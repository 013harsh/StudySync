import { useState, useEffect, useRef, useCallback } from "react";
import {
  createPeerConnection,
  getUserMedia,
  stopMediaStream,
  monitorConnectionState,
  isWebRTCSupported,
} from "../utils/webrtc";

export const useCall = ({ socket, user, groupId }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");
  const [error, setError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  // Keep latest state in refs to avoid stale closures in socket callbacks
  const localStreamRef = useRef(null);
  localStreamRef.current = localStream;

  const remoteStreamRef = useRef(null);
  remoteStreamRef.current = remoteStream;

  const callerRef = useRef(null);
  callerRef.current = caller;

  const isCallActiveRef = useRef(false);
  isCallActiveRef.current = isCallActive;

  // Check WebRTC browser support on mount
  useEffect(() => {
    if (!isWebRTCSupported()) {
      setError(
        "WebRTC is not supported in your browser. Please use Chrome, Firefox, or Safari.",
      );
    }
  }, []);

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

  // End Call function
  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      stopMediaStream(localStreamRef.current);
      setLocalStream(null);
    }

    if (remoteStreamRef.current) {
      stopMediaStream(remoteStreamRef.current);
      setRemoteStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (isCallActiveRef.current && callerRef.current?.userId && socket) {
      socket.emit("call:end", { targetUserId: callerRef.current.userId });
    }

    setIsCallActive(false);
    setIsIncomingCall(false);
    setCaller(null);
    setCallStatus("idle");
    setIsMuted(false);
    setIsVideoOff(false);
    pendingCandidatesRef.current = [];
  }, [socket]);

  // Setup socket listeners for signaling
  useEffect(() => {
    if (!socket) return;

    // Incoming call offer
    const handleOffer = async ({ from, offer, groupId: callGroupId }) => {
      console.log("📞 Incoming call from:", from);
      setIsIncomingCall(true);
      setCaller({ userId: from, groupId: callGroupId });
      setCallStatus("ringing");

      pendingCandidatesRef.current = [{ type: "offer", data: offer, from }];
    };

    // Call answer received
    const handleAnswer = async ({ from, answer }) => {
      console.log("✅ Call answered by:", from);

      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
          setCallStatus("connected");

          // Process queued ICE candidates that arrived before the answer
          const pendingCandidates = pendingCandidatesRef.current.filter(
            (p) => p.type === "candidate",
          );
          for (const { data } of pendingCandidates) {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(data),
            );
          }
          pendingCandidatesRef.current = [];
        } catch (err) {
          console.error("Error setting remote description:", err);
          setError("Failed to establish connection");
        }
      }
    };

    // ICE candidate received
    const handleIceCandidate = async ({ from, candidate }) => {
      console.log("🧊 ICE candidate from:", from);

      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.remoteDescription
      ) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        pendingCandidatesRef.current.push({
          type: "candidate",
          data: candidate,
          from,
        });
      }
    };

    // Call rejected
    const handleRejected = ({ from }) => {
      console.log("❌ Call rejected by:", from);
      setCallStatus("rejected");
      setError("Call was rejected");
      endCall();
    };

    // Call ended
    const handleEnd = ({ from, reason }) => {
      console.log("📴 Call ended by:", from, reason || "");
      setCallStatus("ended");
      endCall();
    };

    // Call busy
    const handleBusy = ({ targetUserId }) => {
      console.log("📵 User is busy:", targetUserId);
      setCallStatus("busy");
      setError("User is currently in another call");
      endCall();
    };

    // Call error
    const handleError = ({ message }) => {
      console.error("⚠️ Call error:", message);
      setError(message);
      endCall();
    };

    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:rejected", handleRejected);
    socket.on("call:end", handleEnd);
    socket.on("call:busy", handleBusy);
    socket.on("call:error", handleError);

    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:rejected", handleRejected);
      socket.off("call:end", handleEnd);
      socket.off("call:busy", handleBusy);
      socket.off("call:error", handleError);
    };
  }, [socket, endCall]);

  // Start outgoing call
  const startCall = async (targetUserId) => {
    if (!socket) {
      setError("Socket not connected");
      return;
    }

    try {
      setError(null);
      setCallStatus("calling");
      setCaller({ userId: targetUserId, groupId });

      // Get local media
      const stream = await getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      monitorConnectionState(pc);

      // Add local tracks
      stream.getTracks().forEach((track) => {
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
    if (!socket || !callerRef.current) return;

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

      monitorConnectionState(pc);

      // Add local tracks
      stream.getTracks().forEach((track) => {
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
            targetUserId: callerRef.current.userId,
            candidate: event.candidate,
          });
        }
      };

      // Process pending offer
      const pendingOffer = pendingCandidatesRef.current.find(
        (p) => p.type === "offer",
      );
      if (pendingOffer) {
        await pc.setRemoteDescription(
          new RTCSessionDescription(pendingOffer.data),
        );

        // Create and send answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("call:answer", {
          targetUserId: callerRef.current.userId,
          answer,
        });

        // Process pending ICE candidates
        const pendingCandidates = pendingCandidatesRef.current.filter(
          (p) => p.type === "candidate",
        );
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
    if (callerRef.current && socket) {
      socket.emit("call:reject", { targetUserId: callerRef.current.userId });
    }
    setIsIncomingCall(false);
    setCaller(null);
    setCallStatus("idle");
    pendingCandidatesRef.current = [];
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        stopMediaStream(localStreamRef.current);
      }
      if (remoteStreamRef.current) {
        stopMediaStream(remoteStreamRef.current);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isCallActive,
    isIncomingCall,
    caller,
    isMuted,
    isVideoOff,
    callStatus,
    error,
    setError,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
};

export default useCall;
