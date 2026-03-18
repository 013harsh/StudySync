# StudySync — Deep Codebase Analysis (March 2026)

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend runtime | Node.js + Express | Express 5.x |
| Database | MongoDB via Mongoose | Mongoose 9.x |
| Real-time | Socket.IO | 4.8.x |
| Auth | JWT (HTTP-only cookie + localStorage mirror) | jsonwebtoken 9.x |
| Frontend | React + Vite | React 19, Vite 7 |
| State | Redux Toolkit | 2.x |
| Styling | TailwindCSS + DaisyUI | TW 3.x, DaisyUI 4.x |
| Animation | Framer Motion | 12.x |
| Video calls | WebRTC (browser-native) | N/A |
| Particles | tsParticles + react-snowfall | — |

**Entry points:**
- Backend: [backend/server.js](file:///d:/web%20development/project/StudySync/backend/server.js) → HTTP server on port `3000`, Socket.IO attached
- Frontend: [frontend/index.html](file:///d:/web%20development/project/StudySync/frontend/index.html) → [main.jsx](file:///d:/web%20development/project/StudySync/frontend/src/main.jsx) → React/Redux/Router tree → [App.jsx](file:///d:/web%20development/project/StudySync/frontend/src/App.jsx)

---

## 2. Backend Architecture

### 2.1 Directory Map

```
backend/
├── server.js              ← Creates HTTP server, attaches Socket.IO, starts on :3000
└── src/
    ├── app.js             ← Express app, CORS, cookie-parser, REST routes
    ├── db/db.js           ← Mongoose connect (MONGO_URI from .env)
    ├── model/
    │   ├── user.model.js
    │   ├── group.model.js
    │   ├── chat.model.js
    │   └── notes.model.js
    ├── controller/
    │   ├── auth.controller.js      (193 lines)
    │   ├── group.controller.js     (321 lines)
    │   ├── chat.controller.js      (157 lines)
    │   └── notes.controller.js     (3.5 KB)
    ├── routes/
    │   ├── auth.routes.js
    │   ├── group.routes.js
    │   ├── chat.routes.js
    │   └── notes.routes.js
    ├── middleware/
    │   ├── auth.middleware.js      ← HTTP JWT guard
    │   └── socket.middleware.js   ← Socket.IO JWT guard
    ├── services/
    │   └── chat.service.js        ← DB helpers for messages
    ├── sockets/
    │   ├── io.js                  ← Singleton getIO/setIO
    │   ├── socket.server.js       ← Registers all 5 handlers
    │   └── handlers/
    │       ├── group.handler.js   (3.5 KB)
    │       ├── chat.handler.js    (3.2 KB)
    │       ├── notes.handler.js   (7.5 KB)
    │       ├── studyRoom.handler.js (7.7 KB)
    │       └── webrtc.handler.js  (5.8 KB)
    └── utils/             ← ⚠️ EMPTY — never populated
```

### 2.2 Data Models (Mongoose Schemas)

#### [User](file:///d:/web%20development/project/StudySync/backend/src/controller/auth.controller.js#67-120)
```js
{
  fullName: { firstName: String (req), lastName: String (req) },
  email:    String (unique, lowercase, req),
  password: String (bcrypt, minLength 8, req),
  role:     'user' | 'admin'  (default: 'user'),
  timestamps: true
}
```

#### [Group](file:///d:/web%20development/project/StudySync/backend/src/controller/group.controller.js#104-158)
```js
{
  name:        String (req, trimmed),
  description: String (default ""),
  createdBy:   ObjectId → User (req),
  type:        'study' | 'friend'  (default: 'study'),
  members: [{
    user:     ObjectId → User,
    role:     'admin' | 'member',
    joinedAt: Date
  }],
  inviteCode:  String (unique, 12-char hex uppercase),
  timestamps: true
}
```

> [!NOTE]
> **Two group types** drive feature segregation:
> - `friend` groups: messages are persisted in MongoDB, history is available via REST.
> - `study` groups: messages are ephemeral (real-time only), never saved to DB.

#### `Message (Chat)`
```js
{
  groupId:  ObjectId → Group  (indexed),
  sender:   ObjectId → User   (req),
  text:     String             (req),
  aiStatus: 'approved' | 'warned' | 'blocked'  (default 'approved'),  // ⚠️ dead field
  isEdited: Boolean,
  readBy:   [ObjectId → User],
  timestamps: true
}
```

#### `Note`
```js
{
  groupId:      ObjectId → Group  (unique — one note per group),
  content:      Mixed  (Quill Delta JSON, default {ops:[]}),
  version:      Number (increments on every save),
  lastEditedBy: ObjectId → User,
  timestamps: true
}
```

---

### 2.3 REST API — Complete Route Table

All routes live under `/api/*`. Protected routes use `authMiddleware` (reads HTTP cookie `token`, verifies JWT with DB lookup, attaches `req.user`).

#### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Hash password, create user, issue JWT cookie → 201 |
| POST | `/login` | ❌ | Verify password, issue JWT cookie → 200 |
| POST | `/logout` | ❌ | Clear `token` cookie → 200 |
| PUT | `/update-profile` | ✅ | Update `fullName`, re-issue JWT cookie → 200 |

> [!IMPORTANT]
> There is **no `GET /api/auth/me`** endpoint. The app cannot verify an existing session from the server side without login — see Bug #4 below.

#### Group — `/api/group`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/create` | ✅ | Create group, auto-generate `inviteCode` |
| POST | `/join` | ✅ | Join by `inviteCode`, emits `group:user-joined` |
| GET | `/my-groups` | ✅ | All groups user belongs to (with `myRole`) |
| DELETE | `/delete/:id` | ✅ | Creator-only delete, emits `group:deleted` |
| PUT | `/leave/:id` | ✅ | Leave, promote next admin if needed |
| GET | `/:id/members` | ✅ | Member list — also used by [Room.jsx](file:///d:/web%20development/project/StudySync/frontend/src/pages/Room.jsx) to get group metadata |

#### Notes — `/api/notes`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/groups/:id` | ✅ | Upsert + return note |
| PUT | `/groups/:id` | ✅ | Save full content, increment version, emit `note:saved` |

#### Chat — `/api/chat`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/:id/messages` | ✅ | Paginated history (friend groups only), marks read |
| DELETE | `/message/:id` | ✅ | Sender-only delete, emits `message-deleted` |
| PUT | `/message/:id` | ✅ | Sender-only edit, emits `message-edited` |
| GET | `/:id/unread` | ✅ | Unread message count |

---

### 2.4 Socket System (Real-time Layer)

**Architecture:** [socket.server.js](file:///d:/web%20development/project/StudySync/backend/src/sockets/socket.server.js) creates [Server](file:///d:/web%20development/project/StudySync/backend/src/sockets/socket.server.js#10-40), applies `socketAuth` middleware (reads `socket.handshake.auth.token` — JWT only, no DB lookup), then delegates to 5 independent handler modules per connection.

#### Socket Event Reference

| Handler | Events → Server | Events → Client |
|---|---|---|
| `group.handler` | `join-group`, `leave-group`, `disconnect` | `user-joined`, `user-left`, `room:presence-update` |
| `chat.handler` | `send-message`, `typing`, `message-seen` | `receive-message`, `typing`, `message-seen` |
| `notes.handler` | `note:join`, `note:update`, `note:save`, `note:get`, `note:leave`, `note:cursor` | `note:init`, `note:updated`, `note:saved`, `note:cursor` |
| `studyRoom.handler` | `room:start-session`, `room:pause`, `room:resume`, `room:end-session`, `disconnect` | `room:session-started`, `room:timer-update`, `room:session-ended` |
| `webrtc.handler` | `call:offer`, `call:answer`, `call:ice-candidate`, `call:reject`, `call:end`, `disconnect` | `call:offer`, `call:answer`, `call:ice-candidate`, `call:rejected`, `call:end`, `call:busy`, `call:error` |

#### In-Memory State (Single-Process Only)

| Map | Lives In | Purpose |
|---|---|---|
| `roomPresence: Map<groupId, Set<userId>>` | `group.handler` | Who's online in each room |
| `sessions: Map<groupId, session>` | `studyRoom.handler` | Active study timer sessions |
| `onlineUsers: Map<userId, socketId>` | `webrtc.handler` | User-to-socket mapping for calls |
| `activeCalls: Map<userId, peerId>` | `webrtc.handler` | Tracks who is in a call |

> [!WARNING]
> All four Maps are **in-process RAM only**. Server restart or horizontal scaling (PM2 cluster, multiple Heroku dynos) **wipes all state**. The WebRTC handler itself has a comment acknowledging this and recommending Redis.

#### Chat Handler — Critical Detail
`send-message` handler:
1. Verifies `socket.user` and group membership via DB
2. For **friend** groups: persists to [Message](file:///d:/web%20development/project/StudySync/backend/src/controller/chat.controller.js#7-47) collection
3. For **study** groups: does NOT persist (ephemeral)
4. Broadcasts `receive-message` to every socket in the `groupId` room

#### StudyRoom Handler — Countdown Auto-Finish
When a countdown session starts, a `setTimeout(duration)` is set. On expiry:
- Sets `session.isRunning = false` and `session.isFinished = true`
- Emits `room:timer-update` with `{ isFinished: true, isRunning: false }`
- Does **NOT** delete the session (so resume is still possible)

> [!CAUTION]
> [Room.jsx](file:///d:/web%20development/project/StudySync/frontend/src/pages/Room.jsx)'s `room:timer-update` listener (lines 120–133) does **not** read `isFinished` from the payload. The timer will simply stop updating, but the UI won't show a "finished" indicator.

---

### 2.5 Middleware

#### `authMiddleware` (HTTP)
```
cookie token → jwt.verify() → User.findById() → req.user = {id, fullName, email, role}
```
Every authenticated REST request makes a DB round-trip to confirm the user still exists. **Performance note** (left as a comment in the code): "a short-lived cache would help at scale."

#### `socketAuth`
```
socket.handshake.auth.token → jwt.verify() → socket.user = payload (no DB lookup)
```

> [!CAUTION]
> **Auth mismatch:** [Room.jsx](file:///d:/web%20development/project/StudySync/frontend/src/pages/Room.jsx) connects to Socket.IO with `{ withCredentials: true }` — it does **NOT** pass a token in `handshake.auth`. The `socketAuth` middleware reads `socket.handshake.auth.token`. If the token is missing, `jwt.verify(undefined, secret)` will throw and the middleware likely rejects the connection. **Sockets may not authenticate correctly.**

---

## 3. Frontend Architecture

### 3.1 Directory Map

```
frontend/src/
├── main.jsx              ← Redux Provider + BrowserRouter + ToastContainer
├── App.jsx               ← Renders <NavBar/> + <AppRoutes/>
├── index.css             ← Minimal (59 bytes — styles come from Tailwind/DaisyUI)
├── Routes/Routes.jsx     ← 11 routes, 4 protected
├── store/
│   ├── store.jsx         ← configureStore with authReducer
│   └── authSlice.jsx     ← login/logout + localStorage persistence
├── context/
│   └── ThemeContext.jsx  ← Provides theme toggle (likely dark/light)
├── pages/
│   ├── Home.jsx          (7.2 KB)
│   ├── Login.jsx         (5.3 KB)
│   ├── Registration.jsx  (6.3 KB)
│   ├── Dashboard.jsx     (5.2 KB)
│   ├── Room.jsx          (10.5 KB)  ← Most complex page
│   ├── Account.jsx       (12.8 KB) ← Largest page
│   ├── Features.jsx      (11.1 KB)
│   ├── About.jsx
│   ├── Terms.jsx
│   ├── Privacy.jsx
│   └── Contact.jsx
├── components/
│   ├── NavBar.jsx        (4.8 KB)
│   ├── Footer.jsx        (1.8 KB)
│   ├── Hero.jsx
│   ├── ProtectedRoute.jsx
│   ├── ErrorBoundary.jsx
│   ├── dashboard/        ← GroupsTable, UserProfileCard, QuickActions, InviteCodes, ...
│   ├── groups/           ← CreateGroupModal.jsx, JoinGroupModal.jsx
│   └── room/
│       ├── MemberPanel.jsx
│       ├── TimerDisplay.jsx
│       ├── TimerControls.jsx
│       └── CallUI.jsx    ← ⚠️ 422 lines, fully implemented, NEVER MOUNTED
└── utils/webrtc.js       ← WebRTC peer connection helpers
```

### 3.2 State Management — `authSlice`

**Since last analysis — this has changed significantly:**

```js
// authSlice.jsx (current)
const userFromStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const initialState = {
  user: userFromStorage,      // ← reads from localStorage on init
  isAuthenticated: !!userFromStorage,
};

reducers: {
  login: (state, action) => {
    state.user = action.payload;
    state.isAuthenticated = true;
    localStorage.setItem("user", JSON.stringify(action.payload));  // ← persists
  },
  logout: (state) => {
    state.user = null;
    state.isAuthenticated = false;
    localStorage.removeItem("user");  // ← clears
  },
}
```

> [!IMPORTANT]
> **The refresh-and-logout bug is now partially fixed.** The user object is persisted to `localStorage` on login and rehydrated on app start. `ProtectedRoute` will no longer redirect after a refresh. However, the JWT payload in `localStorage` is **never validated** — if the cookie expires or is cleared server-side, the `localStorage` value can still be stale, leaving the user appearing logged-in in the UI while their API requests get 401 errors.

### 3.3 Routing

| Path | Component | Protected | Notes |
|---|---|---|---|
| `/` | Home | ❌ | |
| `/login` | Login | ❌ | |
| `/register` | Registration | ❌ | |
| `/about` | About | ❌ | |
| `/terms` | Terms | ❌ | |
| `/privacy` | Privacy | ❌ | |
| `/contact` | Contact | ❌ | |
| `/features` | Features | ✅ | |
| `/dashboard` | Dashboard | ✅ | |
| `/account` | Account | ✅ | |
| `/room/:groupId` | Room | ✅ | |

`ProtectedRoute` checks `user` in Redux state.

---

### 3.4 Room.jsx — Current State (Fully Read)

[Room.jsx](file:///d:/web%20development/project/StudySync/frontend/src/pages/Room.jsx) is the most important page and has been updated since the previous analysis.

**What's now wired:**
```
✅ Fetches group data from GET /api/group/:id/members (also gets name, type)
✅ Socket.IO connection with { withCredentials: true }
✅ Emits join-group on mount, leave-group on unmount
✅ Listens: room:presence-update, user-joined, user-left
✅ Listens: room:session-started, room:timer-update, room:session-ended
✅ Renders MemberPanel, TimerDisplay, TimerControls
✅ Chat: send-message socket emit + receive-message listener
✅ Chat: input + Enter key handler + message list with chat bubbles
```

**What's still missing:**
```
❌ Chat: no message history fetch on load (only receives new messages via socket)
❌ Chat: no typing indicator
❌ Chat: no edit/delete on messages
❌ Chat: sender._id comparison uses user?.id but Redux stores id under different shape
❌ Notes: tab is a stub (shows placeholder, "Add Note" button does nothing)
❌ Notes: no note:join / note:update / note:save events
❌ CallUI: never imported or rendered
❌ room:timer-update: isFinished flag never consumed
```

**Chat sender ID bug (line 266):**
```jsx
// Room.jsx line 266
className={`chat ${msg.sender._id === user?.id ? "chat-end" : "chat-start"}`}
```
`user?.id` comes from Redux/localStorage. The JWT payload stores `id: user._id` (ObjectId string). The `receive-message` payload has `sender._id`. These should match, but need to verify the format is consistent (string vs ObjectId).

---

## 4. Data Flow Diagrams

### 4.1 Authentication Flow
```
Register/Login
  → POST /api/auth/login
  → backend: bcrypt.compare → jwt.sign → res.cookie("token") 
  → frontend: dispatch(login(user)) → localStorage.setItem("user")
  → Redux state.auth.user = { id, email, fullName, role }

App Start (Refresh)
  → authSlice reads localStorage → Redux state hydrated
  → ProtectedRoute passes  ✅

API Request
  → fetch(url, { credentials: "include" })
  → browser sends cookie automatically
  → authMiddleware verifies cookie token

Socket Connection
  → io(API, { withCredentials: true })
  → socket.handshake.auth.token = undefined  ⚠️
  → socketAuth: jwt.verify(undefined) → THROWS
```

### 4.2 Chat Message Flow
```
User types → presses Enter
  → sendMessage() called
  → socket.emit("send-message", { groupId, message })
  → chat.handler: validates, checks membership (DB)
  → if friend group: Message.create() in MongoDB
  → io.to(groupId).emit("receive-message", { sender, text, ... })
  → ALL connected clients in that room receive message
  → Room.jsx: setMessages(prev => [...prev, data])
  → Chat bubble renders
```

### 4.3 Notes Flow (Backend Only — Frontend Not Wired)
```
note:join → joins note:${groupId} room → upserts Note doc → emits note:init to joiner
note:update → broadcasts Quill delta to room (no DB write)
note:save → persists full content → emits note:saved with new version
note:cursor → relays cursor position to collaborators
note:leave → leaves note room
```

### 4.4 WebRTC Call Flow
```
Caller                    Server                   Receiver
  │─call:offer──────────►│                              │
  │                       │─call:offer──────────────────►│
  │                       │◄─call:answer────────────────│
  │◄─call:answer──────────│                              │
  │─call:ice-candidate───►│─call:ice-candidate──────────►│
  │◄─call:ice-candidate───│◄─call:ice-candidate──────────│
  │                (peer connection established)          │
  │─call:end─────────────►│─call:end────────────────────►│
```
**Status:** Backend fully implemented. Frontend `CallUI.jsx` is fully implemented. **They are not connected** — `CallUI` is never imported in [Room.jsx](file:///d:/web%20development/project/StudySync/frontend/src/pages/Room.jsx).

---

## 5. Bugs Register

### 🔴 Critical

| # | Bug | Location | Impact |
|---|---|---|---|
| 1 | **Socket auth broken** — [Room.jsx](file:///d:/web%20development/project/StudySync/frontend/src/pages/Room.jsx) connects with `withCredentials: true` but NO `auth.token`. `socketAuth` reads `handshake.auth.token` → `jwt.verify(undefined)` throws → socket connection rejected | `Room.jsx:71`, `socket.middleware.js` | Socket.IO likely fails to authenticate; all real-time features broken |
| 2 | **Notes tab is a stub** — Entire notes backend (handler, controller, model) exists and works. Frontend tab shows placeholder only | `Room.jsx:295-306` | Full collaborative notes feature is inaccessible |
| 3 | **CallUI never mounted** — 422-line, fully implemented WebRTC component exists but is never imported or used | `CallUI.jsx` | Video call feature completely inaccessible |
| 4 | **No message history load** — Chat only receives new socket messages. On entering a room (friend groups), existing messages are never fetched | [Room.jsx](file:///d:/web%20development/project/StudySync/frontend/src/pages/Room.jsx), missing call to `GET /api/chat/:id/messages` | Users can't see chat history when joining a room |

### 🟡 Significant

| # | Bug | Location | Impact |
|---|---|---|---|
| 5 | **isFinished never consumed** — `room:timer-update` emits `isFinished: true` when countdown ends. [Room.jsx](file:///d:/web%20development/project/StudySync/frontend/src/pages/Room.jsx) listener only spreads `isRunning`, `pausedAt`, `startedAt` | `Room.jsx:123-130` | No "timer done" UI state; users won't know countdown finished |
| 6 | **Stale localStorage auth** — Cookie can expire server-side while `localStorage` still has user object → user appears logged in but API returns 401 | [authSlice.jsx](file:///d:/web%20development/project/StudySync/frontend/src/store/authSlice.jsx) | Silent auth failures, confusing UX |
| 7 | **`aiStatus` is dead schema data** — Field exists in `chat.model.js` but is never set. No AI moderation service exists | `chat.model.js` | Bloat; confusing future maintainers |
| 8 | **CORS origins hardcoded** — Both [app.js](file:///d:/web%20development/project/StudySync/backend/src/app.js) and [socket.server.js](file:///d:/web%20development/project/StudySync/backend/src/sockets/socket.server.js) hardcode `http://localhost:5173` | Both files | Won't work in production without code change |
| 9 | **[leaveGroup](file:///d:/web%20development/project/StudySync/backend/src/controller/group.controller.js#158-223) emits `group:deleted`** when last member leaves — frontend listeners for `group:deleted` will treat "group became empty" the same as "group was deleted by admin" | `group.controller.js:194` | Potentially confusing for clients |

### 🟢 Minor / Style

| # | Issue | Location |
|---|---|---|
| 10 | `backend/src/utils/` is empty — created but never populated | `backend/src/utils/` |
| 11 | Old dead `room:start-session` implementation (lines 7–55) left as commented-out code | `studyRoom.handler.js` |
| 12 | `note:cursor` event is fully implemented on backend but never consumed on frontend | `notes.handler.js:177` |
| 13 | `typing` socket event is implemented in `chat.handler` but not consumed in `Room.jsx` | `chat.handler.js:71` |
| 14 | `message-seen` socket event never emitted from frontend | `Room.jsx` |
| 15 | `axios` is installed in `package.json` but `Room.jsx` and most pages use native `fetch` — inconsistent | `frontend/package.json` |
| 16 | `react-snowfall`, `react-tsparticles`, `tsparticles` are installed — appears used only for visual effects. Adds ~200KB to bundle | `frontend/package.json` |

---

## 6. Feature Completion Matrix

| Feature | Backend | Frontend | Status |
|---|---|---|---|
| Registration / Login / Logout | ✅ | ✅ | **Complete** |
| Profile update (name) | ✅ | ✅ | **Complete** |
| Auth persistence (refresh) | ✅ | ✅ localStorage | **Complete (partial — cookie expiry risk)** |
| Create / Join / Leave / Delete group | ✅ | ✅ | **Complete** |
| Dashboard (groups list, stats) | ✅ | ✅ | **Complete** |
| Study Room (join, presence) | ✅ | ✅ | **Complete** |
| Shared Timer (start/pause/resume/end) | ✅ | ✅ | **Complete** |
| Real-time Chat send/receive | ✅ | ✅ (new!) | **Mostly complete — missing history load** |
| Chat message history (friend groups) | ✅ | ❌ not fetched | **Backend only** |
| Chat typing indicator | ✅ | ❌ | **Backend only** |
| Chat edit / delete message | ✅ | ❌ | **Backend only** |
| Message read receipts | ✅ | ❌ | **Backend only** |
| Shared Notes | ✅ | ❌ stub | **Backend only** |
| Collaborative note cursors | ✅ | ❌ | **Backend only** |
| WebRTC Video Calls | ✅ | ✅ (CallUI) | **Implemented but disconnected** |
| AI Message Moderation | ❌ | ❌ | **Only schema field** |
| Session token validation on load | ❌ | ❌ | **Missing** |

---

## 7. Security Notes

| Topic | Finding |
|---|---|
| JWT Cookie | `httpOnly: true`, `sameSite: 'strict'`, `secure` in production — good |
| XSS via localStorage | `user` object stored in `localStorage` (not sensitive — no password/token, just profile info) |
| Socket auth gap | Token not passed to Socket.IO handshake — authentication likely bypassed or broken |
| Password hashing | bcrypt with saltRounds=10 — appropriate |
| Input validation | Controllers validate inputs before DB operations — good |
| Object ID validation | `mongoose.Types.ObjectId.isValid()` used before DB queries — good |
| Admin-only actions | Timer start/pause/resume/end check `session.hostId === userId` — good |
| Group delete | Only `createdBy` user can delete — good |
| Message delete/edit | Only sender can modify — good |

---

## 8. Recommendations (Priority Order)

### 🔴 Must Fix Now

1. **Fix Socket.IO auth** — In `Room.jsx`, pass the stored token to the socket connection:
   ```js
   const user = JSON.parse(localStorage.getItem("user"));
   // OR add a /api/auth/token endpoint to get a fresh token
   socketRef.current = io(API, {
     withCredentials: true,
     auth: { token: yourJWTToken }  // ← this line is missing
   });
   ```
   The challenge: the token is in an HTTP-only cookie, not accessible from JS. Consider adding `GET /api/auth/token` that returns just the user payload, or use a separate short-lived auth token for Socket.IO.

2. **Wire Notes in Room.jsx** — Emit `note:join` on mount, listen for `note:init` to get content, emit `note:update` on changes, `note:save` periodically. Integrate a text editor (Quill is implied by the Delta format).

3. **Mount CallUI in Room.jsx** — Import and render `<CallUI socket={socketRef.current} groupId={groupId} />`. The component already handles all WebRTC logic.

4. **Load message history for friend groups** — On room enter, call `GET /api/chat/:groupId/messages` and populate the `messages` state before listening for socket messages.

### 🟡 Should Fix Soon

5. **Handle `isFinished` in timer update** — Add `isFinished: data.isFinished || false` to the `room:timer-update` state update.

6. **Add `/api/auth/me` endpoint** — Verifies cookie and returns user payload. Call it on app start. Update Redux + localStorage from the response to keep them in sync.

7. **Move CORS origins to `.env`** — `FRONTEND_URL=http://localhost:5173` in both `app.js` and `socket.server.js`.

8. **Add typing indicators** — In the chat input, emit `typing` event on keydown and stop on blur/send.

### 🟢 Nice To Have

9. Wire `message-seen` when user views messages
10. Add edit/delete buttons to chat messages (with UI for owned messages)
11. Remove dead `aiStatus` from schema or implement real moderation
12. Remove the commented-out old `room:start-session` code from `studyRoom.handler.js`
13. Add bundle size audit — `react-snowfall`, `tsparticles` add weight
14. Populate `backend/src/utils/` with shared helpers (e.g., `generateToken()`, `sendError()`)
