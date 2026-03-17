// src/modules/clients/pages/Clients.jsx

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash, Search } from "lucide-react";

import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";
import { useAuth } from "../../../context/AuthContext";

export default function Clients() {

const { user } = useAuth();

const [clients,setClients] = useState([]);
const [loading,setLoading] = useState(true);

const [search,setSearch] = useState("");

const [form,setForm] = useState({
name:"",
companyName:"",
email:"",
phone:"",
address:""
});

const [editId,setEditId] = useState(null);
const [error,setError] = useState("");
const [success,setSuccess] = useState("");
const [showResults,setShowResults] = useState(false);
const [filteredClients,setFilteredClients] = useState([]);


/* ================= FETCH CLIENTS ================= */

const fetchClients = useCallback(async()=>{

try{

setLoading(true);

const res = await API.get("/clients",{
params:{search}
});

const list =
res?.data?.clients ||
res?.data?.data?.clients ||
res?.data?.data ||
[];

setClients(Array.isArray(list) ? list : []);

}catch(err){

console.error("CLIENT FETCH ERROR",err);
setError("Failed to load clients");

}finally{
setLoading(false);
}

},[search]);


useEffect(()=>{
fetchClients();
},[fetchClients]);



/* ================= FORM ================= */

const handleChange = (e)=>{
setForm({...form,[e.target.name]:e.target.value});
};

const resetForm = ()=>{
setForm({
name:"",
companyName:"",
email:"",
phone:"",
address:""
});
setEditId(null);
};



/* ================= CREATE / UPDATE ================= */

const handleSubmit = async(e)=>{

e.preventDefault();
setError("");
setSuccess("");

if(!form.name || !form.email){
setError("Name and Email required");
return;
}

try{

if(editId){

const res = await API.put(`/clients/${editId}`,form);

setClients(prev =>
prev.map(c=>c._id===editId ? res.data.data : c)
);

setSuccess("Client updated");

}else{

const res = await API.post("/clients",form);

setClients(prev=>[res.data.data,...prev]);

setSuccess("Client created");

}

resetForm();

}catch(err){

setError(err?.response?.data?.message || "Save failed");

}

};



/* ================= EDIT ================= */

const normalizePhone = (phone) => {
  if (!phone) return "";

  // Remove spaces, dashes, non-numeric chars
  const cleaned = phone.toString().replace(/\D/g, "");

  // Optional: enforce max length (India = 10 digits)
  return cleaned.slice(0, 10);
};

const handleEdit = (client) => {
  if (!client || !client._id) {
    console.error("Invalid client data:", client);
    return;
  }

  try {
    setEditId(client._id);

    setForm({
      name: client.name?.trim() || "",
      companyName: client.companyName?.trim() || "",
      email: client.email?.toLowerCase().trim() || "",
      phone: normalizePhone(client.phone),
      address: client.address?.trim() || "",
    });

    // Smooth UX scroll
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  } catch (error) {
    console.error("Error in handleEdit:", error);
  }
};



/* ================= DELETE ================= */

const handleDelete = async(id)=>{

if(!window.confirm("Delete this client?")) return;

try{

await API.delete(`/clients/${id}`);

setClients(prev => prev.filter(c=>c._id !== id));

setSuccess("Client deleted");

}catch(err){

setError("Delete failed");

}

};

useEffect(()=>{

if(!search){
setFilteredClients([]);
return;
}

const results = clients.filter(client =>
client.name?.toLowerCase().includes(search.toLowerCase()) ||
client.companyName?.toLowerCase().includes(search.toLowerCase())
);

setFilteredClients(results.slice(0,5));

},[search,clients]);

/* ================= LOADING ================= */

if(loading){

return(

<div className="flex items-center justify-center min-h-screen text-gray-400 bg-gray-950">

<div className="w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"/>

</div>

)

}



/* ================= UI ================= */

return(

<div className="min-h-screen text-gray-200 bg-gray-950">

<Navbar/>


{/* BACKGROUND GLOW */}

<div className="fixed inset-0 -z-10">

<div className="absolute bg-indigo-500 rounded-full w-96 h-96 blur-3xl top-20 left-20 opacity-20"/>

<div className="absolute bg-purple-500 rounded-full w-96 h-96 blur-3xl bottom-20 right-20 opacity-20"/>

</div>



<main className="w-full p-8 space-y-8">


{/* PAGE HEADER */}

<div>

<h1 className="text-3xl font-bold">
Clients Management
</h1>

<p className="mt-1 text-sm text-gray-400">
Create and manage your business clients.
</p>

</div>



{/* SEARCH */}

{/* SMART SEARCH */}

<div className="relative w-full max-w-md">

<div className="flex items-center gap-2 px-3 py-2 border border-gray-800 shadow bg-gray-900/70 backdrop-blur rounded-xl">

<Search size={16} className="text-gray-400"/>

<input
type="text"
placeholder="Search clients..."
value={search}
onChange={(e)=>{
setSearch(e.target.value);
setShowResults(true);
}}
className="flex-1 text-sm text-gray-200 placeholder-gray-500 bg-transparent outline-none"
/>

{search && (

<button
onClick={()=>{
setSearch("");
setShowResults(false);
}}
className="px-2 text-xs text-gray-400 hover:text-white"
>
Clear
</button>

)}

</div>


{/* DROPDOWN RESULTS */}

{showResults && filteredClients.length > 0 && (

<div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden bg-gray-900 border border-gray-800 shadow-xl rounded-xl">

{filteredClients.map(client => (

<button
key={client._id}
onClick={()=>{

setSearch(client.name);
setShowResults(false);

document
.getElementById(`client-${client._id}`)
?.scrollIntoView({behavior:"smooth"});

}}
className="flex items-center justify-between w-full px-4 py-3 text-sm text-left transition hover:bg-gray-800"
>

<div>

<p className="font-medium text-gray-200">
{client.name}
</p>

<p className="text-xs text-gray-400">
{client.companyName || "Individual"}
</p>

</div>

<span className="text-xs text-indigo-400">
View
</span>

</button>

))}

</div>

)}

</div>

{/* FORM */}

<div className="p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl">

<h2 className="flex items-center gap-2 mb-4 font-semibold">

<Plus size={18}/>
{editId ? "Edit Client" : "Add Client"}

</h2>

{error && <p className="mb-2 text-red-400">{error}</p>}
{success && <p className="mb-2 text-green-400">{success}</p>}

<form
onSubmit={handleSubmit}
className="grid grid-cols-1 gap-4 md:grid-cols-5"
>

<input
name="name"
value={form.name}
onChange={handleChange}
placeholder="Name"
className="p-3 text-sm bg-gray-800 border border-gray-700 rounded-lg"
/>

<input
name="companyName"
value={form.companyName}
onChange={handleChange}
placeholder="Company"
className="p-3 text-sm bg-gray-800 border border-gray-700 rounded-lg"
/>

<input
name="email"
value={form.email}
onChange={handleChange}
placeholder="Email"
className="p-3 text-sm bg-gray-800 border border-gray-700 rounded-lg"
/>

<input
name="phone"
value={form.phone}
onChange={handleChange}
placeholder="Phone"
className="p-3 text-sm bg-gray-800 border border-gray-700 rounded-lg"
/>

<input
name="address"
value={form.address}
onChange={handleChange}
placeholder="Address"
className="p-3 text-sm bg-gray-800 border border-gray-700 rounded-lg"
/>

<button
className="py-3 text-white bg-indigo-600 rounded-lg md:col-span-5 hover:bg-indigo-500"
>
{editId ? "Update Client" : "Add Client"}
</button>

</form>

</div>



{/* CLIENT TABLE */}

<div className="overflow-hidden bg-gray-900 border border-gray-800 shadow-lg rounded-2xl">

<table className="w-full text-sm">

<thead className="bg-gray-800">

<tr>

<th className="p-3 text-left">Name</th>
<th className="p-3 text-left">Company</th>
<th className="p-3 text-left">Email</th>
<th className="p-3 text-left">Phone</th>
<th className="p-3 text-left">Status</th>
<th className="p-3 text-center">Actions</th>

</tr>

</thead>

<tbody>

{clients.length === 0 && (

<tr>

<td colSpan="6" className="p-6 text-center text-gray-500">
No clients found
</td>

</tr>

)}

{clients.map(c=>(

<tr
key={c._id}
className="border-t border-gray-800 hover:bg-gray-800"
>

<td className="p-3 font-medium">{c.name}</td>

<td className="p-3">{c.companyName || "-"}</td>

<td className="p-3">{c.email}</td>

<td className="p-3">{c.phone || "-"}</td>

<td className={`p-3 font-semibold ${
c.status === "active"
? "text-green-400"
: "text-red-400"
}`}>

{c.status || "active"}

</td>

<td className="flex justify-center gap-2 p-3">

<button
onClick={()=>handleEdit(c)}
className="p-2 text-blue-400 rounded hover:bg-blue-500/20"
>
<Edit size={16}/>
</button>

<button
onClick={()=>handleDelete(c._id)}
className="p-2 text-red-400 rounded hover:bg-red-500/20"
>
<Trash size={16}/>
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</main>

</div>

)

}