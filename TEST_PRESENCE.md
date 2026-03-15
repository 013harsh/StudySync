# 🧪 Presence System - Testing Guide

## Quick Test (5 minutes)

### Prerequisites
- Backend running on port 3000
- Frontend running on port 5173
- At least 2 user accounts created
- At least 1 group created

### Test Steps

#### 1. Single User Test
```bash
# Browser 1
1. Login as User A
2. Go to Dashboard
3. Click on a group
4. Check member panel:
   ✅ You should see yourself with a green dot
   ✅ Header shows "1 online • X total"
   ✅ Footer badge shows "1"
```

#### 2. Multi-User Test
```bash
# Browser 2 (Incognito/Different Browser)
1. Login as User B
2. Go to Dashboard
3. Click on the SAME group

# Browser 1 (User A)
   ✅ Should see User B appear with green dot
   ✅ Header updates to "2 online • X total"
   ✅ Footer badge shows "2"

# Browser 2 (User B)
   ✅ Should see User A with green dot
   ✅ Should see yourself with green dot
   ✅ Header shows "2 online • X total"
```

#### 3. Leave Test
```bash
# Browser 2 (User B)
1. Click "Back to Dashboard"

# Browser 1 (User A)
   ✅ User B's green dot turns grey
   ✅ Header updates to "1 online • X total"
   ✅ Footer badge shows "1"
   ✅ User B still appears in list (offline)
```

#### 4. Disconnect Test
```bash
# Browser 2 (User B)
1. Rejoin the room
2. Close the browser tab (or kill network)

# Browser 1 (User A)
   ✅ After ~5 seconds, User B's dot turns grey
   ✅ Header updates to "1 online • X total"
   ✅ Footer badge shows "1"
```

#### 5. Rejoin Test
```bash
# Browser 2 (User B)
1. Open browser again
2. Login and rejoin the room

# Browser 1 (User A)
   ✅ User B's green dot reappears
   ✅ Header updates to "2 online • X total"
   ✅ Footer badge shows "2"
```

---

## Detailed Testing

### Backend Verification

#### Check Server Logs
```bash
cd backend
npm start

# Expected output when users join:
User <userId> joined <groupId>

# Expected output when users leave:
User <userId> left <groupId>

# Expected output on disconnect:
user disconnected <userId>
```

#### Monitor Socket Events
Add temporary logging in `group.handler.js`:
```javascript
socket.on("join-group", async (groupId) => {
  console.log("📥 JOIN:", socket.user.id, "→", groupId);
  // ... rest of code
});

socket.on("leave-group", (data) => {
  console.log("📤 LEAVE:", socket.user?.id, "→", data.groupId);
  // ... rest of code
});
```

#### Check Presence Map
Add to `group.handler.js` (temporary):
```javascript
// After roomPresence updates
console.log("🗺️ Presence Map:", 
  Array.from(roomPresence.entries()).map(([k, v]) => 
    [k, Array.from(v)]
  )
);
```

### Frontend Verification

#### Check Browser Console
```javascript
// Should see these logs:
Presence update: { groupId: "...", onlineUsers: [...] }
User joined: { userId: "..." }
User left: { userId: "..." }
```

#### Check Socket Connection
```javascript
// In browser console:
socket.connected  // Should be: true
socket.id         // Should be: "abc123..."
```

#### Check State
Add temporary logging in `Room.jsx`:
```javascript
useEffect(() => {
  console.log("👥 Online Users:", onlineUsers);
}, [onlineUsers]);
```

---

## Automated Test Script

### Backend Test (Node.js)
```javascript
// test-presence.js
const io = require("socket.io-client");

const socket1 = io("http://localhost:3000", {
  withCredentials: true,
  auth: { token: "user1-token" }
});

const socket2 = io("http://localhost:3000", {
  withCredentials: true,
  auth: { token: "user2-token" }
});

const groupId = "test-group-id";

socket1.on("connect", () => {
  console.log("✅ Socket 1 connected");
  socket1.emit("join-group", groupId);
});

socket1.on("room:presence-update", (data) => {
  console.log("📊 Socket 1 presence:", data.onlineUsers.length);
});

socket2.on("connect", () => {
  console.log("✅ Socket 2 connected");
  setTimeout(() => {
    socket2.emit("join-group", groupId);
  }, 1000);
});

socket2.on("room:presence-update", (data) => {
  console.log("📊 Socket 2 presence:", data.onlineUsers.length);
});

// Expected output:
// ✅ Socket 1 connected
// 📊 Socket 1 presence: 1
// ✅ Socket 2 connected
// 📊 Socket 1 presence: 2
// 📊 Socket 2 presence: 2
```

