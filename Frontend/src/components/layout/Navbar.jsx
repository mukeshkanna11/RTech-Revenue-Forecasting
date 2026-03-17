// 🚀 FINAL SAAS NAVBAR (ACTIVE LINE + PREMIUM PROFILE + CLEAN MOBILE)

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronDown, Settings, User, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { title: "Dashboard", route: "/dashboard" },
    { title: "Targets", route: "/targets" },
    { title: "Revenues", route: "/revenues" },
    { title: "Clients", route: "/clients" },
    { title: "Invoices", route: "/invoices" },
    { title: "Forecast", route: "/forecast" },
  ];

  const handleNavigate = (route) => {
    setMobileOpen(false);
    setProfileOpen(false);
    setTimeout(() => navigate(route), 0);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">

        {/* LOGO */}
        <div
          onClick={() => handleNavigate("/dashboard")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img src={logo} className="w-9 h-9" />
          <div className="hidden sm:block">
            <p className="font-semibold text-white">ReadyTechSolutions</p>
            <p className="text-[10px] text-gray-400">Smart Business Suite</p>
          </div>
        </div>

        {/* NAV WITH ACTIVE LINE */}
        <nav className="relative items-center hidden gap-4 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.route;
            return (
              <button
                key={item.title}
                onClick={() => handleNavigate(item.route)}
                className="relative px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                {item.title}

                {active && (
                  <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* MOBILE MENU */}
          <button
            className="text-gray-400 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

         {/* PREMIUM PROFILE */}
<div ref={dropdownRef} className="relative">
  <button
    onClick={() => setProfileOpen((prev) => !prev)}
    className="flex items-center gap-2 px-2 py-1 transition rounded-lg hover:bg-gray-800"
  >
    {/* Avatar */}
    <img
      src={`https://ui-avatars.com/api/?name=${user?.name}&background=4f46e5&color=fff`}
      className="border border-gray-700 rounded-full w-9 h-9"
    />

    {/* Name + Label */}
    <div className="hidden leading-tight text-left md:block">
      <p className="text-sm font-medium text-white truncate max-w-[120px]">
        {user?.name}
      </p>
      <p className="text-[11px] text-gray-400">My Account</p>
    </div>

    {/* Icon */}
    <ChevronDown
      size={16}
      className={`text-gray-400 transition-transform duration-200 ${
        profileOpen ? "rotate-180" : ""
      }`}
    />
  </button>

  {/* DROPDOWN */}
  {profileOpen && (
    <div className="absolute right-0 z-50 w-64 mt-3 overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl rounded-xl animate-fadeIn">

      {/* USER INFO */}
      <div className="px-4 py-4 border-b border-gray-800">
        <p className="text-xs text-gray-400">Signed in as</p>
        <p className="text-sm font-semibold text-white truncate">
          {user?.email || user?.name}
        </p>
      </div>

      {/* MENU */}
      <div className="py-1">

        <button
          onClick={() => handleNavigate("/profile")}
          className="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
        >
          <User size={16} />
          Profile
        </button>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>
    </div>
  )}
</div>
        </div>
      </div>

      {/* SINGLE MOBILE DROPDOWN ONLY (CLEANED DUPLICATE) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative w-[92%] max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">

            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm text-white">Navigation</h3>
              <button onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="p-2">
              {navItems.map((item) => {
                const active = location.pathname === item.route;
                return (
                  <button
                    key={item.title}
                    onClick={() => handleNavigate(item.route)}
                    className={`w-full text-left px-4 py-3 rounded-xl mb-1 text-sm ${
                      active
                        ? "bg-indigo-600/20 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// CSS
// .dropdown-item {
//   display: flex;
//   gap: 10px;
//   width: 100%;
//   padding: 12px 16px;
//   font-size: 14px;
//   color: #d1d5db;
// }
// .dropdown-item:hover {
//   background: #1f2937;
//   color: white;
// }
