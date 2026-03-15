import { useState, useEffect, useRef } from "react";
import { 
  createPeerConnection, 
  getUserMedia, 
  stopMediaStream,
  monitorConnectionState,
  isWebRTCSupported 
} from "../../utils/webrtc";

const CallUI = ({ socket, user, groupId }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, connected, ended
  const [error, setError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  // Check WebRTC support on mount
  useEffect(() => {
    if (!isWebRTCSupported()) {
      setError("WebRTC is not supported in your browser. Please use Chrome, Firefox, or Safari.");
    }
  }, []);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming call offer
    socket.on("call:offer", async ({ from, offer, groupId: callGroupId }) => {
      console.log("📞 Incoming call from:", from);
      setIsIncomingCall(true);
      setCaller({ userId: from, groupId: callGroupId });
      setCallStatus("ringing");

      // Store offer for when user accepts
      pendingCandidatesRef.current = [{ type: "offer", data: offer, from }];
    });

    // Call answer received
    socket.on("call:answer", async ({ from, answer }) => {
      console.log("✅ Call answered by:", from);
      
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          setCallStatus("connected");
        } catch (err) {
          console.error("Error setting remote description:", err);
          setError("Failed to establish connection");
        }
      }
    });

    // ICE candidate received
    socket.on("call:ice-candidate", async ({ from, candidate }) => {
      console.log("🧊 ICE candidate from:", from);
      
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        // Queue candidates if remote description not set yet
        pendingCandidatesRef.current.push({ type: "candidate", data: candidate, from });
      }
    });

    // Call rejected
    socket.on("call:rejected", ({ from }) => {
      console.log("❌ Call rejected by:", from);
      setCallStatus("rejected");
      setError("Call was rejected");
      endCall();
    });

    // Call ended
    socket.on("call:end", ({ from, reason }) => {
      console.log("📴 Call ended by:", from, reason || "");
      setCallStatus("ended");
      endCall();
    });

    // Call busy
    socket.on("call:busy", ({ targetUserId }) => {
      console.log("📵 User is busy:", targetUserId);
      setCallStatus("busy");
      setError("User is currently in another call");
      endCall();
    });

    // Call error
    socket.on("call:error", ({ message }) => {
      console.error("⚠️ Call error:", message);
      setError(message);
      endCall();
    });

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice-candidate");
      socket.off("call:rejected");
      socket.off("call:end");
      socket.off("call:busy");
      socket.off("call:error");
    };
  }, [socket]);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Start call
  const startCall = async (targetUserId) => {
    try {
      setError(null);
      setCallStatus("calling");

      // Get local media
      const stream = await getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      // Create peer connection with ICE servers
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Monitor connection state
      monitorConnectionState(pc);

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("🎥 Received remote track:", event.track.kind);
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 Sending ICE candidate");
          socket.emit("call:ice-candidate", {
            targetUserId,
            candidate: event.candidate,
          });
        }
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", {
        targetUserId,
        offer,
        groupId,
      });

      setIsCallActive(true);
    } catch (err) {
      console.error("Failed to start call:", err);
      setError(err.message);
      setCallStatus("error");
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    try {
      setError(null);
      setIsIncomingCall(false);
      setCallStatus("connecting");

      // Get local media
      const stream = await getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Monitor connection state
      monitorConnectionState(pc);

      // Add local tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("🎥 Received remote track:", event.track.kind);
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:ice-candidate", {
            targetUserId: caller.userId,
            candidate: event.candidate,
          });
        }
      };

      // Process pending offer
      const pendingOffer = pendingCandidatesRef.current.find(p => p.type === "offer");
      if (pendingOffer) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.data));

        // Create and send answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("call:answer", {
          targetUserId: caller.userId,
          answer,
        });

        // Process pending ICE candidates
        const pendingCandidates = pendingCandidatesRef.current.filter(p => p.type === "candidate");
        for (const { data } of pendingCandidates) {
          await pc.addIceCandidate(new RTCIceCandidate(data));
        }

        pendingCandidatesRef.current = [];
      }

      setIsCallActive(true);
      setCallStatus("connected");
    } catch (err) {
      console.error("Failed to accept call:", err);
      setError(err.message);
      setCallStatus("error");
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (caller) {
      socket.emit("call:reject", { targetUserId: caller.userId });
    }
    setIsIncomingCall(false);
    setCaller(null);
    setCallStatus("idle");
    pendingCandidatesRef.current = [];
  };

  // End call
  const endCall = () => {
    // Stop local stream
    if (localStream) {
      stopMediaStream(localStream);
      setLocalStream(null);
    }

    // Stop remote stream
    if (remoteStream) {
      stopMediaStream(remoteStream);
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Notify other peer if call was active
    if (isCallActive && caller) {
      socket.emit("call:end", { targetUserId: caller.userId });
    }

    setIsCallActive(false);
    setIsIncomingCall(false);
    setCaller(null);
    setCallStatus("idle");
    pendingCandidatesRef.current = [];
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!isWebRTCSupported()) {
    return (
      <div className="p-4 alert alert-error">
        <span>WebRTC is not supported in your browser</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Incoming Call Modal */}
      {isIncomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="p-6 shadow-xl card bg-base-100 w-96">
            <h3 className="text-xl font-bold">Incoming Call</h3>
            <p className="mt-2">User {caller?.userId} is calling...</p>
            <div className="gap-2 mt-4 card-actions">
              <button onClick={acceptCall} className="flex-1 btn btn-success">
                Accept
              </button>
              <button onClick={rejectCall} className="flex-1 btn btn-error">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call UI */}
      {isCallActive && (
        <div className="fixed inset-0 z-40 bg-black">
          {/* Remote Video (large) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="object-cover w-full h-full"
          />

          {/* Local Video (small, picture-in-picture) */}
          <div className="absolute w-48 h-36 top-4 right-4">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="object-cover w-full h-full border-2 rounded-lg border-primary"
            />
          </div>

          {/* Call Controls */}
          <div className="absolute flex gap-4 transform -translate-x-1/2 bottom-8 left-1/2">
            <button
              onClick={toggleMute}
              className={`btn btn-circle ${isMuted ? "btn-error" : "btn-primary"}`}
            >
              {isMuted ? "🔇" : "🎤"}
            </button>
            <button
              onClick={toggleVideo}
              className={`btn btn-circle ${isVideoOff ? "btn-error" : "btn-primary"}`}
            >
              {isVideoOff ? "📹" : "📷"}
            </button>
            <button onClick={endCall} className="btn btn-circle btn-error">
              📞
            </button>
          </div>

          {/* Call Status */}
          <div className="absolute px-4 py-2 rounded-lg top-4 left-4 bg-base-100/80">
            <p className="text-sm font-semibold">
              {callStatus === "calling" && "Calling..."}
              {callStatus === "connecting" && "Connecting..."}
              {callStatus === "connected" && "Connected"}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !isCallActive && (
        <div className="p-4 mt-4 alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn btn-sm">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default CallUI;
