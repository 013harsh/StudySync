import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    allUsers: [],
    usersLoading: false,
    usersError: null,
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
      state.allUsers = [];
      state.usersLoading = false;
      state.usersError = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUsersLoading: (state, action) => {
      state.usersLoading = action.payload;
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
      state.usersLoading = false;
      state.usersError = null;
    },
    setUsersError: (state, action) => {
      state.usersError = action.payload;
      state.usersLoading = false;
    },
    deleteuserAccount: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.allUsers = [];
      state.usersLoading = false;
      state.usersError = null;
    },
  },
});

export const {
  loginSuccess,
  logout,
  Register,
  setLoading,
  deleteuserAccount,
  setAllUsers,
  setUsersLoading,
  setUsersError,
} = authSlice.actions;
export default authSlice.reducer;
