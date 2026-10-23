import { forwardRef, useImperativeHandle } from "react";
import useCall from "../../hooks/useCall";
import { isWebRTCSupported } from "../../utils/webrtc";

const CallUI = forwardRef(({ socket, user, groupId }, ref) => {
  const {
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
  } = useCall({ socket, user, groupId });

  useImperativeHandle(ref, () => ({
    startCall,
  }));

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
});

export default CallUI;
