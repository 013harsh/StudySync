import { useState, useEffect, useMemo } from "react";

/**
 * Format milliseconds -> HH:MM:SS
 */
const formatTime = (ms = 0) => {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

const TimerDisplay = ({ session, isHost }) => {
  const [displayTime, setDisplayTime] = useState("00:00:00");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!session) {
      setDisplayTime("00:00:00");
      setProgress(0);
      return;
    }

    const updateDisplay = () => {
      const now = Date.now();

      const { startedAt, pausedAt, isRunning, duration, mode } = session;

      const elapsed = isRunning
        ? now - startedAt
        : pausedAt
        ? pausedAt - startedAt
        : 0;

      if (mode === "countdown") {
        const remaining = Math.max(0, duration - elapsed);

        setDisplayTime(formatTime(remaining));

        const progressValue = duration
          ? Math.min(100, (elapsed / duration) * 100)
          : 0;

        setProgress(progressValue);
      } else {
        setDisplayTime(formatTime(elapsed));
        setProgress(0);
      }
    };

    updateDisplay();

    const interval = setInterval(updateDisplay, 100);

    return () => clearInterval(interval);
  }, [session]);

  /**
   * Determine if timer finished
   */
  const isFinished = useMemo(() => {
    if (!session || session.mode !== "countdown") return false;

    const now = Date.now();
    const elapsed = session.isRunning
      ? now - session.startedAt
      : session.pausedAt
      ? session.pausedAt - session.startedAt
      : 0;

    return elapsed >= session.duration;
  }, [session]);

  /**
   * Status Color
   */
  const statusColor = useMemo(() => {
    if (!session) return "text-base-content/40";
    if (isFinished) return "text-error";
    if (session.isRunning) return "text-primary";
    return "text-warning";
  }, [session, isFinished]);

  /**
   * Status Text
   */
  const statusText = useMemo(() => {
    if (!session) return "No active session";

    if (isFinished) return "Finished";

    if (session.isRunning) {
      return session.mode === "countdown"
        ? "Countdown Running"
        : "Stopwatch Running";
    }

    return "Paused";
  }, [session, isFinished]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 bg-base-200">
      <div className="text-center">

        {/* Mode Badge */}
        <div className="mb-4">
          {session ? (
            <span className="badge badge-lg badge-primary">
              {session.mode === "countdown"
                ? "⏱️ Countdown"
                : "⏲️ Stopwatch"}
            </span>
          ) : (
            <span className="badge badge-lg badge-ghost">⏱️ Timer</span>
          )}
        </div>

        {/* Timer Display */}
        <div className={`text-8xl font-mono font-bold mb-8 ${statusColor}`}>
          {displayTime}
        </div>

        {/* Progress Bar */}
        {session?.mode === "countdown" && (
          <div className="w-full max-w-md mb-6">
            <progress
              className="w-full progress progress-primary"
              value={progress}
              max="100"
            />
          </div>
        )}

        {/* Status */}
        <p className={`text-lg font-semibold mb-4 ${statusColor}`}>
          {statusText}
        </p>

        {/* Host Info */}
        {session && (
          <p className="text-sm text-base-content/60">
            {isHost
              ? "🎯 You are controlling the timer"
              : "👥 Synced with host"}
          </p>
        )}

        {/* Instructions */}
        {!session && (
          <p className="mt-6 text-sm text-base-content/60">
            {isHost
              ? "Use the controls below to start a timer session"
              : "Waiting for host to start a timer session"}
          </p>
        )}

      </div>
    </div>
  );
};

export default TimerDisplay;