import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
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

        {/* RIGHT SIDE - FORM */}
        <div className="p-10 bg-white">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            ReadyTech CRM
          </h2>
          <p className="mb-6 text-gray-500">
            Please login to continue
          </p>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">
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
                  required
                  placeholder="Enter your email"
                  className="w-full outline-none"
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
                  required
                  placeholder="Enter your password"
                  className="w-full outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
              className="flex items-center justify-center w-full gap-2 py-3 text-white transition duration-300 bg-indigo-600 shadow-lg hover:bg-indigo-700 rounded-xl"
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