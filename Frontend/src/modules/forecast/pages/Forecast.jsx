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
        

<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

  {/* Left Section */}
  <div className="flex items-start gap-4">

    {/* Icon Badge */}
    <div className="flex items-center justify-center w-12 h-12 border shadow-lg rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 border-white/10">
      <TrendingUp className="w-6 h-6 text-white" />
    </div>

    {/* Title + Description */}
    <div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        Revenue Forecast
      </h1>

      <p className="mt-2 text-sm md:text-base text-gray-400 max-w-xl leading-relaxed">
        Analyze historical revenue trends and forecast future performance across departments. 
        Filter insights to make smarter, data-driven business decisions.
      </p>
    </div>

  </div>

  {/* Right Section */}
  <div className="flex items-center gap-3">

    {/* Live Indicator */}
    <div className="hidden sm:flex items-center gap-2 px-4 py-2 border rounded-xl bg-white/5 border-white/10 backdrop-blur-md">
      <span className="relative flex w-2 h-2">
        <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
        <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
      </span>
      <span className="text-xs text-gray-300">Live Analytics</span>
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
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

  {/* Historical Entries */}
  <div className="relative p-5 border shadow-xl group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

    <div className="flex items-center justify-between mb-4">
      <div className="p-3 border rounded-xl bg-indigo-500/10 border-indigo-500/20">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
      </div>
      <span className="text-xs text-green-400">+10%</span>
    </div>

    <p className="text-sm text-gray-400">Total Historical Entries</p>
    <h2 className="mt-1 text-2xl font-semibold text-white">
      {history.length}
    </h2>

    {/* subtle glow */}
    <div className="absolute inset-0 transition opacity-0 rounded-2xl group-hover:opacity-100 bg-indigo-500/5 blur-xl"></div>
  </div>


  {/* Predicted Entries */}
  <div className="relative p-5 border shadow-xl group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

    <div className="flex items-center justify-between mb-4">
      <div className="p-3 border rounded-xl bg-green-500/10 border-green-500/20">
        <Calendar className="w-5 h-5 text-green-400" />
      </div>
      <span className="text-xs text-green-400">Forecast</span>
    </div>

    <p className="text-sm text-gray-400">Predicted Entries</p>
    <h2 className="mt-1 text-2xl font-semibold text-white">
      {forecast.length}
    </h2>

    <div className="absolute inset-0 transition opacity-0 rounded-2xl group-hover:opacity-100 bg-green-500/5 blur-xl"></div>
  </div>


  {/* Departments */}
  <div className="relative p-5 border shadow-xl group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

    <div className="flex items-center justify-between mb-4">
      <div className="p-3 border rounded-xl bg-yellow-500/10 border-yellow-500/20">
        <Users className="w-5 h-5 text-yellow-400" />
      </div>
      <span className="text-xs text-gray-400">Active</span>
    </div>

    <p className="text-sm text-gray-400">Departments Covered</p>
    <h2 className="mt-1 text-2xl font-semibold text-white">
      {departments.length}
    </h2>

    <div className="absolute inset-0 transition opacity-0 rounded-2xl group-hover:opacity-100 bg-yellow-500/5 blur-xl"></div>
  </div>

</section>

       {/* ---------------- Historical Revenue Table ---------------- */}
<section className="relative p-5 border shadow-xl rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl">

  {/* Header */}
  <div className="flex flex-col gap-1 mb-5">
    <h2 className="text-lg font-semibold text-white tracking-tight">
      Historical Revenue
    </h2>
    <p className="text-sm text-gray-400">
      View past revenue records by month and department
    </p>
  </div>

  {/* Table Wrapper */}
  <div className="overflow-x-auto rounded-xl border border-white/5">

    <table className="w-full text-sm text-left text-gray-300">

      {/* Table Head */}
      <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur-md text-xs uppercase text-gray-400">
        <tr>
          <th className="px-4 py-3 font-medium">Month</th>
          <th className="px-4 py-3 font-medium">Department</th>
          <th className="px-4 py-3 font-medium">Amount</th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>

        {filteredHistory.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
              No historical data available
            </td>
          </tr>
        ) : (

          filteredHistory.map((h) => (
            <tr
              key={h._id}
              className="transition-all border-t border-white/5 hover:bg-white/5"
            >

              {/* Month */}
              <td className="px-4 py-3 text-white">
                {formatMonthYear(h.month, h.year)}
              </td>

              {/* Department */}
              <td className="px-4 py-3 capitalize">
                <span className="px-2 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-400">
                  {h.department}
                </span>
              </td>

              {/* Amount */}
              <td className="px-4 py-3 font-semibold text-green-400">
                ₹{h.amount?.toLocaleString() || "-"}
              </td>

            </tr>
          ))

        )}

      </tbody>

    </table>
  </div>

