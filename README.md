# StudySync

StudySync is a comprehensive full-stack web application designed to facilitate online learning and collaboration. Built with a modern tech stack, it features real-time communication, state management, and a sleek user interface.

## 🚀 Features

- **User Authentication**: Secure login and registration using JSON Web Tokens (JWT) and Google OAuth.
- **Real-Time Communication**: Integrated WebSockets (Socket.io) for real-time interactions, chat, or notifications.
- **State Management**: Robust frontend state handling utilizing Redux Toolkit.
- **Responsive UI**: Beautiful and modern user interface built with React, Tailwind CSS, DaisyUI, and Framer Motion for animations.
- **File Uploads**: Support for uploading and managing files/resources via Multer.
- **Caching & Performance**: Redis integration on the backend for fast data retrieval and session management.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS & DaisyUI
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Real-Time**: Socket.io-client
- **Animations**: Framer Motion, React TSParticles, React Snowfall
- **Authentication**: React OAuth (Google)
- **HTTP Client**: Axios

### Backend
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Caching**: Redis
- **Real-Time**: Socket.io
- **Authentication**: JWT, Google Auth Library, bcrypt
- **File Uploads**: Multer
- **Development**: Nodemon

## 📂 Project Structure

Directory structure:
└── 013harsh-studysync/
    ├── README.md
    ├── backend/
    │   ├── package.json
    │   ├── server.js
    │   ├── public/
    │   │   └── index.html
    │   ├── src/
    │   │   ├── app.js
    │   │   ├── controller/
    │   │   │   ├── auth.controller.js
    │   │   │   ├── chat.controller.js
    │   │   │   └── group.controller.js
    │   │   ├── db/
    │   │   │   └── db.js
    │   │   ├── middleware/
    │   │   │   ├── auth.middleware.js
    │   │   │   ├── socket.middleware.js
    │   │   │   └── upload.middleware.js
    │   │   ├── model/
    │   │   │   ├── chat.model.js
    │   │   │   ├── group.model.js
    │   │   │   └── user.model.js
    │   │   ├── routes/
    │   │   │   ├── auth.routes.js
    │   │   │   ├── chat.routes.js
    │   │   │   └── group.routes.js
    │   │   ├── services/
    │   │   │   └── chat.service.js
    │   │   └── sockets/
    │   │       ├── io.js
    │   │       ├── socket.server.js
    │   │       └── handlers/
    │   │           ├── chat.handler.js
    │   │           ├── group.handler.js
    │   │           ├── studyRoom.handler.js
    │   │           └── webrtc.handler.js
    │   └── uploads/
    │       └── documents/
    │           └── .gitkeep
    └── frontend/
        ├── eslint.config.js
        ├── index.html
        ├── package.json
        ├── postcss.config.js
        ├── tailwind.config.js
        ├── vite.config.js
        ├── .env.example
        └── src/
            ├── App.jsx
            ├── index.css
            ├── main.jsx
            ├── components/
            │   ├── ErrorBoundary.jsx
            │   ├── Footer.jsx
            │   ├── Hero.jsx
            │   ├── NavBar.jsx
            │   ├── ProtectedRoute.jsx
            │   ├── dashboard/
            │   │   ├── GroupsTable.jsx
            │   │   ├── InviteCodes.jsx
            │   │   ├── QuickActions.jsx
            │   │   ├── StatCard.jsx
            │   │   └── UserProfileCard.jsx
            │   ├── groups/
            │   │   ├── CreateGroupModal.jsx
            │   │   └── JoinGroupModal.jsx
            │   └── room/
            │       ├── CallUI.jsx
            │       ├── MemberPanel.jsx
            │       ├── TimerControls.jsx
            │       └── TimerDisplay.jsx
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
            │   └── footer/
            │       ├── About.jsx
            │       ├── Contact.jsx
            │       ├── Privacy.jsx
            │       └── Terms.jsx
            ├── Routes/
            │   └── Routes.jsx
            ├── store/
            │   ├── store.jsx
            │   ├── action/
            │   │   ├── auth.action.jsx
            │   │   ├── chat.action.jsx
            │   │   └── group.action.jsx
            │   └── reducer/
            │       ├── auth.slice.jsx
            │       ├── chat.slice.jsx
            │       └── group.slice.jsx
            └── utils/
                └── webrtc.js

## GitDiagram

<img width="1234" height="1536" alt="image" src="https://github.com/user-attachments/assets/21544805-a31f-4002-9ae4-91d57bc68ed4" />

## ⚙️ Getting Started
### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher recommended)
- MongoDB (running locally or a MongoDB Atlas URI)
- Redis Server (running locally)

### 1. Clone the repository

```bash
git clone https://github.com/013harsh/StudySync.git
cd StudySync
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on `.env.example` (or set up the necessary environment variables):
- `PORT` (e.g., 5000)
- `MONGO_URI`
- `JWT_SECRET`
- `REDIS_URL`
- Google OAuth credentials

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory based on `.env.example` (or set up the necessary environment variables, usually prefixed with `VITE_`).

Start the frontend development server:
```bash
npm run dev
```

The frontend will typically run on `http://localhost:5173`.

## 📜 Scripts

### Backend (`/backend`)
- `npm run dev`: Starts the backend server with nodemon for development.
- `npm start`: Starts the backend server with node.

### Frontend (`/frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to check for code issues.
