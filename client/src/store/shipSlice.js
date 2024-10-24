// src/store/shipSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  slug: null,
};

const shipSlice = createSlice({
  name: "ship",
  initialState,
  reducers: {
    setShipInfo: (state, action) => {
      state.id = action.payload.id;
      state.slug = action.payload.slug;
    },
    clearShipInfo: (state) => {
      state.id = null;
      state.slug = null;
    },
  },
});

export const { setShipInfo, clearShipInfo } = shipSlice.actions;
export default shipSlice.reducer;
