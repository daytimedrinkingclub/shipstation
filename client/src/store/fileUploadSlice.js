import { createSlice } from "@reduxjs/toolkit";

const fileUploadSlice = createSlice({
  name: "fileUpload",
  initialState: {
    filesToUpload: [],
  },
  reducers: {
    setFilesToUpload: (state, action) => {
      state.filesToUpload = action.payload;
    },
    addFilesToUpload: (state, action) => {
      state.filesToUpload = [...state.filesToUpload, ...action.payload];
    },
    removeFileToUpload: (state, action) => {
      state.filesToUpload = state.filesToUpload.filter(
        (_, index) => index !== action.payload
      );
    },
  },
});

export const { setFilesToUpload, addFilesToUpload, removeFileToUpload } =
  fileUploadSlice.actions;
export default fileUploadSlice.reducer;
