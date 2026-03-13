// src/modules/invoices/pages/InvoiceDetails.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import InvoicePDF from "./InvoicePDF";
import { Buffer } from "buffer";

window.Buffer = Buffer;

import {
  FileText,
  Send,
  Download,
  ArrowLeft,
  Printer,
} from "lucide-react";

export default function InvoiceDetails() {

const { id } = useParams();
const navigate = useNavigate();

const [invoice,setInvoice] = useState(null);
const [loading,setLoading] = useState(true);
const [sending,setSending] = useState(false);


/* =====================================================
FETCH INVOICE
===================================================== */

const fetchInvoice = async ()=>{

try{

setLoading(true);

const res = await API.get(`/invoices/${id}`);

setInvoice(res.data.data);

}catch(err){

console.error(err);

alert("Invoice not found");

navigate("/invoices");

}finally{

setLoading(false);

}

};

useEffect(()=>{

fetchInvoice();

},[id]);


/* =====================================================
ACTIONS
===================================================== */

// const sendInvoiceEmail = async ()=>{

// try{

// setSending(true);

// await API.post(`/invoices/${id}/email`);

// alert("Invoice email sent successfully");

// }catch(err){

// console.error(err);

// alert("Failed to send email");

// }finally{

// setSending(false);

// }

// };


const downloadInvoicePDF = async () => {

  try {

    const blob = await pdf(
      <InvoicePDF invoice={invoice} />
    ).toBlob();

    saveAs(blob, `invoice-${invoice.invoiceNumber}.pdf`);

  } catch (error) {
    console.error("PDF generation failed:", error);
  }

};

const printInvoice = async () => {

const blob = await pdf(
<InvoicePDF invoice={invoice} />
).toBlob();

const url = URL.createObjectURL(blob);

const printWindow = window.open(url);

printWindow.onload = () => {
  printWindow.print();
};

};

/* =====================================================
LOADING STATE
===================================================== */

if(loading){

return(

<>
<Navbar/>

<div className="flex items-center justify-center min-h-screen text-gray-200 bg-gray-950">

Loading Invoice...

</div>

</>

);

}

if(!invoice) return null;


/* =====================================================
CALCULATIONS
===================================================== */

const subtotal = (invoice.items || []).reduce(
(sum,i)=> sum + (i.price * i.quantity),0
);

const totalTax = (invoice.items || []).reduce(
(sum,i)=> sum + (i.price * i.quantity * (i.taxPercent/100)),0
);

const grandTotal = subtotal + totalTax - (invoice.discount || 0);


/* =====================================================
STATUS STYLE
===================================================== */

const statusStyles = {

paid:"bg-green-600",
draft:"bg-gray-600",
sent:"bg-blue-600",
overdue:"bg-red-600"

};


return(

<>
<Navbar/>

<div className="min-h-screen p-8 text-gray-200 bg-gray-950">


{/* =====================================================
HEADER
===================================================== */}

<div className="flex items-center justify-between mb-10">

<div className="flex items-center gap-4">

<button
onClick={()=>navigate("/invoices")}
className="p-2 bg-gray-800 rounded hover:bg-gray-700"
>
<ArrowLeft size={18}/>
</button>

<h1 className="flex items-center gap-3 text-3xl font-bold">
<FileText className="text-indigo-500"/>
Invoice #{invoice.invoiceNumber}
</h1>

<span className={`px-3 py-1 text-sm rounded-full ${statusStyles[invoice.status]}`}>
{invoice.status}
</span>

</div>


<div className="flex gap-3">

<button
onClick={printInvoice}
className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
>
<Printer size={18}/>
Print
</button>

<button
onClick={downloadInvoicePDF}
className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-900 bg-yellow-500 rounded hover:bg-yellow-600"
>
<Download size={18}/>
PDF
</button>

{/* <button
onClick={sendInvoiceEmail}
disabled={sending}
className="flex items-center gap-2 px-4 py-2 font-semibold bg-green-600 rounded hover:bg-green-700"
>
<Send size={18}/>
{sending ? "Sending..." : "Send Email"}
</button> */}

</div>

</div>


{/* =====================================================
CLIENT + INVOICE INFO
===================================================== */}

<div className="grid gap-6 mb-8 md:grid-cols-2">

<div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">

<h2 className="mb-4 text-lg font-semibold">
Client Information
</h2>

<p className="font-medium">
{invoice.client?.companyName}
</p>

<p className="text-gray-400">
{invoice.client?.email}
</p>

<p className="text-gray-400">
{invoice.client?.phone}
</p>

<p className="text-gray-400">
{invoice.client?.address}
</p>

</div>


<div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">

<h2 className="mb-4 text-lg font-semibold">
Invoice Details
</h2>

<p>
Payment Method : {invoice.paymentMethod || "—"}
</p>

<p>
Discount : ₹{invoice.discount || 0}
</p>

<p>
Notes : {invoice.notes || "—"}
</p>

<p>
Created : {new Date(invoice.createdAt).toLocaleDateString()}
</p>

</div>

</div>


{/* =====================================================
ITEMS TABLE
===================================================== */}

<div className="mb-8 overflow-hidden bg-gray-900 border border-gray-800 rounded-xl">

<table className="w-full text-sm">

<thead className="text-gray-400 border-b border-gray-800">

<tr>

<th className="p-4 text-left">Description</th>
<th className="p-4 text-left">Qty</th>
<th className="p-4 text-left">Price</th>
<th className="p-4 text-left">Tax %</th>
<th className="p-4 text-left">Total</th>

</tr>

</thead>

<tbody>

{(invoice.items || []).map((item,index)=>{

const total = item.price * item.quantity * (1 + item.taxPercent/100);

return(

<tr
key={index}
className="border-b border-gray-800 hover:bg-gray-800"
>

<td className="p-4">
{item.description}
</td>

<td className="p-4">
{item.quantity}
</td>

<td className="p-4">
₹{item.price}
</td>

<td className="p-4">
{item.taxPercent}%
</td>

<td className="p-4 font-medium text-green-400">
₹{total.toFixed(2)}
</td>

</tr>

);

})}

</tbody>

</table>

</div>


{/* =====================================================
TOTAL SUMMARY
===================================================== */}

<div className="flex justify-end">

<div className="w-full max-w-md p-6 bg-gray-900 border border-gray-800 rounded-xl">

<div className="flex justify-between py-2">
<span>Subtotal</span>
<span>₹{subtotal.toFixed(2)}</span>
</div>

<div className="flex justify-between py-2">
<span>Total Tax</span>
<span>₹{totalTax.toFixed(2)}</span>
</div>

<div className="flex justify-between py-2">
<span>Discount</span>
<span>₹{invoice.discount || 0}</span>
</div>

<div className="flex justify-between py-3 mt-2 text-lg font-bold border-t border-gray-800">
<span>Grand Total</span>
<span>₹{grandTotal.toFixed(2)}</span>
</div>

</div>

</div>


</div>

</>

);

}