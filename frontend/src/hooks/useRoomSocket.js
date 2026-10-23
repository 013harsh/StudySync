import { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";

const API = import.meta.env.VITE_API_URL;

export const useRoomSocket = ({
  groupId,
  user,
  setMembers,
  onGroupDeleted,
}) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [timerSession, setTimerSession] = useState(null);
  const [newMessages, setNewMessages] = useState([]);

  // Use refs for callbacks to avoid re-triggering the socket effect on every render
  const setMembersRef = useRef(setMembers);
  setMembersRef.current = setMembers;

  const onGroupDeletedRef = useRef(onGroupDeleted);
  onGroupDeletedRef.current = onGroupDeleted;

  // Clear incoming chat messages whenever groupId changes
  useEffect(() => {
    setNewMessages([]);
  }, [groupId]);

  const currentUserId = String(user?.id || user?._id || "");

  useEffect(() => {
    if (!currentUserId || !groupId) return;

    const newSocket = io(API, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      upgrade: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Join room when connected
    newSocket.on("connect", () => {
      newSocket.emit("join-group", groupId);
    });
    if (newSocket.connected) {
      newSocket.emit("join-group", groupId);
    }

    // Presence update
    newSocket.on("room:presence-update", (data) => {
      console.log("Presence update:", data);
      if (data.groupId === groupId) {
        setOnlineUsers(data.onlineUsers || []);
      }
    });

    // User joined presence
    newSocket.on("user-joined", (data) => {
      console.log("User joined:", data);
      setOnlineUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    });

    // User left presence
    newSocket.on("user-left", (data) => {
      console.log("User left:", data);
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });

    // Group member joined
    newSocket.on("group:user-joined", (data) => {
      console.log("Group member joined:", data);
      if (data.groupId === groupId && setMembersRef.current) {
        setMembersRef.current((prev) => {
          if (
            prev.some(
              (m) => String(m.user?._id || m.user) === String(data.userId),
            )
          ) {
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

    // Group member left
    newSocket.on("group:user-left", (data) => {
      console.log("Group member left:", data);
      if (data.groupId === groupId && setMembersRef.current) {
        setMembersRef.current((prev) => {
          let updated = prev.filter(
            (m) => String(m.user?._id || m.user) !== String(data.userId),
          );
          if (data.newAdmin) {
            updated = updated.map((m) =>
              String(m.user?._id || m.user) === String(data.newAdmin)
                ? { ...m, role: "admin" }
                : m,
            );
          }
          return updated;
        });
      }
    });

    // Error
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Timer: session started
    newSocket.on("room:session-started", (data) => {
      console.log("📊 Session started:", data);
      if (data.groupId === groupId && data.session) {
        setTimerSession(data.session);
      }
    });

    // Timer: update
    newSocket.on("room:timer-update", (data) => {
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

    // Timer: session ended
    newSocket.on("room:session-ended", (data) => {
      console.log("⏹️ Session ended:", data);
      if (data.groupId === groupId) {
        setTimerSession(null);
      }
    });

    // Chat messages
    newSocket.on("receive-message", (data) => {
      const msgData = {
        ...data,
        _id: data._id || `temp-${Date.now()}-${Math.random()}`,
      };
      setNewMessages((prev) => [...prev, msgData]);
    });

    // Group deleted
    newSocket.on("group:deleted", (data) => {
      console.log("Group deleted:", data);
      if (data.groupId === groupId) {
        if (onGroupDeletedRef.current) {
          onGroupDeletedRef.current(data);
        } else {
          alert("This group has been deleted by an admin.");
        }
      }
    });

    return () => {
      newSocket.emit("leave-group", { groupId, userId: currentUserId });
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [groupId, currentUserId]);

  // Send message helper
  const sendMessage = useCallback(
    (message) => {
      if (!message || !message.trim()) return;
      if (socketRef.current) {
        socketRef.current.emit("send-message", {
          groupId,
          message: message.trim(),
        });
      }
    },
    [groupId],
  );

  return {
    socket,
    socketRef,
    onlineUsers,
    setOnlineUsers,
    timerSession,
    setTimerSession,
    newMessages,
    setNewMessages,
    sendMessage,
  };
};

export default useRoomSocket;
