# ✅ PHASE 2 — Presence System Implementation

## Goal
Show who is currently online inside the room with real-time updates.

---

## 🎯 Implementation Complete

### Backend ✅

#### 1. In-Memory Presence Tracking
**File:** `backend/src/sockets/handlers/group.handler.js`

**Data Structure:**
```javascript
// Map<groupId, Set<userId>>
const roomPresence = new Map();
```

**Features:**
- ✅ Maintains a `roomPresence` Map: `groupId → Set<userId>`
- ✅ Adds user to set on `join-group`
- ✅ Removes user from set on `leave-group` and `disconnect`
- ✅ Broadcasts `room:presence-update` with full member list
- ✅ Cleans up empty sets automatically

#### 2. Socket Events

**On `join-group`:**
```javascript
// 1. Validate user and group
// 2. Add user to Socket.IO room
// 3. Add userId to roomPresence Map
// 4. Emit "user-joined" to others
// 5. Send current online list to joining user
// 6. Broadcast "room:presence-update" to all
```

**On `leave-group`:**
```javascript
// 1. Remove userId from roomPresence Map
// 2. Leave Socket.IO room
// 3. Emit "user-left" to others
// 4. Broadcast "room:presence-update" to remaining users
// 5. Clean up empty sets
```

**On `disconnect`:**
```javascript
// 1. Loop through all roomPresence entries
// 2. Remove user from all groups
// 3. Broadcast "room:presence-update" to each group
// 4. Emit "user-left" to each group
// 5. Clean up empty sets
```

#### 3. Emitted Events

| Event | Payload | When | Recipients |
|-------|---------|------|------------|
| `room:presence-update` | `{ groupId, onlineUsers: [] }` | User joins/leaves | All users in room |
| `user-joined` | `{ userId }` | User joins | Other users in room |
| `user-left` | `{ userId }` | User leaves/disconnects | Other users in room |

---

### Frontend ✅

#### 1. MemberPanel Component
**File:** `frontend/src/components/room/MemberPanel.jsx`

**Features:**
- ✅ Displays all group members
- ✅ Shows online count vs total count
- ✅ Green dot (animated pulse) for online members
- ✅ Grey dot for offline members
- ✅ Highlights online members with success background
- ✅ Shows member role (Admin/Member)
- ✅ Avatar with ring styling
- ✅ Footer with active count badge

**Props:**
```javascript
{
  members: [],      // Array of member objects from API
  onlineUsers: []   // Array of online user IDs
}
```

**Visual Indicators:**
- 🟢 Green pulsing dot = Online
- ⚪ Grey dot = Offline
- Green background tint for online members
- Success badge in footer showing active count

#### 2. Room.jsx Updates
**File:** `frontend/src/pages/Room.jsx`

**Socket Event Listeners:**
```javascript
// Primary event - full online list
socket.on("room:presence-update", (data) => {
  setOnlineUsers(data.onlineUsers || []);
});

// Legacy support - individual join
socket.on("user-joined", (data) => {
  setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
});

// Legacy support - individual leave
socket.on("user-left", (data) => {
  setOnlineUsers(prev => prev.filter(id => id !== data.userId));
});
```

**State Management:**
```javascript
const [onlineUsers, setOnlineUsers] = useState([]);
// Updated by socket events in real-time
```

---

## 🔄 Data Flow

### User Joins Room
```
1. User navigates to /room/:groupId
2. Frontend emits: join-group(groupId)
3. Backend adds user to roomPresence Map
4. Backend emits to user: room:presence-update({ groupId, onlineUsers })
5. Backend broadcasts to room: room:presence-update({ groupId, onlineUsers })
6. Frontend updates onlineUsers state
7. MemberPanel re-renders with green dots
```

### User Leaves Room
```
1. User clicks Back or closes tab
2. Frontend emits: leave-group({ groupId, userId })
3. Backend removes user from roomPresence Map
4. Backend broadcasts to room: room:presence-update({ groupId, onlineUsers })
5. Frontend updates onlineUsers state
6. MemberPanel re-renders without that user's green dot
```

### User Disconnects (Network/Browser Close)
```
1. Socket disconnects
2. Backend detects disconnect event
3. Backend loops through all roomPresence entries
4. Backend removes user from all groups
5. Backend broadcasts room:presence-update to each affected room
6. All connected clients update their UI
```

---

## 🎨 UI/UX Features

### Member Card States

