// src/modules/invoices/pages/CreateInvoice.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import { Plus, Trash, ArrowLeft, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import InvoicePDF from "./InvoicePDF";
import {
  useMemo
} from "react";
export default function CreateInvoice({ onInvoiceCreated }) {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
const [loadingClients, setLoadingClients] = useState(false);

const [createdInvoice, setCreatedInvoice] =
  useState(null);

const [invoiceId, setInvoiceId] =
  useState(null);

const [invoiceNumber, setInvoiceNumber] =
  useState("");

const [form, setForm] = useState({
  clientId: "",

  invoiceDate: "",
  orderDate: "",
  dueDate: "",

  purchaseOrderNumber: "",
  purchaseOrderDate: "",

  taxType: "IGST",

  paymentStatus: "Pending",

  supplier: {
    name: "Ready Tech Solutions",
    address: "Tamil Nadu, India",
    gstin: "",
    pan: "",
    email: "",
    phone: ""
  },

  customer: {
    name: "",
    gstin: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: ""
  },

  items: [],

  otherCharges: 0,
  tdsAmount: 0,

  remittance: {
    beneficiaryName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    swiftCode: ""
  },

  termsAndConditions:
    "Payment due within 30 days.",

  companyDisplayName:
    "Ready Tech Solutions",

  authorisedSignatory: "",

  remark: ""
});

const [item, setItem] = useState({
  description: "",
  hsn: "998313",

  quantity: 1,
  unitPrice: 0,
  discount: 0,

  cgstRate: 9,
  sgstRate: 9,
  igstRate: 18
});

  // ================= FETCH CLIENTS =================
  const fetchClients = useCallback(
  async () => {
    try {
      setLoadingClients(true);

      const res =
        await API.get("/clients");

      setClients(
        res?.data?.data || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  },
  []
);

useEffect(() => {
  fetchClients();
}, [fetchClients]);

  // ================= HANDLERS =================
const updateField = (section, key, value) => {
  setForm((prev) => ({
    ...prev,
    [section]: {
      ...(prev[section] || {}),
      [key]: value
    }
  }));
};
  

const handleClientSelect = (
  clientId
) => {
  const client =
  clients?.find(
    (c) => c._id === clientId
  );

  if (!client) return;

  setForm((prev) => ({
    ...prev,

    clientId,

    customer: {
      name: client.name || "",
      gstin: client.gstin || "",
      email: client.email || "",
      phone: client.phone || "",
      billingAddress:
        client.address || "",
      shippingAddress:
        client.address || ""
    }
  }));
};

const addItem = () => {
  if (!item.description)
    return alert(
      "Description required"
    );

  const quantity = Number(
    item.quantity || 1
  );

  const unitPrice = Number(
    item.unitPrice || 0
  );

  const discount = Number(
    item.discount || 0
  );

  const taxableValue =
    quantity * unitPrice -
    discount;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (
    form.taxType ===
    "CGST_SGST"
  ) {
    cgstAmount =
      (taxableValue *
        Number(
          item.cgstRate || 9
        )) /
      100;

    sgstAmount =
      (taxableValue *
        Number(
          item.sgstRate || 9
        )) /
      100;
  }

  if (
    form.taxType === "IGST"
  ) {
    igstAmount =
      (taxableValue *
        Number(
          item.igstRate || 18
        )) /
      100;
  }

  const total =
    taxableValue +
    cgstAmount +
    sgstAmount +
    igstAmount;

  const newItem = {
    ...item,

    quantity,
    unitPrice,
    discount,

    taxableValue,

    cgstAmount,
    sgstAmount,
    igstAmount,

    total
  };

  setForm((prev) => ({
    ...prev,
    items: [
      ...prev.items,
      newItem
    ]
  }));

  setItem({
    description: "",
    hsn: "998313",

    quantity: 1,
    unitPrice: 0,
    discount: 0,

    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18
  });
};
  
  // ================= REMOVE ITEM =================
 const removeItem = (
  index
) => {
  setForm((prev) => ({
    ...prev,

    items: prev.items.filter(
      (_, i) => i !== index
    )
  }));
};

const summary = useMemo(() => {
  const items = form.items || [];

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.taxableValue || 0),
    0
  );

  const discount = items.reduce(
    (sum, item) =>
      sum + Number(item.discount || 0),
    0
  );

  const cgst = items.reduce(
    (sum, item) =>
      sum + Number(item.cgstAmount || 0),
    0
  );

  const sgst = items.reduce(
    (sum, item) =>
      sum + Number(item.sgstAmount || 0),
    0
  );

  const igst = items.reduce(
    (sum, item) =>
      sum + Number(item.igstAmount || 0),
    0
  );

  const grandTotal =
    subtotal +
    cgst +
    sgst +
    igst +
    Number(form.otherCharges || 0) -
    Number(form.tdsAmount || 0);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2))
  };
}, [
  form.items,
  form.otherCharges,
  form.tdsAmount
]);

  // ================= TOTAL =================
