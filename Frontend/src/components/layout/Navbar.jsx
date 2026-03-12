// src/components/layout/Navbar.jsx

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronDown, Settings, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function Navbar() {

const { logout, user } = useAuth();
const navigate = useNavigate();
const location = useLocation();

const [profileOpen,setProfileOpen] = useState(false);
const dropdownRef = useRef(null);

const navItems = [
{title:"Dashboard",route:"/dashboard"},
{title:"Clients",route:"/clients"},
{title:"Invoices",route:"/invoices"},
{title:"Revenues",route:"/revenues"},
{title:"Targets",route:"/targets"},
{title:"Forecast",route:"/forecast"},
{title:"Health",route:"/health"}
];


// close dropdown when clicking outside
useEffect(()=>{

const handleClickOutside = (e)=>{
if(dropdownRef.current && !dropdownRef.current.contains(e.target)){
setProfileOpen(false);
}
};

document.addEventListener("mousedown",handleClickOutside);
return ()=>document.removeEventListener("mousedown",handleClickOutside);

},[]);


return (

<header className="sticky top-0 z-50 border-b border-gray-800 shadow bg-gray-950">

<div className="flex items-center justify-between w-full px-8 py-3">

{/* LEFT : LOGO */}

<div
onClick={()=>navigate("/dashboard")}
className="flex items-center gap-3 cursor-pointer"
>

<img
src={logo}
alt="ReadyTech"
className="object-contain w-9 h-9"
/>

<span className="text-lg font-semibold tracking-wide text-white">
ReadyTech Solutions
</span>

</div>



{/* CENTER : NAVIGATION */}

<nav className="flex items-center gap-2">

{navItems.map((item)=>{

const active = location.pathname === item.route;

return(

<button
key={item.title}
onClick={()=>navigate(item.route)}
className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg
${active
? "text-white"
: "text-gray-300 hover:text-white"}
`}
>

{item.title}

{/* active indicator */}

{active && (
<span className="absolute left-0 w-full h-0.5 bottom-0 bg-indigo-500 rounded-full"/>
)}

</button>

)

})}

</nav>



{/* RIGHT : PROFILE */}

<div className="relative" ref={dropdownRef}>

<button
onClick={()=>setProfileOpen(!profileOpen)}
className="flex items-center gap-3 px-3 py-2 transition rounded-lg hover:bg-gray-800"
>

<img
src={`https://ui-avatars.com/api/?name=${user?.name}&background=4f46e5&color=fff`}
className="border border-gray-700 rounded-full w-9 h-9"
/>

<div className="hidden text-left md:block">

<p className="text-sm font-medium text-white">
{user?.name}
</p>

<p className="text-xs text-gray-400">
Account
</p>

</div>

<ChevronDown
size={16}
className={`text-gray-400 transition-transform ${
profileOpen ? "rotate-180" : ""
}`}
/>

</button>



{/* DROPDOWN */}

{profileOpen && (

<div className="absolute right-0 w-56 mt-3 overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl rounded-xl">

{/* user info */}

<div className="px-4 py-4 border-b border-gray-800">

<p className="text-xs text-gray-400">
Signed in as
</p>

<p className="text-sm font-semibold text-white">
{user?.email || user?.name}
</p>

</div>


{/* profile */}

<button
onClick={()=>navigate("/profile")}
className="flex items-center w-full gap-3 px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800"
>

<User size={16}/>
Profile

</button>


{/* settings */}

<button
onClick={()=>navigate("/settings")}
className="flex items-center w-full gap-3 px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800"
>

<Settings size={16}/>
Settings

</button>


{/* logout */}

<button
onClick={()=>{
logout();
navigate("/login");
}}
className="flex items-center w-full gap-3 px-4 py-3 text-sm text-red-400 transition hover:bg-gray-800"
>

<LogOut size={16}/>
Logout

</button>

</div>

)}

</div>

</div>

</header>

);

}