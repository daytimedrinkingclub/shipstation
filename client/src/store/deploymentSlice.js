import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDeploying: false,
};

const deploymentSlice = createSlice({
  name: "deployment",
  initialState,
  reducers: {
    setIsDeploying: (state, action) => {
      state.isDeploying = action.payload;
    },
  },
});

export const { setIsDeploying } = deploymentSlice.actions;
export default deploymentSlice.reducer;
