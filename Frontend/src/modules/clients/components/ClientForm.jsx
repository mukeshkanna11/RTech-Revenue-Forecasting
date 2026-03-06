import { useEffect, useState } from "react";

export default function ClientForm({
  editing,
  onCreate,
  onUpdate
}) {

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    gstNumber: ""
  });

  useEffect(() => {
    if (editing) {
      setForm(editing);
    }
  }, [editing]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      onUpdate(editing._id, form);
    } else {
      onCreate(form);
    }

    setForm({
      name: "",
      companyName: "",
      email: "",
      phone: "",
      gstNumber: ""
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4 p-4 mb-6 bg-white border rounded"
    >

      <input
        name="name"
        placeholder="Client Name"
        value={form.name}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        name="companyName"
        placeholder="Company"
        value={form.companyName}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="p-2 border"
      />

      <input
        name="gstNumber"
        placeholder="GST Number"
        value={form.gstNumber}
        onChange={handleChange}
        className="p-2 border"
      />

      <button className="col-span-2 py-2 text-white bg-blue-600 rounded">

        {editing ? "Update Client" : "Create Client"}

      </button>

    </form>
  );
}