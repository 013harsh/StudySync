# ⏱️ Study Timer Implementation - Complete Guide

## ✅ PHASE 3 — Pomodoro / Study Timer (Step 5)

### Goal
Host controls a synced countdown/stopwatch timer; all students see it in real-time.

---

## 📋 Implementation Overview

### Backend Architecture

#### Session Storage
```javascript
// In-memory Map: groupId → sessionState
const sessions = new Map();

// Session State Structure:
{
  hostId: string,           // User ID of the host
  mode: 'countdown' | 'stopwatch',
  startedAt: number,        // Timestamp when started
  pausedAt: number | null,  // Timestamp when paused (null if running)
  duration: number | null,  // Total duration in ms (countdown only)
  isRunning: boolean        // Current running state
}
```

#### Socket Events

**Host Actions:**
- `room:start-session` - Start a new timer session
- `room:pause` - Pause the running timer
- `room:resume` - Resume a paused timer
- `room:end-session` - End the current session

**Broadcast Events:**
- `room:session-started` - Sent to all users when session starts
- `room:timer-update` - Sent when timer state changes (pause/resume)
- `room:session-ended` - Sent when session ends

**Student Actions:**
- `room:request-sync` - Request current session state (for late joiners)

---

## 🏗️ File Structure

### Backend
```
backend/src/sockets/handlers/
└── studyRoom.handler.js    ← New handler for timer logic
```

### Frontend
```
frontend/src/components/room/
├── TimerDisplay.jsx        ← Large visual timer display
└── TimerControls.jsx       ← Start/Pause/Resume/End controls (host only)
```

---

## 🔧 Backend Implementation

### studyRoom.handler.js

**Key Features:**
1. ✅ In-memory session storage per group
2. ✅ Host-only control validation
3. ✅ Pause/resume with time adjustment
4. ✅ Sync for late joiners
5. ✅ Auto-cleanup on host disconnect

**Event Handlers:**

#### 1. Start Session
```javascript
socket.on("room:start-session", ({ groupId, mode, duration }) => {
  // Validates mode: 'countdown' or 'stopwatch'
  // Creates session with current timestamp
  // Broadcasts to all users in room
});
```

**Payload:**
```javascript
{
  groupId: "abc123",
  mode: "countdown",      // or "stopwatch"
  duration: 1500000       // 25 minutes in ms (countdown only)
}
```

#### 2. Pause Session
```javascript
socket.on("room:pause", ({ groupId }) => {
  // Only host can pause
  // Records pausedAt timestamp
  // Broadcasts updated state
});
```

**How Pause Works:**
- Records `pausedAt` timestamp
- Sets `isRunning = false`
- Elapsed time = `pausedAt - startedAt`

#### 3. Resume Session
```javascript
socket.on("room:resume", ({ groupId }) => {
  // Only host can resume
  // Adjusts startedAt to account for pause duration
  // Broadcasts updated state
});
```

**How Resume Works:**
```javascript
const pauseDuration = Date.now() - session.pausedAt;
session.startedAt += pauseDuration;  // Shift start time forward
session.pausedAt = null;
session.isRunning = true;
```

This ensures the timer continues from where it was paused.

#### 4. End Session
```javascript
socket.on("room:end-session", ({ groupId }) => {
  // Only host can end
  // Calculates final elapsed time
  // Deletes session from memory
  // Broadcasts end event
});
```

#### 5. Request Sync
```javascript
socket.on("room:request-sync", ({ groupId }) => {
  // Sends current session state to requesting user
  // Used when student joins mid-session
});
```

---

## 🎨 Frontend Implementation

### TimerDisplay.jsx

**Purpose:** Large visual display of the timer

**Features:**
- ✅ Real-time countdown/stopwatch display
- ✅ Updates every 100ms for smooth animation
- ✅ Progress bar for countdown mode
- ✅ Color-coded status (running/paused)
- ✅ Mode badge (countdown/stopwatch)
- ✅ Host/student indicator

