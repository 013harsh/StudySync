const sessions = new Map();

module.exports = (io, socket) => {
  const userId = socket.user?.id?.toString();

  //  START SESSION
  // socket.on("room:start-session", ({ groupId, mode, duration }) => {
  //   try {
  //     if (!userId || !groupId) {
  //       return socket.emit("error", "Missing required fields");
  //     }

  //     // Validate mode
  //     if (!["countdown", "stopwatch"].includes(mode)) {
  //       return socket.emit(
  //         "error",
  //         "Invalid mode. Must be 'countdown' or 'stopwatch'",
  //       );
  //     }

  //     // Validate duration for countdown mode
  //     if (mode === "countdown" && (!duration || duration <= 0)) {
  //       return socket.emit("error", "Duration required for countdown mode");
  //     }

  //     // Create new session
  //     const session = {
  //       hostId: userId,
  //       mode,
  //       startedAt: Date.now(),
  //       pausedAt: null,
  //       duration: mode === "countdown" ? duration : null,
  //       isRunning: true,
  //     };

  //     sessions.set(groupId, session);

  //     console.log(`⏱️  Session started in ${groupId} by ${userId} (${mode})`);

  //     // Broadcast to all users in the room
  //     io.to(groupId).emit("room:session-started", {
  //       groupId,
  //       session: {
  //         hostId: session.hostId,
  //         mode: session.mode,
  //         startedAt: session.startedAt,
  //         duration: session.duration,
  //         isRunning: session.isRunning,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Start Session Error:", error);
  //     socket.emit("error", "Failed to start session");
  //   }
  // });
  socket.on("room:start-session", ({ groupId, mode, duration }) => {
    try {
      if (!userId || !groupId) {
        return socket.emit("error", "Missing required fields");
      }

      if (!["countdown", "stopwatch"].includes(mode)) {
        return socket.emit("error", "Invalid mode");
      }

      if (mode === "countdown" && (!duration || duration <= 0)) {
        return socket.emit("error", "Duration required for countdown");
      }

      const session = {
        hostId: userId,
        mode,
        startedAt: Date.now(),
        pausedAt: null,
        duration: mode === "countdown" ? duration : null,
        isRunning: true,
      };

      sessions.set(groupId, session);

      console.log(`⏱️ Session started in ${groupId}`);

      io.to(groupId).emit("room:session-started", {
        groupId,
        session,
      });

      // AUTO FINISH COUNTDOWN
      // if (mode === "countdown") {
      //   setTimeout(() => {
      //     const current = sessions.get(groupId);

      //     if (!current || !current.isRunning) return;

      //     console.log(`⏰ Countdown finished in ${groupId}`);

      //     sessions.delete(groupId);

      //     io.to(groupId).emit("room:session-ended", {
      //       groupId,
      //       reason: "Countdown finished",
      //     });
      //   }, duration);
      // }
      if (mode === "countdown") {
  setTimeout(() => {
    const session = sessions.get(groupId);

    if (!session) return;

    // Stop session but DO NOT delete it
    session.isRunning = false;
    session.isFinished = true;
    session.pausedAt = Date.now();

    console.log(`⏰ Countdown finished in ${groupId}`);

    io.to(groupId).emit("room:timer-update", {
      groupId,
      isRunning: false,
      isFinished: true,
      pausedAt: session.pausedAt,
    });

  }, duration);
}
    } catch (error) {
      console.error("Start Session Error:", error);
      socket.emit("error", "Failed to start session");
    }
  });

  //  PAUSE SESSION
  socket.on("room:pause", ({ groupId }) => {
    try {
      if (!userId || !groupId) {
        return socket.emit("error", "Missing required fields");
      }

      const session = sessions.get(groupId);

      if (!session) {
        return socket.emit("error", "No active session");
      }

      // Only host can pause
      if (session.hostId !== userId) {
        return socket.emit("error", "Only host can pause the timer");
      }

      if (!session.isRunning) {
        return socket.emit("error", "Session is not running");
      }

      // Pause the session
      session.pausedAt = Date.now();
      session.isRunning = false;

      console.log(`⏸️  Session paused in ${groupId} by ${userId}`);

      // Broadcast pause with current elapsed time
      const elapsed = session.pausedAt - session.startedAt;
      io.to(groupId).emit("room:timer-update", {
        groupId,
        isRunning: false,
        pausedAt: session.pausedAt,
        elapsed,
      });
    } catch (error) {
      console.error("Pause Session Error:", error);
      socket.emit("error", "Failed to pause session");
    }
  });

  //  RESUME SESSION
  socket.on("room:resume", ({ groupId }) => {
    try {
      if (!userId || !groupId) {
        return socket.emit("error", "Missing required fields");
      }

      const session = sessions.get(groupId);

      if (!session) {
        return socket.emit("error", "No active session");
      }

      // Only host can resume
      if (session.hostId !== userId) {
        return socket.emit("error", "Only host can resume the timer");
      }

      if (session.isRunning) {
        return socket.emit("error", "Session is already running");
      }

      // Calculate pause duration and adjust startedAt
      const pauseDuration = Date.now() - session.pausedAt;
      session.startedAt += pauseDuration;
      session.pausedAt = null;
      session.isRunning = true;

      // Broadcast resume
      io.to(groupId).emit("room:timer-update", {
        groupId,
        isRunning: true,
        startedAt: session.startedAt,
      });
    } catch (error) {
      console.error("Resume Session Error:", error);
      socket.emit("error", "Failed to resume session");
    }
  });

  //  END SESSION
  socket.on("room:end-session", ({ groupId }) => {
    try {
      if (!userId || !groupId) {
        return socket.emit("error", "Missing required fields");
      }

      const session = sessions.get(groupId);

      if (!session) {
        return socket.emit("error", "No active session");
      }

      // Only host can end
      if (session.hostId !== userId) {
        return socket.emit("error", "Only host can end the timer");
      }

      // Calculate final elapsed time
      const endTime = session.pausedAt || Date.now();
      const elapsed = endTime - session.startedAt;

      console.log(`⏹️  Session ended in ${groupId} by ${userId}`);

      // Clear session
      sessions.delete(groupId);

      // Broadcast end
      io.to(groupId).emit("room:session-ended", {
        groupId,
        elapsed,
      });
    } catch (error) {
      console.error("End Session Error:", error);
      socket.emit("error", "Failed to end session");
    }
  });

  // If host disconnects,  end session
  socket.on("disconnect", () => {
    if (!userId) return;

    // Find sessions where this user is the host
    sessions.forEach((session, groupId) => {
      if (session.hostId === userId) {
        console.log(`⚠️  Host ${userId} disconnected from ${groupId}`);

        //End session when host disconnects
        sessions.delete(groupId);
        io.to(groupId).emit("room:session-ended", {
          groupId,
          reason: "Host disconnected",
        });
      }
    });
  });
};
