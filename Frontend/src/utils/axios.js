import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 🔥 increase to 30s (VERY IMPORTANT)
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach token
API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 Smart retry (handles Render cold start)
const retryRequest = async (error) => {
  const config = error.config;

  if (!config || config.__retryCount >= 2) {
    return Promise.reject(error);
  }

  config.__retryCount = config.__retryCount || 0;
  config.__retryCount += 1;

  // wait before retry (important)
  await new Promise((res) => setTimeout(res, 2000));

  return API(config);
};

// ✅ Global response handling
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    // 🔥 Retry if server not responding (timeout / network)
    if (!error.response) {
      console.warn("⚠️ Network issue / server waking up...");
      return retryRequest(error);
    }

    // 🔐 Unauthorized
    if (status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }

    // 💥 Server error
    if (status === 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default API;