</section>

       

{/* ---------------- Forecast Chart ---------------- */}
<section className="relative p-5 border shadow-xl rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl">

  {/* Header */}
  <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-center md:justify-between">

    <div className="flex items-center gap-3">
      
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 border rounded-xl bg-indigo-500/10 border-indigo-500/20">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight">
          Revenue Forecast
        </h2>
        <p className="text-sm text-gray-400">
          Predicted revenue based on historical trends
        </p>
      </div>

    </div>

    {/* Right Meta */}
    <span className="text-xs text-gray-400">
      Next 6 Months Projection
    </span>

  </div>

  {/* Chart / Empty State */}
  {filteredForecast.length === 0 ? (

    <div className="flex flex-col items-center justify-center h-72 border rounded-xl bg-white/5 border-white/10">
      <p className="text-gray-400 text-sm">No forecast data available</p>
    </div>

  ) : (

    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={filteredForecast}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >

        {/* Gradient */}
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.5}/>
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0}/>
          </linearGradient>
        </defs>

        {/* Grid */}
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgba(255,255,255,0.05)" 
        />

        {/* X Axis */}
        <XAxis
          dataKey="month"
          tickFormatter={(month, idx) =>
            formatMonthYear(month, filteredForecast[idx]?.year)
          }
          stroke="#888"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />

        {/* Y Axis */}
        <YAxis
          stroke="#888"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `₹${val.toLocaleString()}`}
        />

        {/* Tooltip */}
        <Tooltip
          formatter={(value) =>
            value ? `₹${Number(value).toLocaleString()}` : "-"
          }
          labelFormatter={(label, idx) =>
            formatMonthYear(label, filteredForecast[idx]?.year)
          }
          contentStyle={{
            background: "rgba(17, 24, 39, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "0.85rem",
            padding: "10px 12px",
          }}
        />

        {/* Line */}
        <Line
          type="monotone"
          dataKey="predictedRevenue"
          stroke="#6366F1"
          strokeWidth={3}
          dot={{
            r: 4,
            stroke: "#6366F1",
            strokeWidth: 2,
            fill: "#0f172a",
          }}
          activeDot={{
            r: 7,
            stroke: "#6366F1",
            strokeWidth: 3,
            fill: "#fff",
          }}
          isAnimationActive={true}
          animationDuration={1200}
          fill="url(#revenueGradient)"
        />

      </LineChart>
    </ResponsiveContainer>

  )}

</section>


       {/* ---------------- Forecast Details Table ---------------- */}
<section className="relative p-5 border shadow-xl rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl">

  {/* Header */}
  <div className="flex flex-col gap-1 mb-5">
    <h2 className="text-lg font-semibold text-white tracking-tight">
      Forecast Details
    </h2>
    <p className="text-sm text-gray-400">
      Monthly forecast with department insights and data analysis
    </p>
  </div>

  {/* Table Wrapper */}
  <div className="overflow-x-auto border rounded-xl border-white/5">

    <table className="w-full text-sm text-left text-gray-300">

      {/* Head */}
      <thead className="sticky top-0 z-10 text-xs uppercase bg-white/5 backdrop-blur-md text-gray-400">
        <tr>
          <th className="px-4 py-3 font-medium">Month</th>
          <th className="px-4 py-3 font-medium">Department</th>
          <th className="px-4 py-3 font-medium">Revenue</th>
          <th className="px-4 py-3 font-medium">Data Points</th>
          <th className="px-4 py-3 font-medium">Notes</th>
        </tr>
      </thead>

      {/* Body */}
      <tbody>

        {filteredForecast.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
              No forecast data available
            </td>
          </tr>
        ) : (

          filteredForecast.map((f, idx) => (
            <tr
              key={idx}
              className="transition-all border-t border-white/5 hover:bg-white/5"
            >

              {/* Month */}
              <td className="px-4 py-3 text-white">
                {formatMonthYear(f.month, f.year)}
              </td>

              {/* Department */}
              <td className="px-4 py-3 capitalize">
                <span className="px-2 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-400">
                  {f.department}
                </span>
              </td>

              {/* Revenue */}
              <td className="px-4 py-3 font-semibold text-green-400">
                ₹{f.predictedRevenue?.toLocaleString() || "-"}
              </td>

              {/* Data Points */}
              <td className="px-4 py-3">
                <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-400">
                  {f.dataPointsUsed} pts
                </span>
              </td>

              {/* Notes */}
              <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                {f.note || "-"}
              </td>

            </tr>
          ))

        )}

      </tbody>

    </table>
  </div>

</section>

      </main>
    </div>
  );
}