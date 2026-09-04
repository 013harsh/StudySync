import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
  },

  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    Register: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    deleteuserAccount: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { loginSuccess, logout, Register, setLoading, deleteAccount } =
  authSlice.actions;
export default authSlice.reducer;