**Time Calculation:**
```javascript
// For running timer
const elapsed = Date.now() - session.startedAt;

// For paused timer
const elapsed = session.pausedAt - session.startedAt;

// Countdown remaining time
const remaining = session.duration - elapsed;

// Format: HH:MM:SS
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${minutes}:${seconds}`;
};
```

**Visual States:**
- **No Session**: Grey text, "00:00:00"
- **Running**: Primary color, animated
- **Paused**: Warning color, static

### TimerControls.jsx

**Purpose:** Host-only controls for timer management

**Features:**
- ✅ Mode selection (countdown/stopwatch)
- ✅ Duration input with presets (5, 15, 25, 45, 60 min)
- ✅ Start/Pause/Resume/End buttons
- ✅ Session info display
- ✅ Non-host message

**Presets:**
```javascript
const presets = [
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "25 min", value: 25 },   // Pomodoro
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];
```

**UI States:**
1. **No Session (Host)**: Show "Start Timer Session" button
2. **Setup Mode**: Show mode selector, duration input, presets
3. **Active Session**: Show Pause/Resume and End buttons
4. **Non-Host**: Show info message

---

## 🔄 Data Flow

### Starting a Session

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Host clicks "Start Timer Session"                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Host selects mode (countdown/stopwatch) and duration     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend emits: room:start-session                       │
│    { groupId, mode, duration }                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend validates and creates session                    │
│    sessions.set(groupId, { hostId, mode, startedAt, ... }) │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend broadcasts: room:session-started                 │
│    to ALL users in the room                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. All clients receive event and update state               │
│    setTimerSession(data.session)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. TimerDisplay starts updating every 100ms                 │
│    Shows synchronized time across all users                 │
└─────────────────────────────────────────────────────────────┘
```

### Pausing a Session

```
Host clicks Pause
      ↓
Frontend emits: room:pause
      ↓
Backend records pausedAt timestamp
      ↓
Backend broadcasts: room:timer-update
      ↓
All clients update state (isRunning = false)
      ↓
TimerDisplay stops updating, shows paused time
```

### Resuming a Session

```
Host clicks Resume
      ↓
Frontend emits: room:resume
      ↓
Backend calculates pause duration
      ↓
Backend adjusts startedAt += pauseDuration
      ↓
Backend broadcasts: room:timer-update
      ↓
All clients update state (isRunning = true)
      ↓
TimerDisplay resumes from paused time
```

### Late Joiner Sync

```
Student joins room mid-session
      ↓
Frontend emits: room:request-sync
      ↓
Backend sends current session state
      ↓
Student receives: room:session-started
      ↓
TimerDisplay calculates current time and displays
```

---

## 🧪 Testing Guide

### Test 1: Basic Countdown

**Steps:**
1. Host starts 5-minute countdown
2. Verify all users see "05:00:00"
3. Wait 1 minute
4. Verify all users see "04:00:00"
5. Host ends session
6. Verify all users see "00:00:00"

**Expected:**
- ✅ All users see same time (±1 second)
- ✅ Timer counts down smoothly
- ✅ Progress bar fills up
- ✅ Session ends cleanly

### Test 2: Pause and Resume

**Steps:**
1. Host starts 10-minute countdown
2. Wait 2 minutes (should show "08:00:00")
3. Host pauses
4. Verify all users see paused state
5. Wait 30 seconds (time should NOT change)
6. Host resumes
7. Verify timer continues from "08:00:00"

**Expected:**
- ✅ Pause freezes time for all users
- ✅ Resume continues from paused time
- ✅ No time lost during pause

### Test 3: Stopwatch Mode

**Steps:**
1. Host starts stopwatch
2. Verify all users see "00:00:00"
3. Wait 1 minute
4. Verify all users see "00:01:00"
5. Host pauses at "00:02:30"
6. Host resumes
7. Verify continues from "00:02:30"

**Expected:**
- ✅ Stopwatch counts up
- ✅ No progress bar shown
- ✅ Pause/resume works correctly

### Test 4: Late Joiner

**Steps:**
1. Host starts 10-minute countdown
2. Wait 3 minutes
3. New student joins room
4. Verify new student sees "07:00:00" (not "10:00:00")

**Expected:**
- ✅ Late joiner syncs to current time
- ✅ No need to restart session

### Test 5: Host Disconnect

**Steps:**
1. Host starts timer
2. Host closes browser/disconnects
3. Verify session ends for all users

**Expected:**
- ✅ Session ends automatically
- ✅ All users notified
- ✅ No orphaned sessions

### Test 6: Non-Host Restrictions

**Steps:**
1. Student tries to access timer controls
2. Verify "Only host can control" message shown
3. Verify no control buttons visible

**Expected:**
- ✅ Students cannot start/pause/end
- ✅ Clear message displayed

---

## 🐛 Troubleshooting

### Issue 1: Timer not syncing

**Symptoms:** Different users see different times

**Possible Causes:**
1. Clock skew between devices
2. Network latency
3. Session not broadcasting

**Solutions:**
```javascript
// Check if session is received
console.log("Session:", timerSession);

// Check socket connection
console.log("Socket connected:", socket.connected);

// Verify groupId matches
console.log("Group ID:", groupId);
```

### Issue 2: Timer jumps after pause/resume

**Symptoms:** Timer shows wrong time after resume

**Cause:** `startedAt` not adjusted correctly

**Solution:** Backend already handles this:
```javascript
const pauseDuration = Date.now() - session.pausedAt;
session.startedAt += pauseDuration;
```

