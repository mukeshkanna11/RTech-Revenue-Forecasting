import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from storage
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (token && userData) setUser(JSON.parse(userData));
    setLoading(false);
  }, []);

  // Login with email/password
  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      const { accessToken, user } = res.data;

      if (!accessToken) throw new Error(res.data?.message || "Invalid credentials");

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
      console.error("Login error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Invalid credentials");
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

  // Social login (Google/GitHub placeholder)
  const socialLogin = async (provider) => {
    try {
      const res = await API.post(`/auth/${provider}`);
      const { accessToken, user } = res.data;

      if (!accessToken) throw new Error("Social login failed");

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err) {
      console.error("Social login error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Social login failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, socialLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);