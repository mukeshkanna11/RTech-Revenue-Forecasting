// src/modules/clients/pages/Clients.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, Edit, Trash, Users, Home, DollarSign, FileText, Target,
  BarChart3, Activity, LogOut, Menu, X
} from "lucide-react";
import API from "../../../utils/axios";
import { useAuth } from "../../../context/AuthContext";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", companyName: "", email: "", phone: "", address: "" });
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

  // ---------------- Fetch Clients ----------------
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await API.get("/clients", { headers: { Authorization: `Bearer ${user?.token}` } });
        setClients(Array.isArray(res.data.data?.data) ? res.data.data.data : []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) { logout(); navigate("/login"); }
      } finally { setLoading(false); }
    };
    fetchClients();
  }, [user, logout, navigate]);

  // ---------------- Form Handlers ----------------
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.name || !form.email) {
      setError("Name and Email are required");
      return;
    }

    try {
      if (editId) {
        // ---------------- Edit Client ----------------
        const res = await API.put(`/clients/${editId}`, form, { headers: { Authorization: `Bearer ${user?.token}` } });
        setClients(clients.map(c => c._id === editId ? res.data.data : c));
        setSuccess("Client updated successfully!");
        setEditId(null);
      } else {
        // ---------------- Add Client ----------------
        const res = await API.post("/clients", form, { headers: { Authorization: `Bearer ${user?.token}` } });
        setClients([res.data.data, ...clients]);
        setSuccess("Client added successfully!");
      }
      setForm({ name: "", companyName: "", email: "", phone: "", address: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save client");
    }
  };

  // ---------------- Edit Button ----------------
  const handleEdit = (client) => {
    setForm({
      name: client.name || "",
      companyName: client.companyName || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
    });
    setEditId(client._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------- Delete Button ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await API.delete(`/clients/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
      setClients(clients.filter(c => c._id !== id));
      setSuccess("Client deleted successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete client");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><p className="animate-pulse">Loading Clients...</p></div>;

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
          <h1 className="text-xl font-bold">{editId ? "Edit Client" : "Clients"}</h1>
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

        {/* Page Content */}
        <main className="p-6 space-y-6">

          {/* Add/Edit Client Form */}
          <section className="relative p-6 bg-white shadow rounded-2xl">
            {editId && (
              <button
                onClick={() => { setEditId(null); setForm({ name: "", companyName: "", email: "", phone: "", address: "" }); }}
                className="absolute p-2 bg-gray-200 rounded-full top-4 right-4 hover:bg-gray-300"
              ><X size={16} /></button>
            )}

            <h2 className="flex items-center gap-2 mb-4 text-xl font-bold"><Plus size={20} /> {editId ? "Edit Client" : "Add Client"}</h2>
            {error && <p className="mb-3 text-red-600">{error}</p>}
            {success && <p className="mb-3 text-green-600">{success}</p>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Client Name" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="text" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <button type="submit" className="flex items-center justify-center col-span-1 gap-2 px-6 py-3 text-white transition bg-indigo-600 md:col-span-5 rounded-xl hover:bg-indigo-700">
                <Plus size={16} /> {editId ? "Update Client" : "Add Client"}
              </button>
            </form>
          </section>

          {/* Clients Table */}
          <section className="p-6 overflow-x-auto bg-white shadow rounded-2xl">
            <h2 className="flex items-center gap-2 mb-4 text-xl font-bold"><Users size={20} /> Client List</h2>
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-gray-600">Name</th>
                  <th className="p-3 text-left text-gray-600">Company</th>
                  <th className="p-3 text-left text-gray-600">Email</th>
                  <th className="p-3 text-left text-gray-600">Phone</th>
                  <th className="p-3 text-left text-gray-600">Address</th>
                  <th className="p-3 text-left text-gray-600">Status</th>
                  <th className="p-3 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr><td colSpan={7} className="p-3 text-center text-gray-500">No clients found</td></tr>
                ) : clients.map(c => (
                  <tr key={c._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.companyName || "-"}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone || "-"}</td>
                    <td className="p-3">{c.address || "-"}</td>
                    <td className={`p-3 font-semibold ${c.status === "active" ? "text-green-600" : "text-red-600"}`}>{c.status}</td>
                    <td className="flex gap-2 p-3">
                      <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-2 text-red-600 rounded-lg hover:bg-red-100"><Trash size={16} /></button>
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