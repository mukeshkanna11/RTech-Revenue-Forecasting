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

  const [invoices,setInvoices] = useState([]);
  const [latest,setLatest] = useState([]);
  const [search,setSearch] = useState("");
  const [loading,setLoading] = useState(false);

  /* -------------------------------------------------- */
  /* FETCH INVOICES */
  /* -------------------------------------------------- */

  const fetchInvoices = async () => {

    try {

      setLoading(true);

      const res = await API.get(`/invoices?search=${search}`);

      const data = res.data.data || [];

      setInvoices(data);

      setLatest(data.slice(0,3));

    } catch(err){

      console.error("Invoice fetch failed",err);
      setInvoices([]);

    } finally{

      setLoading(false);

    }

  };

  useEffect(()=>{
    fetchInvoices();
  },[]);

  /* -------------------------------------------------- */
  /* AUTO STATS CALCULATION (SDE-15) */
  /* -------------------------------------------------- */

  const stats = useMemo(()=>{

    const total = invoices.length;

    const paidInvoices = invoices.filter(i=>i.status==="paid");

    const pendingInvoices = invoices.filter(
      i => i.status==="draft" || i.status==="sent" || i.status==="pending"
    );

    const revenue = paidInvoices.reduce(
      (sum,i)=>sum+(i.grandTotal || 0),
      0
    );

    return {
      total,
      paid: paidInvoices.length,
      pending: pendingInvoices.length,
      revenue
    };

  },[invoices]);

  /* -------------------------------------------------- */
  /* DELETE */
  /* -------------------------------------------------- */

  const deleteInvoice = async(id)=>{

    if(!window.confirm("Delete this invoice ?")) return;

    try{

      await API.delete(`/invoices/${id}`);

      fetchInvoices();

    }catch(err){

      alert("Delete failed");

    }

  };

  /* -------------------------------------------------- */
  /* EMAIL */
  /* -------------------------------------------------- */

  // const sendEmail = async(id)=>{

  //   try{

  //     await API.post(`/invoices/${id}/email`);

  //     alert("Invoice sent");

  //   }catch(err){

  //     alert("Email failed");

  //   }

  // };

  /* -------------------------------------------------- */
  /* STATUS UPDATE */
  /* -------------------------------------------------- */

  const updateStatus = async(id,status)=>{

    try{

      await API.patch(`/invoices/${id}/status`,{status});

      fetchInvoices();

    }catch(err){

      alert("Status update failed");

    }

  };

  /* -------------------------------------------------- */
  /* VIEW INVOICE */
  /* -------------------------------------------------- */  

const viewInvoice = (id) => {
  navigate(`/invoices/${id}`);
};

  /* -------------------------------------------------- */
  /* DOWNLOAD PDF */
  /* -------------------------------------------------- */

  const downloadPDF = async (invoice)=>{

const blob = await pdf(
<InvoicePDF invoice={invoice}/>
).toBlob();

saveAs(blob, `invoice-${invoice.invoiceNumber}.pdf`);

};

  return (

<>
<Navbar/>

<div className="min-h-screen p-8 text-gray-200 bg-gray-950">

{/* -------------------------------------------------- */}
{/* HEADER */}
{/* -------------------------------------------------- */}

<div className="flex items-center justify-between mb-10">

<h1 className="flex items-center gap-3 text-3xl font-bold">
<FileText className="text-indigo-500"/>
Invoice Management
</h1>

<button
onClick={()=>navigate("/invoices/create")}
className="flex items-center gap-2 px-6 py-3 font-semibold bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700"
>
<Plus size={18}/>
Create Invoice
</button>

</div>


{/* -------------------------------------------------- */}
{/* STATS */}
{/* -------------------------------------------------- */}

<div className="grid gap-6 mb-10 md:grid-cols-4">

<Card
title="Total Invoices"
value={stats.total}
icon={<FileText className="text-indigo-400"/>}
/>

<Card
title="Paid"
value={stats.paid}
icon={<CheckCircle className="text-green-400"/>}
/>

<Card
title="Pending"
value={stats.pending}
icon={<Clock className="text-yellow-400"/>}
/>

<Card
title="Revenue"
value={`₹${stats.revenue}`}
icon={<DollarSign className="text-purple-400"/>}
/>

</div>


{/* -------------------------------------------------- */}
{/* LATEST INVOICES */}
{/* -------------------------------------------------- */}

<div className="mb-10">

<h2 className="mb-4 text-xl font-semibold">
Latest Invoices
</h2>

<div className="grid gap-6 md:grid-cols-3">

{latest.map(inv => (

<div
key={inv._id}
className="p-6 transition bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500"
>

<div className="flex justify-between mb-2">

<h3 className="font-semibold">
{inv.invoiceNumber}
</h3>

<span className={`text-xs px-2 py-1 rounded-full

${inv.status==="paid" && "bg-green-600"}
${inv.status==="draft" && "bg-gray-600"}
${inv.status==="sent" && "bg-blue-600"}
${inv.status==="overdue" && "bg-red-600"}

`}>

{inv.status}

</span>

</div>

<p className="mb-2 text-sm text-gray-400">
{inv.client?.companyName || "Client"}
</p>

<p className="mb-4 font-semibold text-green-400">
₹{inv.grandTotal}
</p>

<div className="flex gap-3">

<button
onClick={()=>downloadPDF(inv)}
className="text-yellow-400 hover:text-yellow-300"
>
<Download size={18}/>
</button>

{/* <button
onClick={()=>sendEmail(inv._id)}
className="text-green-400 hover:text-green-300"
>
<Send size={18}/>
</button> */}

</div>

</div>

))}

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