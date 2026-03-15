# ⏱️ Study Timer - Quick Reference

## 🎯 Quick Start (2 Minutes)

### For Hosts (Admins)

1. **Start a Timer:**
   - Click "▶️ Start Timer Session"
   - Choose mode: Countdown or Stopwatch
   - Set duration (for countdown)
   - Click "Start"

2. **Control Timer:**
   - **Pause**: ⏸️ Pause button
   - **Resume**: ▶️ Resume button
   - **End**: ⏹️ End button

### For Students

- **View Only**: Timer syncs automatically
- **No Controls**: Only host can control
- **Late Join**: Automatically syncs to current time

---

## 📡 Socket Events Reference

### Emit (Client → Server)

| Event | Payload | Who | Description |
|-------|---------|-----|-------------|
| `room:start-session` | `{ groupId, mode, duration }` | Host | Start new session |
| `room:pause` | `{ groupId }` | Host | Pause running timer |
| `room:resume` | `{ groupId }` | Host | Resume paused timer |
| `room:end-session` | `{ groupId }` | Host | End current session |
| `room:request-sync` | `{ groupId }` | Any | Request current state |

### Listen (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `room:session-started` | `{ groupId, session }` | Session started/synced |
| `room:timer-update` | `{ groupId, isRunning, ... }` | Timer state changed |
| `room:session-ended` | `{ groupId, elapsed }` | Session ended |

---

## 🔧 Session Object Structure

```javascript
{
  hostId: "user123",           // Who started it
  mode: "countdown",           // or "stopwatch"
  startedAt: 1234567890,       // Timestamp (ms)
  pausedAt: null,              // Timestamp or null
  duration: 1500000,           // 25 min in ms (countdown only)
  isRunning: true              // Current state
}
```

---

## 🎨 Component Props

### TimerDisplay

```javascript
<TimerDisplay 
  session={timerSession}  // Session object or null
  isHost={isHost}         // Boolean
/>
```

### TimerControls

```javascript
<TimerControls 
  socket={socketRef.current}  // Socket.IO instance
  groupId={groupId}           // Current group ID
  session={timerSession}      // Session object or null
  isHost={isHost}             // Boolean
/>
```

---

## 💡 Common Patterns

### Starting a Countdown

```javascript
socket.emit("room:start-session", {
  groupId: "abc123",
  mode: "countdown",
  duration: 25 * 60 * 1000  // 25 minutes
});
```

### Starting a Stopwatch

```javascript
socket.emit("room:start-session", {
  groupId: "abc123",
  mode: "stopwatch",
  duration: null  // Not needed for stopwatch
});
```

### Calculating Elapsed Time

```javascript
// For running timer
const elapsed = Date.now() - session.startedAt;

// For paused timer
const elapsed = session.pausedAt - session.startedAt;
```

### Calculating Remaining Time (Countdown)

```javascript
const elapsed = Date.now() - session.startedAt;
const remaining = Math.max(0, session.duration - elapsed);
```

### Formatting Time (HH:MM:SS)

```javascript
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
```

---

## 🐛 Quick Debugging

### Check Session State

```javascript
// In browser console
console.log("Timer session:", timerSession);
```

### Check Socket Connection

```javascript
console.log("Socket connected:", socket.connected);
console.log("Socket ID:", socket.id);
```

### Check Role

```javascript
console.log("Is host:", isHost);
console.log("User role:", user?.role);
```

### Monitor Events

```javascript
// Add to useEffect
socket.on("room:session-started", (data) => {
  console.log("📊 Session started:", data);
});

socket.on("room:timer-update", (data) => {
  console.log("⏱️ Timer update:", data);
});

socket.on("room:session-ended", (data) => {
  console.log("⏹️ Session ended:", data);
});
```

---

## ⚡ Performance Tips

### Update Frequency

```javascript
// Current: 100ms (smooth, efficient)
setInterval(updateDisplay, 100);

// Too fast: 16ms (60 FPS, overkill)
setInterval(updateDisplay, 16);

// Too slow: 1000ms (choppy)
setInterval(updateDisplay, 1000);
```

