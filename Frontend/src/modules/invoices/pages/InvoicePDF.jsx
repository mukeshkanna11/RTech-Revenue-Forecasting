// src/modules/invoices/pages/InvoicePDF.jsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../../../utils/axios";
import { Printer } from "lucide-react";

export default function InvoicePDF() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const printRef = useRef();

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/invoices/${id}`);
      setInvoice(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const w = window.open();
    w.document.write(`<html><body style="background:#111;color:#fff;font-family:sans-serif;">${printContents}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
  if (!invoice) return <div className="flex items-center justify-center h-screen text-lg text-red-400">Invoice not found</div>;

  const totalAmount = invoice.items.reduce((sum, item) => {
    const tax = (item.price * item.quantity) * (item.taxPercent / 100);
    return sum + (item.price * item.quantity) + tax;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-gray-200">
      <div className="flex justify-end mb-4">
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500">
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      <div ref={printRef} className="p-6 border bg-gray-900 border-gray-800 rounded-xl space-y-6">

        <h1 className="text-3xl font-bold text-center">Invoice #{invoice.invoiceNumber}</h1>

        {/* Client & Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Client</h2>
            <p>{invoice.client?.companyName}</p>
            <p>{invoice.client?.name}</p>
            <p>{invoice.client?.email}</p>
            <p>{invoice.client?.phone}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Invoice Info</h2>
            <p>Status: {invoice.status}</p>
            <p>Payment: {invoice.paymentMethod}</p>
            <p>Discount: ₹{invoice.discount || 0}</p>
            <p>Notes: {invoice.notes || "-"}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto border bg-gray-800 border-gray-700 rounded-xl">
          <table className="w-full text-left text-gray-200">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4">Description</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Price</th>
                <th className="p-4">Tax %</th>
                <th className="p-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => {
                const itemTotal = (item.price * item.quantity) * (1 + item.taxPercent / 100);
                return (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="p-4">{item.description}</td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="p-4">₹{item.price}</td>
                    <td className="p-4">{item.taxPercent}%</td>
                    <td className="p-4 font-semibold text-green-400">₹{itemTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="text-right text-2xl font-bold">
          Total Amount: <span className="text-green-400">₹{totalAmount.toFixed(2)}</span>
        </div>

      </div>
    </div>
  );
}