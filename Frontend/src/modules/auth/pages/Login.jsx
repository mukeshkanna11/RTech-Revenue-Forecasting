import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import bgImage from "../../../assets/login2.jpg"; 
import logoImage from "../../../assets/logo.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value.trim() }));
  };

  // 🔥 Dynamic loading messages (SaaS feel)
  useEffect(() => {
    let timer;

    if (loading) {
      setStatusMsg("Signing you in...");

      timer = setTimeout(() => {
        setStatusMsg("Connecting to server...");
      }, 4000);

      setTimeout(() => {
        setStatusMsg("Server is waking up, please wait...");
      }, 8000);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      // 🔥 Clean SaaS-safe messages
      if (err.message.includes("Server")) {
        setError("Server is busy. Please try again in a moment.");
      } else if (err.message.includes("Network")) {
        setError("Network issue. Check your connection.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Form */}
<div className="relative z-10 w-full max-w-2xl p-10 mx-4 border shadow-2xl bg-gradient-to-br from-[#0b0b12]/95 via-[#111827]/90 to-[#2e1065]/90 rounded-3xl backdrop-blur-xl border-white/10">

  {/* 🔥 Header Section */}
  <div className="flex flex-col items-center gap-4 mb-8 text-center">
    
    {/* Logo */}
    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-lg">
      <img src={logoImage} className="w-14 h-14 rounded-full bg-black/80"/>
    </div>

    {/* Title */}
    <h2 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">
      Welcome to{" "}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
        ReadyTech
      </span>
    </h2>

    {/* Subtitle */}
    <p className="max-w-md text-sm text-gray-300">
      Securely access your revenue dashboard, insights, and analytics in one place.
    </p>

    {/* Badge */}
    <span className="px-3 py-1 text-xs text-purple-300 border border-purple-500 rounded-full bg-purple-500/10">
      SaaS Revenue Intelligence Platform
    </span>
  </div>

  {/* 🔥 Status Message */}
  {loading && (
    <div className="p-3 mb-4 text-sm text-blue-300 border border-blue-500 rounded-lg bg-blue-900/30 animate-pulse">
      {statusMsg}
    </div>
  )}

  {/* Error */}
  {error && (
    <div className="p-3 mb-4 text-sm text-red-400 border border-red-600 rounded-lg bg-red-900/30 animate-shake">
      {error}
    </div>
  )}

  {/* Form */}
  <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">

    {/* Email */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium tracking-wide text-gray-300 uppercase">
        Email Address
      </label>

      <div className="flex items-center px-4 py-3 transition-all duration-300 border rounded-xl bg-white/5 border-white/10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30">
        <Mail size={18} className="text-purple-300"/>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@company.com"
          className="w-full ml-3 text-sm text-white placeholder-gray-400 bg-transparent outline-none"
          required
        />
      </div>
    </div>

    {/* Password */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium tracking-wide text-gray-300 uppercase">
        Password
      </label>

      <div className="flex items-center px-4 py-3 transition-all duration-300 border rounded-xl bg-white/5 border-white/10 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30">
        <Lock size={18} className="text-purple-300"/>

        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full ml-3 text-sm text-white placeholder-gray-400 bg-transparent outline-none"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-gray-400 hover:text-white"
        >
          {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
        </button>
      </div>
    </div>

    {/* Button */}
    <div className="sm:col-span-2">
      <button
        type="submit"
        disabled={loading}
        className={`relative w-full py-3 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300
        ${loading 
          ? "bg-gray-700 cursor-not-allowed" 
          : "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:scale-[1.02] hover:brightness-110 shadow-lg shadow-purple-500/30"
        }`}
      >
        {!loading && (
          <span className="absolute inset-0 opacity-0 hover:opacity-20 transition bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 blur-xl"></span>
        )}

        <span className="relative flex items-center justify-center gap-2">
          {loading ? "Please wait..." : "Login to Dashboard"}
          {!loading && <LogIn size={16}/>}
        </span>
      </button>
    </div>
  </form>

  {/* Footer */}
  <p className="mt-8 text-xs text-center text-gray-400">
    © 2026 ReadyTechSolutions • Secure Access • All rights reserved
  </p>
</div>
    </div>
  );
}