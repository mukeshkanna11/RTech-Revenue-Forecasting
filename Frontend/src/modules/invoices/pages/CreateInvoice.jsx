import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import { Plus, Trash } from "lucide-react";

export default function CreateInvoice() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    clientId: "",
    customer: { name: "", address: "", serviceMode: "Onsite / IT Services" },
    agreementPO: { number: "", date: "" },
    items: [],
    remarks: "",
    typeOfClearance: "LUT",
    paymentMethod: "UPI"
  });

  const [item, setItem] = useState({
    description: "",
    hsnCode: "",
    quantity: 1,
    rate: 0,
    taxPercent: 18
  });

  const [newClient, setNewClient] = useState({
    companyName: "",
    email: "",
    address: ""
  });

  // ================= FETCH CLIENTS =================
  const fetchClients = async () => {
    const res = await API.get("/clients");
    setClients(res.data?.data?.clients || []);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ================= ADD CLIENT =================
  const addClient = async () => {
    if (!newClient.companyName) return alert("Company name required");

    const res = await API.post("/clients", newClient);

    alert("Client Added");
    setNewClient({ companyName: "", email: "", address: "" });
    fetchClients();
  };

  // ================= AUTO FILL =================
  useEffect(() => {
    const selected = clients.find(c => c._id === form.clientId);
    if (selected) {
      setForm(prev => ({
        ...prev,
        customer: {
          name: selected.companyName,
          address: selected.address,
          serviceMode: "Onsite / IT Services"
        }
      }));
    }
  }, [form.clientId, clients]);

  // ================= ADD ITEM =================
  const addItem = () => {
    if (!item.description || !item.hsnCode) return alert("Enter item details");

    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: item.description,
          hsnCode: Number(item.hsnCode),
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          taxPercent: Number(item.taxPercent)
        }
      ]
    }));

    setItem({ description: "", hsnCode: "", quantity: 1, rate: 0, taxPercent: 18 });
  };

  const removeItem = i => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i)
    }));
  };

  // ================= CALC =================
  const summary = form.items.reduce(
    (acc, i) => {
      const base = i.quantity * i.rate;
      const gst = (base * i.taxPercent) / 100;
      acc.subtotal += base;
      acc.gst += gst;
      return acc;
    },
    { subtotal: 0, gst: 0 }
  );

  const total = summary.subtotal + summary.gst;

  // ================= CREATE =================
  const createInvoice = async () => {
    if (!form.clientId) return alert("Select client");
    if (!form.items.length) return alert("Add items");

    const payload = {
      clientId: form.clientId,

      supplier: {
        name: "TechNova Solutions Pvt Ltd",
        gstin: "27ABCDE9876F2Z3",
        cin: "U67890KA2021PTC987654",
        iec: "IEC9876543",
        iecDate: "2025-01-15",
        pan: "ABCDE9876F"
      },

      customer: form.customer,

      agreementPO: {
        ...form.agreementPO,
        date: new Date(form.agreementPO.date).toISOString()
      },

      items: form.items,

      remittance: {
        beneficiaryName: "TechNova Solutions Pvt Ltd",
        accountNumber: "1122334455",
        swiftCode: "TNOVINBBXXX",
        ifsCode: "TNOV0000678",
        bankAddress: "Hyderabad, India"
      },

      remarks: form.remarks,
      typeOfClearance: form.typeOfClearance,
      paymentMethod: form.paymentMethod
    };

    await API.post("/invoices", payload);
    alert("Invoice Created");
    navigate("/invoices");
  };

  return (
    <div className="min-h-screen p-8 text-white bg-gray-950">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">Create Invoice</h1>

        {/* CLIENT SELECT */}
        <div className="p-6 space-y-3 bg-gray-900 rounded-xl">
          <select
            value={form.clientId}
            onChange={e => setForm({ ...form, clientId: e.target.value })}
            className="w-full p-3 bg-gray-800 rounded"
          >
            <option value="">Select Client</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* ADD CLIENT */}
        <div className="p-6 space-y-3 bg-gray-900 rounded-xl">
          <h2>Add Client</h2>
          <input placeholder="Company" className="w-full p-2 bg-gray-800"
            value={newClient.companyName}
            onChange={e => setNewClient({ ...newClient, companyName: e.target.value })}
          />
          <input placeholder="Email" className="w-full p-2 bg-gray-800"
            value={newClient.email}
            onChange={e => setNewClient({ ...newClient, email: e.target.value })}
          />
          <input placeholder="Address" className="w-full p-2 bg-gray-800"
            value={newClient.address}
            onChange={e => setNewClient({ ...newClient, address: e.target.value })}
          />
          <button onClick={addClient} className="px-4 py-2 bg-green-600 rounded">
            Add Client
          </button>
        </div>

        {/* ITEMS */}
        <div className="p-6 space-y-4 bg-gray-900 rounded-xl">
          <div className="grid grid-cols-5 gap-2">
            <input placeholder="Desc" className="p-2 bg-gray-800" value={item.description}
              onChange={e => setItem({ ...item, description: e.target.value })}
            />
            <input placeholder="HSN" className="p-2 bg-gray-800" value={item.hsnCode}
              onChange={e => setItem({ ...item, hsnCode: e.target.value })}
            />
            <input type="number" placeholder="Qty" className="p-2 bg-gray-800" value={item.quantity}
              onChange={e => setItem({ ...item, quantity: e.target.value })}
            />
            <input type="number" placeholder="Rate" className="p-2 bg-gray-800" value={item.rate}
              onChange={e => setItem({ ...item, rate: e.target.value })}
            />
            <button onClick={addItem} className="bg-indigo-600">
              <Plus />
            </button>
          </div>

          {form.items.map((i, idx) => (
            <div key={idx} className="flex justify-between p-2 bg-gray-800">
              {i.description} - ₹{i.rate}
              <button onClick={() => removeItem(idx)}><Trash /></button>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="p-6 bg-gray-900 rounded-xl">
          <div>Subtotal: ₹{summary.subtotal}</div>
          <div>GST: ₹{summary.gst}</div>
          <div className="font-bold">Total: ₹{total}</div>
        </div>

        <button onClick={createInvoice} className="w-full py-3 bg-indigo-600 rounded">
          Create Invoice
        </button>

      </div>
    </div>
  );
}
