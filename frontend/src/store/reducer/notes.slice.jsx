import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
  name: "notes",

  initialState: {},
  reducers: {
    isMember(state, action) {
      state.isMember = action.payload;
    },
    getNote(state, action) {
      state.notes = action.payload;
    },
    saveNote(state, action) {
      state.notes.push(action.payload);
    },
  },
});

export const { saveNote, getNote, isMember } = notesSlice.actions;
export default notesSlice.reducer;
