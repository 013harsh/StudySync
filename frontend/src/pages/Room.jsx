import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import MemberPanel from "../components/room/MemberPanel";
import TimerDisplay from "../components/room/TimerDisplay";
import TimerControls from "../components/room/TimerControls";

const API = import.meta.env.VITE_API_URL;

const Room = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [timerSession, setTimerSession] = useState(null);

  // const myRole = user?.role || "user";
  // const isHost = myRole === "admin";
  const myMember = members.find(
    (m) => m.user?._id === user?.id || m.user?._id === user?._id,
  );
  const isHost = myMember?.role === "admin";

  useEffect(() => {
    // Fetch group data using the members endpoint which includes group info
    const fetchGroup = async () => {
      try {
        const res = await fetch(`${API}/api/group/${groupId}/members`, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 404)
            throw new Error("Group not found or you are not a member");
          if (res.status === 401)
            throw new Error("Unauthorized - Please login");
          throw new Error("Failed to load group");
        }

        const data = await res.json();

        setGroupData({
          _id: data.groupId,
          name: data.name,
          type: data.type,
          description: "",
        });
        setMembers(data.members || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    if (!user || !groupId) return;

    // Initialize Socket.IO connection
    socketRef.current = io(API, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    // Join the group room
    socket.emit("join-group", groupId);

    // Listen for presence updates
    socket.on("room:presence-update", (data) => {
      console.log("Presence update:", data);
      if (data.groupId === groupId) {
        setOnlineUsers(data.onlineUsers || []);
      }
    });

    // Listen for user joined (legacy support)
    socket.on("user-joined", (data) => {
      console.log("User joined:", data);
      setOnlineUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    });

    // Listen for user left (legacy support)
    socket.on("user-left", (data) => {
      console.log("User left:", data);
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    // Handle socket errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Timer session events
    socket.on("room:session-started", (data) => {
      console.log("📊 Session started:", data);
      if (data.groupId === groupId && data.session) {
        setTimerSession(data.session);
      }
    });

    socket.on("room:timer-update", (data) => {
      console.log("⏱️ Timer update:", data);
      if (data.groupId === groupId) {
        setTimerSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isRunning: data.isRunning,
            pausedAt: data.pausedAt || null,
            startedAt: data.startedAt || prev.startedAt,
          };
        });
      }
    });

    socket.on("room:session-ended", (data) => {
      console.log("⏹️ Session ended:", data);
      if (data.groupId === groupId) {
        setTimerSession(null);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave-group", { groupId, userId: user.id });
      socket.disconnect();
    };
  }, [groupId, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="max-w-md shadow-xl card bg-base-100">
          <div className="card-body">
            <h2 className="card-title text-error">Error</h2>
            <p>{error}</p>
            <div className="justify-end card-actions">
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-base-200">
      {/* Header */}
      <div className="border-b shadow-sm navbar bg-base-100 border-base-300">
        <div className="flex-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-ghost btn-sm"
          >
            ← Back
          </button>
          <div className="ml-4">
            <h1 className="text-xl font-bold">{groupData?.name}</h1>
            <p className="text-xs text-base-content/60">
              {groupData?.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex-none">
          <span className="mr-4 badge badge-primary">
            {isHost ? "🎯 Host View" : "🎓 Student View"}
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Members & Presence */}
        <MemberPanel members={members} onlineUsers={onlineUsers} />

        {/* Center Panel - Timer */}
        <div className="flex flex-col flex-1">
          <TimerDisplay session={timerSession} isHost={isHost} />
          <div className="border-t border-base-300">
            <TimerControls
              socket={socketRef.current}
              groupId={groupId}
              session={timerSession}
              isHost={isHost}
            />
          </div>
        </div>

        {/* Right Panel - Chat & Notes Tabs */}
        <div className="flex flex-col w-96 border-l bg-base-100 border-base-300">
          {/* Tabs */}
          <div className="border-b tabs tabs-boxed border-base-300">
            <button
              className={`tab flex-1 ${activeTab === "chat" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              💬 Chat
            </button>
            <button
              className={`tab flex-1 ${activeTab === "notes" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              📝 Notes
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "chat" ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="text-center text-base-content/40">
                    <p className="text-sm">Chat messages will appear here</p>
                  </div>
                </div>
                <div className="p-4 border-t border-base-300">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 input input-bordered"
                    />
                    <button className="btn btn-primary">Send</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full p-4">
                <div className="flex-1 overflow-y-auto">
                  <div className="text-center text-base-content/40">
                    <p className="text-sm">Shared notes will appear here</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-base-300">
                  <button className="w-full btn btn-primary btn-sm">
                    + Add Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
