import { useState, useEffect, useCallback } from "react";
import API from "../../../utils/axios";
import { Plus, Trash } from "lucide-react";

export default function CreateInvoice() {
  /* ================= STATES ================= */
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientError, setClientError] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);

  const [form, setForm] = useState({
    clientId: "",
    invoiceDate: "",
    agreementPO: { number: "", date: "" },
    serviceMode: "Online / ITES",
    supplier: {
      name: "NextGen Business Consulting LLP",
      gstin: "27AACFN5678L1Z9",
      cin: "AAL-1234",
      pan: "AACFN5678L",
      iec: "IEC9988776",
      iecDate: "2022-11-20",
      email: "accounts@nextgenconsulting.com",
      phone: "9012345678"
    },
    items: [],
    remittance: {
      beneficiaryName: "",
      accountNumber: "",
      swiftCode: "",
      ifscCode: "",
      bankAddress: ""
    },
    remark: ""
  });

  const [item, setItem] = useState({ description: "", hsn: "", value: "", igstRate: "" });

  /* ================= FETCH CLIENTS ================= */
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

  /* ================= HANDLERS ================= */
  const handleChange = (section, key, value) => {
    setForm({ ...form, [section]: { ...form[section], [key]: value } });
  };

  /* ================= ADD ITEM ================= */
  const addItem = () => {
    if (!item.description) return alert("Description required");
    const value = Number(item.value || 0);
    const igstRate = Number(item.igstRate || 0);
    if (isNaN(value) || isNaN(igstRate)) return alert("Invalid numbers");

    setForm({
      ...form,
      items: [...form.items, { description: item.description, hsn: item.hsn || "", value, igstRate }]
    });

    setItem({ description: "", hsn: "", value: "", igstRate: "" });
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = (i) => {
    const arr = [...form.items];
    arr.splice(i, 1);
    setForm({ ...form, items: arr });
  };

  /* ================= TOTAL ================= */
  const total = form.items.reduce((sum, i) => {
    const value = Number(i.value) || 0;
    const rate = Number(i.igstRate) || 0;
    const tax = (value * rate) / 100;
    return sum + value + tax;
  }, 0);

  /* ================= CREATE INVOICE ================= */
 const createInvoice = async () => {
  try {
    if (!form.clientId) return alert("Select client");
    if (!form.invoiceDate) return alert("Invoice Date required");
    if (!form.agreementPO.number) return alert("PO Number required");
    if (!form.agreementPO.date) return alert("PO Date required");
    if (!form.items.length) return alert("Add at least 1 item");

    // SANITIZE ITEMS
    const sanitizedItems = form.items.map((i, idx) => {
      const value = Number(i.value);
      const igstRate = Number(i.igstRate);

      if (!isFinite(value) || !isFinite(igstRate)) {
        throw new Error(
          `Item #${idx + 1} has invalid numbers: value=${i.value}, igstRate=${i.igstRate}`
        );
      }

      const igstAmount = (value * igstRate) / 100;
      const total = value + igstAmount;

      return {
        description: i.description,
        hsn: i.hsn || "",
        value,
        igstRate,
        igstAmount,
        total
      };
    });

    // CALCULATE TOTAL AMOUNT
    const totalAmount = sanitizedItems.reduce((sum, i) => sum + i.total, 0);
    if (!isFinite(totalAmount)) throw new Error("Total amount is invalid");

    // PREPARE PAYLOAD
    const payload = {
      clientId: form.clientId,
      invoiceDate: new Date(form.invoiceDate).toISOString(),
      agreementPO: {
        number: form.agreementPO.number,
        date: new Date(form.agreementPO.date).toISOString()
      },
      serviceMode: form.serviceMode,
      supplier: {
        name: form.supplier.name || "NextGen Business Consulting LLP",
        gstin: form.supplier.gstin || "",
        cin: form.supplier.cin || "",
        pan: form.supplier.pan || "",
        iec: form.supplier.iec || "",
        iecDate: form.supplier.iecDate
          ? new Date(form.supplier.iecDate).toISOString()
          : new Date().toISOString(),
        email: form.supplier.email || "",
        phone: form.supplier.phone || ""
      },
      items: sanitizedItems,
      totalAmount,
      remittance: {
        beneficiaryName: form.remittance.beneficiaryName || "",
        accountNumber: form.remittance.accountNumber || "",
        swiftCode: form.remittance.swiftCode || "",
        ifscCode: form.remittance.ifscCode || "",
        bankAddress: form.remittance.bankAddress || ""
      },
      remark: form.remark || ""
    };

    console.log("FINAL PAYLOAD", payload);

    const res = await API.post("/invoices", payload);
    if (res.data.success) {
      setInvoiceId(res.data.data._id);
      alert(`✅ Invoice Created: ${res.data.data.invoiceNumber}`);
    }
  } catch (err) {
    console.error("CREATE INVOICE ERROR:", err.message || err.response?.data);
    alert(err.response?.data?.message || err.message || "Error creating invoice");
  }
};


  /* ================= DOWNLOAD ================= */
  const downloadPDF = () => {
    if (!invoiceId) return;
    window.open(`http://localhost:5000/api/v1/invoices/${invoiceId}/pdf`);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen p-6 text-white bg-gray-950">
      <h1 className="mb-6 text-3xl font-bold">Create Invoice</h1>

      {/* CLIENT */}
      <div className="p-5 mb-6 bg-gray-900 rounded-xl">
        <h2 className="mb-3 font-semibold">Client</h2>
        {loadingClients ? <p>Loading...</p> :
          clientError ? <p className="text-red-400">{clientError}</p> :
            <select
              className="w-full p-3 bg-gray-800 rounded"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName || c.name}
                </option>
              ))}
            </select>}
      </div>

      {/* BASIC */}
      <div className="grid grid-cols-2 gap-4 p-5 mb-6 bg-gray-900 rounded-xl">
        <div>
          <label>Invoice Date</label>
          <input type="date" className="w-full p-2 bg-gray-800 rounded" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} />
        </div>
        <div>
          <label>PO Number</label>
          <input className="w-full p-2 bg-gray-800 rounded" onChange={(e) => handleChange("agreementPO", "number", e.target.value)} />
        </div>
        <div>
          <label>PO Date</label>
          <input type="date" className="w-full p-2 bg-gray-800 rounded" onChange={(e) => handleChange("agreementPO", "date", e.target.value)} />
        </div>
      </div>

      {/* ITEMS */}
      <div className="p-5 mb-6 bg-gray-900 rounded-xl">
        <h2 className="mb-3 font-semibold">Items</h2>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <input placeholder="Description" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} className="p-2 bg-gray-800 rounded" />
          <input placeholder="HSN" value={item.hsn} onChange={(e) => setItem({ ...item, hsn: e.target.value })} className="p-2 bg-gray-800 rounded" />
          <input type="number" placeholder="Value" value={item.value} onChange={(e) => setItem({ ...item, value: e.target.value })} className="p-2 bg-gray-800 rounded" />
          <input type="number" placeholder="IGST %" value={item.igstRate} onChange={(e) => setItem({ ...item, igstRate: e.target.value })} className="p-2 bg-gray-800 rounded" />
        </div>
        <button onClick={addItem} className="flex gap-2 px-4 py-2 bg-indigo-600 rounded"><Plus size={16} /> Add Item</button>

        {form.items.map((i, idx) => (
          <div key={idx} className="flex justify-between p-2 mt-2 bg-gray-800 rounded">
            <span>{i.description} | ₹{i.value} | {i.igstRate}%</span>
            <Trash onClick={() => removeItem(idx)} className="text-red-400 cursor-pointer" />
          </div>
        ))}
      </div>

      {/* REMITTANCE */}
      <div className="p-5 mb-6 bg-gray-900 rounded-xl">
        <h2 className="mb-3 font-semibold">Bank Details</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(form.remittance).map((key) => (
            <input key={key} placeholder={key} className="p-2 bg-gray-800 rounded" onChange={(e) => handleChange("remittance", key, e.target.value)} />
          ))}
        </div>
      </div>

      {/* REMARK */}
      <textarea placeholder="Remark" className="w-full p-3 mb-4 bg-gray-800 rounded" onChange={(e) => setForm({ ...form, remark: e.target.value })} />

      {/* TOTAL */}
      <div className="mb-4 text-xl font-bold">Total: ₹ {total.toFixed(2)}</div>

      {/* ACTION */}
      <button onClick={createInvoice} className="w-full py-3 mb-2 bg-blue-600 rounded">Create Invoice</button>
      {invoiceId && <button onClick={downloadPDF} className="w-full py-3 bg-green-600 rounded">Download PDF</button>}
    </div>
  );
}