### Issue 3: Late joiner sees 00:00:00

**Symptoms:** New user doesn't see current timer

**Cause:** `room:request-sync` not emitted

**Solution:** Verify sync request in Room.jsx:
```javascript
useEffect(() => {
  // ...
  socket.emit("room:request-sync", { groupId });
}, [groupId, user, groupData]);
```

### Issue 4: Host can't control timer

**Symptoms:** Host sees "Only host can control" message

**Cause:** `isHost` calculation incorrect

**Solution:** Check role detection:
```javascript
const myRole = user?.role || "user";
const isHost = myRole === "admin";
console.log("Is host:", isHost, "Role:", myRole);
```

---

## 📊 Performance Considerations

### Update Frequency

**Current:** 100ms (10 updates/second)
```javascript
const interval = setInterval(updateDisplay, 100);
```

**Alternatives:**
- 1000ms (1 update/second): Less smooth, lower CPU
- 50ms (20 updates/second): Smoother, higher CPU
- 16ms (60 FPS): Overkill for a timer

**Recommendation:** 100ms is optimal balance

### Memory Usage

**Per Session:**
- Session object: ~200 bytes
- 100 concurrent groups: ~20 KB
- Negligible memory footprint

**Cleanup:**
- Sessions deleted on end
- Auto-cleanup on host disconnect
- No memory leaks

### Network Traffic

**Session Start:**
- Broadcast once: ~200 bytes
- All users receive: 200 bytes × N users

**Timer Updates:**
- Only on pause/resume (not continuous)
- ~100 bytes per update

**Bandwidth:** Minimal (< 1 KB/minute)

---

## 🚀 Future Enhancements

### 1. Pomodoro Presets
```javascript
const pomodoroPresets = [
  { label: "Pomodoro", work: 25, break: 5 },
  { label: "Long Pomodoro", work: 50, break: 10 },
  { label: "Study Session", work: 45, break: 15 },
];
```

### 2. Sound Notifications
```javascript
// Play sound when countdown finishes
if (remaining === 0 && session.isRunning) {
  const audio = new Audio('/sounds/timer-end.mp3');
  audio.play();
}
```

### 3. Timer History
```javascript
// Store completed sessions in database
const timerHistory = {
  groupId,
  mode,
  duration,
  startedAt,
  endedAt,
  participants: [...],
};
```

### 4. Personal Timers
```javascript
// Each student can run their own local timer
// Independent of group timer
const [personalTimer, setPersonalTimer] = useState(null);
```

### 5. Break Reminders
```javascript
// Auto-start break timer after work session
if (session.mode === 'countdown' && remaining === 0) {
  setTimeout(() => {
    startBreakTimer(5 * 60 * 1000); // 5-minute break
  }, 1000);
}
```

### 6. Analytics
```javascript
// Track timer usage
const analytics = {
  totalSessions: 0,
  totalStudyTime: 0,
  averageSessionLength: 0,
  mostUsedMode: 'countdown',
};
```

---

## ✅ Implementation Checklist

### Backend
- [x] Create studyRoom.handler.js
- [x] Implement session storage (Map)
- [x] Handle room:start-session event
- [x] Handle room:pause event
- [x] Handle room:resume event
- [x] Handle room:end-session event
- [x] Handle room:request-sync event
- [x] Validate host-only actions
- [x] Broadcast to all room members
- [x] Auto-cleanup on disconnect
- [x] Register handler in socket.server.js

### Frontend
- [x] Create TimerDisplay.jsx component
- [x] Create TimerControls.jsx component
- [x] Integrate into Room.jsx
- [x] Add timer session state
- [x] Listen for socket events
- [x] Request sync on mount
- [x] Real-time display updates
- [x] Host/student role detection
- [x] Mode selection UI
- [x] Duration presets
- [x] Pause/Resume functionality

### Testing
- [ ] Test countdown mode
- [ ] Test stopwatch mode
- [ ] Test pause/resume
- [ ] Test late joiner sync
- [ ] Test host disconnect
- [ ] Test non-host restrictions
- [ ] Test multiple concurrent sessions
- [ ] Test network interruptions

---

## 📝 Summary

**Implementation Status:** ✅ Complete

**Features Delivered:**
- ✅ Host-controlled synchronized timer
- ✅ Countdown and stopwatch modes
- ✅ Pause/resume functionality
- ✅ Real-time sync across all users
- ✅ Late joiner support
- ✅ Duration presets (5, 15, 25, 45, 60 min)
- ✅ Visual progress bar (countdown)
- ✅ Host-only controls
- ✅ Auto-cleanup on disconnect

**Next Phase:** Implement chat messaging or collaborative notes! 🚀
