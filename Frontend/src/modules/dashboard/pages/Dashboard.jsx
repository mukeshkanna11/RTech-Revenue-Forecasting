// src/modules/dashboard/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
Users,
FileText,
DollarSign,
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
import Navbar from "../../../components/layout/Navbar";

export default function Dashboard(){

const [data,setData] = useState({});
const [chartData,setChartData] = useState([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const loadData = async()=>{

try{

const res = await API.get("/dashboard/summary");
setData(res.data.data || {});

}catch(err){
console.error(err);
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

<div className="flex items-center justify-center min-h-screen text-gray-400 bg-gray-950">
Loading Dashboard...
</div>

)
}

return(

<div className="min-h-screen text-gray-200 bg-gray-950">

<Navbar/>

{/* background glow */}

<div className="fixed inset-0 -z-10">

<div className="absolute bg-indigo-500 rounded-full w-96 h-96 blur-3xl top-20 left-20 opacity-20"/>

<div className="absolute bg-purple-500 rounded-full w-96 h-96 blur-3xl bottom-20 right-20 opacity-20"/>

</div>


{/* page */}

<main className="w-full p-8 space-y-8">


{/* HERO */}

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
className="p-10 shadow-xl rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600"
>

<h2 className="text-3xl font-bold">
ReadyTech Solutions Dashboard
</h2>

<p className="max-w-2xl mt-3 text-sm opacity-90">

Monitor business performance, track revenue growth,
manage clients and analyse forecasting trends with
our intelligent SaaS CRM platform.

</p>

</motion.div>


{/* KPI */}

<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

<StatCard
title="Total Revenue"
value={formatCurrency(data.totalRevenue)}
icon={<DollarSign size={20}/>}
/>

<StatCard
title="Growth Rate"
value={`${data.monthlyGrowth || 14}%`}
icon={<TrendingUp size={20}/>}
/>

<StatCard
title="Active Clients"
value={data.activeClients || 3}
icon={<Users size={20}/>}
/>

<StatCard
title="Invoices"
value={data.invoices || 12}
icon={<FileText size={20}/>}
/>

</div>


{/* CHART + AI */}

<div className="grid gap-6 lg:grid-cols-3">

{/* chart */}

<div className="p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl lg:col-span-2">

<h3 className="mb-6 font-semibold">
Revenue Forecast
</h3>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={chartData}>

<CartesianGrid strokeDasharray="3 3" stroke="#374151"/>

<XAxis dataKey="month" stroke="#9CA3AF"/>

<YAxis stroke="#9CA3AF"/>

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


{/* AI card */}

<div className="p-6 shadow-xl rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500">

<h3 className="flex items-center gap-2 mb-3 font-semibold">

<Sparkles size={18}/>
AI Revenue Prediction

</h3>

<p className="text-sm">

Based on invoice patterns and client acquisition,
next month revenue is predicted to grow by
<b> 18%</b>.

</p>

</div>

</div>


{/* TOP CLIENTS */}

<div className="p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl">

<h3 className="mb-4 font-semibold">
Top Clients
</h3>

{[
{name:"TechNova",revenue:120000,img:"https://i.pravatar.cc/40?img=1"},
{name:"BlueSoft",revenue:95000,img:"https://i.pravatar.cc/40?img=2"},
{name:"NextEdge",revenue:87000,img:"https://i.pravatar.cc/40?img=3"}
].map((c,i)=>(

<div
key={i}
className="flex items-center justify-between py-3 border-b border-gray-800 last:border-none"
>

<div className="flex items-center gap-3">

<img
src={c.img}
className="w-8 h-8 rounded-full"
/>

<span>{c.name}</span>

</div>

<span className="font-semibold text-indigo-400">
{formatCurrency(c.revenue)}
</span>

</div>

))}

</div>


{/* INSIGHTS */}

<div className="p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl">

<h3 className="mb-3 font-semibold">
Business Insights
</h3>

<ul className="space-y-2 text-sm text-gray-400">

<li>✔ Revenue increased 14% this month</li>
<li>✔ 3 new clients joined recently</li>
<li>✔ 8 invoices successfully paid</li>
<li>✔ Forecast indicates stable growth</li>

</ul>

</div>


{/* ABOUT */}

<div className="p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl">

<h3 className="flex items-center gap-2 mb-3 text-lg font-bold">

<Briefcase size={18}/>
About ReadyTech Solutions

</h3>

<p className="text-sm text-gray-400">

ReadyTech Solutions provides scalable SaaS CRM tools
for client management, invoice tracking, revenue
analytics and business forecasting through intelligent
data dashboards.

</p>

</div>

</main>

</div>

)

}


function StatCard({title,value,icon}){

return(

<motion.div
whileHover={{scale:1.05}}
className="flex items-center justify-between p-6 transition bg-gray-900 border border-gray-800 shadow-lg rounded-2xl hover:border-indigo-500"
>

<div>

<p className="text-sm text-gray-400">
{title}
</p>

<h2 className="text-2xl font-bold text-white">
{value}
</h2>

</div>

<div className="p-3 text-white bg-indigo-600 rounded-xl">
{icon}
</div>

</motion.div>

)

}