const totalAmount = summary.grandTotal;

  // ================= CREATE INVOICE =================
  const createInvoice =
  async () => {
    try {
      if (!form.invoiceDate)
        return alert(
          "Invoice Date required"
        );

      if (
        !form.customer.name
      )
        return alert(
          "Customer required"
        );

      if (
        form.items.length === 0
      )
        return alert(
          "Add at least one item"
        );

      const payload = {
        ...form,

        subtotal:
          summary.subtotal,

        discountAmount:
          summary.discount,

        cgstTotal:
          summary.cgst,

        sgstTotal:
          summary.sgst,

        igstTotal:
          summary.igst,

        grandTotal:
          summary.grandTotal,

        totalAmount:
          summary.grandTotal
      };

      const res =
        await API.post(
          "/invoices",
          payload
        );

      if (
        res.data.success
      ) {
        const invoice =
          res.data.data;

        setInvoiceId(
          invoice._id
        );

        setInvoiceNumber(
          invoice.invoiceNumber
        );

        setCreatedInvoice(
          invoice
        );

        alert(
          `Invoice Created : ${invoice.invoiceNumber}`
        );

        onInvoiceCreated?.(
          invoice
        );
      }
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data
          ?.message ||
          "Invoice creation failed"
      );
    }
  };

  // ================= PDF =================
  const downloadPDF =
  async () => {
    try {
      if (!createdInvoice)
        return alert(
          "Create invoice first"
        );

      const blob =
        await pdf(
          <InvoicePDF
            invoice={
              createdInvoice
            }
          />
        ).toBlob();

      saveAs(
        blob,
        `${createdInvoice.invoiceNumber}.pdf`
      );
    } catch (err) {
      console.error(err);
      alert(
        "PDF generation failed"
      );
    }
  };

  return (
  <div className="min-h-screen text-white bg-slate-950">
    {/* Header */}
    <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">
            Create Invoice
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Professional GST Invoice Generator
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 transition rounded-xl bg-slate-800 hover:bg-slate-700"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>
    </div>

    <div className="p-6 mx-auto space-y-6 max-w-7xl">

      {/* Invoice Info */}
      <div className="p-6 border bg-slate-900 rounded-3xl border-slate-800">
        <h2 className="mb-5 text-xl font-semibold">
          Invoice Information
        </h2>

        <div className="grid gap-4 lg:grid-cols-4">

          <div>
            <label className="block mb-2 text-slate-400">
              Invoice Date
            </label>

            <input
              type="date"
              value={form.invoiceDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  invoiceDate: e.target.value
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="block mb-2 text-slate-400">
              PO Number
            </label>

            <input
  value={form.purchaseOrderNumber}
  onChange={(e) =>
    setForm({
      ...form,
      purchaseOrderNumber: e.target.value
    })
  }
  className="input"
/>
          </div>

          <div>
            <label className="block mb-2 text-slate-400">
              PO Date
            </label>

            <input
  type="date"
  value={form.purchaseOrderDate}
  onChange={(e) =>
    setForm({
      ...form,
      purchaseOrderDate: e.target.value
    })
  }
  className="input"
/>
          </div>

          <div>
            <label className="block mb-2 text-slate-400">
              Service Mode
            </label>

            <select
              value={form.serviceMode}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceMode: e.target.value
                })
              }
              className="input"
            >
              <option>Consulting / IT Services</option>
              <option>Website Development</option>
              <option>Mobile App Development</option>
              <option>Hosting Services</option>
            </select>
          </div>

        </div>
      </div>

      {/* Customer */}
      <div className="p-6 border bg-slate-900 rounded-3xl border-slate-800">
        <h2 className="mb-5 text-xl font-semibold">
          Customer Details
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">

          <input
            placeholder="Company Name"
            value={form.customer.name}
            onChange={(e) =>
              updateField(
                "customer",
                "name",
                e.target.value
              )
            }
            className="input"
          />

          <input
            placeholder="Email"
            value={form.customer.email}
            onChange={(e) =>
              updateField(
                "customer",
                "email",
                e.target.value
              )
            }
            className="input"
          />

          <input
            placeholder="Phone"
            value={form.customer.phone}
            onChange={(e) =>
              updateField(
                "customer",
                "phone",
                e.target.value
              )
            }
            className="input"
          />

          <input
            placeholder="Address"
            value={form.customer.address}
            onChange={(e) =>
              updateField(
                "customer",
                "address",
                e.target.value
              )
            }
            className="input"
          />
        </div>
      </div>

      {/* Invoice Items */}
