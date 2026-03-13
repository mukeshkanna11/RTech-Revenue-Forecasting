// src/modules/invoices/pages/Invoices.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";

import {
  FileText,
  Plus,
  Eye,
  Trash,
  Send,
  Download,
  DollarSign,
  CheckCircle,
  Clock,
  Search
} from "lucide-react";

export default function Invoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");

  const fetchInvoices = async () => {
    try {
      const res = await API.get(`/invoices?search=${search}`);
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setInvoices([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get(`/invoices/stats`);
      setStats(res.data.data || {});
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({});
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, []);

  const deleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await API.delete(`/invoices/${id}`);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert("Failed to delete invoice");
    }
  };

  const sendEmail = async (id) => {
    try {
      await API.post(`/invoices/${id}/email`);
      alert("Invoice sent successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to send invoice email");
    }
  };

  const downloadPDF = (id) => {
    window.open(`/api/v1/invoices/${id}/pdf`);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen p-8 text-gray-200 bg-gray-950">

       {/* Header Section - SDE 12 Version */}
<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
  
  {/* Page Title */}
  <h1 className="flex items-center gap-3 text-3xl font-extrabold text-gray-100">
    <FileText size={28} className="text-indigo-500" /> Invoice Management
  </h1>

  {/* Create Invoice Button */}
{/* Create Invoice Button */}
<button
  onClick={() => navigate("/invoices/create")}
  className="flex items-center gap-2 px-6 py-3 text-white font-semibold bg-indigo-600 rounded-lg shadow-lg transition duration-200 ease-in-out 
             hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
>
  <Plus size={18} /> Create Invoice
</button>

</div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-4">
          <Card title="Total Invoices" value={stats.total || 0} icon={<FileText />} />
          <Card title="Paid" value={stats.paid || 0} icon={<CheckCircle />} />
          <Card title="Pending" value={stats.pending || 0} icon={<Clock />} />
          <Card title="Revenue" value={`₹${stats.revenue || 0}`} icon={<DollarSign />} />
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 p-4 mb-6 bg-gray-900 border border-gray-800 rounded-xl">
          <Search size={18} />
          <input
            placeholder="Search invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
          />
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg"
          >
            Search
          </button>
        </div>

        {/* Invoice Table */}
        <div className="overflow-hidden border bg-gray-900 rounded-xl border-gray-800">
          <table className="w-full">
            <thead className="text-sm text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-4 text-left">Invoice</th>
                <th className="p-4 text-left">Client</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(invoices || []).map(inv => (
                <tr key={inv._id} className="transition border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-4 font-medium">{inv.invoiceNumber}</td>
                  <td className="p-4">{inv.client?.companyName || "Client"}</td>
                  <td className="p-4 font-semibold text-green-400">₹{inv.grandTotal}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full
                      ${inv.status === "paid" ? "bg-green-600" : ""}
                      ${inv.status === "sent" ? "bg-blue-600" : ""}
                      ${inv.status === "draft" ? "bg-gray-600" : ""}
                      ${inv.status === "overdue" ? "bg-red-600" : ""}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="flex gap-3 p-4">
                    <button className="text-blue-400 hover:text-blue-300"><Eye size={18} /></button>
                    <button onClick={() => downloadPDF(inv._id)} className="text-yellow-400 hover:text-yellow-300"><Download size={18} /></button>
                    <button onClick={() => sendEmail(inv._id)} className="text-green-400 hover:text-green-300"><Send size={18} /></button>
                    <button onClick={() => deleteInvoice(inv._id)} className="text-red-400 hover:text-red-300"><Trash size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* Card Component */
function Card({ title, value, icon }) {
  return (
    <div className="p-6 transition border bg-gray-900 rounded-xl border-gray-800 hover:border-indigo-500">
      <div className="flex items-center justify-between mb-3 text-gray-400">
        <span>{title}</span>
        {icon}
      </div>
      <h2 className="text-2xl font-bold">{value || 0}</h2>
    </div>
  );
}