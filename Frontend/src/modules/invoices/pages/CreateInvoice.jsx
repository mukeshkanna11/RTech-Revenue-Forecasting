import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";
import { Plus, Trash, ArrowLeft } from "lucide-react";

export default function CreateInvoice() {

const navigate = useNavigate();

/* ================= CLIENT STATES ================= */

const [clients,setClients] = useState([]);
const [loadingClients,setLoadingClients] = useState(false);
const [clientError,setClientError] = useState("");

/* ================= FORM STATE ================= */

const [form,setForm] = useState({
client:"",
items:[],
discount:0,
gst:18,
paymentMethod:"UPI",
notes:""
});

/* ================= ITEM STATE ================= */

const [item,setItem] = useState({
description:"",
quantity:1,
price:0
});

/* ================= FETCH CLIENTS ================= */

const fetchClients = useCallback(async()=>{

try{

setLoadingClients(true);
setClientError("");

const res = await API.get("/clients");

const list =
res?.data?.clients ||
res?.data?.data?.clients ||
res?.data?.data ||
[];

setClients(Array.isArray(list) ? list : []);

}catch(err){

console.error("CLIENT FETCH ERROR",err);
setClientError("Failed to load clients");

}finally{

setLoadingClients(false);

}

},[]);

useEffect(()=>{
fetchClients();
},[fetchClients]);

/* ================= SELECTED CLIENT ================= */

const selectedClient = clients.find(c=>c._id===form.client);

/* ================= ADD ITEM ================= */

const addItem = ()=>{

if(!item.description) return;

setForm({
...form,
items:[...form.items,item]
});

setItem({
description:"",
quantity:1,
price:0
});

};

/* ================= REMOVE ITEM ================= */

const removeItem = (index)=>{

const newItems = [...form.items];
newItems.splice(index,1);

setForm({...form,items:newItems});

};

/* ================= CALCULATIONS ================= */

const subtotal = form.items.reduce((sum,i)=>{

return sum + (i.price * i.quantity);

},0);

const gstAmount = (subtotal * form.gst)/100;

const discountAmount = (subtotal * form.discount)/100;

const grandTotal = subtotal + gstAmount - discountAmount;

/* ================= CREATE INVOICE ================= */

const createInvoice = async () => {

try {

if (!form.client) {
alert("Please select a client");
return;
}

if (!form.items || form.items.length === 0) {
alert("Add at least one invoice item");
return;
}

/* ===== Find Selected Client ===== */

const selectedClient = clients.find(c => c._id === form.client);

if (!selectedClient) {
alert("Client data not found");
return;
}

/* ===== Build Payload ===== */

const payload = {

client: form.client,

billingAddress: {
companyName: selectedClient.companyName || "",
address: selectedClient.address || "",
gstNumber: selectedClient.gstNumber || "",
email: selectedClient.email || "",
phone: selectedClient.phone || ""
},

items: form.items.map(item => ({
description: item.description,
hsnCode: item.hsnCode || "",
quantity: Number(item.quantity),
price: Number(item.price),
discount: Number(item.discount || 0),
taxPercent: Number(item.taxPercent || form.gst || 0)
})),

discount: Number(form.discount || 0),

gst: {
cgst: Number(form.gst / 2 || 0),
sgst: Number(form.gst / 2 || 0),
igst: 0
},

paymentMethod: form.paymentMethod?.toLowerCase(),

notes: form.notes || ""

};

/* ===== Debug Log ===== */

console.log("SENDING INVOICE:", payload);

/* ===== API Request ===== */

const res = await API.post("/invoices", payload);

if (res.data?.success) {

alert("✅ Invoice Created Successfully");

/* reset form */

setForm({
client: "",
items: [],
discount: 0,
gst: 18,
paymentMethod: "upi",
notes: ""
});

/* redirect */

navigate("/invoices");

}

} catch (err) {

console.error("CREATE INVOICE ERROR:", err.response?.data || err);

alert(
err.response?.data?.message ||
"Failed to create invoice"
);

}

};
return(

<>
<Navbar/>

<div className="min-h-screen p-8 text-gray-200 bg-gray-950">

{/* HEADER */}

<div className="flex items-center justify-between mb-8">

<div className="flex items-center gap-3">

<button
onClick={()=>navigate("/invoices")}
className="p-2 bg-gray-800 rounded"
>
<ArrowLeft size={18}/>
</button>

<h1 className="text-3xl font-bold">
Create Invoice
</h1>

</div>

</div>

{/* CLIENT SELECT */}

<div className="p-6 mb-6 border bg-gray-900 rounded-xl border-gray-800">

<h2 className="mb-4 text-lg font-semibold">
Client Information
</h2>

{loadingClients ? (

<div>Loading clients...</div>

) : clientError ? (

<div className="text-red-400">{clientError}</div>

) : (

<select
value={form.client}
onChange={(e)=>setForm({...form,client:e.target.value})}
className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded"
>

<option value="">Select Client</option>

{clients.map(c=>(
<option key={c._id} value={c._id}>
{c.companyName} ({c.email})
</option>
))}

</select>

)}

{selectedClient &&(

<div className="p-4 mt-4 bg-gray-800 rounded">

<p><b>Company:</b> {selectedClient.companyName}</p>
<p><b>Email:</b> {selectedClient.email}</p>
<p><b>Phone:</b> {selectedClient.phone || "N/A"}</p>

</div>

)}

</div>

{/* ADD ITEMS */}

<div className="p-6 mb-6 border bg-gray-900 rounded-xl border-gray-800">

<h2 className="mb-4 text-lg font-semibold">
Invoice Items
</h2>

<div className="grid grid-cols-3 gap-3 mb-4">

<input
placeholder="Description"
value={item.description}
onChange={(e)=>setItem({...item,description:e.target.value})}
className="p-3 bg-gray-800 border border-gray-700 rounded"
/>

<input
type="number"
placeholder="Quantity"
value={item.quantity}
onChange={(e)=>setItem({...item,quantity:Number(e.target.value)})}
className="p-3 bg-gray-800 border border-gray-700 rounded"
/>

<input
type="number"
placeholder="Price"
value={item.price}
onChange={(e)=>setItem({...item,price:Number(e.target.value)})}
className="p-3 bg-gray-800 border border-gray-700 rounded"
/>

</div>

<button
onClick={addItem}
className="flex items-center gap-2 px-4 py-2 mb-4 bg-indigo-600 rounded"
>
<Plus size={16}/> Add Item
</button>

{/* ITEMS LIST */}

{form.items.map((i,index)=>(

<div
key={index}
className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded"
>

<div>
{i.description} — {i.quantity} × ₹{i.price}
</div>

<button
onClick={()=>removeItem(index)}
className="text-red-400"
>
<Trash size={16}/>
</button>

</div>

))}

</div>

{/* BILLING SUMMARY */}

<div className="p-6 border bg-gray-900 rounded-xl border-gray-800">

<h2 className="mb-4 text-lg font-semibold">
Billing Summary
</h2>

<div className="grid grid-cols-2 gap-4">

<div>

<label>Discount %</label>

<input
type="number"
value={form.discount}
onChange={(e)=>setForm({...form,discount:Number(e.target.value)})}
className="w-full p-3 mt-1 bg-gray-800 border border-gray-700 rounded"
/>

</div>

<div>

<label>GST %</label>

<input
type="number"
value={form.gst}
onChange={(e)=>setForm({...form,gst:Number(e.target.value)})}
className="w-full p-3 mt-1 bg-gray-800 border border-gray-700 rounded"
/>

</div>

</div>

<div className="mt-6 space-y-2">

<div className="flex justify-between">
<span>Subtotal</span>
<span>₹{subtotal.toFixed(2)}</span>
</div>

<div className="flex justify-between">
<span>GST</span>
<span>₹{gstAmount.toFixed(2)}</span>
</div>

<div className="flex justify-between">
<span>Discount</span>
<span>- ₹{discountAmount.toFixed(2)}</span>
</div>

<div className="flex justify-between pt-3 text-xl font-bold border-t border-gray-700">
<span>Grand Total</span>
<span>₹{grandTotal.toFixed(2)}</span>
</div>

</div>

<button
onClick={createInvoice}
className="w-full py-3 mt-6 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
>
Create Invoice
</button>

</div>

</div>
</>

);

}