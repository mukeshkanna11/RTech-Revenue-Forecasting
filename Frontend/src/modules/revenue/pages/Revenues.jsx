import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  Building2
} from "lucide-react";
import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";

export default function Revenues() {

  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    department: "",
    month: "",
    year: "",
    amount: ""
  });

  const departments = ["sales","marketing","finance","operations","hr"];

  /* ================= FETCH ================= */
  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const res = await API.get("/revenues");
      const list = res?.data?.data?.data || res?.data?.data || [];
      setRevenues(list);
    } catch (err) {
      console.error(err);
      setError({ general: "Failed to load revenues" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRevenues(); }, []);

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    if (!search) return revenues;
    const s = search.toLowerCase();
    return revenues.filter(r =>
      r.department?.toLowerCase().includes(s) ||
      r.year?.toString().includes(s)
    );
  }, [search, revenues]);

  /* ================= FORM HANDLERS ================= */
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: "" }); // clear field error
    setSuccess("");
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ department:"", month:"", year:"", amount:"" });
    setError({});
  };

  /* ================= FIELD VALIDATION ================= */
  const validateForm = () => {
    const err = {};
    if(!form.department) err.department = "Department is required";
    if(!form.month) err.month = "Month is required";
    else if(form.month < 1 || form.month > 12) err.month = "Month must be 1-12";
    if(!form.year) err.year = "Year is required";
    if(!form.amount) err.amount = "Amount is required";
    setError(err);
    return Object.keys(err).length === 0;
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        department: form.department.trim().toLowerCase(),
        month: parseInt(form.month, 10),
        year: parseInt(form.year, 10),
        amount: parseFloat(form.amount)
      };

      let res;
      if(editId){
        res = await API.put(`/revenues/${editId}`, payload);
        setRevenues(prev => prev.map(r => r._id === editId ? res.data.data : r));
        setSuccess("Revenue updated successfully");
      } else {
        res = await API.post("/revenues", payload);
        setRevenues(prev => {
          const exists = prev.find(r => r._id === res.data.data._id);
          return exists ? prev.map(r => r._id === res.data.data._id ? res.data.data : r) : [res.data.data, ...prev];
        });
        setSuccess("Revenue created successfully");
      }

      resetForm();
    } catch(err){
      console.error(err.response?.data || err.message);
      const msg = err?.response?.data?.message || "Operation failed";
      // map duplicate errors to field if possible
      if(msg.includes("Duplicate")) setError({ department: "Revenue for this department/month/year already exists" });
      else setError({ general: msg });
    } finally { setSaving(false); }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this revenue record?")) return;
    try {
      await API.delete(`/revenues/${id}`);
      setRevenues(prev => prev.filter(r => r._id !== id));
      setSuccess("Revenue deleted");
    } catch {
      setError({ general: "Delete failed" });
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (r) => {
    setEditId(r._id);
    setForm({ department: r.department, month: r.month, year: r.year, amount: r.amount });
    setError({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= ANALYTICS ================= */
  const totalRevenue = useMemo(()=>revenues.reduce((acc,r)=>acc+r.amount,0),[revenues]);
  const departmentCount = useMemo(()=>new Set(revenues.map(r=>r.department)).size,[revenues]);
  const formatCurrency = amount => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(amount||0);

  if(loading) return <div className="flex items-center justify-center h-screen text-white bg-gray-950">Loading Revenue Data...</div>;

  return(
    <div className="min-h-screen text-white bg-gray-950">
      <Navbar/>
      <div className="w-full px-6 py-10 space-y-8">

       

{/* HEADER */}
<div className="flex flex-col gap-6">

  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

    {/* Left Section */}
    <div className="flex items-start gap-4">
      
      {/* Icon Badge */}
      <div className="flex items-center justify-center w-12 h-12 border shadow-lg rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 border-white/10">
        <DollarSign className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Revenue Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Monitor, analyze, and optimize financial performance across departments
        </p>
      </div>

    </div>

    {/* Right Section */}
    <div className="flex items-center gap-3">

      {/* Live Status */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-2 border rounded-xl bg-white/5 border-white/10 backdrop-blur-md">
        <span className="relative flex w-2 h-2">
          <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
          <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
        </span>
        <span className="text-xs text-gray-300">Live</span>
      </div>

      {/* CTA */}
      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 border shadow-md rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 hover:shadow-lg border-white/10">
        <Plus className="w-4 h-4" />
        Add Revenue
      </button>

    </div>

  </div>

  {/* ALERTS */}
  {error.general && <Alert type="error" message={error.general}/>}
  {success && <Alert type="success" message={success}/>}

  {/* ANALYTICS CARDS */}
  <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">

    {/* Total Revenue */}
    <div className="relative p-5 overflow-hidden transition-all duration-300 border group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 border rounded-lg bg-indigo-500/10 border-indigo-500/20">
          <DollarSign className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="text-xs text-green-400">+12.5%</span>
      </div>
      <h3 className="text-sm text-gray-400">Total Revenue</h3>
      <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(totalRevenue)}</p>
    </div>

    {/* Departments */}
    <div className="relative p-5 overflow-hidden transition-all duration-300 border group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 border rounded-lg bg-purple-500/10 border-purple-500/20">
          <Building2 className="w-5 h-5 text-purple-400" />
        </div>
        <span className="text-xs text-gray-400">Active</span>
      </div>
      <h3 className="text-sm text-gray-400">Departments</h3>
      <p className="mt-1 text-2xl font-semibold text-white">{departmentCount}</p>
    </div>

    {/* Records */}
    <div className="relative p-5 overflow-hidden transition-all duration-300 border group rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 border rounded-lg bg-green-500/10 border-green-500/20">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <span className="text-xs text-green-400">Growing</span>
      </div>
      <h3 className="text-sm text-gray-400">Records</h3>
      <p className="mt-1 text-2xl font-semibold text-white">{revenues.length}</p>
    </div>

  </div>

</div>

        {/* FORM */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
          <h2 className="mb-5 text-lg font-semibold">{editId ? "Edit Revenue" : "Add Revenue"}</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5">

            <SelectInput name="department" value={form.department} onChange={handleChange} options={departments} error={error.department}/>
            <Input name="month" type="number" value={form.month} onChange={handleChange} placeholder="Month" error={error.month}/>
            <Input name="year" type="number" value={form.year} onChange={handleChange} placeholder="Year" error={error.year}/>
            <Input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount" error={error.amount}/>

            <button disabled={saving} className="flex items-center justify-center gap-2 px-4 py-3 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50">
              <Plus size={16}/> {saving ? "Saving..." : editId ? "Update" : "Add"}
            </button>
          </form>
        </div>

        {/* SEARCH */}
        <div className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl">
          <Search size={18}/>
          <input placeholder="Search department or year..." value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 bg-transparent outline-none"/>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-center">Month</th>
                <th className="p-4 text-center">Year</th>
                <th className="p-4 text-center">Revenue</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">No revenue records found</td></tr>
              ) : filtered.map(r=>(
                <tr key={r._id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-4 capitalize">{r.department}</td>
                  <td className="p-4 text-center">{r.month}</td>
                  <td className="p-4 text-center">{r.year}</td>
                  <td className="p-4 text-center text-green-400">{formatCurrency(r.amount)}</td>
                  <td className="flex justify-center gap-4 p-4">
                    <button onClick={()=>handleEdit(r)} className="text-blue-400 hover:text-blue-300"><Edit size={16}/></button>
                    <button onClick={()=>handleDelete(r._id)} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */
function StatCard({icon,title,value}){
  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex items-center gap-2 text-gray-400">{icon}{title}</div>
      <h2 className="mt-2 text-2xl font-bold">{value}</h2>
    </div>
  );
}

function Input({error,...props}){
  return (
    <div className="flex flex-col">
      <input {...props} className="p-3 bg-gray-800 border border-gray-700 rounded-lg"/>
      {error && <span className="mt-1 text-xs text-red-400">{error}</span>}
    </div>
  );
}

function SelectInput({name,value,onChange,options,error}){
  return (
    <div className="flex flex-col">
      <select name={name} value={value} onChange={onChange} className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
        <option value="">Select {name}</option>
        {options.map(opt=> <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {error && <span className="mt-1 text-xs text-red-400">{error}</span>}
    </div>
  );
}

function Alert({type,message}){
  const colors = { error:"text-red-400 border-red-700 bg-red-900/20", success:"text-green-400 border-green-700 bg-green-900/20" };
  return <div className={`p-3 border rounded-lg ${colors[type]}`}>{message}</div>;
}