---

## Common Issues & Solutions

### Issue 1: Green dots not appearing
**Symptoms:** All members show grey dots

**Debug:**
```javascript
// Check in browser console:
console.log("Online users:", onlineUsers);
console.log("Members:", members);

// Should see:
// onlineUsers: ["userId1", "userId2"]
// members: [{ user: { _id: "userId1" }, ... }]
```

**Solution:**
- Check socket connection: `socket.connected`
- Check if `room:presence-update` event is received
- Verify user IDs match between `onlineUsers` and `members`

### Issue 2: Count not updating
**Symptoms:** Header shows "0 online" even when users join

**Debug:**
```javascript
// In Room.jsx, check:
console.log("Socket event received:", data);
console.log("State updated:", onlineUsers);
```

**Solution:**
- Ensure `setOnlineUsers` is called in socket listener
- Check if `groupId` matches in event payload
- Verify socket is connected before emitting

### Issue 3: Dots don't turn grey on leave
**Symptoms:** User leaves but dot stays green

**Debug:**
```bash
# Backend logs should show:
User <userId> left <groupId>

# Frontend console should show:
User left: { userId: "..." }
Presence update: { onlineUsers: [...] }
```

**Solution:**
- Check if `leave-group` event is emitted
- Verify `user-left` event is received
- Ensure `onlineUsers` state is updated

### Issue 4: Multiple green dots for same user
**Symptoms:** User appears online multiple times

**Debug:**
```javascript
// Check for duplicates:
console.log("Online users:", onlineUsers);
console.log("Unique count:", new Set(onlineUsers).size);
```

**Solution:**
- Backend uses `Set` to prevent duplicates
- Frontend should deduplicate if needed:
```javascript
setOnlineUsers(prev => [...new Set([...prev, userId])]);
```

---

## Performance Testing

### Load Test: 10 Users
```bash
# Expected behavior:
- All 10 users see each other online
- Header shows "10 online • 10 total"
- No lag in updates
- Memory usage stable
```

### Load Test: 50 Users
```bash
# Expected behavior:
- All users see accurate count
- Updates within 1 second
- Backend memory < 50MB increase
- No socket disconnections
```

### Stress Test: Rapid Join/Leave
```bash
# Test script:
for i in 1..100; do
  join-group
  sleep 0.5
  leave-group
  sleep 0.5
done

# Expected behavior:
- No memory leaks
- Presence map cleans up properly
- No orphaned entries
```

---

## Acceptance Criteria

### Must Have ✅
- [x] Green dot for online users
- [x] Grey dot for offline users
- [x] Real-time updates (< 1 second)
- [x] Accurate online count
- [x] Automatic cleanup on disconnect
- [x] No duplicate users in online list

### Should Have ✅
- [x] Animated pulse on green dots
- [x] Green background for online members
- [x] Footer badge with active count
- [x] Smooth transitions

### Nice to Have 🎯
- [ ] Typing indicators
- [ ] Last seen timestamp
- [ ] User status (away, busy, etc.)
- [ ] Presence analytics

---

## Sign-Off Checklist

Before marking as complete:

- [ ] Backend logs show join/leave events
- [ ] Frontend console shows presence updates
- [ ] Green dots appear for online users
- [ ] Grey dots appear for offline users
- [ ] Online count is accurate
- [ ] Multiple users tested successfully
- [ ] Disconnect handling works
- [ ] No console errors
- [ ] No memory leaks
- [ ] Documentation complete

---

## Next Steps

After presence system is verified:

1. **Phase 3:** Implement chat messaging
2. **Phase 4:** Implement timer synchronization
3. **Phase 5:** Implement collaborative notes
4. **Phase 6:** Add WebRTC for video/audio

---

## Support

If tests fail, check:
1. `PRESENCE_SYSTEM.md` - Implementation details
2. `PRESENCE_VISUAL_GUIDE.md` - Visual reference
3. `TROUBLESHOOTING.md` - Common issues
4. Backend logs for errors
5. Browser console for errors

**Status:** Ready for testing! 🚀
