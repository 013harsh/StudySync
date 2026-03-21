import { createSlice } from "@reduxjs/toolkit";

const groupSlice = createSlice({
  name: "group",

  initialState: {
    group: [],
    currentGroup: null,
    member: [],
    loading: false,
    error: null,
  },
  reducers: {
    addGroup: (state, action) => {
      state.group.push(action.payload);
    },
    deleteg: (state, action) => {
      state.group = state.group.filter((group) => group._id !== action.payload);
    },
    setGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
    setGroups: (state, action) => {
      state.group = action.payload;
    },
  },
});

export const { addGroup, deleteg, setGroup, setGroups } = groupSlice.actions;
export default groupSlice.reducer;
