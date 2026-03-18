// src/modules/dashboard/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { motion , AnimatePresence ,} from "framer-motion";
import { Activity , BarChart2 , Cpu } from "lucide-react";
import {
Users,
FileText,
DollarSign,
Sparkles,
TrendingUp,
Briefcase
} from "lucide-react";

import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid
} from "recharts";

import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenues, setRevenues] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [clients, setClients] = useState([]);
  const [expanded, setExpanded] = useState(false);
const badgeColors = ["bg-yellow-400", "bg-gray-400", "bg-amber-700"];
  /* ================= FETCH TOP CLIENTS ================= */
  useEffect(() => {
    async function fetchTopClients() {
      try {
        setLoading(true);
        // Fetch all clients
        const res = await API.get("/clients");
        const list =
          res?.data?.clients ||
          res?.data?.data?.clients ||
          res?.data?.data ||
          [];

        // Ensure array
        const clientsArray = Array.isArray(list) ? list : [];

        // Sort by revenue descending
        const sortedClients = clientsArray.sort((a, b) => b.revenue - a.revenue);

        // Take top 5 clients by default
        setClients(sortedClients);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopClients();
  }, []);

// insights //
  
const insights = {
  revenueGrowth: 0.14,
  newClients: 3,
  invoicesPaid: 8,
  forecastStable: true,
  totalRevenue: 214000,
  pendingInvoices: 2
};

  // Show top 3 by default, expandable to all
  const displayedClients = expanded ? clients : clients.slice(0, 3);

  // //

useEffect(() => {
  if (revenues.length) {
    setLastUpdated(new Date().toLocaleTimeString());
  }
}, [revenues]);


// //

useEffect(() => {

  const loadData = async () => {
    try {
      setLoading(true);

      const [summaryRes, revenueRes] = await Promise.all([
        API.get("/dashboard/summary"),
        API.get("/revenues"),
      ]);

      setData(summaryRes.data.data || {});

      const list =
        revenueRes?.data?.data?.data ||
        revenueRes?.data?.data ||
        [];

      setRevenues(list);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadData();

}, []);

// ✅ Step 1: build chart data//

useEffect(() => {
  try {
    if (!Array.isArray(revenues) || revenues.length === 0) {
      setChartData([]);
      return;
    }

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    // ✅ Step 1: initialize all months
    const monthlyMap = Object.fromEntries(
      months.map(m => [m, 0])
    );

    // ✅ Step 2: aggregate safely
    for (const item of revenues) {
      if (!item) continue;

      const rawDate = item.date || item.createdAt;
      if (!rawDate) continue;

      const d = new Date(rawDate);
      if (isNaN(d.getTime())) continue;

      const monthIndex = d.getUTCMonth();
      const month = months[monthIndex];

      const amount = Number(item.amount);
      monthlyMap[month] += isNaN(amount) ? 0 : amount;
    }

    // ✅ Step 3: build last 6 months (stable)
    const result = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const temp = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth() - i,
        1
      ));

      const month = months[temp.getUTCMonth()];

      result.push({
        month,
        revenue: monthlyMap[month] ?? 0
      });
    }

    // ✅ Optional: prevent unnecessary re-render
    setChartData(prev =>
      JSON.stringify(prev) !== JSON.stringify(result)
        ? result
        : prev
    );

  } catch (error) {
    console.error("Chart transform error:", error);
    setChartData([]);
  }
}, [revenues]);

// ANALAYTICS //

const current = chartData.at(-1)?.revenue || 0;
const prev = chartData.at(-2)?.revenue || 0;

const growth = prev ? ((current - prev) / prev) * 100 : 0;

const totalRevenue = revenues.reduce(
  (sum, r) => sum + (r.amount || 0),
  0
);

const predicted = Math.round(current * (1 + growth / 100 || 1.15));

const formatCurrency = (amount)=>{
return new Intl.NumberFormat("en-IN",{
style:"currency",
currency:"INR",
maximumFractionDigits:0
}).format(amount || 0);
};

if(loading){
return(

<div className="flex items-center justify-center min-h-screen text-gray-400 bg-gray-950">
Loading Dashboard...
</div>

)
}

return(

<div className="min-h-screen text-gray-200 bg-gray-950">

<Navbar/>

{/* background glow */}

<div className="fixed inset-0 -z-10">

<div className="absolute bg-indigo-500 rounded-full w-96 h-96 blur-3xl top-20 left-20 opacity-20"/>

<div className="absolute bg-purple-500 rounded-full w-96 h-96 blur-3xl bottom-20 right-20 opacity-20"/>

</div>


{/* page */}

<main className="w-full p-8 space-y-8">


<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="p-10 border border-gray-800 shadow-2xl rounded-3xl from-indigo-600 via-purple-700 to-pink-400 bg-gradient-to-br"
>
  <h2 className="text-2xl font-bold tracking-wide text-white">
    🎯ReadyTechSolutions Dashboard
  </h2>

  <p className="max-w-3xl mt-4 text-sm leading-relaxed text-gray-200">
    Monitor business performance, track revenue growth, manage clients, and analyze forecasting trends with our intelligent SaaS CRM platform. Access advanced insights, real-time KPIs, and intelligent recommendations designed for modern enterprises.
  </p>

  <div className="flex flex-wrap gap-4 mt-6">
    <div className="px-4 py-2 text-sm font-medium text-white transition rounded-lg shadow-md bg-white/10 hover:bg-white/20">
      📊 Revenue Insights
    </div>
    <div className="px-4 py-2 text-sm font-medium text-white transition rounded-lg shadow-md bg-white/10 hover:bg-white/20">
      🧾 Client Management
    </div>
    <div className="px-4 py-2 text-sm font-medium text-white transition rounded-lg shadow-md bg-white/10 hover:bg-white/20">
      🎯 Target Tracking
    </div>
    <div className="px-4 py-2 text-sm font-medium text-white transition rounded-lg shadow-md bg-white/10 hover:bg-white/20">
      📈 Forecast Analytics
    </div>
  </div>
</motion.div>

{/* stats */}


<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

  <StatCard
    title="Total Revenue"
    value={formatCurrency(data.totalRevenue)}
    icon={<DollarSign size={26} className="text-white" />}
    className="flex items-center gap-2 p-3 text-white transition-all duration-300 transform border border-gray-700 shadow-2xl bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-500 rounded-xl hover:scale-105"
    compact
  />

  <StatCard
    title="Growth Rate"
    value={`${data.monthlyGrowth || 14}%`}
    icon={<TrendingUp size={26} className="text-white" />}
    className="flex items-center gap-2 p-3 text-white transition-all duration-300 transform border border-gray-700 shadow-2xl bg-gradient-to-r from-green-900 via-green-700 to-green-500 rounded-xl hover:scale-105"
    compact
  />

  <StatCard
    title="Active Clients"
    value={data.activeClients || 3}
    icon={<Users size={26} className="text-white" />}
    className="flex items-center gap-2 p-3 text-white transition-all duration-300 transform border border-gray-700 shadow-2xl bg-gradient-to-r from-purple-900 via-purple-700 to-purple-500 rounded-xl hover:scale-105"
    compact
  />

  <StatCard
    title="Invoices"
    value={data.invoices || 12}
    icon={<FileText size={26} className="text-white" />}
    className="flex items-center gap-2 p-3 text-white transition-all duration-300 transform border border-gray-700 shadow-2xl bg-gradient-to-r from-pink-900 via-pink-700 to-pink-500 rounded-xl hover:scale-105"
    compact
  />

</div>



{/* CHART + AI */}
<div className="grid gap-4 lg:grid-cols-3">

  {/* ================= CHART ================= */}
  <div className="relative lg:col-span-2 rounded-2xl border border-gray-800 bg-[#0B0F19] p-4 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">

    {/* Header */}
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-sm font-medium text-gray-300">
          Revenue Trend
        </h3>
        <p className="text-[10px] text-gray-500">
          Monthly performance
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span className="text-[10px] text-gray-400">
          Live
        </span>
      </div>
    </div>

    {/* Chart */}
    {!chartData.length ? (
      <div className="flex items-center justify-center h-[220px] text-xs text-gray-500">
        No revenue data
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>

          <CartesianGrid
            stroke="#111827"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            stroke="#4B5563"
            tick={{ fontSize: 10 }}
          />

          <YAxis
            stroke="#4B5563"
            tick={{ fontSize: 10 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid #1F2937",
              borderRadius: "10px",
              fontSize: "12px"
            }}
          />

 <defs>
  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
  </linearGradient>
</defs>

<Line
  type="monotone"
  dataKey="revenue"
  stroke="#6366F1"
  strokeWidth={2.5}
  dot={{ r: 3 }}
  activeDot={{ r: 6 }}
  isAnimationActive
  animationDuration={800}
/>
        </LineChart>
      </ResponsiveContainer>
    )}

    {/* Bottom */}
    <div className="flex items-center justify-between mt-3 text-[11px]">

      <span className="text-gray-500">
        Last updated: {lastUpdated}
      </span>

      <span className={`font-medium ${
        growth >= 0 ? "text-green-400" : "text-red-400"
      }`}>
        {growth >= 0 ? "+" : ""}
        {growth.toFixed(1)}%
      </span>

    </div>

  </div>


  {/* ================= AI INSIGHT ================= */}
  <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#0B0F19] p-4 shadow-md hover:shadow-purple-500/20 transition-all duration-300">

    {/* Soft Glow */}
    <div className="absolute rounded-full w-28 h-28 -top-10 -right-10 bg-indigo-500/10 blur-2xl"></div>

    {/* Header */}
    <div className="flex items-center gap-2 mb-3 text-indigo-300">
      <Sparkles size={14} />
      <span className="text-xs font-medium tracking-wide">
        AI Insight
      </span>
    </div>

    {/* Main KPI */}
    <div className="flex items-end gap-2 mb-2">
      <h2 className="text-xl font-semibold text-white">
        {growth.toFixed(0)}%
      </h2>
      <span className="text-[10px] text-gray-500">
        expected growth
      </span>
    </div>

    {/* Insight */}
    <p className="text-[11px] leading-relaxed text-gray-400">
      Revenue trend indicates a projected value of
      <span className="font-medium text-indigo-400">
        {" "}₹{predicted.toLocaleString()}
      </span>
      {" "}next month based on recent performance.
    </p>

    {/* Micro Stats */}
    <div className="flex justify-between mt-4 text-[10px] text-gray-500">
      <span>Trend: {growth >= 0 ? "Upward" : "Decline"}</span>
      <span>Confidence: Medium</span>
    </div>

  </div>

</div>

{/* top clients */}

<div className="w-full p-6 border border-gray-700 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <h3 className="text-lg font-semibold tracking-wide text-gray-100">Top Clients</h3>
        <span className="text-sm text-gray-400">{clients.length} Clients</span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="px-2 space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-full h-14 rounded-xl" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <p className="px-2 text-sm text-gray-400">No clients available.</p>
      ) : (
        <>
          <div className="divide-y divide-gray-700">
            <AnimatePresence>
              {displayedClients.map((client, i) => (
                <motion.div
                  key={client.id || i}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between w-full px-3 py-3 transition-all duration-300 rounded-lg hover:bg-gray-800"
                >
                  {/* Left: Avatar + Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={client.avatar || `https://i.pravatar.cc/40?img=${i + 1}`}
                        alt={client.name}
                        className="object-cover w-12 h-12 border-2 border-indigo-500 rounded-full"
                      />
                      {i < 3 && (
                        <span
                          className={`absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full ${badgeColors[i]}`}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-medium text-gray-100 truncate">{client.name}</span>
                      {client.companyName && (
                        <span className="text-xs text-gray-400 truncate max-w-[180px]">
                          {client.companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Revenue or Mobile */}
                  <div className="flex flex-col items-end">
                    {client.revenue && client.revenue > 0 ? (
                      <motion.span
                        key={client.revenue}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-sm font-semibold text-indigo-400"
                      >
                        {formatCurrency(client.revenue)}
                      </motion.span>
                    ) : (
                      <span className="text-sm font-semibold text-indigo-400">{client.phone || "—"}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {client.revenue && client.revenue > 0 ? "Revenue" : "Mobile"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Expand Button */}
          {clients.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-4 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300 hover:underline"
            >
              {expanded ? "Show Less" : `Show All (${clients.length})`}
            </button>
          )}
        </>
      )}
    </div>

    
<div className="w-full p-6 border border-gray-700 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl">
      {/* Header */}
      <h3 className="mb-4 text-lg font-semibold tracking-wide text-gray-100">Business Insights</h3>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Revenue Growth */}
        <div className="flex items-center gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700">
          <div className="p-2 text-white bg-indigo-500 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Revenue Growth</span>
            <span className="font-semibold text-gray-100">{(insights.revenueGrowth * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* New Clients */}
        <div className="flex items-center gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700">
          <div className="p-2 text-white bg-green-500 rounded-lg">
            <Users size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">New Clients</span>
            <span className="font-semibold text-gray-100">{insights.newClients}</span>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="flex items-center gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700">
          <div className="p-2 text-white bg-blue-500 rounded-lg">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Invoices Paid</span>
            <span className="font-semibold text-gray-100">{insights.invoicesPaid}</span>
          </div>
        </div>

        {/* Forecast / Stable Growth */}
        <div className="flex items-center gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700">
          <div className="p-2 text-white bg-yellow-500 rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Forecast</span>
            <span className="font-semibold text-gray-100">{insights.forecastStable ? "Stable Growth" : "Needs Attention"}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="flex items-center col-span-1 gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700 sm:col-span-2">
          <div className="p-2 text-white bg-purple-500 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Total Revenue</span>
            <span className="font-semibold text-gray-100">{formatCurrency(insights.totalRevenue)}</span>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="flex items-center col-span-1 gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700 sm:col-span-2">
          <div className="p-2 text-white bg-red-500 rounded-lg">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Pending Invoices</span>
            <span className="font-semibold text-gray-100">{insights.pendingInvoices}</span>
          </div>
        </div>
      </div>
    </div>


<div className="w-full p-6 border border-gray-700 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Briefcase size={20} className="text-indigo-400"/>
        <h3 className="text-lg font-bold tracking-wide text-gray-100">
          About ReadyTech Solutions
        </h3>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-gray-400">
        ReadyTech Solutions provides scalable SaaS CRM tools for client management, 
        invoice tracking, revenue analytics, and business forecasting. 
        Our intelligent dashboards empower businesses to make data-driven decisions 
        with real-time insights.
      </p>

      {/* Key Features */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700">
          <Users className="text-green-400" size={20}/>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Client Management</span>
            <span className="font-semibold text-gray-100">Track & Organize Your Clients</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700">
          <DollarSign className="text-indigo-400" size={20}/>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Revenue Analytics</span>
            <span className="font-semibold text-gray-100">Monitor Growth & Forecasts</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700">
          <TrendingUp className="text-yellow-400" size={20}/>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Business Forecasting</span>
            <span className="font-semibold text-gray-100">Predict Future Trends</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 transition-colors bg-gray-800 rounded-xl hover:bg-gray-700">
          <Cpu className="text-pink-400" size={20}/>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Intelligent Dashboards</span>
            <span className="font-semibold text-gray-100">Data-Driven Insights</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-4 text-xs text-gray-500">
        Trusted by growing SaaS businesses for real-time insights and operational efficiency.
      </p>
    </div>

</main>

</div>

)

}


function StatCard({title,value,icon}){

return(

<motion.div
whileHover={{scale:1.05}}
className="flex items-center justify-between p-6 transition bg-gray-900 border border-gray-800 shadow-lg rounded-2xl hover:border-indigo-500"
>

<div>

<p className="text-sm text-gray-400">
{title}
</p>

<h2 className="text-2xl font-bold text-white">
{value}
</h2>

</div>

<div className="p-3 text-white bg-indigo-600 rounded-xl">
{icon}
</div>

</motion.div>

)

}