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

  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");

  const [form,setForm] = useState({
    department:"",
    month:"",
    year:"",
    amount:""
  });

  const departments = [
    "sales",
    "marketing",
    "finance",
    "operations",
    "hr"
  ];

  /* ================= FETCH ================= */

  const fetchRevenues = async () => {

    try {

      setLoading(true);

      const res = await API.get("/revenues");

      const list =
        res?.data?.data?.data ||
        res?.data?.data ||
        [];

      setRevenues(list);

    } catch (err) {

      console.error(err);
      setError("Failed to load revenues");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchRevenues();
  }, []);

  /* ================= SEARCH ================= */

  const filtered = useMemo(() => {

    if (!search) return revenues;

    const s = search.toLowerCase();

    return revenues.filter(r =>
      r.department?.toLowerCase().includes(s) ||
      r.year?.toString().includes(s)
    );

  }, [search,revenues]);

  /* ================= FORM ================= */

  const handleChange = e =>
    setForm({ ...form,[e.target.name]:e.target.value });

  const resetForm = () => {

    setEditId(null);

    setForm({
      department:"",
      month:"",
      year:"",
      amount:""
    });

  };

  /* ================= VALIDATION ================= */

  const validateForm = () => {

    if(!form.department || !form.month || !form.year || !form.amount){
      setError("All fields are required");
      return false;
    }

    if(form.month < 1 || form.month > 12){
      setError("Month must be between 1-12");
      return false;
    }

    return true;

  };

  /* ================= CREATE / UPDATE ================= */

  const handleSubmit = async e => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if(!validateForm()) return;

    try {

      setSaving(true);

      const payload = {
        department: form.department,
        month: Number(form.month),
        year: Number(form.year),
        amount: Number(form.amount)
      };

      if(editId){

        const res = await API.put(`/revenues/${editId}`,payload);

        setRevenues(prev =>
          prev.map(r => r._id === editId ? res.data.data : r)
        );

        setSuccess("Revenue updated successfully");

      } else {

        const res = await API.post("/revenues",payload);

        setRevenues(prev => [res.data.data,...prev]);

        setSuccess("Revenue added successfully");

      }

      resetForm();

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        "Operation failed"
      );

    } finally {

      setSaving(false);

    }

  };

  /* ================= DELETE ================= */

  const handleDelete = async id => {

    if(!window.confirm("Delete this revenue record?")) return;

    try{

      await API.delete(`/revenues/${id}`);

      setRevenues(prev =>
        prev.filter(r => r._id !== id)
      );

      setSuccess("Revenue deleted");

    }catch{

      setError("Delete failed");

    }

  };

  /* ================= EDIT ================= */

  const handleEdit = r => {

    setEditId(r._id);

    setForm({
      department:r.department,
      month:r.month,
      year:r.year,
      amount:r.amount
    });

    window.scrollTo({top:0,behavior:"smooth"});

  };

  /* ================= ANALYTICS ================= */

  const totalRevenue = useMemo(() =>
    revenues.reduce((acc,r)=> acc + r.amount,0)
  ,[revenues]);

  const departmentCount = useMemo(() =>
    new Set(revenues.map(r=>r.department)).size
  ,[revenues]);

  const formatCurrency = amount =>
    new Intl.NumberFormat("en-IN",{
      style:"currency",
      currency:"INR"
    }).format(amount || 0);

  /* ================= LOADING ================= */

  if(loading){
    return(
      <div className="flex items-center justify-center h-screen text-white bg-gray-950">
        Loading Revenue Data...
      </div>
    );
  }

  return (

    <div className="min-h-screen text-white bg-gray-950">

      <Navbar/>

      <div className="w-full px-6 py-10 space-y-8">

        {/* HEADER */}

        <div>

          <h1 className="text-3xl font-bold">
            Revenue Analytics
          </h1>

          <p className="text-gray-400">
            Track financial performance across departments
          </p>

        </div>

        {/* ALERTS */}

        {error && (
          <div className="p-3 text-red-400 border border-red-700 rounded-lg bg-red-900/20">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-green-400 border border-green-700 rounded-lg bg-green-900/20">
            {success}
          </div>
        )}

        {/* ANALYTICS */}

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">

          <StatCard
            icon={<DollarSign/>}
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
          />

          <StatCard
            icon={<Building2/>}
            title="Departments"
            value={departmentCount}
          />

          <StatCard
            icon={<TrendingUp/>}
            title="Records"
            value={revenues.length}
          />

        </div>

        {/* FORM */}

        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">

          <h2 className="mb-5 text-lg font-semibold">

            {editId ? "Edit Revenue" : "Add Revenue"}

          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-5"
          >

            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg"
            >

              <option value="">Select Department</option>

              {departments.map(dep=>(
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}

            </select>

            <Input name="month" type="number" value={form.month} onChange={handleChange} placeholder="Month"/>
            <Input name="year" type="number" value={form.year} onChange={handleChange} placeholder="Year"/>
            <Input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount"/>

            <button
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-3 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50"
            >

              <Plus size={16}/>

              {saving ? "Saving..." : editId ? "Update" : "Add"}

            </button>

          </form>

        </div>

        {/* SEARCH */}

        <div className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl">

          <Search size={18}/>

          <input
            placeholder="Search department or year..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />

        </div>

        {/* TABLE */}

        <div className="bg-gray-900 border border-gray-800 rounded-xl">

          <div className="overflow-x-auto">

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

                {filtered.length === 0 ? (

                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400">
                      No revenue records found
                    </td>
                  </tr>

                ) : (

                  filtered.map(r => (

                    <tr
                      key={r._id}
                      className="border-b border-gray-800 hover:bg-gray-800"
                    >

                      <td className="p-4 capitalize">{r.department}</td>

                      <td className="p-4 text-center">{r.month}</td>

                      <td className="p-4 text-center">{r.year}</td>

                      <td className="p-4 text-center text-green-400">
                        {formatCurrency(r.amount)}
                      </td>

                      <td className="flex justify-center gap-4 p-4">

                        <button
                          onClick={()=>handleEdit(r)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit size={16}/>
                        </button>

                        <button
                          onClick={()=>handleDelete(r._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16}/>
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

/* ================= COMPONENTS ================= */

function StatCard({icon,title,value}){

  return(

    <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">

      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        {title}
      </div>

      <h2 className="mt-2 text-2xl font-bold">
        {value}
      </h2>

    </div>

  );

}

function Input(props){

  return(

    <input
      {...props}
      className="p-3 bg-gray-800 border border-gray-700 rounded-lg"
    />

  );

}