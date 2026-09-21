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

<img width="1424" height="1328" alt="image" src="https://github.com/user-attachments/assets/34218e7d-ace6-4096-b10a-48a0818d1ec0" />

## GitDiagram

<img width="1234" height="1536" alt="image" src="https://github.com/user-attachments/assets/21544805-a31f-4002-9ae4-91d57bc68ed4" />

## GitDiagram 2

<img width="1762" height="696" alt="image" src="https://github.com/user-attachments/assets/4c90fa92-33a6-45cd-a8f0-7f063d546bc2" />


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
