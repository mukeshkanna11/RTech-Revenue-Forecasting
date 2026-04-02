// src/modules/invoices/pages/Invoices.jsx

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import InvoicePDF from "./InvoicePDF";
import { Buffer } from "buffer";

window.Buffer = Buffer;

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

  // States
  const [invoices, setInvoices] = useState([]);
  const [latest, setLatest] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH INVOICES ================= */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/invoices?search=${search}`);

      // Normalize data
     // Extract invoices correctly from nested response
let data = [];
if (res.data?.data?.data) {
  data = res.data.data.data;  // <- this is where your invoices actually are
} else if (Array.isArray(res.data)) {
  data = res.data;
} else if (Array.isArray(res.data.data)) {
  data = res.data.data;
}

setInvoices(data);
setLatest(data.slice(0, 3));
    } catch (err) {
      console.error("Invoice fetch failed:", err);
      setError("Failed to load invoices. Please check your backend.");
      setInvoices([]);
      setLatest([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchInvoices();
  }, [search]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const total = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === "paid");
    const pendingInvoices = invoices.filter(
      i => ["draft", "sent", "pending"].includes(i.status)
    );
    const revenue = paidInvoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);

    return {
      total,
      paid: paidInvoices.length,
      pending: pendingInvoices.length,
      revenue
    };
  }, [invoices]);

  /* ================= DELETE ================= */
  const deleteInvoice = async id => {
    if (!window.confirm("Delete this invoice?")) return;

    try {
      await API.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  /* ================= STATUS UPDATE ================= */
  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/invoices/${id}/status`, { status });
      fetchInvoices();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Status update failed");
    }
  };

  /* ================= VIEW ================= */
  const viewInvoice = id => {
    navigate(`/invoices/${id}`);
  };

  /* ================= DOWNLOAD PDF ================= */
  const downloadPDF = async invoice => {
    try {
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
      saveAs(blob, `invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("PDF download failed");
    }
  };

  return (

<>
<Navbar/>

<div className="min-h-screen p-8 text-gray-200 bg-gray-950">

{/* -------------------------------------------------- */}


{/* HEADER */}
<div className="flex flex-col gap-6 mb-10 md:flex-row md:items-center md:justify-between">

  {/* Left Section */}
  <div className="flex items-start gap-4">

    {/* Icon Badge */}
    <div className="flex items-center justify-center w-12 h-12 border shadow-lg rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 border-white/10">
      <FileText className="w-6 h-6 text-white" />
    </div>

    {/* Title */}
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-transparent md:text-4xl bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text">
        Invoice Management
      </h1>
      <p className="mt-1 text-sm text-gray-400">
        Create, manage, and track all your invoices seamlessly
      </p>
    </div>

  </div>

  {/* Right Section */}
  <div className="flex items-center gap-3">

    {/* Live Indicator */}
    <div className="items-center hidden gap-2 px-4 py-2 border sm:flex rounded-xl bg-white/5 border-white/10 backdrop-blur-md">
      <span className="relative flex w-2 h-2">
        <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
        <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
      </span>
      <span className="text-xs text-gray-300">Auto Sync</span>
    </div>

    {/* CTA Button */}
    <button
      onClick={() => navigate("/invoices/create")}
      className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-300 border shadow-lg rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 hover:shadow-xl border-white/10"
    >
      <Plus className="w-4 h-4" />
      Create Invoice
    </button>

  </div>

</div>


{/* STATS */}
{/* -------------------------------------------------- */}

<div className="grid gap-6 mb-10 md:grid-cols-2 lg:grid-cols-4">

  {/* Total Invoices */}
  <div className="relative p-5 transition-all duration-300 border shadow-xl group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:-translate-y-1 hover:shadow-2xl">
    
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 border rounded-lg bg-indigo-500/10 border-indigo-500/20">
        <FileText className="w-5 h-5 text-indigo-400" />
      </div>
      <span className="text-xs text-green-400">+8%</span>
    </div>

    <p className="text-sm text-gray-400">Total Invoices</p>
    <h2 className="mt-1 text-2xl font-semibold text-white">{stats.total}</h2>

  </div>

  {/* Paid */}
  <div className="relative p-5 transition-all duration-300 border shadow-xl group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:-translate-y-1 hover:shadow-2xl">
    
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 border rounded-lg bg-green-500/10 border-green-500/20">
        <CheckCircle className="w-5 h-5 text-green-400" />
      </div>
      <span className="text-xs text-green-400">Completed</span>
    </div>

    <p className="text-sm text-gray-400">Paid</p>
    <h2 className="mt-1 text-2xl font-semibold text-white">{stats.paid}</h2>

  </div>

  {/* Pending */}
  <div className="relative p-5 transition-all duration-300 border shadow-xl group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:-translate-y-1 hover:shadow-2xl">
    
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
        <Clock className="w-5 h-5 text-yellow-400" />
      </div>
      <span className="text-xs text-yellow-400">In Progress</span>
    </div>

    <p className="text-sm text-gray-400">Pending</p>
    <h2 className="mt-1 text-2xl font-semibold text-white">{stats.pending}</h2>

  </div>

  {/* Revenue */}
  <div className="relative p-5 transition-all duration-300 border shadow-xl group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:-translate-y-1 hover:shadow-2xl">
    
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 border rounded-lg bg-purple-500/10 border-purple-500/20">
        <DollarSign className="w-5 h-5 text-purple-400" />
      </div>
      <span className="text-xs text-green-400">+12.5%</span>
    </div>

    <p className="text-sm text-gray-400">Revenue</p>
    <h2 className="mt-1 text-2xl font-semibold text-white">
      ₹{stats.revenue}
    </h2>

  </div>

</div>


{/* -------------------------------------------------- */}

{/* -------------------------------------------------- */}
{/* LATEST INVOICES */}
{/* -------------------------------------------------- */}

<div className="mb-12">

  {/* Section Header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold tracking-tight text-white">
      Latest Invoices
    </h2>

    <span className="text-xs text-gray-400">
      Recently created invoices
    </span>
  </div>

  {/* Grid */}
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

    {latest.map((inv) => {

      const statusStyles = {
        paid: "bg-green-500/10 text-green-400 border-green-500/20",
        draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        overdue: "bg-red-500/10 text-red-400 border-red-500/20",
      };

      return (
        <div
          key={inv._id}
          className="relative p-5 transition-all duration-300 border shadow-xl group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:-translate-y-1 hover:shadow-2xl"
        >

          {/* Top Row */}
          <div className="flex items-start justify-between mb-4">

            {/* Left */}
            <div className="flex items-center gap-3">

              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 border rounded-xl bg-indigo-500/10 border-indigo-500/20">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {inv.invoiceNumber}
                </h3>
                <p className="text-xs text-gray-400">
                  {inv.client?.companyName || "Client"}
                </p>
              </div>

            </div>

            {/* Status */}
            <span className={`text-xs px-3 py-1 rounded-full border ${statusStyles[inv.status]}`}>
              {inv.status}
            </span>

          </div>

          {/* Amount */}
          <div className="mb-5">
            <p className="text-lg font-semibold text-green-400">
              ₹{inv.grandTotal}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">

            {/* Small label */}
            <span className="text-xs text-gray-500">
              Invoice
            </span>

            {/* Actions */}
            <div className="flex items-center gap-3">

              <button
                onClick={() => downloadPDF(inv)}
                className="p-2 transition rounded-lg hover:bg-white/10"
              >
                <Download size={16} className="text-yellow-400 hover:text-yellow-300" />
              </button>

            </div>

          </div>

        </div>
      );
    })}

  </div>

</div>


{/* -------------------------------------------------- */}
{/* SEARCH */}
{/* -------------------------------------------------- */}

<div className="flex items-center gap-3 p-4 mb-6 bg-gray-900 border border-gray-800 rounded-xl">

<Search size={18}/>

<input
value={search}
onChange={(e)=>setSearch(e.target.value)}
placeholder="Search invoice..."
className="flex-1 text-sm bg-transparent outline-none"
/>

<button
onClick={fetchInvoices}
className="px-4 py-2 bg-indigo-600 rounded-lg"
>
Search
</button>

</div>


{/* -------------------------------------------------- */}
{/* TABLE */}
{/* -------------------------------------------------- */}

<div className="overflow-hidden bg-gray-900 border border-gray-800 rounded-xl">

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

{loading ? (

<tr>
<td colSpan="5" className="p-8 text-center text-gray-400">
Loading invoices...
</td>
</tr>

) : invoices.length === 0 ? (

<tr>
<td colSpan="5" className="p-8 text-center text-gray-400">
No invoices found
</td>
</tr>

) : (

invoices.map(inv => (

<tr
key={inv._id}
className="transition border-b border-gray-800 hover:bg-gray-800"
>

<td className="p-4 font-medium">
{inv.invoiceNumber}
</td>

<td className="p-4">
{inv.client?.companyName || "Client"}
</td>

<td className="p-4 font-semibold text-green-400">
₹{inv.grandTotal}
</td>

<td className="p-4">

<select
value={inv.status}
onChange={(e)=>updateStatus(inv._id,e.target.value)}
className="px-2 py-1 text-sm bg-gray-800 rounded"
>

<option value="draft">Draft</option>
<option value="sent">Sent</option>
<option value="paid">Paid</option>
<option value="overdue">Overdue</option>

</select>

</td>

<td className="flex items-center gap-3 p-4">

<button
onClick={() => viewInvoice(inv._id)}
title="View Invoice"
className="text-blue-400 transition hover:text-blue-300"
>
<Eye size={18}/>
</button>

<button
onClick={()=>downloadPDF(inv)}
className="text-yellow-400 hover:text-yellow-300"
>
<Download size={18}/>
</button>

{/* <button
onClick={() => sendEmail(inv._id)}
title="Send Email"
className="text-green-400 transition hover:text-green-300"
>
<Send size={18}/>
</button> */}

<button
onClick={() => deleteInvoice(inv._id)}
title="Delete Invoice"
className="text-red-400 transition hover:text-red-300"
>
<Trash size={18}/>
</button>

</td>

</tr>

))

)}

</tbody>

</table>

</div>

</div>

</>

);

}


/* -------------------------------------------------- */
/* CARD COMPONENT */
/* -------------------------------------------------- */

function Card({title,value,icon}){

return(

<div className="p-6 transition bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500">

<div className="flex justify-between mb-2 text-gray-400">

<span>{title}</span>
{icon}

</div>

<h2 className="text-2xl font-bold">
{value}
</h2>

</div>

);

}