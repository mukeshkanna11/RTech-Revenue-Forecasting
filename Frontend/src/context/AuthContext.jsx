import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore Session
  useEffect(() => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Session restore failed:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Login
  const login = async (email, password, rememberMe = false) => {
    if (!navigator.onLine) {
      throw new Error("No internet connection");
    }

    let lastError = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await API.post(
          "/auth/login",
          { email, password },
          { timeout: 20000 }
        );

        console.log("LOGIN RESPONSE:", res.data);

        const token = res.data.token;
        const user = res.data.user;

        if (!token || !user) {
          throw new Error("Invalid login response");
        }

        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem("token", token);
        storage.setItem("user", JSON.stringify(user));

        setUser(user);

        return user;
      } catch (err) {
        lastError = err;

        if (!err.response) {
          console.warn(
            `Login retry ${attempt + 1}/2 - server may be waking up`
          );

          await wait(2000);
          continue;
        }

        break;
      }
    }

    if (!lastError?.response) {
      throw new Error(
        "Server is starting. Please wait a few seconds and try again."
      );
    }

    switch (lastError.response.status) {
      case 400:
        throw new Error(
          lastError.response.data?.message || "Invalid request"
        );

      case 401:
        throw new Error("Invalid email or password");

      case 403:
        throw new Error("Access denied");

      case 404:
        throw new Error("Service unavailable");

      case 500:
        throw new Error("Server error. Please try again later");

      default:
        throw new Error(
          lastError.response.data?.message || "Login failed"
        );
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
  };

  // Social Login
  const socialLogin = async (provider) => {
    try {
      const res = await API.post(
        `/auth/${provider}`,
        {},
        { timeout: 20000 }
      );

      const token = res.data.token;
      const user = res.data.user;

      if (!token || !user) {
        throw new Error("Invalid social login response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return user;
    } catch (err) {
      if (!err.response) {
        throw new Error("Network error. Please try again.");
      }

      throw new Error(
        err.response?.data?.message || "Social login failed"
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        socialLogin,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);