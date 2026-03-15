import { useState } from "react";

/**
 * TimerControls Component
 * Start / Pause / Resume / End controls (host only)
 */
const TimerControls = ({ socket, groupId, session, isHost }) => {
  const [mode, setMode] = useState("countdown");
  const [duration, setDuration] = useState(25); // minutes
  const [showSetup, setShowSetup] = useState(false);

  const handleStart = () => {
    if (!socket || !groupId) return;

    const durationMs = mode === "countdown" ? duration * 60 * 1000 : null;

    socket.emit("room:start-session", {
      groupId,
      mode,
      duration: durationMs,
    });

    setShowSetup(false);
  };

  const handlePause = () => {
    if (!socket || !groupId) return;
    socket.emit("room:pause", { groupId });
  };

  const handleResume = () => {
    if (!socket || !groupId) return;
    socket.emit("room:resume", { groupId });
  };

  const handleEnd = () => {
    if (!socket || !groupId) return;
    
    if (confirm("Are you sure you want to end the timer session?")) {
      socket.emit("room:end-session", { groupId });
    }
  };

  // Preset durations for quick selection
  const presets = [
    { label: "5 min", value: 5 },
    { label: "15 min", value: 15 },
    { label: "25 min", value: 25 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
  ];

  if (!isHost) {
    return (
      <div className="p-4 text-center alert alert-info">
        <span>Only the host can control the timer</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {!session ? (
        // Setup Mode
        <>
          {!showSetup ? (
            <button
              onClick={() => setShowSetup(true)}
              className="w-full btn btn-primary btn-lg"
            >
              ▶️ Start Timer Session
            </button>
          ) : (
            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="font-semibold label-text">Timer Mode</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode("countdown")}
                    className={`flex-1 btn ${mode === "countdown" ? "btn-primary" : "btn-outline"}`}
                  >
                    ⏱️ Countdown
                  </button>
                  <button
                    onClick={() => setMode("stopwatch")}
                    className={`flex-1 btn ${mode === "stopwatch" ? "btn-primary" : "btn-outline"}`}
                  >
                    ⏲️ Stopwatch
                  </button>
                </div>
              </div>

              {/* Duration Selection (Countdown only) */}
              {mode === "countdown" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="font-semibold label-text">Duration (minutes)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full input input-bordered"
                    />
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setDuration(preset.value)}
                        className={`btn btn-sm ${duration === preset.value ? "btn-primary" : "btn-outline"}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleStart}
                  className="flex-1 btn btn-success"
                >
                  Start
                </button>
                <button
                  onClick={() => setShowSetup(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // Active Session Controls
        <div className="space-y-3">
          <div className="flex gap-2">
            {session.isRunning ? (
              <button
                onClick={handlePause}
                className="flex-1 btn btn-warning btn-lg"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex-1 btn btn-success btn-lg"
              >
                ▶️ Resume
              </button>
            )}
            <button
              onClick={handleEnd}
              className="btn btn-error btn-lg"
            >
              ⏹️ End
            </button>
          </div>

          {/* Session Info */}
          <div className="p-3 rounded-lg bg-base-200">
            <p className="text-sm text-base-content/70">
              <span className="font-semibold">Mode:</span>{" "}
              {session.mode === "countdown" ? "Countdown" : "Stopwatch"}
            </p>
            {session.mode === "countdown" && (
              <p className="text-sm text-base-content/70">
                <span className="font-semibold">Duration:</span>{" "}
                {Math.floor(session.duration / 60000)} minutes
              </p>
            )}
            <p className="text-sm text-base-content/70">
              <span className="font-semibold">Status:</span>{" "}
              {session.isRunning ? "Running" : "Paused"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerControls;