<div className="p-6 border shadow-2xl bg-slate-900/80 backdrop-blur-xl rounded-3xl border-slate-800">

  <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">

    <div>
      <h2 className="text-2xl font-bold text-white">
        Invoice Items
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Add services, products and tax details
      </p>
    </div>

    <button
      type="button"
      onClick={addItem}
      className="flex items-center justify-center gap-2 px-5 py-3 font-medium text-white transition-all bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl"
    >
      <Plus size={18} />
      Add Item
    </button>
  </div>

  {/* Add Item Form */}
  <div className="grid gap-4 mb-8 lg:grid-cols-6">

    <input
      type="text"
      placeholder="Description"
      value={item.description || ""}
      onChange={(e) =>
        setItem({
          ...item,
          description: e.target.value
        })
      }
      className="input"
    />

    <input
      type="text"
      placeholder="HSN"
      value={item.hsn || ""}
      onChange={(e) =>
        setItem({
          ...item,
          hsn: e.target.value
        })
      }
      className="input"
    />

    <input
      type="number"
      placeholder="Qty"
      value={item.quantity || ""}
      onChange={(e) =>
        setItem({
          ...item,
          quantity: e.target.value
        })
      }
      className="input"
    />

    <input
      type="number"
      placeholder="Unit Price"
      value={item.unitPrice || ""}
      onChange={(e) =>
        setItem({
          ...item,
          unitPrice: e.target.value
        })
      }
      className="input"
    />

    <input
      type="number"
      placeholder="Discount"
      value={item.discount || ""}
      onChange={(e) =>
        setItem({
          ...item,
          discount: e.target.value
        })
      }
      className="input"
    />

    {form.taxType === "IGST" ? (
      <input
        type="number"
        placeholder="IGST %"
        value={item.igstRate || ""}
        onChange={(e) =>
          setItem({
            ...item,
            igstRate: e.target.value
          })
        }
        className="input"
      />
    ) : (
      <div className="grid grid-cols-2 gap-2">

        <input
          type="number"
          placeholder="CGST %"
          value={item.cgstRate || ""}
          onChange={(e) =>
            setItem({
              ...item,
              cgstRate: e.target.value
            })
          }
          className="input"
        />

        <input
          type="number"
          placeholder="SGST %"
          value={item.sgstRate || ""}
          onChange={(e) =>
            setItem({
              ...item,
              sgstRate: e.target.value
            })
          }
          className="input"
        />

      </div>
    )}
  </div>

  {/* Items Table */}
  <div className="overflow-x-auto">

    <table className="w-full">

      <thead>
        <tr className="border-b border-slate-700 text-slate-400">

          <th className="py-3 text-left">
            Description
          </th>

          <th className="text-left">
            HSN
          </th>

          <th className="text-left">
            Qty
          </th>

          <th className="text-left">
            Price
          </th>

          <th className="text-left">
            Discount
          </th>

          <th className="text-left">
            Taxable
          </th>

          <th className="text-left">
            GST
          </th>

          <th className="text-left">
            Total
          </th>

          <th />
        </tr>
      </thead>

      <tbody>

        {form.items.length === 0 ? (
          <tr>
            <td
              colSpan={9}
              className="py-10 text-center text-slate-500"
            >
              No Items Added
            </td>
          </tr>
        ) : (
          form.items.map((row, index) => (

            <tr
              key={index}
              className="border-b border-slate-800 hover:bg-slate-800/40"
            >

              <td className="py-4">
                {row.description}
              </td>

              <td>{row.hsn}</td>

              <td>{row.quantity}</td>

              <td>
                ₹ {Number(row.unitPrice || 0).toLocaleString("en-IN")}
              </td>

              <td>
                ₹ {Number(row.discount || 0).toLocaleString("en-IN")}
              </td>

              <td>
                ₹ {Number(row.taxableValue || 0).toLocaleString("en-IN")}
              </td>

              <td>
                ₹{" "}
                {Number(
                  row.cgstAmount +
                    row.sgstAmount +
                    row.igstAmount
                ).toLocaleString("en-IN")}
              </td>

              <td className="font-semibold text-green-400">
                ₹ {Number(row.total || 0).toLocaleString("en-IN")}
              </td>

              <td>
                <button
                  type="button"
                  onClick={() =>
                    removeItem(index)
                  }
                  className="p-2 rounded-lg hover:bg-red-500/20"
                >
                  <Trash
                    size={18}
                    className="text-red-500"
                  />
                </button>
              </td>

            </tr>
          ))
        )}

      </tbody>

    </table>

  </div>

