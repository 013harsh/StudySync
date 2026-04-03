import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import MemberPanel from "../components/room/MemberPanel";
import TimerDisplay from "../components/room/TimerDisplay";
import TimerControls from "../components/room/TimerControls";
import io from "socket.io-client";
import { fetchMessage, uploadFile } from "../store/action/chat.action";

const API = import.meta.env.VITE_API_URL;

const Room = () => {
  const reduxMessages = useSelector((state) => state.chat.messages);

  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [timerSession, setTimerSession] = useState(null);
  const [newMessages, setNewMessages] = useState([]);
  const messages = [...reduxMessages, ...newMessages].filter(
    (msg, index, self) => index === self.findIndex((m) => m._id === msg._id),
  );

  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const myMember = members.find(
    (m) => m.user?._id === user?.id || m.user?._id === user?._id,
  );
  const isHost = myMember?.role === "admin";

  // fectch message
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`${API}/api/group/${groupId}/members`, {
          credentials: "include",
        });

        const data = await res.json();

        setGroupData({
          _id: data.groupId,
          name: data.name,
          type: data.type,
          description: "",
        });
        setMembers(data.members || []);

        if (data.type === "friend") {
          dispatch(fetchMessage(data.groupId));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, dispatch]);

  //not resetting on group change
  useEffect(() => {
    setNewMessages([]);
  }, [groupId]);

  //socket connection
  useEffect(() => {
    if (!user || !groupId) return;

    socketRef.current = io(API, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      upgrade: true,
    });

    const socket = socketRef.current;

    socket.emit("join-group", groupId);

    socket.on("room:presence-update", (data) => {
      console.log("Presence update:", data);
      if (data.groupId === groupId) {
        setOnlineUsers(data.onlineUsers || []);
      }
    });

    socket.on("user-joined", (data) => {
      console.log("User joined:", data);
      setOnlineUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    });

    socket.on("user-left", (data) => {
      console.log("User left:", data);
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

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
            isFinished: data.isFinished || false,
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

    socket.on("receive-message", (data) => {
      setNewMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.emit("leave-group", { groupId, userId: user.id });
      socket.disconnect();
    };
  }, [groupId, user]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit("send-message", {
      groupId,
      message: chatInput.trim(),
    });

    setChatInput("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await uploadFile(groupId, selectedFile, chatInput);
      setSelectedFile(null);
      setChatInput("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const cancelFileSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith("image/")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    if (type.includes("presentation") || type.includes("powerpoint")) return "📽️";
    if (type.includes("zip") || type.includes("rar") || type.includes("7z")) return "🗜️";
    return "📎";
  };

  const renderFileMessage = (msg) => {
    const fileIcon = msg.file?.fileType === "image" ? "🖼️" : 
                     msg.file?.mimeType?.includes("pdf") ? "📄" :
                     msg.file?.mimeType?.includes("word") ? "📝" :
                     msg.file?.mimeType?.includes("sheet") ? "📊" : "📎";
    
    return (
      <div className="chat-bubble">
        <div className="flex items-start gap-2">
          <span className="text-2xl">{fileIcon}</span>
          <div className="flex-1 min-w-0">
            <a 
              href={`${API}${msg.file.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline break-all"
            >
              {msg.file.fileName}
            </a>
            <p className="text-xs opacity-70">{formatFileSize(msg.file.fileSize)}</p>
            {msg.text && <p className="mt-1">{msg.text}</p>}
          </div>
        </div>
      </div>
    );
  };
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
            ← Exit
          </button>
          <div className="ml-4">
            <h1 className="text-lg font-bold">{groupData?.name}</h1>
            <p className="text-xs text-base-content/60">
              {groupData?.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex-none">
          <span className="mr-4 badge badge-primary badge-sm">
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

        {/* Right Panel - Chat */}
        <div className="flex flex-col border-l w-96 bg-base-100 border-base-300">
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-base-content/40">
                  <p className="text-xs">Chat messages will appear here</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`chat ${msg.sender._id === user?.id ? "chat-end" : "chat-start"}`}
                  >
                    <div className="text-xs opacity-50 chat-header">
                      {typeof msg.sender.fullName === "string"
                        ? msg.sender.fullName
                        : `${msg.sender.fullName?.firstName || ""} ${msg.sender.fullName?.lastName || ""}`.trim()}
                    </div>
                    {msg.messageType === "file" ? renderFileMessage(msg) : (
                      <div className="chat-bubble text-sm">{msg.text}</div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-base-300">
              {selectedFile && (
                <div className="mb-3 p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(selectedFile)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs opacity-60">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={cancelFileSelection}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.webp"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-ghost btn-square btn-sm"
                  disabled={uploading}
                >
                  📎
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (selectedFile ? handleFileUpload() : sendMessage())}
                  placeholder={selectedFile ? "Add a caption (optional)..." : "Type a message..."}
                  className="flex-1 input input-bordered input-sm text-sm"
                  disabled={uploading}
                />
                <button 
                  onClick={selectedFile ? handleFileUpload : sendMessage} 
                  className="btn btn-primary btn-sm"
                  disabled={uploading || (!chatInput.trim() && !selectedFile)}
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
