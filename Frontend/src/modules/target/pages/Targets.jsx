// src/modules/targets/pages/Targets.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, Edit, Trash, Target, Home, Users, FileText,
  DollarSign, BarChart3, Activity, LogOut, Menu, X
} from "lucide-react";
import API from "../../../utils/axios";
import { useAuth } from "../../../context/AuthContext";

export default function Targets() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ month: "", year: "", department: "", targetAmount: 0 });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  // ---------------- Fetch Targets ----------------
  const fetchTargets = async () => {
    setLoading(true);
    try {
      const res = await API.get("/targets", { headers: { Authorization: `Bearer ${user?.token}` } });
      setTargets(Array.isArray(res.data.data?.data) ? res.data.data.data : []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { logout(); navigate("/login"); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTargets(); }, [user]);

  // ---------------- Form Handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "month" || name === "year" || name === "targetAmount" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); 
  setSuccess("");

  // Validate fields first
  if (!form.month || !form.year || !form.department || !form.targetAmount) {
    setError("All fields are required and must be valid numbers");
    return;
  }

  const payload = {
    month: Number(form.month),
    year: Number(form.year),
    department: form.department.trim(),
    targetAmount: Number(form.targetAmount),
  };

  try {
    if (editId) {
      const res = await API.put(`/targets/${editId}`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setTargets(targets.map(t => t._id === editId ? res.data.data : t));
      setSuccess("Target updated successfully!");
      setEditId(null);
    } else {
      const res = await API.post("/targets", payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setTargets([res.data.data, ...targets]);
      setSuccess("Target added successfully!");
    }

    setForm({ month: "", year: "", department: "", targetAmount: "" });
  } catch (err) {
    console.error(err.response?.data);
    setError(err.response?.data?.message || "Failed to save target");
  }
};

  const handleEdit = (target) => {
    setForm({
      month: target.month,
      year: target.year,
      department: target.department,
      targetAmount: target.targetAmount,
    });
    setEditId(target._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this target?")) return;
    try {
      await API.delete(`/targets/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
      setTargets(targets.filter(t => t._id !== id));
      setSuccess("Target deleted successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete target");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><p className="animate-pulse">Loading Targets...</p></div>;

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
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <h1 className="text-xl font-bold">{editId ? "Edit Target" : "Targets"}</h1>
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

          {/* Add/Edit Target Form */}
          <section className="relative p-6 bg-white shadow rounded-2xl">
            {editId && (
              <button
                onClick={() => { setEditId(null); setForm({ month: "", year: "", department: "", targetAmount: 0 }); }}
                className="absolute p-2 bg-gray-200 rounded-full top-4 right-4 hover:bg-gray-300"
              ><X size={16} /></button>
            )}

            <h2 className="flex items-center gap-2 mb-4 text-xl font-bold"><Plus size={20} /> {editId ? "Edit Target" : "Add Target"}</h2>
            {error && <p className="mb-3 text-red-600">{error}</p>}
            {success && <p className="mb-3 text-green-600">{success}</p>}

            <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-4">
              <input type="number" name="month" value={form.month} onChange={handleChange} placeholder="Month (1-12)" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="number" name="year" value={form.year} onChange={handleChange} placeholder="Year" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="Department" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="number" name="targetAmount" value={form.targetAmount} onChange={handleChange} placeholder="Target Amount" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
            </div>

            <button onClick={handleSubmit} className="px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">{editId ? "Update Target" : "Add Target"}</button>
          </section>

          {/* Targets Table */}
          <section className="p-6 overflow-x-auto bg-white shadow rounded-2xl">
            <h2 className="flex items-center gap-2 mb-4 text-xl font-bold"><Target size={20} /> Target List</h2>
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-gray-600">Month</th>
                  <th className="p-3 text-left text-gray-600">Year</th>
                  <th className="p-3 text-left text-gray-600">Department</th>
                  <th className="p-3 text-left text-gray-600">Target Amount</th>
                  <th className="p-3 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {targets.length === 0 ? (
                  <tr><td colSpan={5} className="p-3 text-center text-gray-500">No targets found</td></tr>
                ) : targets.map(t => (
                  <tr key={t._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{t.month}</td>
                    <td className="p-3">{t.year}</td>
                    <td className="p-3">{t.department}</td>
                    <td className="p-3 font-semibold">₹{t.targetAmount}</td>
                    <td className="flex gap-2 p-3">
                      <button onClick={() => handleEdit(t)} className="p-2 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(t._id)} className="p-2 text-red-600 rounded-lg hover:bg-red-100"><Trash size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

        </main>
      </div>
    </div>
  );
}