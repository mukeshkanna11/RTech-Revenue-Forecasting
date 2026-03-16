// src/modules/forecast/pages/Forecast.jsx
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import Navbar from "../../../components/layout/Navbar";
import API from "../../../utils/axios";
import { useAuth } from "../../../context/AuthContext";
import { TrendingUp, Calendar, Users } from "lucide-react";

export default function Forecast() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const { user, logout } = useAuth();

  // ---------------- Fetch Forecast ----------------
  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const res = await API.get("/forecast", { headers: { Authorization: `Bearer ${user?.token}` } });
        const data = res.data.data || {};

        const forecastWithExtras = (data.forecast || []).map(f => ({
          ...f,
          dataPointsUsed: f.dataPointsUsed ?? 3,
          note: f.note ?? "Predicted using last 3 months of data"
        }));

        setHistory(data.history || []);
        setForecast(forecastWithExtras);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [user, logout]);

  // ---------------- Utilities ----------------
  const formatMonthYear = (month, year) => {
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return (!month || !year) ? "-" : `${monthNames[month - 1]}-${year}`;
  };

  const departments = [...new Set(history.map(h => h.department))];
  const filteredHistory = departmentFilter === "All" ? history : history.filter(h => h.department === departmentFilter);
  const filteredForecast = departmentFilter === "All" ? forecast : forecast.filter(f => f.department === departmentFilter);

  // ---------------- Loading Skeleton ----------------
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <p className="text-lg text-gray-400 animate-pulse">Loading Forecast Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 w-full">
      <Navbar />

      <main className="w-full max-w-full mx-auto p-6 space-y-10">

        {/* ---------------- Header + Filter ---------------- */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <div className="flex items-center gap-3">
    

    {/* Headline + description */}
    <div>
      <h1 className="text-3xl md:text-3xl font-bold text-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text ">
        Revenue Forecast
      </h1>
      <p className="mt-2 text-gray-400 text-sm md:text-base max-w-lg">
        Analyze historical revenue trends and predicted forecasts across departments. Use filters to focus on specific department performance and plan ahead.
      </p>
    </div>
  </div>
</div>

          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-300">Filter by Department:</label>
            <select
              className="p-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 text-gray-100"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All</option>
              {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
        </section>

        {/* ---------------- KPI Cards ---------------- */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl shadow-lg hover:shadow-2xl transition flex items-center gap-4 animate-fadeIn">
            <TrendingUp className="w-8 h-8 text-white" />
            <div>
              <p className="text-sm text-gray-300">Total Historical Entries</p>
              <p className="text-2xl font-bold text-white">{history.length}</p>
            </div>
          </div>
          <div className="p-5 bg-gradient-to-r from-green-700 to-green-500 rounded-2xl shadow-lg hover:shadow-2xl transition flex items-center gap-4 animate-fadeIn delay-75">
            <Calendar className="w-8 h-8 text-white" />
            <div>
              <p className="text-sm text-gray-300">Predicted Entries</p>
              <p className="text-2xl font-bold text-white">{forecast.length}</p>
            </div>
          </div>
          <div className="p-5 bg-gradient-to-r from-yellow-700 to-yellow-500 rounded-2xl shadow-lg hover:shadow-2xl transition flex items-center gap-4 animate-fadeIn delay-150">
            <Users className="w-8 h-8 text-white" />
            <div>
              <p className="text-sm text-gray-300">Departments Covered</p>
              <p className="text-2xl font-bold text-white">{departments.length}</p>
            </div>
          </div>
        </section>

        {/* ---------------- Historical Revenue Table ---------------- */}
        <section className="bg-gray-950 shadow-lg rounded-2xl p-4 md:p-6 overflow-x-auto">
          <h2 className="mb-3 text-xl font-semibold text-indigo-400">Historical Revenue</h2>
          <p className="mb-4 text-gray-400 text-sm">
            Displays past revenue records by month and department.
          </p>
          <table className="w-full text-gray-100 text-sm md:text-base">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-gray-400">No historical data</td>
                </tr>
              ) : filteredHistory.map(h => (
                <tr key={h._id} className="border-b border-gray-900 hover:bg-gray-900 transition">
                  <td className="p-3">{formatMonthYear(h.month, h.year)}</td>
                  <td className="p-3 capitalize">{h.department}</td>
                  <td className="p-3 font-semibold">₹{h.amount?.toLocaleString() || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ---------------- Forecast Chart ---------------- */}
<section className="bg-gray-950 shadow-xl rounded-2xl p-4 md:p-6 border border-gray-800">
  <h2 className="mb-2 text-2xl font-semibold text-indigo-400">Revenue Forecast</h2>
  <p className="mb-4 text-gray-400 text-sm">
    Predicted revenue for upcoming months based on historical trends. Hover over points to see exact values.
  </p>

  {filteredForecast.length === 0 ? (
    <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-700">
      <p className="text-gray-500 text-lg">No forecast data available</p>
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={filteredForecast}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.6}/>
            <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.1}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="month"
          tickFormatter={(month, idx) => formatMonthYear(month, filteredForecast[idx]?.year)}
          stroke="#aaa"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke="#aaa"
          tick={{ fontSize: 12 }}
          tickFormatter={(val) => `₹${val.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value) => value ? `₹${Number(value).toLocaleString()}` : "-"}
          labelFormatter={(label, idx) => formatMonthYear(label, filteredForecast[idx]?.year)}
          contentStyle={{
            backgroundColor: '#1F2937',
            borderRadius: 8,
            borderColor: '#4F46E5',
            color: '#fff',
            padding: '10px',
            fontSize: '0.875rem'
          }}
        />

        <Line
          type="monotone"
          dataKey="predictedRevenue"
          stroke="#4F46E5"
          strokeWidth={3}
          dot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 8, stroke: "#4F46E5", strokeWidth: 3 }}
          isAnimationActive={true}
          animationDuration={1000}
          strokeOpacity={0.9}
          fill="url(#revenueGradient)"
        />
      </LineChart>
    </ResponsiveContainer>
  )}
</section>
        {/* ---------------- Forecast Details Table ---------------- */}
        <section className="bg-gray-950 shadow-lg rounded-2xl p-4 md:p-6 overflow-x-auto">
          <h2 className="mb-3 text-xl font-semibold text-indigo-400">Forecast Details</h2>
          <p className="mb-4 text-gray-400 text-sm">
            Detailed forecast by month, department, data points used, and notes.
          </p>
          <table className="w-full text-gray-100 text-sm md:text-base">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Predicted Revenue (₹)</th>
                <th className="p-3 text-left">Data Points Used</th>
                <th className="p-3 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredForecast.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-400">No forecast data</td>
                </tr>
              ) : filteredForecast.map((f, idx) => (
                <tr key={idx} className="border-b border-gray-900 hover:bg-gray-900 transition">
                  <td className="p-3">{formatMonthYear(f.month, f.year)}</td>
                  <td className="p-3 capitalize">{f.department}</td>
                  <td className="p-3 font-semibold">₹{f.predictedRevenue?.toLocaleString() || "-"}</td>
                  <td className="p-3">{f.dataPointsUsed}</td>
                  <td className="p-3 text-gray-400">{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}