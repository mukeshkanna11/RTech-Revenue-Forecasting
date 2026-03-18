import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // must be set in Netlify and .env.local
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (status === 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default API;