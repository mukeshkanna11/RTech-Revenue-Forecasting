import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        console.warn("Invalid stored user data");
      }
    }

    setLoading(false);
  }, []);

  // 🔥 Helper: delay (for retry)
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  // 🔥 Login with retry + smart error handling
  const login = async (email, password, rememberMe = false) => {
    // 🌐 Check internet first
    if (!navigator.onLine) {
      throw new Error("No internet connection");
    }

    let lastError;

    // 🔁 Retry 2 times (important for Render cold start)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await API.post(
          "/auth/login",
          { email, password },
          { timeout: 20000 } // ⏳ increase timeout
        );

        const { accessToken, user } = res.data;

        if (!accessToken) {
          throw new Error(res.data?.message || "Invalid credentials");
        }

        // 💾 Store session
        if (rememberMe) {
          localStorage.setItem("token", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.setItem("token", accessToken);
          sessionStorage.setItem("user", JSON.stringify(user));
        }

        setUser(user);
        return user;
      } catch (err) {
        lastError = err;

        // 🚨 If backend unreachable (Render cold start)
        if (!err.response) {
          console.warn(`Retrying login... attempt ${attempt + 1}`);
          await wait(2000); // wait 2s before retry
          continue;
        }

        // ❌ Stop retry for real API errors
        break;
      }
    }

    // 🔥 Final error handling (HR-safe messages)
    if (!lastError.response) {
      throw new Error(
        "Server is starting... please wait a few seconds and try again"
      );
    }

    if (lastError.response?.status === 401) {
      throw new Error("Invalid email or password");
    }

    if (lastError.response?.status === 500) {
      throw new Error("Server error. Please try again later");
    }

    throw new Error(
      lastError.response?.data?.message || "Login failed. Please try again"
    );
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  };

  // 🔗 Social login
  const socialLogin = async (provider) => {
    try {
      const res = await API.post(`/auth/${provider}`, {}, { timeout: 20000 });

      const { accessToken, user } = res.data;

      if (!accessToken) throw new Error("Social login failed");

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return user;
    } catch (err) {
      if (!err.response) {
        throw new Error("Network issue. Please try again");
      }

      throw new Error(
        err.response?.data?.message || "Social login failed"
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, socialLogin, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => useContext(AuthContext);