</div>

      {/* Summary */}
      <div className="grid gap-6 lg:grid-cols-2">

        <div className="p-6 border bg-slate-900 rounded-3xl border-slate-800">

          <h2 className="mb-4 text-xl font-semibold">
            Remarks
          </h2>

          <textarea
            rows="6"
            value={form.remark}
            onChange={(e) =>
              setForm({
                ...form,
                remark: e.target.value
              })
            }
            className="resize-none input"
            placeholder="Additional Notes..."
          />
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl">

          <h2 className="mb-5 text-2xl font-bold">
            Invoice Summary
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between">
              <span>Items</span>
              <span>{form.items.length}</span>
            </div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                ₹
                {totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between pt-4 text-xl font-bold border-t border-white/20">
              <span>Total</span>

              <span>
                ₹
                {totalAmount.toLocaleString()}
              </span>
            </div>

          </div>

          <button
            onClick={createInvoice}
            className="w-full mt-6 bg-white text-slate-900 font-semibold py-3 rounded-xl hover:scale-[1.02] transition"
          >
            Create Invoice
          </button>

          {invoiceId && (
            <button
              onClick={downloadPDF}
              className="flex justify-center w-full gap-2 py-3 mt-3 bg-slate-900 rounded-xl"
            >
              <Download size={18} />
              Download PDF
            </button>
          )}
        </div>

      </div>

    </div>

    <style>{`
      .input{
        width:100%;
        background:#0f172a;
        border:1px solid #334155;
        border-radius:14px;
        padding:12px 14px;
        color:white;
        outline:none;
      }

      .input:focus{
        border-color:#3b82f6;
        box-shadow:0 0 0 3px rgba(59,130,246,.15);
      }
    `}</style>
  </div>
);  
}