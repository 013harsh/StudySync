import { createSlice } from "@reduxjs/toolkit";

const ChatSlice = createSlice({
  name: "chat",

  initialState: {
    messages: [],
    activeChat: [],
    isTyping: false,
    onlineUsers: [],
    typingUser: null,
  },
  reducers: {
    getMessages: (state, action) => {
      state.messages = action.payload;
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(
        (message) => message._id !== action.payload,
      );
    },
    editMessage: (state, action) => {
      state.messages = state.messages.map((message) =>
        message._id === action.payload._id
          ? { ...message, text: action.payload.text }
          : message,
      );
    },
  },
});

export const { getMessages, deleteMessage, editMessage } = ChatSlice.actions;
export default ChatSlice.reducer;
