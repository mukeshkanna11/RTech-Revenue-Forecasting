import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Navbar({ title }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-700">{user?.name}</span>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-2 px-3 py-2 text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}