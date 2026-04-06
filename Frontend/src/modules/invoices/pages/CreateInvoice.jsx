// src/modules/invoices/pages/CreateInvoice.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import { Plus, Trash, ArrowLeft, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import InvoicePDF from "./InvoicePDF";

export default function CreateInvoice({ onInvoiceCreated }) {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [form, setForm] = useState({
    clientId: "",
    invoiceDate: "",
    agreementPO: { number: "", date: "" },
    serviceMode: "Consulting / IT Services",

    supplier: {
      name: "ReadyTechSolutions Pvt Ltd",
      gstin: "29IWQPS5331L1ZH",
      cin: "U12345KA2020PTC543210",
      pan: "AAACI1234Q",
      iec: "IEC1234567",
      iecDate: "2023-03-15",
      email: "info@readytechsolutions.in",
      phone: "07010797721"
    },

    customer: {
      name: "",
      address: "",
      email: "",
      phone: ""
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

  const [item, setItem] = useState({ description: "", hsn: "", value: "", igstRate: "" });

  // ================= FETCH CLIENTS =================
  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      const res = await API.get("/clients");
      setClients(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ================= HANDLERS =================
  const updateField = (section, key, value) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  // ================= ADD ITEM =================
  const addItem = () => {
    if (!item.description || !item.value) return alert("Fill item details");

    const value = Number(item.value);
    const igstRate = Number(item.igstRate || 0);
    const igstAmount = (value * igstRate) / 100;

    const newItem = { ...item, value, igstRate, igstAmount, total: value + igstAmount };

    setForm((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setItem({ description: "", hsn: "", value: "", igstRate: "" });
  };

  // ================= REMOVE ITEM =================
  const removeItem = (index) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // ================= TOTAL =================
  const totalAmount = form.items.reduce((sum, i) => sum + i.total, 0);

  // ================= CREATE INVOICE =================
  const createInvoice = async () => {
    try {
      if (!form.invoiceDate) return alert("Invoice date required");
      if (!form.agreementPO.number) return alert("PO number required");
      if (!form.items.length) return alert("Add items");

      const payload = {
        invoiceDate: new Date(form.invoiceDate).toISOString(),
        agreementPO: {
          number: form.agreementPO.number,
          date: form.agreementPO.date ? new Date(form.agreementPO.date).toISOString() : null
        },
        serviceMode: form.serviceMode,
        supplier: form.supplier,
        customer: form.customer,
        items: form.items,
        totalAmount,
        remittance: form.remittance,
        remark: form.remark
      };

      const res = await API.post("/invoices", payload);

      if (res.data.success) {
        const data = res.data.data;

        setInvoiceId(data._id);
        setInvoiceNumber(data.invoiceNumber);

        // ✅ Always attach frontend customer and remittance
        setCreatedInvoice({ ...data, customer: form.customer, remittance: form.remittance });

        alert(`✅ Invoice Created: ${data.invoiceNumber}`);
        onInvoiceCreated?.();
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error creating invoice");
    }
  };

  // ================= PDF =================
  const downloadPDF = async () => {
    if (!createdInvoice) return alert("Create invoice first");

    const blob = await pdf(<InvoicePDF invoice={createdInvoice} />).toBlob();
    saveAs(blob, `invoice-${createdInvoice.invoiceNumber}.pdf`);
  };

  // ================= UI =================
  return (
    <div className="min-h-screen p-6 text-white bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-300 hover:text-white"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="mb-6 text-3xl font-bold">Create Invoice</h1>

        {/* BASIC */}
        <div className="grid grid-cols-3 gap-4 p-5 mb-6 bg-gray-800 shadow rounded-xl">
          <input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} className="input" />
          <input placeholder="PO Number" value={form.agreementPO.number} onChange={(e) => updateField("agreementPO", "number", e.target.value)} className="input" />
          <input type="date" value={form.agreementPO.date} onChange={(e) => updateField("agreementPO", "date", e.target.value)} className="input" />
        </div>

        {/* CUSTOMER */}
        <div className="p-5 mb-6 bg-gray-800 shadow rounded-xl">
          <h2 className="mb-3 font-semibold">Customer Details</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(form.customer).map((key) => (
              <input key={key} placeholder={key} value={form.customer[key]} onChange={(e) => updateField("customer", key, e.target.value)} className="input" />
            ))}
          </div>
        </div>

        {/* ITEMS */}
        <div className="p-5 mb-6 bg-gray-800 shadow rounded-xl">
          <h2 className="mb-3 font-semibold">Items</h2>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <input placeholder="Description" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} className="input" />
            <input placeholder="HSN" value={item.hsn} onChange={(e) => setItem({ ...item, hsn: e.target.value })} className="input" />
            <input type="number" placeholder="Value" value={item.value} onChange={(e) => setItem({ ...item, value: e.target.value })} className="input" />
            <input type="number" placeholder="IGST %" value={item.igstRate} onChange={(e) => setItem({ ...item, igstRate: e.target.value })} className="input" />
          </div>
          <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 mb-3 bg-blue-600 rounded"><Plus size={16} /> Add Item</button>

          {form.items.map((i, idx) => (
            <div key={idx} className="flex justify-between p-2 mt-2 bg-gray-700 rounded">
              <span>{i.description} | ₹{i.total}</span>
              <Trash onClick={() => removeItem(idx)} className="text-red-400 cursor-pointer" />
            </div>
          ))}
        </div>

        {/* BANK/REMITTANCE */}
        <div className="p-5 mb-6 bg-gray-800 shadow rounded-xl">
          <h2 className="mb-3 font-semibold">Bank / Remittance Details</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(form.remittance).map((key) => (
              <input key={key} value={form.remittance[key]} onChange={(e) => updateField("remittance", key, e.target.value)} className="input" />
            ))}
          </div>
        </div>

        {/* REMARK */}
        <textarea placeholder="Remark" value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="w-full p-3 mb-4 bg-gray-800 border border-gray-600 rounded" />

        {/* TOTAL */}
        <h2 className="mb-4 text-xl font-bold">Total: ₹ {totalAmount.toFixed(2)}</h2>

        {/* ACTIONS */}
        <button onClick={createInvoice} className="w-full py-3 mb-2 bg-green-600 rounded">Create Invoice</button>
        {invoiceId && <button onClick={downloadPDF} className="flex justify-center w-full gap-2 py-3 bg-indigo-600 rounded"><Download size={16} /> Download PDF</button>}
      </div>

      <style>{`
        .input {
          background: #1f2937;
          border: 1px solid #4b5563;
          padding: 10px;
          border-radius: 6px;
          color: white;
        }
      `}</style>
    </div>
  );
}