import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/auth.slice";
import chatReducer from "./reducer/chat.slice";
import groupReducer from "./reducer/group.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    group: groupReducer,
  },
});
