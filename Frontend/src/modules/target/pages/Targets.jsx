import { useEffect, useState, useMemo } from "react";
import {
Target,
Plus,
Edit,
Trash2,
RefreshCcw,
Search,
TrendingUp
} from "lucide-react";

import { motion } from "framer-motion";

import {  Edit2,  } from "lucide-react";

import {
BarChart,
Bar,
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid,
Legend
} from "recharts";

import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";

/* -------------------------------------------------- */

export default function Targets(){

/* ---------------- STATE ---------------- */

const [targets,setTargets] = useState([]);
const [revenues,setRevenues] = useState([]);

const [loading,setLoading] = useState(false);
const [error,setError] = useState("");
const [saving, setSaving] = useState(false);
const [search,setSearch] = useState("");

const [form,setForm] = useState({
month:"",
year:"",
department:"",
targetAmount:""
});

const [editingTargetId, setEditingTargetId] = useState(null);
const [editForm, setEditForm] = useState({
  department: "",
  targetAmount: "",
  month: "",
  year: "",
});

const [editId,setEditId] = useState(null);
const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

/* ---------------- FETCH DATA ---------------- */

const fetchData = async()=>{

try{

setLoading(true);
setError("");

const [targetRes,revenueRes] = await Promise.all([

API.get("/targets"),
API.get("/revenues").catch(()=>({data:[]}))

]);

const targetData =
targetRes?.data?.data ||
targetRes?.data?.targets ||
targetRes?.data ||
[];

const revenueData =
revenueRes?.data?.data ||
revenueRes?.data?.revenues ||
revenueRes?.data ||
[];

setTargets(Array.isArray(targetData) ? targetData : []);
setRevenues(Array.isArray(revenueData) ? revenueData : []);

}catch(err){

console.error(err);

setError(
err?.response?.data?.message ||
"Failed to load targets"
);

}finally{
setLoading(false);
}

};

useEffect(()=>{
fetchData();
},[]);

/* ---------------- KPI ---------------- */

const totalTarget = useMemo(()=>{

return targets.reduce((sum,t)=>sum + (t.targetAmount || 0),0);

},[targets]);

const totalRevenue = useMemo(()=>{

return revenues.reduce((sum,r)=>sum + (r.amount || 0),0);

},[revenues]);

const forecastRevenue = useMemo(()=>{

if(targets.length===0) return 0;

const avg = totalTarget / targets.length;

return Math.round(avg * 1.15);

},[targets]);

/* ---------------- TARGET VS REVENUE CHART ---------------- */

const chartData = useMemo(()=>{

return targets.map(t=>{

const revenue = revenues.find(r=>
r.month === t.month && r.year === t.year
);

return{
name:`${t.month}/${t.year}`,
target:t.targetAmount,
revenue:revenue?.amount || 0
};

});

},[targets,revenues]);

/* ---------------- DEPARTMENT LEADERBOARD ---------------- */

const leaderboard = useMemo(()=>{

const map={};

targets.forEach(t=>{

if(!map[t.department]) map[t.department]=0;

map[t.department]+=t.targetAmount;

});

return Object.entries(map)
.map(([dept,value])=>({dept,value}))
.sort((a,b)=>b.value-a.value);

},[targets]);

const departmentAnalytics = useMemo(() => {

const map = {};

targets.forEach(t => {

if (!map[t.department]) {
map[t.department] = {
dept: t.department,
target: 0,
revenue: 0
};
}

map[t.department].target += t.targetAmount;

});

revenues.forEach(r => {

if (!map[r.department]) {
map[r.department] = {
dept: r.department,
target: 0,
revenue: 0
};
}

map[r.department].revenue += r.amount;

});

const result = Object.values(map).map(d => {

const achievement =
d.target > 0 ? (d.revenue / d.target) * 100 : 0;

return {
...d,
achievement
};

});

return result.sort((a,b)=> b.achievement - a.achievement);

}, [targets, revenues]);

/* ---------------- SEARCH ---------------- */

const filteredTargets = useMemo(()=>{

return targets.filter(t=>
t.department?.toLowerCase().includes(search.toLowerCase())
);

},[targets,search]);

/* ---------------- CREATE TARGET ---------------- */

const handleSubmit = async(e)=>{

e.preventDefault();

try{

const payload={
month:Number(form.month),
year:Number(form.year),
department:form.department,
targetAmount:Number(form.targetAmount)
};

if(editId){

await API.put(`/targets/${editId}`,payload);

}else{

await API.post("/targets",payload);

}

setForm({
month:"",
year:"",
department:"",
targetAmount:""
});

setEditId(null);

fetchData();

}catch(err){

setError(err?.response?.data?.message || "Operation failed");

}

};

const handleEditChange = (e) => {
  const { name, value } = e.target;
  setEditForm((prev) => ({ ...prev, [name]: value }));
};

const handleCancelEdit = () => {
  setEditingTargetId(null); // exit edit mode
};

/* ---------------- EDIT TARGET ---------------- */
const handleEditClick = (target) => {
  setEditingTargetId(target._id); // mark this target as editing
  setEditForm({
    department: target.department,
    targetAmount: target.targetAmount,
    month: target.month,
    year: target.year,
  });
};


/* ---------------- SAVE EDIT (PARTIAL UPDATE - SAAS) ---------------- */
const handleSaveEdit = async (id) => {
  if (!id) return;

  try {
    setSaving(true);

    // ✅ Build payload dynamically (only changed fields)
    const payload = {};

    if (editForm.department)
      payload.department = editForm.department.trim();

    if (editForm.month)
      payload.month = Number(editForm.month);

    if (editForm.year)
      payload.year = Number(editForm.year);

    if (editForm.target)
      payload.target = Number(editForm.target);

    // ❌ If nothing changed
    if (Object.keys(payload).length === 0) {
      throw new Error("No changes to update");
    }

    console.log("🚀 Partial Payload:", payload);

    await API.put(`/targets/${id}`, payload);

    console.log("✅ Updated successfully");

    setEditingTargetId(null);
    fetchData();

  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Update failed";

    console.error("❌ Update Failed:", message);

  } finally {
    setSaving(false);
  }
};


/* ---------------- DELETE ---------------- */

const handleDelete = async(id)=>{

if(!window.confirm("Delete target?")) return;

await API.delete(`/targets/${id}`);

fetchData();

};

/* ---------------- UI ---------------- */

return(

<>
<Navbar/>

<div className="min-h-screen px-8 py-10 text-white bg-gray-950">

{/* HEADER */}

<div className="flex items-center justify-between mb-8">

<div className="flex items-center gap-3">

<Target className="text-indigo-500"/>

<h1 className="text-3xl font-bold">
Targets Analytics
</h1>

</div>

<button
onClick={fetchData}
className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg"
>

<RefreshCcw size={16}/>
Refresh

</button>

</div>

{/* KPI CARDS */}

<div className="grid gap-6 mb-10 md:grid-cols-4">

<div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
<p className="text-gray-400">Total Target</p>
<p className="mt-2 text-2xl font-bold text-indigo-400">
₹{totalTarget.toLocaleString()}
</p>
</div>

<div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
<p className="text-gray-400">Revenue</p>
<p className="mt-2 text-2xl font-bold text-green-400">
₹{totalRevenue.toLocaleString()}
</p>
</div>

<div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
<p className="text-gray-400">AI Forecast</p>
<p className="mt-2 text-2xl font-bold text-purple-400">
₹{forecastRevenue.toLocaleString()}
</p>
</div>

<div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
<p className="text-gray-400">Departments</p>
<p className="mt-2 text-2xl font-bold text-yellow-400">
{leaderboard.length}
</p>
</div>

</div>

{/* CHART */}

{/* ================================
        ANALYTICS DASHBOARD
================================ */}

<div className="grid gap-8 mb-10 lg:grid-cols-2">

{/* ================================
        TARGET vs REVENUE
================================ */}

<div className="p-6 bg-gray-900 border border-gray-800 shadow-xl rounded-xl">

<h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-200">

<TrendingUp size={18} className="text-indigo-400"/>
Target vs Revenue

</h2>

<ResponsiveContainer width="100%" height={320}>

<BarChart data={chartData}>

<defs>

<linearGradient id="targetBar" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#6366F1" stopOpacity={0.9}/>
<stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
</linearGradient>

<linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%" stopColor="#22C55E" stopOpacity={0.9}/>
<stop offset="95%" stopColor="#22C55E" stopOpacity={0.3}/>
</linearGradient>

</defs>

<CartesianGrid stroke="#374151" strokeDasharray="4 4"/>

<XAxis dataKey="name" stroke="#9CA3AF"/>

<YAxis stroke="#9CA3AF"/>

<Tooltip
contentStyle={{
background:"#111827",
border:"1px solid #374151",
borderRadius:"8px"
}}
/>

<Legend/>

<Bar
dataKey="target"
fill="url(#targetBar)"
radius={[6,6,0,0]}
/>

<Bar
dataKey="revenue"
fill="url(#revenueBar)"
radius={[6,6,0,0]}
/>

</BarChart>

</ResponsiveContainer>

</div>


{/* ================================
        AI FORECAST
================================ */}

<div className="p-6 bg-gray-900 border border-gray-800 shadow-xl rounded-xl">

<h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-200">

<TrendingUp size={18} className="text-purple-400"/>
AI Revenue Forecast

</h2>

<ResponsiveContainer width="100%" height={320}>

<LineChart data={chartData}>

<CartesianGrid stroke="#374151" strokeDasharray="4 4"/>

<XAxis dataKey="name" stroke="#9CA3AF"/>

<YAxis stroke="#9CA3AF"/>

<Tooltip
contentStyle={{
background:"#111827",
border:"1px solid #374151"
}}
/>

<Legend/>

<Line
type="monotone"
dataKey="revenue"
stroke="#22C55E"
strokeWidth={3}
dot={{ r:5 }}
/>

<Line
type="monotone"
dataKey="target"
stroke="#6366F1"
strokeWidth={3}
dot={{ r:5 }}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

{/* ===============================
        DEPARTMENT LEADERBOARD
================================ */}

{/* ======================================
     DEPARTMENT PERFORMANCE LEADERBOARD
====================================== */}

<div className="p-6 mb-10 bg-gray-900 border border-gray-800 shadow-xl rounded-xl">

{/* HEADER */}

<div className="flex items-center justify-between mb-6">

<h2 className="text-lg font-semibold text-gray-200">
Department Performance
</h2>

<span className="text-xs text-gray-400">
Target vs Revenue
</span>

</div>

<div className="space-y-4">

{departmentAnalytics.map((d,i)=>{

const percent = Math.min(d.achievement,100);

return(

<div
key={i}
className="p-4 transition border border-gray-800 rounded-lg bg-gray-950 hover:border-indigo-500"
>

{/* HEADER ROW */}

<div className="flex items-center justify-between mb-3">

<div className="flex items-center gap-3">

{/* RANK */}

<div className={`
flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full
${i===0 ? "bg-yellow-500 text-black" :
i===1 ? "bg-gray-400 text-black" :
i===2 ? "bg-orange-500 text-black" :
"bg-gray-700 text-white"}
`}>
{i===0 ? "👑" : `#${i+1}`}
</div>

<div>

<p className="font-medium text-gray-200 capitalize">
{d.dept}
</p>

<p className="text-xs text-gray-400">
Department Performance
</p>

</div>

</div>

{/* VALUES */}

<div className="text-right">

<p className="text-sm text-gray-400">
Target: ₹{d.target.toLocaleString()}
</p>

<p className="text-sm font-semibold text-green-400">
Revenue: ₹{d.revenue.toLocaleString()}
</p>

</div>

</div>

{/* PROGRESS BAR */}

<div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">

<div
style={{width:`${percent}%`}}
className="h-full transition-all duration-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
/>

</div>

{/* FOOTER */}

<div className="flex justify-between mt-2 text-xs text-gray-400">

<span>Achievement</span>

<span className="font-semibold text-indigo-400">
{percent.toFixed(1)}%
</span>

</div>

</div>

)

})}

</div>

</div>

{/* ======================================
        CREATE TARGET (SaaS Form)
====================================== */}

<div className="p-8 mb-10 bg-gray-900 border border-gray-800 shadow-xl rounded-xl">

{/* HEADER */}

<div className="mb-6">

<h2 className="text-lg font-semibold text-gray-200">
Create Monthly Target
</h2>

<p className="mt-1 text-sm text-gray-400">
Set revenue targets for each department. These targets will be used for
performance analytics and forecasting.
</p>

</div>


<form
onSubmit={handleSubmit}
className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
>

{/* MONTH */}

<div className="flex flex-col gap-2">

<label className="text-sm text-gray-400">
Month
</label>

<select
value={form.month}
onChange={(e)=>setForm({...form,month:e.target.value})}
className="p-3 text-white transition bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
>

<option value="">Select Month</option>

<option value="1">January</option>
<option value="2">February</option>
<option value="3">March</option>
<option value="4">April</option>
<option value="5">May</option>
<option value="6">June</option>
<option value="7">July</option>
<option value="8">August</option>
<option value="9">September</option>
<option value="10">October</option>
<option value="11">November</option>
<option value="12">December</option>

</select>

</div>


{/* YEAR */}

<div className="flex flex-col gap-2">

<label className="text-sm text-gray-400">
Year
</label>

<input
type="number"
placeholder="2026"
value={form.year}
onChange={(e)=>setForm({...form,year:e.target.value})}
className="p-3 text-white transition bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
/>

</div>


{/* DEPARTMENT */}

<div className="flex flex-col gap-2">

<label className="text-sm text-gray-400">
Department
</label>

<select
value={form.department}
onChange={(e)=>setForm({...form,department:e.target.value})}
className="p-3 text-white transition bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
>

<option value="">Select Department</option>

<option value="sales">Sales</option>
<option value="marketing">Marketing</option>
<option value="operations">Operations</option>
<option value="hr">Hr</option>
<option value="finance">Finance</option>

</select>

</div>


{/* TARGET AMOUNT */}

<div className="flex flex-col gap-2">

<label className="text-sm text-gray-400">
Target Amount
</label>

<input
type="number"
placeholder="500000"
value={form.targetAmount}
onChange={(e)=>setForm({...form,targetAmount:e.target.value})}
className="p-3 text-white transition bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
/>

</div>


{/* BUTTON */}

<div className="flex items-end col-span-full">

<button
type="submit"
className="flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-500"
>

<Plus size={18}/>

Create Target

</button>

</div>

</form>

</div>


<div className="p-6 mt-10 bg-gray-900 border border-gray-800 shadow-xl rounded-xl">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-200">Targets Management</h2>
          <p className="text-sm text-gray-400">Manage monthly revenue targets across departments</p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 top-1/2 left-3" />
          <input
            type="text"
            placeholder="Search department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pl-10 pr-3 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border border-gray-800 rounded-lg">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900 border-b border-gray-800">
            <tr>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTargets.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-500">
                  No targets available
                </td>
              </tr>
            ) : (
              filteredTargets.map((t) => (
                <tr key={t._id} className="transition border-b border-gray-800 hover:bg-gray-800/40">
                  {/* DEPARTMENT */}
                  <td className="px-4 py-4">
                    {editingTargetId === t._id ? (
                      <input
                        name="department"
                        value={editForm.department}
                        onChange={handleEditChange}
                        className="w-full px-2 py-1 text-sm text-white bg-gray-800 border border-gray-700 rounded focus:outline-none"
                      />
                    ) : (
                      <span className="px-2 py-1 text-xs text-indigo-300 capitalize bg-indigo-900 rounded">
                        {t.department}
                      </span>
                    )}
                  </td>

                  {/* MONTH */}
                  <td className="px-4 py-4 text-gray-300">
                    {editingTargetId === t._id ? (
                      <input
                        type="number"
                        name="month"
                        value={editForm.month}
                        onChange={handleEditChange}
                        min="1"
                        max="12"
                        className="w-16 px-2 py-1 text-sm text-white bg-gray-800 border border-gray-700 rounded focus:outline-none"
                      />
                    ) : (
                      months[t.month - 1]
                    )}
                  </td>

                  {/* YEAR */}
                  <td className="px-4 py-4 text-gray-300">
                    {editingTargetId === t._id ? (
                      <input
                        type="number"
                        name="year"
                        value={editForm.year}
                        onChange={handleEditChange}
                        className="w-20 px-2 py-1 text-sm text-white bg-gray-800 border border-gray-700 rounded focus:outline-none"
                      />
                    ) : (
                      t.year
                    )}
                  </td>

                  {/* TARGET */}
                  <td className="px-4 py-4 font-semibold text-indigo-400">
                    {editingTargetId === t._id ? (
                      <input
                        type="number"
                        name="targetAmount"
                        value={editForm.targetAmount}
                        onChange={handleEditChange}
                        className="px-2 py-1 text-sm text-white bg-gray-800 border border-gray-700 rounded w-28 focus:outline-none"
                      />
                    ) : (
                      `₹${t.targetAmount.toLocaleString()}`
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-xs text-green-300 bg-green-900 rounded">
                      Active
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingTargetId === t._id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(t._id)}
                            className="px-3 py-1 text-xs text-green-300 transition bg-green-900 rounded hover:bg-green-800"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs text-gray-300 transition bg-gray-800 rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(t)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-yellow-300 transition bg-yellow-900 rounded hover:bg-yellow-800"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-red-300 transition bg-red-900 rounded hover:bg-red-800"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>



</div>

</>

);

}