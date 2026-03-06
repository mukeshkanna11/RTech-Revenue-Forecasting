import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user on page refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    setLoading(false);
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });

      console.log("Login Response:", res.data); // debug

      const token = res?.data?.accessToken;
      const userData = res?.data?.user;

      if (!token) {
        throw new Error(res?.data?.message || "Invalid credentials");
      }

      // Save token & user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return true;
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Invalid credentials");
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook
export const useAuth = () => useContext(AuthContext);