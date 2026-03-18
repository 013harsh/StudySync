import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/auth.sclice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
