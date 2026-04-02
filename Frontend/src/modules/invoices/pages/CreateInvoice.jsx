// src/modules/invoices/pages/CreateInvoice.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import { Plus, Trash, ArrowLeft } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import InvoicePDF from "./InvoicePDF";

export default function CreateInvoice({ onInvoiceCreated }) {
  const navigate = useNavigate();

  // ================= STATES =================
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientError, setClientError] = useState("");

  const [invoiceId, setInvoiceId] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [form, setForm] = useState({
    clientId: "",
    invoiceDate: "",
    agreementPO: { number: "", date: "" },
    serviceMode: "Digital Marketing  / IT Services",
    supplier: {
      name: "ReadyTechSolutions Pvt Ltd",
      gstin: "29IWQPS5331L1ZH",
      cin: "U12345KA2020PTC543210",
      pan: "AAACI1234Q",
      iec: "IEC1234567",
      email: "info@readytechsolutions.in",
      phone: "070107 97721"
    },
    items: [],
    remittance: {
      beneficiaryName: "ReadyTechSolutions Pvt Ltd",
      accountNumber: "334455667788",
      swiftCode: "ICICINBBXXX",
      ifscCode: "ICIC0001234",
      bankAddress: "ICICI Bank, Bangalore"
    },
    remark: ""
  });

  const [item, setItem] = useState({ description: "", hsn: "", value: 0, igstRate: 0 });

  // ================= FETCH CLIENTS =================
  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      setClientError("");
      const res = await API.get("/clients");
      const list = res?.data?.clients || res?.data?.data?.clients || res?.data?.data || [];
      setClients(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setClientError("Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ================= HANDLERS =================
  const handleChange = (section, key, value) => {
    setForm({ ...form, [section]: { ...form[section], [key]: value } });
  };

  // ================= ADD ITEM =================
  const addItem = () => {
    if (!item.description) return alert("Description required");
    const value = Number(item.value || 0);
    const igstRate = Number(item.igstRate || 0);
    if (isNaN(value) || isNaN(igstRate)) return alert("Invalid numbers");

    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...item, value, igstRate }]
    }));
    setItem({ description: "", hsn: "", value: 0, igstRate: 0 });
  };

  // ================= REMOVE ITEM =================
  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // ================= CALCULATE TOTAL =================
  const total = form.items.reduce((sum, i) => {
    const value = Number(i.value) || 0;
    const igstRate = Number(i.igstRate) || 0;
    const tax = (value * igstRate) / 100;
    return sum + value + tax;
  }, 0);

  // ================= CREATE INVOICE =================
  const createInvoice = async () => {
    try {
      if (!form.clientId) return alert("Select client");
      if (!form.invoiceDate) return alert("Invoice Date required");
      if (!form.agreementPO.number) return alert("PO Number required");
      if (!form.agreementPO.date) return alert("PO Date required");
      if (!form.items.length) return alert("Add at least 1 item");

      const sanitizedItems = form.items.map((i) => {
        const value = Number(i.value);
        const igstRate = Number(i.igstRate);
        const igstAmount = (value * igstRate) / 100;
        return { ...i, value, igstRate, igstAmount, total: value + igstAmount };
      });

      const totalAmount = sanitizedItems.reduce((sum, i) => sum + i.total, 0);

      const payload = {
        clientId: form.clientId,
        invoiceDate: new Date(form.invoiceDate).toISOString(),
        agreementPO: {
          number: form.agreementPO.number,
          date: new Date(form.agreementPO.date).toISOString()
        },
        serviceMode: form.serviceMode,
        supplier: form.supplier,
        items: sanitizedItems,
        totalAmount,
        remittance: form.remittance,
        remark: form.remark || ""
      };

      const res = await API.post("/invoices", payload);

      if (res.data.success) {
        const created = res.data.data;
        setInvoiceId(created._id);
        setInvoiceNumber(created.invoiceNumber);
        alert(`✅ Invoice Created: ${created.invoiceNumber}`);

        // Trigger parent refresh
        if (typeof onInvoiceCreated === "function") {
          onInvoiceCreated();
        }
      }
    } catch (err) {
      console.error("CREATE INVOICE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Error creating invoice");
    }
  };

  // ================= DOWNLOAD PDF =================
  const downloadPDF = async () => {
    if (!invoiceId) return alert("Invoice not ready yet!");
    const invoiceData = { ...form, invoiceNumber, createdAt: new Date() }; // can fetch from API if needed
    const blob = await pdf(<InvoicePDF invoice={invoiceData} />).toBlob();
    saveAs(blob, `invoice-${invoiceNumber || invoiceId}.pdf`);
  };

  // ================= UI =================
  return (
    <div className="max-w-5xl min-h-screen p-6 mx-auto text-gray-900 bg-gray-50">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 mb-4 bg-gray-200 rounded hover:bg-gray-300"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="mb-6 text-3xl font-bold">Create Invoice</h1>

      {/* CLIENT */}
      <div className="p-5 mb-6 bg-white rounded shadow">
        <h2 className="mb-3 font-semibold">Client</h2>
        {loadingClients ? (
          <p>Loading...</p>
        ) : clientError ? (
          <p className="text-red-500">{clientError}</p>
        ) : (
          <select
            className="w-full p-3 border rounded"
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.companyName || c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* BASIC INFO */}
      <div className="grid grid-cols-2 gap-4 p-5 mb-6 bg-white rounded shadow">
        <div>
          <label>Invoice Date</label>
          <input type="date" className="w-full p-2 border rounded" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} />
        </div>
        <div>
          <label>PO Number</label>
          <input className="w-full p-2 border rounded" value={form.agreementPO.number} onChange={(e) => handleChange("agreementPO", "number", e.target.value)} />
        </div>
        <div>
          <label>PO Date</label>
          <input type="date" className="w-full p-2 border rounded" value={form.agreementPO.date} onChange={(e) => handleChange("agreementPO", "date", e.target.value)} />
        </div>
      </div>

      {/* ITEMS */}
      <div className="p-5 mb-6 bg-white rounded shadow">
        <h2 className="mb-3 font-semibold">Items</h2>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <input placeholder="Description" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} className="p-2 border rounded" />
          <input placeholder="HSN" value={item.hsn} onChange={(e) => setItem({ ...item, hsn: e.target.value })} className="p-2 border rounded" />
          <input type="number" placeholder="Value" value={item.value} onChange={(e) => setItem({ ...item, value: e.target.value })} className="p-2 border rounded" />
          <input type="number" placeholder="IGST %" value={item.igstRate} onChange={(e) => setItem({ ...item, igstRate: e.target.value })} className="p-2 border rounded" />
        </div>
        <button onClick={addItem} className="flex gap-2 px-4 py-2 mb-3 text-white bg-blue-600 rounded hover:bg-blue-500">
          <Plus size={16} /> Add Item
        </button>

        {form.items.map((i, idx) => (
          <div key={idx} className="flex justify-between p-2 mt-2 bg-gray-100 rounded">
            <span>{i.description} | ₹{i.value} | {i.igstRate}%</span>
            <Trash onClick={() => removeItem(idx)} className="text-red-500 cursor-pointer" />
          </div>
        ))}
      </div>

      {/* REMITTANCE */}
      <div className="p-5 mb-6 bg-white rounded shadow">
        <h2 className="mb-3 font-semibold">Bank Details</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(form.remittance).map((key) => (
            <input key={key} placeholder={key} className="p-2 border rounded" value={form.remittance[key]} onChange={(e) => handleChange("remittance", key, e.target.value)} />
          ))}
        </div>
      </div>

      {/* REMARK */}
      <textarea placeholder="Remark" className="w-full p-3 mb-4 border rounded" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />

      {/* TOTAL */}
      <div className="mb-4 text-xl font-bold">Total: ₹ {total.toFixed(2)}</div>

      {/* ACTION BUTTONS */}
      <button onClick={createInvoice} className="w-full py-3 mb-2 text-white bg-green-600 rounded hover:bg-green-500">Create Invoice</button>
      {invoiceId && <button onClick={downloadPDF} className="w-full py-3 text-white bg-indigo-600 rounded hover:bg-indigo-500">Download PDF</button>}

    </div>
  );
}