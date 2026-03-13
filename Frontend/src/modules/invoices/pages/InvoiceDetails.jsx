// src/modules/invoices/pages/InvoiceDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../utils/axios";
import Navbar from "../../../components/layout/Navbar";
import {
  DollarSign,
  Send,
  Download,
  Trash,
  FileText,
} from "lucide-react";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH INVOICE ================= */
  const fetchInvoice = async () => {
    try {
      const res = await API.get(`/invoices/${id}`);
      setInvoice(res.data.data);
    } catch (err) {
      console.error("Error fetching invoice:", err);
      alert("Invoice not found");
      navigate("/invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  /* ================= ACTIONS ================= */
  const sendInvoiceEmail = async () => {
    try {
      await API.post(`/invoices/${id}/email`);
      alert("Invoice sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send invoice email");
    }
  };

  const downloadInvoicePDF = () => {
    window.open(`/api/v1/invoices/${id}/pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-200 bg-gray-950">
        Loading Invoice...
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const subtotal = (invoice.items || []).reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const totalTax = (invoice.items || []).reduce(
    (sum, i) => sum + i.price * i.quantity * (i.taxPercent / 100),
    0
  );

  const grandTotal = subtotal + totalTax - (invoice.discount || 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8 text-gray-200 bg-gray-950">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <FileText size={28} /> Invoice #{invoice.invoiceNumber}
          </h1>
          <button
            onClick={() => navigate("/invoices")}
            className="px-5 py-2 bg-gray-700 rounded hover:bg-gray-800 text-white"
          >
            Back to Invoices
          </button>
        </div>

        {/* Client & Invoice Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 border border-gray-700 rounded bg-gray-900">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Client Info</h2>
            <p>{invoice.client?.companyName || "Client Name"}</p>
            <p>{invoice.client?.email}</p>
            <p>{invoice.client?.phone}</p>
            <p>{invoice.client?.address}</p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Invoice Details</h2>
            <p>Status: <span className={`px-2 py-1 rounded ${invoice.status === "paid" ? "bg-green-600" : invoice.status === "overdue" ? "bg-red-600" : "bg-blue-600"}`}>{invoice.status}</span></p>
            <p>Payment Method: {invoice.paymentMethod}</p>
            <p>Discount: ₹{invoice.discount || 0}</p>
            <p>Notes: {invoice.notes || "—"}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 border border-gray-700 rounded bg-gray-900 p-4 overflow-x-auto">
          <table className="w-full text-gray-200 text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Qty</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Tax %</th>
                <th className="p-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((i, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2">{i.description}</td>
                  <td className="p-2">{i.quantity}</td>
                  <td className="p-2">₹{i.price}</td>
                  <td className="p-2">{i.taxPercent}%</td>
                  <td className="p-2">₹{(i.price * i.quantity * (1 + i.taxPercent / 100)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Billing Summary */}
        <div className="mb-6 p-6 border border-gray-700 rounded bg-gray-900 text-gray-200 w-full max-w-md ml-auto">
          <div className="flex justify-between py-1">Subtotal: <span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between py-1">Total Tax: <span>₹{totalTax.toFixed(2)}</span></div>
          <div className="flex justify-between py-1">Discount: <span>₹{invoice.discount || 0}</span></div>
          <div className="flex justify-between py-2 font-bold border-t border-gray-700 mt-2">
            Grand Total: <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={sendInvoiceEmail}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold"
          >
            <Send size={18} /> Send Email
          </button>
          <button
            onClick={downloadInvoicePDF}
            className="flex items-center gap-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-gray-900 font-semibold"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>
    </>
  );
}