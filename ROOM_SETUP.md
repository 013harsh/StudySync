# Room Page Setup Instructions

## Installation

Install the required Socket.IO client dependency:

```bash
cd frontend
npm install socket.io-client@^4.7.2
```

## Features Implemented

### ✅ Room Page (`/room/:groupId`)
- Protected route requiring authentication
- Dynamic route parameter for group ID
- Full-screen layout optimized for collaboration

### ✅ User Role Detection
- Automatically detects if user is admin (host view) or regular user (student view)
- Role displayed in header badge
- Based on Redux auth state

### ✅ Socket.IO Integration
- Emits `join-group` event on mount with `{ groupId, userId }`
- Emits `leave-group` event on unmount
- Listens for presence updates (`user-joined`, `user-left`, `online-users`)
- Auto-reconnection with websocket transport

### ✅ Three-Panel Layout

#### Left Panel - Members & Presence
- Shows all group members
- Real-time online status indicators (green dot)
- Member avatars and roles
- Online count vs total count

#### Center Panel - Timer
- Large display for study timer (00:00:00)
- Start/Reset controls
- Placeholder for synchronized timer functionality
- Centered and prominent

#### Right Panel - Chat & Notes Tabs
- Tab switcher between Chat and Notes
- Chat: Message list + input field with Send button
- Notes: Notes list + Add Note button
- Ready for Socket.IO message integration

### ✅ Navigation
- GroupsTable rows are now clickable
- Clicking a group navigates to `/room/:groupId`
- Back button in Room header returns to Dashboard

## File Changes

### New Files
- `frontend/src/pages/Room.jsx` - Main room component

### Modified Files
- `frontend/src/Routes/Routes.jsx` - Added `/room/:groupId` protected route
- `frontend/src/components/dashboard/GroupsTable.jsx` - Added click handler for navigation
- `frontend/package.json` - Added socket.io-client dependency

## Usage

1. Install dependencies (see Installation above)
2. Start the backend server
3. Start the frontend dev server
4. Login and navigate to Dashboard
5. Click any group row to enter the room

## Socket.IO Events

### Emitted by Client
- `join-group` - When entering room: `{ groupId, userId }`
- `leave-group` - When leaving room: `{ groupId, userId }`

### Expected from Server
- `user-joined` - When another user joins: `{ userId }`
- `user-left` - When another user leaves: `{ userId }`
- `online-users` - Initial list of online users: `{ users: [] }`

## Next Steps

To complete the implementation, you'll need to:

1. Implement timer synchronization logic
2. Add chat message sending/receiving via Socket.IO
3. Add notes CRUD operations
4. Add WebRTC for video/audio (if needed)
5. Enhance error handling and loading states

## Environment Variables

Make sure your `.env` file has:
```
VITE_API_URL=http://localhost:3000
```

## Notes

- The backend Socket.IO handlers are already in place (not modified per requirements)
- The room fetches group data via REST API on mount
- Socket connection uses credentials for authentication
- All styling uses DaisyUI components for consistency