### Cleanup Intervals

```javascript
useEffect(() => {
  const interval = setInterval(updateDisplay, 100);
  
  // IMPORTANT: Clear on unmount
  return () => clearInterval(interval);
}, [session]);
```

---

## 🎯 Pomodoro Technique

### Classic Pomodoro

```javascript
// 25 minutes work
socket.emit("room:start-session", {
  groupId,
  mode: "countdown",
  duration: 25 * 60 * 1000
});

// Then 5 minutes break
socket.emit("room:start-session", {
  groupId,
  mode: "countdown",
  duration: 5 * 60 * 1000
});
```

### Long Pomodoro

```javascript
// 50 minutes work
duration: 50 * 60 * 1000

// 10 minutes break
duration: 10 * 60 * 1000
```

---

## 🔒 Security Notes

### Host Validation

```javascript
// Backend checks on every action
if (session.hostId !== userId) {
  return socket.emit("error", "Only host can control timer");
}
```

### Input Validation

```javascript
// Mode validation
if (!["countdown", "stopwatch"].includes(mode)) {
  return socket.emit("error", "Invalid mode");
}

// Duration validation
if (mode === "countdown" && (!duration || duration <= 0)) {
  return socket.emit("error", "Duration required");
}
```

---

## 📊 Usage Examples

### Example 1: Study Session

```javascript
// Host starts 45-minute study session
socket.emit("room:start-session", {
  groupId: "study-group-1",
  mode: "countdown",
  duration: 45 * 60 * 1000
});

// After 20 minutes, host pauses for question
socket.emit("room:pause", { groupId: "study-group-1" });

// 5 minutes later, resume
socket.emit("room:resume", { groupId: "study-group-1" });

// When done, end session
socket.emit("room:end-session", { groupId: "study-group-1" });
```

### Example 2: Timed Quiz

```javascript
// Host starts 15-minute quiz timer
socket.emit("room:start-session", {
  groupId: "quiz-room",
  mode: "countdown",
  duration: 15 * 60 * 1000
});

// No pause allowed (strict mode)
// Timer runs until completion or manual end
```

### Example 3: Open Study Time

```javascript
// Host starts stopwatch for open-ended session
socket.emit("room:start-session", {
  groupId: "study-hall",
  mode: "stopwatch",
  duration: null
});

// Students can see how long they've been studying
// Host ends when everyone is done
socket.emit("room:end-session", { groupId: "study-hall" });
```

---

## ✅ Testing Checklist

Quick tests to verify everything works:

- [ ] Host can start countdown
- [ ] Host can start stopwatch
- [ ] All users see same time (±1 sec)
- [ ] Pause freezes timer for all
- [ ] Resume continues from paused time
- [ ] End clears timer for all
- [ ] Late joiner syncs correctly
- [ ] Non-host sees "host only" message
- [ ] Host disconnect ends session
- [ ] No console errors

---

## 🆘 Common Issues

### "Only host can control timer"
- **Cause**: User is not admin
- **Fix**: Check `user.role === "admin"`

### Timer shows 00:00:00
- **Cause**: Session not received
- **Fix**: Check socket connection, emit `room:request-sync`

### Timer not syncing
- **Cause**: Clock skew or network lag
- **Fix**: Normal (±1 second acceptable)

### Timer jumps after resume
- **Cause**: Backend bug (should be fixed)
- **Fix**: Verify `startedAt` adjustment in backend

---

## 📚 Related Files

- `backend/src/sockets/handlers/studyRoom.handler.js` - Backend logic
- `frontend/src/components/room/TimerDisplay.jsx` - Display component
- `frontend/src/components/room/TimerControls.jsx` - Control component
- `frontend/src/pages/Room.jsx` - Integration
- `STUDY_TIMER_IMPLEMENTATION.md` - Full documentation

---

## 🎉 Quick Win

**Test in 30 seconds:**

1. Open room as host
2. Click "Start Timer Session"
3. Select "Countdown", "5 min"
4. Click "Start"
5. ✅ See timer counting down!

**Status: Ready to use!** 🚀
