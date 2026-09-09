import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import MemberPanel from "../components/room/MemberPanel";
import TimerDisplay from "../components/room/TimerDisplay";
import TimerControls from "../components/room/TimerControls";
import io from "socket.io-client";
import {
  fetchMessage,
  uploadFile,
  removeMessage,
} from "../store/action/chat.action";
import { getGroupMembers } from "../store/action/group.action";

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

  const [showChat, setShowChat] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const currentUserId = String(user?.id || user?._id || "");
  const myMember = members.find((m) => {
    const memberUserId = String(m.user?._id || m.user || "");
    return memberUserId === currentUserId;
  });
  const isHost = myMember?.role === "admin";

  // fectch message
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const data = await dispatch(getGroupMembers(groupId));

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

  useEffect(() => {
    setNewMessages([]);
  }, [groupId]);

  useEffect(() => {
    if (!user || !groupId) return;

    socketRef.current = io(API, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      upgrade: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join-group", groupId);
    });
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

    socket.on("group:user-joined", (data) => {
      console.log("Group member joined:", data);
      if (data.groupId === groupId) {
        setMembers((prev) => {
          if (prev.some((m) => String(m.user?._id || m.user) === String(data.userId))) {
            return prev;
          }
          return [
            ...prev,
            {
              user: { _id: data.userId, fullName: data.fullName },
              role: "member",
              joinedAt: new Date().toISOString(),
            },
          ];
        });
      }
    });

    socket.on("group:user-left", (data) => {
      console.log("Group member left:", data);
      if (data.groupId === groupId) {
        setMembers((prev) => {
          let updated = prev.filter((m) => String(m.user?._id || m.user) !== String(data.userId));
          if (data.newAdmin) {
            updated = updated.map((m) => 
              String(m.user?._id || m.user) === String(data.newAdmin) 
                ? { ...m, role: "admin" } 
                : m
            );
          }
          return updated;
        });
      }
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
      const msgData = {
        ...data,
        _id: data._id || `temp-${Date.now()}-${Math.random()}`,
      };
      setNewMessages((prev) => [...prev, msgData]);
    });

    socket.on("group:deleted", (data) => {
      console.log("Group deleted:", data);
      if (data.groupId === groupId) {
        alert("This group has been deleted by an admin.");
        navigate("/dashboard");
      }
    });

    return () => {
      socket.emit("leave-group", { groupId, userId: user.id });
      socket.disconnect();
    };
  }, [groupId, user]);

  const handleDelete = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      dispatch(removeMessage(messageId));
      setNewMessages((prev) => prev.filter((m) => m._id !== messageId));
    }
  };

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
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "📽️";
    if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
      return "🗜️";
    return "📎";
  };

  const isOwnMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    const currentUserId = user?._id || user?.id;
    return String(senderId) === String(currentUserId);
  };

  const renderDropdown = (msg) => {
    if (!isOwnMessage(msg)) return null;
    return (
      <div className="absolute transition-opacity opacity-0 top-1 right-1 dropdown dropdown-end group-hover:opacity-100">
        <div
          tabIndex={0}
          role="button"
          className="w-6 h-6 min-h-0 p-0 btn btn-ghost btn-xs btn-circle text-base-content"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[10] menu p-1 shadow bg-base-100 rounded-box w-24 text-xs"
        >
          <li>
            <a className="text-error" onClick={() => handleDelete(msg._id)}>
              Delete
            </a>
          </li>
        </ul>
      </div>
    );
  };

  const renderFileMessage = (msg) => {
    const fileIcon =
      msg.file?.fileType === "image"
        ? "🖼️"
        : msg.file?.mimeType?.includes("pdf")
          ? "📄"
          : msg.file?.mimeType?.includes("word")
            ? "📝"
            : msg.file?.mimeType?.includes("sheet")
              ? "📊"
              : "📎";

    return (
      <div className="relative pr-8 group chat-bubble">
        <div className="flex items-start gap-2">
          <span className="text-2xl">{fileIcon}</span>
          <div className="flex-1 min-w-0">
            <a
              href={`${API}${msg.file.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium break-all hover:underline"
            >
              {msg.file.fileName}
            </a>
            <p className="text-xs opacity-70">
              {formatFileSize(msg.file.fileSize)}
            </p>
            {msg.text && <p className="mt-1">{msg.text}</p>}
          </div>
        </div>
        {renderDropdown(msg)}
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
        <div className="flex items-center flex-none gap-2">
          <span className="hidden mr-4 badge badge-primary badge-sm sm:inline-flex">
            {isHost ? "🎯 Host View" : "🎓 Student View"}
          </span>

          <div className="mr-2 dropdown dropdown-end lg:hidden">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[50] p-2 shadow bg-base-100 rounded-box w-40"
            >
              <li>
                <a onClick={() => setShowMembers(true)}>👥 Members</a>
              </li>
              <li>
                <a onClick={() => setShowChat(true)}>💬 Chat</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="relative flex flex-col flex-1 overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* Left Panel - Members & Presence */}
        <MemberPanel
          members={members}
          onlineUsers={onlineUsers}
          showOnMobile={showMembers}
          onClose={() => setShowMembers(false)}
        />

        {/* Center Panel - Timer */}
        <div className="flex flex-col flex-1 min-h-[400px] order-1 lg:order-2">
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
        <div
          className={`
          absolute inset-0 z-50 lg:static lg:z-auto
          flex-col lg:border-l w-full lg:w-96 bg-base-100 border-base-300
          ${showChat ? "flex" : "hidden lg:flex"}
          order-3 lg:order-3
        `}
        >
          <div className="flex items-center justify-between p-3 border-b shadow-sm border-base-300 lg:hidden">
            <h2 className="text-lg font-bold">Group Chat</h2>
            <button
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => setShowChat(false)}
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-base-content/40">
                  <p className="text-xs">Chat messages will appear here</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`chat ${isOwnMessage(msg) ? "chat-end" : "chat-start"}`}
                  >
                    <div className="text-xs opacity-50 chat-header">
                      {typeof msg.sender.fullName === "string"
                        ? msg.sender.fullName
                        : `${msg.sender.fullName?.firstName || ""} ${msg.sender.fullName?.lastName || ""}`.trim()}
                    </div>
                    {msg.messageType === "file" ? (
                      renderFileMessage(msg)
                    ) : (
                      <div className="relative pr-8 text-sm group chat-bubble">
                        {msg.text}
                        {renderDropdown(msg)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-base-300">
              {selectedFile && (
                <div className="p-3 mb-3 rounded-lg bg-base-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className="text-2xl">
                        {getFileIcon(selectedFile)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs opacity-60">
                          {formatFileSize(selectedFile.size)}
                        </p>
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
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedFile) handleFileUpload();
                  else sendMessage();
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.webp"
                />
                <button
                  type="button"
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
                  placeholder={
                    selectedFile
                      ? "Add a caption (optional)..."
                      : "Type a message..."
                  }
                  className="flex-1 text-sm input input-bordered input-sm"
                  disabled={uploading}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={uploading || (!chatInput.trim() && !selectedFile)}
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Send"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
