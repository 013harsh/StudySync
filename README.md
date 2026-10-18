# StudySync 📚

A real-time study collaboration platform where students can create/join study groups, chat, share documents, video call, and track study sessions with built-in timers — all in one place.

**Live Demo:** [Add your deployed link here]

---

## ✨ Features

- 🔐 **Authentication** — secure signup/login with protected routes
- 👥 **Study Groups** — create groups, generate/share invite codes, join existing groups
- 💬 **Real-time Chat** — group messaging powered by Socket.IO
- 📞 **Video Calls** — peer-to-peer calling in study rooms via WebRTC
- ⏱️ **Study Timers** — shared timer controls/display for focused study sessions (e.g. Pomodoro-style)
- 📁 **Document Uploads** — share files/documents within groups
- 📊 **Dashboard** — stats cards, groups table, invite codes, and user profile overview
- 🌗 **Theming** — light/dark mode via Theme Context
- 📱 **Responsive UI** — built with Tailwind CSS

---

## 🛠️ Tech Stack

**Frontend**
- React (JSX) + Vite
- Redux (actions/reducers via `store/`)
- Tailwind CSS + PostCSS
- Socket.IO Client
- WebRTC (`utils/webrtc.js`)
- React Router (`Routes/Routes.jsx`)

**Backend**
- Node.js + Express (`app.js`, `server.js`)
- Socket.IO (real-time chat, group events, study rooms, WebRTC signaling)
- MongoDB (via `db.js` / Mongoose-style models)
- JWT-based auth middleware
- Multer-style upload middleware for document sharing

---

## 📁 Project Structure

```
013harsh-studysync/
├── backend/
│   ├── server.js                     # Server entry point
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── app.js                    # Express app setup
│       ├── controller/
│       │   ├── auth.controller.js
│       │   ├── chat.controller.js
│       │   └── group.controller.js
│       ├── db/
│       │   └── db.js                 # DB connection
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── socket.middleware.js
│       │   └── upload.middleware.js
│       ├── model/
│       │   ├── chat.model.js
│       │   ├── group.model.js
│       │   └── user.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── chat.routes.js
│       │   └── group.routes.js
│       ├── services/
│       │   └── chat.service.js
│       └── sockets/
│           ├── io.js
│           ├── socket.server.js
│           └── handlers/
│               ├── chat.handler.js
│               ├── group.handler.js
│               ├── studyRoom.handler.js
│               └── webrtc.handler.js
│
└── frontend/
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        │   ├── ErrorBoundary.jsx
        │   ├── Footer.jsx
        │   ├── Hero.jsx
        │   ├── NavBar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── dashboard/            # GroupsTable, InviteCodes, QuickActions, StatCard, UserProfileCard
        │   ├── groups/                # CreateGroupModal, JoinGroupModal
        │   └── room/                  # CallUI, MemberPanel, TimerControls, TimerDisplay
        ├── context/
        │   └── ThemeContext.jsx
        ├── pages/
        │   ├── Account.jsx
        │   ├── Dashboard.jsx
        │   ├── Features.jsx
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Registration.jsx
        │   ├── Room.jsx
        │   └── footer/                # About, Contact, Privacy, Terms
        ├── Routes/
        │   └── Routes.jsx
        ├── store/
        │   ├── store.jsx
        │   ├── action/                # auth, chat, group actions
        │   └── reducer/               # auth, chat, group slices
        └── utils/
            └── webrtc.js
```
## GitDiagram

<img width="1234" height="1536" alt="image" src="https://github.com/user-attachments/assets/21544805-a31f-4002-9ae4-91d57bc68ed4" />

---
## GitDiagram 2

<img width="1762" height="696" alt="image" src="https://github.com/user-attachments/assets/4c90fa92-33a6-45cd-a8f0-7f063d546bc2" />

----
## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd 013harsh-studysync
```

### 2. Backend setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` with your configuration, e.g.:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```
Start the backend:
```bash
npm start
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```
Update `.env` with the backend API/socket URL, then start the dev server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧩 Key Modules

| Module | Purpose |
|---|---|
| `sockets/handlers/chat.handler.js` | Real-time group chat events |
| `sockets/handlers/group.handler.js` | Group membership/live updates |
| `sockets/handlers/studyRoom.handler.js` | Study room presence/session events |
| `sockets/handlers/webrtc.handler.js` | WebRTC signaling for video calls |
| `utils/webrtc.js` (frontend) | Peer connection setup for calls |
| `store/` (Redux) | Auth, chat, and group state management |
| `middleware/upload.middleware.js` | Handles document uploads to `uploads/documents` |

---

## 📦 Deployment

- **Backend:** Deploy to any Node hosting (Render, Railway, EC2, etc.) with MongoDB connection configured.
- **Frontend:** Build with `npm run build` and deploy the static output (Vercel, Netlify, etc.), pointing `.env` to the deployed backend URL.

---

## 📌 Roadmap / Ideas

- [ ] File preview for uploaded documents
- [ ] Group study session history/analytics
- [ ] Push notifications for group activity
- [ ] Mobile-responsive video call layout improvements

---

## 🙋 About

Built by **Harsh** — a B.Tech Computer Science student and Full Stack (MERN) Developer, exploring real-time collaborative tools.

---

## 📄 License

This project is open source. Feel free to fork and adapt it — attribution appreciated!
