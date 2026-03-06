// src/modules/forecast/pages/Forecast.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, DollarSign, BarChart3, Target, Users, Activity, FileText, Menu, X, LogOut
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import API from "../../../utils/axios";
import { useAuth } from "../../../context/AuthContext";

export default function Forecast() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", icon: <Home size={18} />, route: "/dashboard" },
    { title: "Clients", icon: <Users size={18} />, route: "/clients" },
    { title: "Invoices", icon: <FileText size={18} />, route: "/invoices" },
    { title: "Revenues", icon: <DollarSign size={18} />, route: "/revenues" },
    { title: "Targets", icon: <Target size={18} />, route: "/targets" },
    { title: "Forecast", icon: <BarChart3 size={18} />, route: "/forecast" },
    { title: "Health", icon: <Activity size={18} />, route: "/health" },
  ];

  // ---------------- Fetch Forecast ----------------
  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const res = await API.get("/forecast", { headers: { Authorization: `Bearer ${user?.token}` } });
        setHistory(res.data.data?.history || []);
        setForecast(res.data.data?.forecast || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) { logout(); navigate("/login"); }
      } finally { setLoading(false); }
    };
    fetchForecast();
  }, [user, logout, navigate]);

  // ---------------- Format Month-Year ----------------
  const formatMonthYear = (month, year) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (!month || !year) return "-";
    return `${monthNames[month - 1]}-${year}`;
  };

  // ---------------- Filtered Data ----------------
  const filteredHistory = departmentFilter === "All" ? history : history.filter(h => h.department === departmentFilter);
  const filteredForecast = departmentFilter === "All" ? forecast : forecast.filter(f => f.department === departmentFilter);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-gray-600 animate-pulse">Loading Forecast Data...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ---------------- Sidebar ---------------- */}
      <aside className={`bg-white shadow-lg fixed h-full transition-all duration-300 z-20 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <h2 className="text-lg font-bold text-indigo-600">ReadyTech CRM</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20} /></button>
        </div>

        <nav className="flex flex-col gap-2 px-2 mt-6">
          {menuItems.map((item) => {
            const active = location.pathname === item.route;
            return (
              <button
                key={item.title}
                onClick={() => navigate(item.route)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
                  ${active ? "bg-indigo-100 text-indigo-600 font-semibold" : "text-gray-600 hover:bg-gray-100"}
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

      {/* ---------------- Main Content ---------------- */}
      <div className="flex flex-col flex-1" style={{ marginLeft: sidebarOpen ? "16rem" : "4rem" }}>
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <h1 className="text-xl font-bold">Revenue Forecast</h1>
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

          {/* ---------------- Filter ---------------- */}
          <section className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">Filter by Department:</label>
            <select
              className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All</option>
              {[...new Set(history.map(h => h.department))].map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </section>

          {/* ---------------- Historical Revenue Table ---------------- */}
          <section className="p-6 bg-white shadow rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-indigo-600">Historical Revenue</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left text-gray-600">Month</th>
                    <th className="p-3 text-left text-gray-600">Department</th>
                    <th className="p-3 text-left text-gray-600">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-gray-500">No historical data</td>
                    </tr>
                  ) : filteredHistory.map((h) => (
                    <tr key={h._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatMonthYear(h.month, h.year)}</td>
                      <td className="p-3">{h.department}</td>
                      <td className="p-3 font-semibold">₹{h.amount?.toLocaleString() || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---------------- Forecast Chart ---------------- */}
          <section className="p-6 bg-white shadow rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-indigo-600">Revenue Forecast Chart</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(month, index) => formatMonthYear(month, filteredForecast[index]?.year)} />
                <YAxis />
                <Tooltip
                  formatter={(value) => value ? `₹${Number(value).toLocaleString()}` : "-"}
                  labelFormatter={(label, index) => formatMonthYear(label, filteredForecast[index]?.year)}
                />
                <Line type="monotone" dataKey="predictedRevenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* ---------------- Forecast Table ---------------- */}
          <section className="p-6 bg-white shadow rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-indigo-600">Forecast Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left text-gray-600">Month</th>
                    <th className="p-3 text-left text-gray-600">Department</th>
                    <th className="p-3 text-left text-gray-600">Predicted Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForecast.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-gray-500">No forecast data</td>
                    </tr>
                  ) : filteredForecast.map((f, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatMonthYear(f.month, f.year)}</td>
                      <td className="p-3">{f.department}</td>
                      <td className="p-3 font-semibold">₹{f.predictedRevenue?.toLocaleString() || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}