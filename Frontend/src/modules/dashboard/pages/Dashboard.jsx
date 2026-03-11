// src/modules/dashboard/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import {
Home,
Users,
FileText,
DollarSign,
Target,
BarChart3,
Activity,
Menu,
LogOut,
Sparkles,
TrendingUp,
Briefcase
} from "lucide-react";

import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid
} from "recharts";

import API from "../../../utils/axios";
import { useAuth } from "../../../context/AuthContext";

export default function Dashboard(){

const [data,setData] = useState({});
const [chartData,setChartData] = useState([]);
const [loading,setLoading] = useState(true);
const [sidebarOpen,setSidebarOpen] = useState(true);

const {logout,user} = useAuth();
const navigate = useNavigate();
const location = useLocation();

const menuItems = [
{title:"Dashboard",icon:<Home size={18}/>,route:"/dashboard"},
{title:"Clients",icon:<Users size={18}/>,route:"/clients"},
{title:"Invoices",icon:<FileText size={18}/>,route:"/invoices"},
{title:"Revenues",icon:<DollarSign size={18}/>,route:"/revenues"},
{title:"Targets",icon:<Target size={18}/>,route:"/targets"},
{title:"Forecast",icon:<BarChart3 size={18}/>,route:"/forecast"},
{title:"Health",icon:<Activity size={18}/>,route:"/health"}
];

useEffect(()=>{

const loadData = async()=>{

try{
const res = await API.get("/dashboard/summary");
setData(res.data.data || {});
}catch(err){
console.log(err);
}

setChartData([
{month:"Jan",revenue:12000},
{month:"Feb",revenue:18000},
{month:"Mar",revenue:24000},
{month:"Apr",revenue:31000},
{month:"May",revenue:38000},
{month:"Jun",revenue:44000}
]);

setLoading(false);

};

loadData();

},[]);

const formatCurrency = (amount)=>{
return new Intl.NumberFormat("en-IN",{
style:"currency",
currency:"INR",
maximumFractionDigits:0
}).format(amount || 0);
};

if(loading){
return(
<div className="flex items-center justify-center h-screen">
<p className="animate-pulse">Loading Dashboard...</p>
</div>
)
}

return(

<div className="flex min-h-screen bg-gray-50">

{/* FLOATING BACKGROUND */}

<div className="fixed inset-0 -z-10">

<div className="absolute bg-indigo-200 rounded-full w-96 h-96 blur-3xl top-10 left-10 animate-pulse"/>

<div className="absolute bg-purple-200 rounded-full w-96 h-96 blur-3xl bottom-10 right-10 animate-pulse"/>

</div>

{/* SIDEBAR */}

<aside className={`fixed h-full bg-white shadow-lg transition-all duration-300
${sidebarOpen ? "w-64":"w-16"}`}>

<div className="flex items-center justify-between p-4 border-b">

{sidebarOpen && (
<h2 className="font-bold text-indigo-600">
ReadyTech CRM
</h2>
)}

<button onClick={()=>setSidebarOpen(!sidebarOpen)}>
<Menu size={20}/>
</button>

</div>

<nav className="flex flex-col gap-2 p-2 mt-6">

{menuItems.map(item=>{

const active = location.pathname === item.route;

return(

<button
key={item.title}
onClick={()=>navigate(item.route)}
className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
${active ? "bg-indigo-100 text-indigo-600":"text-gray-600 hover:bg-gray-100"}
${!sidebarOpen && "justify-center"}`}
>

{item.icon}
{sidebarOpen && item.title}

</button>

)

})}

</nav>

</aside>

{/* MAIN */}

<div
className="flex flex-col flex-1"
style={{marginLeft: sidebarOpen ? "16rem":"4rem"}}
>

{/* NAVBAR */}

<header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white shadow">

<h1 className="text-xl font-bold">
Revenue Intelligence Dashboard
</h1>

<div className="flex items-center gap-4">

<span className="text-sm text-gray-600">
Welcome {user?.name}
</span>

<button
onClick={()=>{logout();navigate("/login")}}
className="flex items-center gap-2 px-3 py-2 text-white bg-indigo-600 rounded-lg"
>

<LogOut size={16}/>
Logout

</button>

</div>

</header>

{/* CONTENT */}

<main className="p-6 space-y-6">

{/* COMPANY BANNER */}

<motion.div
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
className="p-8 text-white shadow-xl rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600"
>

<h2 className="text-3xl font-bold">
ReadyTech Solutions
</h2>

<p className="max-w-xl mt-2 text-sm opacity-90">
Modern SaaS CRM platform helping businesses manage clients,
invoices, revenue analytics and intelligent forecasting.
</p>

</motion.div>

{/* KPI */}

<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

<StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={<DollarSign/>}/>
<StatCard title="Growth Rate" value={`${data.monthlyGrowth || 14}%`} icon={<TrendingUp/>}/>
<StatCard title="Active Clients" value={data.activeClients || 3} icon={<Users/>}/>
<StatCard title="Invoices" value={data.invoices || 12} icon={<FileText/>}/>

</div>

{/* CHART + AI */}

<div className="grid gap-6 lg:grid-cols-3">

<div className="p-6 bg-white shadow rounded-2xl lg:col-span-2">

<h3 className="mb-4 font-semibold">
Revenue Forecast
</h3>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={chartData}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="month"/>
<YAxis/>
<Tooltip/>

<Line
type="monotone"
dataKey="revenue"
stroke="#6366F1"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

<div className="p-6 text-white shadow rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500">

<h3 className="flex items-center gap-2 mb-3 font-semibold">
<Sparkles size={18}/>
AI Revenue Prediction
</h3>

<p className="text-sm">
Projected revenue next month may increase by <b>18%</b>
based on current sales performance and client activity.
</p>

</div>

</div>

{/* CLIENTS */}

<div className="p-6 bg-white shadow rounded-2xl">

<h3 className="mb-4 font-semibold">
Top Clients
</h3>

{[
{name:"TechNova",revenue:120000,img:"https://i.pravatar.cc/40?img=1"},
{name:"BlueSoft",revenue:95000,img:"https://i.pravatar.cc/40?img=2"},
{name:"NextEdge",revenue:87000,img:"https://i.pravatar.cc/40?img=3"}
].map((c,i)=>(

<div key={i} className="flex items-center justify-between py-2">

<div className="flex items-center gap-3">

<img src={c.img} className="w-8 h-8 rounded-full"/>

<span>{c.name}</span>

</div>

<span className="font-semibold">
{formatCurrency(c.revenue)}
</span>

</div>

))}

</div>

{/* BUSINESS INSIGHTS */}

<div className="p-6 bg-white shadow rounded-2xl">

<h3 className="mb-3 font-semibold">
Business Insights
</h3>

<ul className="space-y-2 text-sm text-gray-600">

<li>✔ Revenue increased 14% this month</li>
<li>✔ 3 new clients joined recently</li>
<li>✔ 8 invoices successfully paid</li>
<li>✔ Forecast indicates steady growth</li>

</ul>

</div>

{/* ABOUT */}

<div className="p-6 bg-white shadow rounded-2xl">

<h3 className="flex items-center gap-2 mb-3 text-lg font-bold">

<Briefcase size={18}/>
About ReadyTech Solutions

</h3>

<p className="text-sm text-gray-600">
ReadyTech Solutions provides scalable CRM tools for
client management, invoicing, revenue analytics and
business forecasting through intelligent dashboards.
</p>

</div>

</main>

</div>

</div>

)

}

function StatCard({title,value,icon}){

return(

<motion.div
whileHover={{scale:1.04}}
className="flex items-center justify-between p-6 bg-white shadow rounded-2xl"
>

<div>

<p className="text-sm text-gray-500">
{title}
</p>

<h2 className="text-2xl font-bold">
{value}
</h2>

</div>

<div className="p-3 text-white bg-indigo-600 rounded-xl">
{icon}
</div>

</motion.div>

)

}