import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import axios from "axios";
import { apiClient } from "./api/config/axiosConfig.js";
import authService from "./api/auth/auth.js";

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Error response:', error.response);
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await authService.refreshAccessToken();
        console.log("New Access",res);
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Error response:', error.response);
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await authService.refreshAccessToken();
        console.log("New Access",res);
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
