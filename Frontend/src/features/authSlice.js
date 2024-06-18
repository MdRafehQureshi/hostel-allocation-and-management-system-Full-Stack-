import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  status: JSON.parse(sessionStorage.getItem("status")) || false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.userData = action.payload.data.user;
      state.status = true;
      sessionStorage.setItem("status","true")
    },

    logout: (state) => {
      state.userData = null;
      state.status = false;
      sessionStorage.clear()
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
