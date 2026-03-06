import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/auth/register", form);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white shadow rounded-xl w-80"
      >
        <h2 className="mb-4 text-xl font-bold">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 mb-3 border"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
        />

        <button className="w-full p-2 text-white bg-green-600 rounded">
          Register
        </button>
      </form>
    </div>
  );
}