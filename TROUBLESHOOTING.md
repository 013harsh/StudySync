# Room Page Troubleshooting Guide

## Issues Fixed

### 1. ❌ "Group not found" Error (404)
**Problem:** The frontend was calling `/api/group/:groupId` which doesn't exist.

**Solution:** Updated to use `/api/group/:groupId/members` endpoint which:
- Returns group information (name, type, memberCount)
- Returns all members with their details
- Verifies user is a member of the group

### 2. ⚠️ WebSocket Connection Warning
**Problem:** Socket.IO shows "WebSocket connection to 'ws://localhost:3000/socket.io/' failed"

**Possible Causes:**
1. Backend server is not running
2. Socket.IO server not initialized properly
3. CORS configuration issue

**Solutions:**

#### Check if Backend is Running
```bash
cd backend
npm start
```

You should see: `server on port 3000`

#### Verify Socket.IO is Working
The backend already has Socket.IO configured in:
- `backend/src/sockets/socket.server.js` - Socket initialization
- `backend/src/sockets/io.js` - Socket instance export
- `backend/server.js` - HTTP server with Socket.IO

#### Check Browser Console
If you see the warning but the page works, it's likely just trying websocket first before falling back to polling (normal behavior).

## How to Test the Room Page

### Step 1: Start Backend
```bash
cd backend
npm start
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Access the Room
1. Login to your account
2. Go to Dashboard
3. Click on any group row
4. You should see the Room page with:
   - Group name in header
   - Members list on left
   - Timer in center
   - Chat/Notes tabs on right

## Expected API Calls

When you enter a room, the frontend makes:

### 1. REST API Call
```
GET /api/group/:groupId/members
Headers: Cookie (authentication)

Response:
{
  "groupId": "...",
  "name": "Group Name",
  "type": "study",
  "memberCount": 5,
  "members": [
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "fullName": { "firstName": "John", "lastName": "Doe" },
        "email": "john@example.com"
      },
      "role": "admin",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Socket.IO Connection
```javascript
// Emitted by client
socket.emit("join-group", { groupId, userId })

// Expected from server
socket.on("user-joined", { userId })
socket.on("user-left", { userId })
socket.on("online-users", { users: [] })
```

## Common Errors and Fixes

### Error: "Group not found or you are not a member"
**Cause:** You're trying to access a group you're not a member of, or the group doesn't exist.

**Fix:** 
1. Go back to Dashboard
2. Join a group using an invite code
3. Or create a new group
4. Then click on that group

### Error: "Unauthorized - Please login"
**Cause:** Your session expired or you're not logged in.

**Fix:**
1. Go to `/login`
2. Login with your credentials
3. Navigate back to Dashboard
4. Click on a group

### Error: "Failed to load group"
**Cause:** Backend server is not running or network error.

**Fix:**
1. Check if backend is running on port 3000
2. Check browser console for detailed error
3. Verify `.env` file has correct `VITE_API_URL`

## Debugging Tips

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Look for:
   - `/api/group/:id/members` - Should return 200 OK
   - `socket.io` requests - Should show connection attempts

### Check Console Tab
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - Socket.IO connection logs
   - Any error messages
   - API response errors

### Verify Backend Routes
```bash
# In backend directory
grep -r "router.get" src/routes/group.routes.js
```

Should show:
```javascript
router.get("/my-groups", authMiddleware, getMyGroups);
router.get("/:id/members", authMiddleware, getGroupMembers);
```

## Socket.IO Connection States

### Normal Behavior
```
1. Attempting websocket connection (may show warning)
2. Falls back to polling if websocket fails
3. Connection established
4. Emits join-group event
5. Receives online-users list
```

### If Connection Fails
```
1. Check backend is running
2. Check CORS settings in backend
3. Check firewall/antivirus blocking port 3000
4. Try accessing http://localhost:3000 directly
```

## Data Flow

```
User clicks group row
        ↓
Navigate to /room/:groupId
        ↓
Fetch group data (REST API)
        ↓
Connect Socket.IO
        ↓
Emit join-group event
        ↓
Render room with members
        ↓
Listen for presence updates
```

## Next Steps After Fixing

Once the room loads successfully:
1. ✅ Members list should show all group members
2. ✅ Your role badge should show (Host/Student)
3. ✅ Timer should be visible
4. ✅ Chat/Notes tabs should be clickable
5. ⏳ Socket.IO events need backend implementation for real-time features

## Need More Help?

Check these files:
- `frontend/src/pages/Room.jsx` - Room component
- `backend/src/routes/group.routes.js` - API routes
- `backend/src/controller/group.controller.js` - API logic
- `backend/src/sockets/socket.server.js` - Socket.IO setup
