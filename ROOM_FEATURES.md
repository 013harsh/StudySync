# Room Page - Feature Breakdown

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: [← Back] Group Name | Description      [🎯 Host View]  │
├──────────┬──────────────────────────────────┬───────────────────┤
│          │                                  │  💬 Chat | 📝 Notes│
│ Members  │         Study Timer              ├───────────────────┤
│ & Online │                                  │                   │
│          │        00:00:00                  │   Tab Content     │
│ 👤 John  │                                  │                   │
│ 🟢 (on)  │    [Start]  [Reset]              │   Messages or     │
│          │                                  │   Notes List      │
│ 👤 Jane  │  Synchronized across members     │                   │
│ ⚪ (off) │                                  │                   │
│          │                                  ├───────────────────┤
│ 2 online │                                  │ [Input / Button]  │
│ 5 total  │                                  │                   │
└──────────┴──────────────────────────────────┴───────────────────┘
```

## Component Hierarchy

```
Room.jsx
├── Header (Navbar)
│   ├── Back Button → /dashboard
│   ├── Group Info (name, description)
│   └── Role Badge (Host/Student)
│
├── Left Panel (w-64)
│   ├── Members Header (count)
│   └── Member List
│       └── Member Card
│           ├── Avatar
│           ├── Online Indicator (green dot)
│           ├── Name
│           └── Role
│
├── Center Panel (flex-1)
│   └── Timer Section
│       ├── Timer Display (00:00:00)
│       ├── Control Buttons
│       └── Sync Message
│
└── Right Panel (w-96)
    ├── Tab Switcher
    │   ├── Chat Tab
    │   └── Notes Tab
    │
    └── Tab Content
        ├── Chat View
        │   ├── Message List
        │   └── Input + Send
        │
        └── Notes View
            ├── Notes List
            └── Add Note Button
```

## State Management

### Local State
```javascript
- groupData: null          // Group info from API
- loading: true            // Initial load state
- error: null              // Error messages
- members: []              // Group members list
- onlineUsers: []          // Currently online user IDs
- activeTab: "chat"        // "chat" or "notes"
```

### Redux State (from auth)
```javascript
- user.id                  // Current user ID
- user.role                // "admin" or "user"
- user.fullName            // User's name
```

### Socket.IO Connection
```javascript
socketRef.current          // Socket instance
- Connected on mount
- Disconnected on unmount
- Emits: join-group, leave-group
- Listens: user-joined, user-left, online-users
```

## User Flows

### 1. Entering a Room
```
Dashboard → Click Group Row → Navigate to /room/:groupId
                                      ↓
                              Fetch group data (REST)
                                      ↓
                              Connect Socket.IO
                                      ↓
                              Emit "join-group"
                                      ↓
                              Render Room Layout
```

### 2. Presence Updates
```
User A joins → Server broadcasts "user-joined"
                        ↓
            All clients update onlineUsers[]
                        ↓
            Green dot appears on User A's avatar
```

### 3. Leaving a Room
```
Click Back / Close Tab → Emit "leave-group"
                                ↓
                        Disconnect socket
                                ↓
                        Navigate to /dashboard
```

## Role-Based Views

### Host View (admin)
- Badge shows: "🎯 Host View"
- Can control timer (future)
- Can manage members (future)
- Full access to all features

### Student View (user)
- Badge shows: "🎓 Student View"
- Can see timer
- Can participate in chat/notes
- Limited control features

## Socket.IO Events

### Client → Server
| Event | Payload | When |
|-------|---------|------|
| `join-group` | `{ groupId, userId }` | On room mount |
| `leave-group` | `{ groupId, userId }` | On room unmount |

### Server → Client
| Event | Payload | Purpose |
|-------|---------|---------|
| `user-joined` | `{ userId }` | Someone joined |
| `user-left` | `{ userId }` | Someone left |
| `online-users` | `{ users: [] }` | Initial online list |

## Styling Details

### Colors & Themes
- Uses DaisyUI semantic tokens
- Primary color for timer and accents
- Success color for online indicators
- Base colors for panels and text

### Responsive Design
- Fixed width panels (left: 64, right: 96)
- Center panel is flexible (flex-1)
- Full height layout (h-screen)
- Overflow handling on scrollable areas

### Interactive Elements
- Hover effects on member cards
- Active tab highlighting
- Button states (loading, disabled)
- Smooth transitions

## API Endpoints Used

### REST API
```
GET /api/group/:groupId
- Fetches group details
- Returns: { group: { name, description, members, ... } }
- Requires authentication
```

### Socket.IO
```
Connection: ws://localhost:3000
- Uses credentials for auth
- Transports: websocket, polling
- Auto-reconnection enabled
```

## Error Handling

### Loading State
- Shows spinner with "Loading room..." message
- Centered on screen

### Error State
- Shows error card with message
- "Back to Dashboard" button
- Handles: 404 (not found), 401 (unauthorized), network errors

### Socket Errors
- Graceful degradation
- Logs to console
- Continues to show UI

## Future Enhancements

### Timer Features
- Start/pause/reset functionality
- Pomodoro mode (25/5 intervals)
- Sound notifications
- Sync across all clients via Socket.IO

### Chat Features
- Real-time message sending
- Message history
- User typing indicators
- File sharing

### Notes Features
- Collaborative editing
- Note categories
- Rich text formatting
- Export/download

### Video/Audio
- WebRTC integration
- Screen sharing
- Mute/unmute controls
- Video grid layout
