// src/modules/dashboard/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DollarSign,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
  Home,
  Users,
  FileText,
  LogOut,
  Clock,
  Menu,
} from "lucide-react";

import API from "../../../utils/axios";
import { useAuth } from "../../../context/AuthContext";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { logout, user } = useAuth();
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

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get("/dashboard/summary");
        setData(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg animate-pulse">Loading Dashboard...</p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}

      <aside
        className={`bg-white shadow-lg fixed h-full transition-all duration-300 z-20 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">

          {sidebarOpen && (
            <h2 className="text-lg font-bold text-indigo-600">
              ReadyTech CRM
            </h2>
          )}

          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>

        </div>

        <nav className="flex flex-col gap-2 px-2 mt-6">

          {menuItems.map((item) => {
            const active = location.pathname === item.route;

            return (
              <button
                key={item.title}
                onClick={() => navigate(item.route)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
                ${
                  active
                    ? "bg-indigo-100 text-indigo-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }
                ${!sidebarOpen ? "justify-center" : ""}
                `}
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

      {/* MAIN CONTENT */}

      <div
        className="flex flex-col flex-1"
        style={{ marginLeft: sidebarOpen ? "16rem" : "4rem" }}
      >

        {/* NAVBAR */}

        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">

          <h1 className="text-xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-4">

            <span className="font-medium text-gray-600">
              Welcome {user?.name}
            </span>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-2 px-3 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="p-6 space-y-6">

          {/* WELCOME BANNER */}

          <div className="flex flex-col items-center justify-between p-6 text-white shadow-lg rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 md:flex-row">

            <div>
              <h2 className="mb-1 text-2xl font-bold">
                Welcome back, {user?.name} 👋
              </h2>

              <p className="text-sm opacity-90">
                Manage clients, invoices, revenue and analytics in one place.
              </p>
            </div>

            <div className="flex gap-3 mt-4 md:mt-0">

              <button
                onClick={() => navigate("/clients")}
                className="px-4 py-2 font-semibold text-indigo-600 bg-white rounded-lg hover:bg-gray-100"
              >
                Add Client
              </button>

              <button
                onClick={() => navigate("/invoices")}
                className="px-4 py-2 font-semibold text-indigo-600 bg-white rounded-lg hover:bg-gray-100"
              >
                Create Invoice
              </button>

            </div>
          </div>

          {/* STAT CARDS */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total Revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={<DollarSign />}
              color="bg-green-500"
            />

            <StatCard
              title="Targets"
              value={formatCurrency(data.totalTarget)}
              icon={<Target />}
              color="bg-blue-500"
            />

            <StatCard
              title="Growth"
              value={`${data.monthlyGrowth || 0}%`}
              icon={<TrendingUp />}
              color="bg-purple-500"
            />

            <StatCard
              title="Clients"
              value={data.activeClients || 0}
              icon={<Users />}
              color="bg-orange-500"
            />

            <StatCard
              title="Invoices"
              value={data.invoices || 0}
              icon={<FileText />}
              color="bg-indigo-500"
            />

            <StatCard
              title="Health Score"
              value={`${data.healthScore || 0}%`}
              icon={<Activity />}
              color="bg-teal-500"
            />

            <StatCard
              title="Pending Tasks"
              value={data.pendingTasks || 0}
              icon={<Clock />}
              color="bg-red-500"
            />

            <StatCard
              title="Achievement"
              value={`${data.achievementPercent || 0}%`}
              icon={<BarChart3 />}
              color="bg-pink-500"
            />

          </div>

          {/* ABOUT SECTION */}

          <div className="p-6 bg-white shadow rounded-2xl">

            <h3 className="mb-2 text-lg font-bold">
              About ReadyTech Solutions
            </h3>

            <p className="mb-4 text-sm text-gray-600">
              ReadyTech CRM helps businesses manage revenue, invoices,
              customer relationships, and analytics with a powerful dashboard.
            </p>

            <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
              <li>Client Management</li>
              <li>Invoice generation & PDF export</li>
              <li>Revenue tracking</li>
              <li>Target analytics</li>
              <li>Business forecasting</li>
            </ul>

          </div>

        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between p-6 transition bg-white shadow rounded-2xl hover:shadow-xl">

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-1 text-2xl font-bold">{value}</h2>
      </div>

      <div className={`${color} text-white p-3 rounded-xl`}>
        {icon}
      </div>

    </div>
  );
}