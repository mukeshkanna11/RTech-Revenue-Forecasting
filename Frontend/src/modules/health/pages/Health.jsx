// src/modules/health/pages/Health.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DollarSign,
  Target,
  BarChart3,
  Activity,
  Home,
  Users,
  LogOut,
  Cpu,
  Database,
  Zap,
  Server,
  Clock,
  Menu,
  X,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../utils/axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Health() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", route: "/dashboard", icon: <Home size={18} /> },
    { title: "Clients", route: "/clients", icon: <Users size={18} /> },
    { title: "Revenues", route: "/revenues", icon: <DollarSign size={18} /> },
    { title: "Targets", route: "/targets", icon: <Target size={18} /> },
    { title: "Forecast", route: "/forecast", icon: <BarChart3 size={18} /> },
    { title: "Health", route: "/health", icon: <Activity size={18} /> },
  ];

  // Fetch health data from API
  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await API.get("/health", {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      // Sample structure for demo: adapt based on actual API response
      setMetrics([
        { title: "Server Status", value: "Online", color: "text-green-600", icon: <Server size={20} /> },
        { title: "API Response Time", value: "120ms", color: "text-blue-600", icon: <Clock size={20} /> },
        { title: "Active Users", value: 152, color: "text-purple-600", icon: <Users size={20} /> },
        { title: "CPU Usage", value: "35%", color: "text-yellow-600", icon: <Cpu size={20} /> },
      ]);

      setLogs([
        { time: "2026-03-06T10:00:00Z", event: "User login", user: "John Doe", status: "success" },
        { time: "2026-03-06T10:05:00Z", event: "Invoice created", user: "Alice", status: "success" },
        { time: "2026-03-06T10:10:00Z", event: "Server reboot", user: "System", status: "success" },
      ]);

      setDepartments([
        { name: "Sales", uptime: 99.8, avgResponse: 120 },
        { name: "Support", uptime: 99.5, avgResponse: 150 },
        { name: "Operations", uptime: 99.9, avgResponse: 100 },
      ]);

    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { logout(); navigate("/login"); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchHealth(); }, [user]);

  if (loading) return <div className="flex items-center justify-center h-screen"><p className="animate-pulse">Loading Health Dashboard...</p></div>;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className={`bg-white shadow-lg fixed h-full transition-all duration-300 z-20 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <h2 className="text-lg font-bold text-indigo-600">ReadyTech CRM</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-2 mt-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
              <button
                key={item.title}
                onClick={() => navigate(item.route)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
                  ${isActive ? "bg-indigo-100 text-indigo-600 font-semibold" : "text-gray-600 hover:bg-gray-100"}
                  ${!sidebarOpen ? "justify-center" : ""}`}
              >
                {item.icon}
                {sidebarOpen && item.title}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 text-xs text-center text-gray-400">
          {sidebarOpen && "Powered by ReadyTech Solutions"}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarOpen ? "16rem" : "4rem" }}>
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <h1 className="text-xl font-bold text-gray-800">System Health</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-2 px-3 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6">

          <p className="mb-6 text-gray-600">Monitor system metrics, performance trends, and activity across all departments.</p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.title} className="flex flex-col justify-between p-6 bg-white shadow-md rounded-2xl">
                <div className="flex items-center gap-2">
                  {m.icon}
                  <p className="text-sm text-gray-500">{m.title}</p>
                </div>
                <h2 className={`mt-2 text-2xl font-bold ${m.color}`}>{m.value}</h2>
              </div>
            ))}
          </div>

          {/* Department Health Chart */}
          <section className="p-6 bg-white shadow-lg rounded-2xl">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800"><TrendingUp size={20}/> Department Health Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="uptime" stroke="#4f46e5" strokeWidth={2} name="Uptime (%)"/>
                <Line type="monotone" dataKey="avgResponse" stroke="#f97316" strokeWidth={2} name="Avg Response (ms)"/>
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Activity Logs */}
          <section className="p-6 overflow-x-auto bg-white shadow-lg rounded-2xl">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800"><Database size={20}/> Recent Activity Logs</h3>
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-gray-600">Time</th>
                  <th className="p-3 text-left text-gray-600">Event</th>
                  <th className="p-3 text-left text-gray-600">User</th>
                  <th className="p-3 text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={4} className="p-3 text-center text-gray-500">No recent logs</td></tr>
                ) : logs.map((log, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(log.time).toLocaleString()}</td>
                    <td className="p-3">{log.event}</td>
                    <td className="p-3">{log.user}</td>
                    <td className={`p-3 font-semibold ${log.status === "success" ? "text-green-600" : "text-red-600"}`}>{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* About Section */}
          <section className="p-6 bg-white shadow-lg rounded-2xl">
            <h3 className="mb-2 text-xl font-bold text-gray-800">About ReadyTech Solutions</h3>
            <p className="text-gray-600">
              ReadyTech Solutions ensures your CRM platform runs smoothly. Monitor system health, server status, API response, and user activity in real-time with department-level insights and performance charts.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}