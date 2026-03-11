import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      
      <div className="grid w-full max-w-5xl overflow-hidden shadow-2xl md:grid-cols-2 bg-white/10 backdrop-blur-xl rounded-3xl">

        {/* LEFT SIDE */}
        <div className="flex-col items-center justify-center hidden p-10 text-white md:flex bg-gradient-to-br from-indigo-700 to-purple-800">
          <h1 className="mb-4 text-4xl font-bold">
            Welcome Back 👋
          </h1>

          <p className="text-lg text-center text-indigo-200">
            Login to manage your CRM dashboard,
            track revenue, invoices and clients
            in one powerful place.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10 bg-white">

          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            ReadyTech CRM
          </h2>

          <p className="mb-6 text-gray-500">
            Please login to continue
          </p>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-600">
                Email Address
              </label>

              <div className="flex items-center px-3 py-2 mt-1 border rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                <Mail size={18} className="mr-2 text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-600">
                Password
              </label>

              <div className="flex items-center px-3 py-2 mt-1 border rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
                <Lock size={18} className="mr-2 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-500" />
                  ) : (
                    <Eye size={18} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center w-full gap-2 py-3 text-white transition duration-300 rounded-xl shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <LogIn size={18} />}
            </button>

          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            © 2026 ReadyTech Solutions
          </p>

        </div>
      </div>
    </div>
  );
}