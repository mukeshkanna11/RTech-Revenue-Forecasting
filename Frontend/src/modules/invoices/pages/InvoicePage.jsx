// src/modules/invoices/pages/Invoices.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, Edit, Trash, FileText, Home, Users, DollarSign, Target,
  BarChart3, Activity, LogOut, Menu, X, Download
} from "lucide-react";
import API from "../../../utils/axios";
import { useAuth } from "../../../context/AuthContext";
import jsPDF from "jspdf";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    client: "",
    billingAddress: { companyName: "", address: "", gstNumber: "", email: "", phone: "" },
    issueDate: "",
    dueDate: "",
    items: [],
    discount: 0,
    gst: { cgst: 0, sgst: 0, igst: 0 },
    paymentMethod: "upi",
    status: "draft",
    notes: "",
  });
  const [itemForm, setItemForm] = useState({ description: "", hsnCode: "", quantity: 1, price: 0, discount: 0, taxPercent: 0 });
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

  // ---------------- Fetch Clients & Invoices ----------------
  const fetchClients = async () => {
    try {
      const res = await API.get("/clients", { headers: { Authorization: `Bearer ${user?.token}` } });
      setClients(Array.isArray(res.data.data?.data) ? res.data.data.data : []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { logout(); navigate("/login"); }
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await API.get("/invoices", { headers: { Authorization: `Bearer ${user?.token}` } });
      setInvoices(Array.isArray(res.data.data?.data) ? res.data.data.data : []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) { logout(); navigate("/login"); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); fetchInvoices(); }, [user]);

  // ---------------- Form Handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("billingAddress.")) {
      const key = name.split(".")[1];
      setForm({ ...form, billingAddress: { ...form.billingAddress, [key]: value } });
    } else if (name.startsWith("gst.")) {
      const key = name.split(".")[1];
      setForm({ ...form, gst: { ...form.gst, [key]: Number(value) } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    const client = clients.find(c => c._id === clientId);
    if (client) {
      setForm({
        ...form,
        client: clientId,
        billingAddress: {
          companyName: client.companyName,
          address: client.address,
          gstNumber: "", // optional
          email: client.email,
          phone: client.phone
        }
      });
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm({ ...itemForm, [name]: ["quantity","price","discount","taxPercent"].includes(name) ? Number(value) : value });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, itemForm] });
    setItemForm({ description: "", hsnCode: "", quantity: 1, price: 0, discount: 0, taxPercent: 0 });
  };

  const removeItem = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.client || form.items.length === 0 || !form.issueDate || !form.dueDate) {
      setError("Client, Items, Issue Date, and Due Date are required");
      return;
    }

    try {
      if (editId) {
        const res = await API.put(`/invoices/${editId}`, form, { headers: { Authorization: `Bearer ${user?.token}` } });
        setInvoices(invoices.map(i => i._id === editId ? res.data.data : i));
        setSuccess("Invoice updated successfully!");
        setEditId(null);
      } else {
        const res = await API.post("/invoices", form, { headers: { Authorization: `Bearer ${user?.token}` } });
        setInvoices([res.data.data, ...invoices]);
        setSuccess("Invoice added successfully!");
      }
      setForm({
        client: "",
        billingAddress: { companyName: "", address: "", gstNumber: "", email: "", phone: "" },
        issueDate: "", dueDate: "", items: [], discount: 0, gst: { cgst: 0, sgst: 0, igst: 0 }, paymentMethod: "upi", status: "draft", notes: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save invoice");
    }
  };

  const handleEdit = (inv) => { setForm({ ...inv }); setEditId(inv._id); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await API.delete(`/invoices/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
      setInvoices(invoices.filter(i => i._id !== id));
      setSuccess("Invoice deleted successfully!");
    } catch (err) { console.error(err); setError(err.response?.data?.message || "Failed to delete invoice"); }
  };

  // ---------------- Generate PDF ----------------
  const generatePDF = (inv) => {
    const doc = new jsPDF({ unit: "pt", format: "A4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("READYTECH SOLUTIONS", 40, 40);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("123, Tech Street, Erode, Tamil Nadu", 40, 55);
    doc.text("Email: info@readytech.com | Phone: 9876543210", 40, 70);

    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 100, 40, { align: "right" });

    // Client
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Bill To:", pageWidth - 250, 60);
    doc.text(inv.billingAddress.companyName, pageWidth - 250, 75);
    doc.text(inv.billingAddress.address, pageWidth - 250, 90);
    doc.text(`GST: ${inv.billingAddress.gstNumber || "-"}`, pageWidth - 250, 105);
    doc.text(`Email: ${inv.billingAddress.email}`, pageWidth - 250, 120);
    doc.text(`Phone: ${inv.billingAddress.phone}`, pageWidth - 250, 135);

    // Invoice Info
    doc.text(`Invoice No: ${inv._id}`, 40, 100);
    doc.text(`Issue Date: ${inv.issueDate}`, 40, 115);
    doc.text(`Due Date: ${inv.dueDate}`, 40, 130);
    doc.text(`Payment Method: ${inv.paymentMethod.toUpperCase()}`, 40, 145);

    // Table headers
    let startY = 170; doc.setFont("helvetica", "bold"); doc.setFillColor(240,240,240); doc.rect(40, startY-15, pageWidth-80, 20, "F");
    const headers = ["Item","HSN","Qty","Price","Discount","Tax","Total"];
    const colX = [40,160,220,260,320,380,440]; headers.forEach((h,i)=>doc.text(h,colX[i],startY));

    // Table rows
    doc.setFont("helvetica","normal"); let y=startY+15;
    inv.items.forEach((item,index)=>{
      const amount = item.price*item.quantity - item.discount;
      const taxAmount = (amount*item.taxPercent)/100;
      const total = amount + taxAmount;
      const row = [item.description,item.hsnCode,item.quantity.toString(),`₹${item.price}`,`₹${item.discount}`,`₹${taxAmount.toFixed(2)}`,`₹${total.toFixed(2)}`];
      row.forEach((text,i)=>doc.text(text,colX[i],y));
      y+=20;
    });

    // Totals
    const totalAmount = inv.items.reduce((sum,item)=>sum+(item.price*item.quantity - item.discount)*(1+item.taxPercent/100),0);
    const cgstTotal = inv.items.reduce((sum,item)=>sum+((item.price*item.quantity - item.discount)*(item.taxPercent/2)/100),0);
    const sgstTotal = cgstTotal;
    doc.setFont("helvetica","bold");
    doc.text(`CGST: ₹${cgstTotal.toFixed(2)}`,400,y+10);
    doc.text(`SGST: ₹${sgstTotal.toFixed(2)}`,400,y+25);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`,400,y+50);

    if(inv.notes){
      doc.setFont("helvetica","normal"); doc.setFontSize(10);
      doc.text("Notes:",40,y+40);
      doc.text(inv.notes,40,y+55);
    }

    doc.save(`Invoice_${inv._id}.pdf`);
  };

  if(loading) return <div className="flex items-center justify-center h-screen"><p className="animate-pulse">Loading Invoices...</p></div>;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className={`bg-white shadow-lg fixed h-full transition-all duration-300 z-20 ${sidebarOpen?"w-64":"w-16"}`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <h2 className="text-lg font-bold text-indigo-600">ReadyTech CRM</h2>}
          <button onClick={()=>setSidebarOpen(!sidebarOpen)}><Menu size={20}/></button>
        </div>
        <nav className="flex flex-col gap-2 px-2 mt-6">
          {menuItems.map(item=>{
            const active = location.pathname===item.route;
            return (
              <button key={item.title} onClick={()=>navigate(item.route)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
                  ${active?"bg-indigo-100 text-indigo-600 font-semibold":"text-gray-600 hover:bg-gray-100"}
                  ${!sidebarOpen?"justify-center":""}`}>
                {item.icon}{sidebarOpen && item.title}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 text-xs text-center text-gray-400">{sidebarOpen && "Powered by ReadyTech Solutions"}</div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1" style={{marginLeft: sidebarOpen?"16rem":"4rem"}}>
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <h1 className="text-xl font-bold">{editId?"Edit Invoice":"Invoices"}</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Welcome, {user?.name}</span>
            <button onClick={()=>{logout(); navigate("/login");}} className="flex items-center gap-2 px-3 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"><LogOut size={16}/> Logout</button>
          </div>
        </header>

        <main className="p-6 space-y-6">

          {/* Invoice Form */}
          <section className="relative p-6 bg-white shadow rounded-2xl">
            {editId && <button onClick={()=>{setEditId(null); setForm({client:"",billingAddress:{companyName:"",address:"",gstNumber:"",email:"",phone:""},issueDate:"",dueDate:"",items:[],discount:0,gst:{cgst:0,sgst:0,igst:0},paymentMethod:"upi",status:"draft",notes:""});}} className="absolute p-2 bg-gray-200 rounded-full top-4 right-4 hover:bg-gray-300"><X size={16}/></button>}
            <h2 className="flex items-center gap-2 mb-4 text-xl font-bold"><Plus size={20}/> {editId?"Edit Invoice":"Add Invoice"}</h2>
            {error && <p className="mb-3 text-red-600">{error}</p>}
            {success && <p className="mb-3 text-green-600">{success}</p>}

            {/* Client Select */}
            <select onChange={handleClientSelect} value={form.client} className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-indigo-400">
              <option value="">Select Client</option>
              {clients.map(c=><option key={c._id} value={c._id}>{c.name} - {c.companyName}</option>)}
            </select>

            {/* Billing Address */}
            <div className="grid grid-cols-1 gap-3 mb-3 md:grid-cols-3">
              <input type="text" name="billingAddress.companyName" value={form.billingAddress.companyName} onChange={handleChange} placeholder="Company Name" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="text" name="billingAddress.address" value={form.billingAddress.address} onChange={handleChange} placeholder="Address" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="text" name="billingAddress.gstNumber" value={form.billingAddress.gstNumber} onChange={handleChange} placeholder="GST Number" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="text" name="billingAddress.email" value={form.billingAddress.email} onChange={handleChange} placeholder="Email" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="text" name="billingAddress.phone" value={form.billingAddress.phone} onChange={handleChange} placeholder="Phone" className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"/>
            </div>

            {/* Items */}
           {/* Items */}
<div className="mb-3">
  <h3 className="mb-2 font-semibold">Items</h3>
  <div className="grid grid-cols-1 gap-3 mb-2 md:grid-cols-6">
    <input type="text" name="description" value={itemForm.description} onChange={handleItemChange} placeholder="Description" className="p-2 border rounded-lg"/>
    <input type="text" name="hsnCode" value={itemForm.hsnCode} onChange={handleItemChange} placeholder="HSN Code" className="p-2 border rounded-lg"/>
    <input type="number" name="quantity" value={itemForm.quantity} onChange={handleItemChange} placeholder="Qty" className="p-2 border rounded-lg"/>
    <input type="number" name="price" value={itemForm.price} onChange={handleItemChange} placeholder="Price" className="p-2 border rounded-lg"/>
    <input type="number" name="discount" value={itemForm.discount} onChange={handleItemChange} placeholder="Discount" className="p-2 border rounded-lg"/>
    <input type="number" name="taxPercent" value={itemForm.taxPercent} onChange={handleItemChange} placeholder="Tax %" className="p-2 border rounded-lg"/>
  </div>
  <button type="button" onClick={addItem} className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add Item</button>
  <ul className="mt-2">
    {form.items.map((item,i)=>(
      <li key={i} className="flex justify-between p-1 border-b">
        {item.description} - Qty: {item.quantity} - ₹{item.price} 
        <button type="button" onClick={()=>removeItem(i)} className="ml-2 text-red-600">Remove</button>
      </li>
    ))}
  </ul>

  {/* --- Live Totals --- */}
  {form.items.length > 0 && (
    <div className="w-full p-4 mt-4 border rounded-lg bg-gray-50 md:w-1/2">
      {(() => {
        const subtotal = form.items.reduce((sum,item)=>sum + item.price*item.quantity,0);
        const totalDiscount = form.items.reduce((sum,item)=>sum + item.discount,0);
        const cgst = form.items.reduce((sum,item)=>sum + ((item.price*item.quantity - item.discount)*(item.taxPercent/2)/100),0);
        const sgst = cgst;
        const grandTotal = subtotal - totalDiscount + cgst + sgst;
        return (
          <>
            <div className="flex justify-between py-1"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between py-1"><span>Total Discount:</span><span>₹{totalDiscount.toFixed(2)}</span></div>
            <div className="flex justify-between py-1"><span>CGST:</span><span>₹{cgst.toFixed(2)}</span></div>
            <div className="flex justify-between py-1"><span>SGST:</span><span>₹{sgst.toFixed(2)}</span></div>
            <hr className="my-1"/>
            <div className="flex justify-between py-1 font-bold"><span>Grand Total:</span><span>₹{grandTotal.toFixed(2)}</span></div>
          </>
        );
      })()}
    </div>
  )}
</div>

            <button onClick={handleSubmit} className="px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">{editId?"Update Invoice":"Create Invoice"}</button>
          </section>

          {/* Invoice Table */}
          <section className="p-6 overflow-x-auto bg-white shadow rounded-2xl">
            <h2 className="flex items-center gap-2 mb-4 text-xl font-bold"><FileText size={20}/> Invoice List</h2>
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-gray-600">Client</th>
                  <th className="p-3 text-left text-gray-600">Issue Date</th>
                  <th className="p-3 text-left text-gray-600">Due Date</th>
                  <th className="p-3 text-left text-gray-600">Status</th>
                  <th className="p-3 text-left text-gray-600">Amount</th>
                  <th className="p-3 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length===0 ? (
                  <tr><td colSpan={6} className="p-3 text-center text-gray-500">No invoices found</td></tr>
                ) : invoices.map(inv=>(
                  <tr key={inv._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{inv.billingAddress.companyName}</td>
                    <td className="p-3">{inv.issueDate}</td>
                    <td className="p-3">{inv.dueDate}</td>
                    <td className={`p-3 font-semibold ${inv.status==="draft"?"text-yellow-600":inv.status==="paid"?"text-green-600":"text-gray-600"}`}>{inv.status}</td>
                    <td className="p-3 font-semibold">₹{inv.items.reduce((sum,i)=>sum+(i.price*i.quantity-i.discount)*(1+i.taxPercent/100),0)}</td>
                    <td className="flex gap-2 p-3">
                      <button onClick={()=>handleEdit(inv)} className="p-2 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16}/></button>
                      <button onClick={()=>handleDelete(inv._id)} className="p-2 text-red-600 rounded-lg hover:bg-red-100"><Trash size={16}/></button>
                      <button onClick={()=>generatePDF(inv)} className="p-2 text-green-600 rounded-lg hover:bg-green-100"><Download size={16}/></button>
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