**Online Member:**
```
┌─────────────────────────────┐
│ 🟢 [Avatar]  John Doe       │ ← Green background
│              Admin  ●       │ ← Green dot indicator
└─────────────────────────────┘
```

**Offline Member:**
```
┌─────────────────────────────┐
│ ⚪ [Avatar]  Jane Smith      │ ← Normal background
│              Member         │ ← No dot
└─────────────────────────────┘
```

### Header Stats
```
Members
3 online • 5 total
```

### Footer Badge
```
Active now    [3]
              ↑ Success badge
```

---

## 🧪 Testing Guide

### Test 1: Single User
1. Login and join a room
2. ✅ You should see yourself with a green dot
3. ✅ Header shows "1 online • X total"

### Test 2: Multiple Users
1. Open two browser windows (or incognito)
2. Login with different accounts
3. Both join the same room
4. ✅ Both should see each other with green dots
5. ✅ Header shows "2 online • X total"

### Test 3: User Leaves
1. Have 2+ users in a room
2. One user clicks "Back to Dashboard"
3. ✅ Other users see green dot disappear
4. ✅ Online count decreases

### Test 4: Network Disconnect
1. Have 2+ users in a room
2. One user closes browser/tab
3. ✅ Other users see green dot disappear after ~5 seconds
4. ✅ Online count decreases

### Test 5: Rejoin
1. User leaves room
2. User rejoins same room
3. ✅ Green dot reappears
4. ✅ Online count increases

---

## 🐛 Debugging

### Check Backend Logs
```bash
cd backend
npm start

# Look for:
# "User <userId> joined <groupId>"
# "User <userId> left <groupId>"
# "user disconnected <userId>"
```

### Check Frontend Console
```javascript
// Should see:
console.log("Presence update:", { groupId, onlineUsers: [...] })
console.log("User joined:", { userId })
console.log("User left:", { userId })
```

### Verify Socket Connection
```javascript
// In browser console:
socket.connected  // Should be true
```

### Check roomPresence Map
Add this to backend for debugging:
```javascript
// In group.handler.js
setInterval(() => {
  console.log("Current presence:", 
    Array.from(roomPresence.entries()).map(([k, v]) => 
      [k, Array.from(v)]
    )
  );
}, 10000); // Every 10 seconds
```

---

## 📊 Performance Considerations

### Memory Usage
- Each group stores a Set of user IDs (strings)
- Automatically cleaned up when empty
- Minimal memory footprint

### Network Traffic
- `room:presence-update` sent only on join/leave/disconnect
- Not polling-based (efficient)
- Only sends array of user IDs (small payload)

### Scalability
- Current implementation: In-memory (single server)
- For multi-server: Use Redis with pub/sub
- For 1000+ concurrent users: Consider Redis Sorted Sets

---

## 🚀 Future Enhancements

### Typing Indicators
```javascript
socket.on("user-typing", ({ userId, groupId }) => {
  // Show "User is typing..." in chat
});
```

### Last Seen Timestamp
```javascript
// Store in database
lastSeen: Date
// Show "Last seen 5 minutes ago"
```

### User Status
```javascript
// Add status field
status: "online" | "away" | "busy" | "offline"
// Show colored dots: green, yellow, red, grey
```

### Presence Analytics
```javascript
// Track time spent in room
// Track peak concurrent users
// Generate activity reports
```

---

## 📁 Files Modified

### Backend
- ✅ `backend/src/sockets/handlers/group.handler.js` - Added presence tracking

### Frontend
- ✅ `frontend/src/components/room/MemberPanel.jsx` - New component
- ✅ `frontend/src/pages/Room.jsx` - Integrated MemberPanel and socket events

---

## ✅ Checklist

### Backend
- [x] Maintain `roomPresence` Map in `group.handler.js`
- [x] On `join-group`: add user to set, emit `room:presence-update`
- [x] On `leave-group`: remove user, emit `room:presence-update`
- [x] On `disconnect`: remove user from all groups, emit updates

### Frontend
- [x] Create `components/room/MemberPanel.jsx`
- [x] Listen for `room:presence-update` socket event
- [x] Update `onlineUsers` state
- [x] Show green dot for online members
- [x] Show grey dot for offline members
- [x] Display online count vs total count

---

## 🎉 Result

The presence system is now fully functional! Users can see in real-time who is online in their study room, with visual indicators (green/grey dots) and accurate counts.

**Next Phase:** Implement chat messaging or timer synchronization.
