import { useState } from "react";
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

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value.trim() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Floating gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob top-[-15%] left-[-10%]"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 top-1/3 right-[-15%]"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 bottom-[-10%] left-1/4"></div>
      </div>

      {/* Premium login form */}
      <div className="relative z-10 w-full max-w-2xl p-8 mx-4 border bg-gradient-to-br from-black/95 via-[#0f0f1a]/90 to-[#2e1065]/80 rounded-3xl backdrop-blur-lg sm:mx-auto">
        {/* Logo + Company Name */}
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <img src={logoImage} alt="Company Logo" className="object-contain w-16 h-16 rounded-full shadow-lg"/>
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-center sm:text-4xl">
  <span className="text-white">ReadyTech</span>{" "}
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
    Revenue Dashboard
  </span>
</h2>
        </div>

        <p className="mb-6 text-xs tracking-wide text-center text-gray-200 uppercase">
          Secure login to manage ReadyTechSolutions revenue insights
        </p>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 border border-red-600 rounded-lg bg-red-900/20 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
  
  {/* Email */}
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-medium tracking-wide text-gray-200 uppercase">
      Email Address
    </label>

    <div className="relative flex items-center px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900/70 backdrop-blur-md transition-all duration-300 
    focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40 shadow-inner shadow-black/40">

      <Mail size={16} className="mr-3 text-gray-200" />

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@company.com"
        className="w-full text-sm text-white placeholder-gray-500 bg-transparent outline-none"
        required
      />

      {/* Glow effect */}
      <div className="absolute inset-0 transition duration-300 opacity-0 pointer-events-none rounded-xl focus-within:opacity-100 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 blur-md"></div>
    </div>
  </div>

  {/* Password */}
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-medium tracking-wide text-gray-200 uppercase">
      Password
    </label>

    <div className="relative flex items-center px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900/70 backdrop-blur-md transition-all duration-300 
    focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/40 shadow-inner shadow-black/40">

      <Lock size={16} className="mr-3 text-gray-200" />

      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="••••••••"
        className="w-full text-sm text-white placeholder-gray-500 bg-transparent outline-none"
        required
      />

      <button
        type="button"
        onClick={() => setShowPassword(prev => !prev)}
        className="ml-2 text-gray-200 transition "
      >
        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
      </button>

      {/* Glow effect */}
      <div className="absolute inset-0 transition duration-300 opacity-0 pointer-events-none rounded-xl focus-within:opacity-100 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 blur-md"></div>
    </div>
  </div>

  {/* Button */}
  <div className="mt-2 sm:col-span-2">
    <button
      type="submit"
      disabled={loading}
      className={`relative flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300
      ${loading 
        ? "bg-gray-700 cursor-not-allowed" 
        : "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:scale-[1.02] hover:brightness-110 shadow-lg shadow-purple-500/20"
      }`}
    >
      {/* Glow layer */}
      {!loading && (
        <span className="absolute inset-0 transition duration-500 opacity-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:opacity-20 blur-xl"></span>
      )}

      <span className="relative flex items-center gap-2">
        {loading ? "Logging in..." : "Login"}
        {!loading && <LogIn size={16}/>}
      </span>
    </button>
  </div>

</form>

        <p className="mt-6 text-xs text-center text-gray-200">© 2026 ReadyTechSolutions</p>
      </div>

      <style>{`
        @keyframes shake {0%,100% { transform: translateX(0);} 25% { transform: translateX(-5px);} 75% { transform: translateX(5px);}}
        .animate-shake { animation: shake 0.3s ease;}

        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-50px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.9); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}