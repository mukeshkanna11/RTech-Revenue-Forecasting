import { useEffect, useState } from "react";

export default function InvoiceForm({ editing, onCreate, onUpdate }) {

  const [form, setForm] = useState({
    client: "",
    description: "",
    quantity: 1,
    price: 0,
    discount: 0,
    taxPercent: 18,
    dueDate: ""
  });

  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (editing) {
      setForm({
        client: editing.client,
        description: editing.items[0]?.description || "",
        quantity: editing.items[0]?.quantity || 1,
        price: editing.items[0]?.price || 0,
        discount: editing.items[0]?.discount || 0,
        taxPercent: editing.items[0]?.taxPercent || 18,
        dueDate: editing.dueDate?.substring(0,10)
      });
    }
  }, [editing]);

  useEffect(() => {

    const subtotal = form.quantity * form.price;

    const discountAmount = subtotal * (form.discount / 100);

    const tax = (subtotal - discountAmount) * (form.taxPercent / 100);

    setTotal(subtotal - discountAmount + tax);

  }, [form]);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    const payload = {

      client: form.client,

      dueDate: form.dueDate,

      items: [
        {
          description: form.description,
          quantity: Number(form.quantity),
          price: Number(form.price),
          discount: Number(form.discount),
          taxPercent: Number(form.taxPercent)
        }
      ]

    };

    if (editing) {
      onUpdate(editing._id, payload);
    } else {
      onCreate(payload);
    }

    setForm({
      client: "",
      description: "",
      quantity: 1,
      price: 0,
      discount: 0,
      taxPercent: 18,
      dueDate: ""
    });

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4 p-4 mb-6 bg-white border rounded"
    >

      <input
        name="client"
        placeholder="Client ID"
        value={form.client}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        name="description"
        placeholder="Service Description"
        value={form.description}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        type="number"
        name="price"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        type="number"
        name="discount"
        placeholder="Discount %"
        value={form.discount}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        type="number"
        name="taxPercent"
        placeholder="GST %"
        value={form.taxPercent}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        type="date"
        name="dueDate"
        value={form.dueDate}
        onChange={handleChange}
        className="p-2 border"
      />

      <div className="flex items-center font-bold">
        Total: ₹{total.toFixed(2)}
      </div>

      <button className="col-span-2 py-2 text-white bg-blue-600 rounded">

        {editing ? "Update Invoice" : "Create Invoice"}

      </button>

    </form>
  );
}