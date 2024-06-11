import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authData: null,
  status: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.authData = action.payload;
      state.status = true;
    },

    logout: (state) => {
      state.authData = null;
      state.status = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
