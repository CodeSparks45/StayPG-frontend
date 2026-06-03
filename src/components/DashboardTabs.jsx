import { motion } from "framer-motion";
import { Clock, AlertCircle, Star, TrendingUp, Users, Phone, Zap, Camera, Crown } from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";

// ── CONSTANTS ──────────────────────────────────
export const MILESTONES = [
  { id: 1, tenants: 5, title: "Fast-Reply Badge", icon: <Zap size={20} />, color: "from-blue-500 to-cyan-500" },
  { id: 2, tenants: 20, title: "Top-Slot Visibility", icon: <TrendingUp size={20} />, color: "from-amber-500 to-orange-500" },
  { id: 3, tenants: 50, title: "Featured Video Slot", icon: <Camera size={20} />, color: "from-purple-500 to-pink-500" },
  { id: 4, tenants: 100, title: "StayPG PRO (Lifetime)", icon: <Crown size={20} />, color: "from-green-500 to-emerald-500" },
];

export const AI_INSIGHTS = [
  { icon:TrendingUp, bg:"bg-emerald-50 dark:bg-emerald-900/30", border:"border-emerald-100 dark:border-emerald-800", color:"text-emerald-600 dark:text-emerald-400", title:"Raise rent by ₹500", text:"Demand in Shankar Nagar is 38% above supply this week." },
  { icon:AlertCircle,bg:"bg-red-50 dark:bg-red-900/30", border:"border-red-100 dark:border-red-800", color:"text-red-500 dark:text-red-400", title:"3 tenants haven't paid rent", text:"Auto-reminder sent to Priya, Ravi, Sneha." }
];

export function LeadsTab({ darkMode }) {
  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>Active Leads</h2>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} border rounded-2xl p-5`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold">U{i}</div>
              <div>
                <h3 className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Lead Name {i}</h3>
                <p className="text-xs text-slate-400">Interested in Shankar Nagar PG</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className={`flex-1 py-2 rounded-lg font-bold text-xs ${darkMode ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"}`}>Call</button>
              <button type="button" className="flex-1 py-2 rounded-lg bg-rose-500 text-white font-bold text-xs">Message</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsTab({ darkMode }) {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ label: "Views", data: [12, 19, 3, 5, 2, 3, 9], borderColor: "#f43f5e", tension: 0.4 }]
  };
  return (
    <div className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} border rounded-2xl p-6`}>
      <h4 className={`font-black mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>Weekly Views</h4>
      <div className="h-64"><Line data={data} options={{ maintainAspectRatio: false }} /></div>
    </div>
  );
}

export function AlertsTab({ darkMode }) {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} border rounded-2xl px-5 py-4 flex items-center gap-4`}>
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center"><Clock size={18} className="text-amber-600 dark:text-amber-400" /></div>
          <div className="flex-1">
            <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>Rent due from Tenant {i}</p>
            <p className="text-xs text-slate-400">Due in 2 days</p>
          </div>
          <button type="button" className="text-xs font-bold text-rose-500">Remind</button>
        </div>
      ))}
    </div>
  );
}

export function RevenueTab({ darkMode, totalRevenue }) {
  const donutData = {
    labels: ["Shankar Nagar","Civil Lines"],
    datasets: [{ data:[84000, 100000], backgroundColor:["#f43f5e","#fbbf24"], borderWidth:0 }]
  };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} border rounded-2xl p-6`}>
        <h3 className={`font-black text-lg ${darkMode ? "text-white" : "text-slate-900"} mb-6`}>Revenue Split</h3>
        <div className="flex justify-between items-center">
          <span className={darkMode ? "text-slate-300" : "text-slate-600"}>Total Revenue</span>
          <span className="text-2xl font-black text-rose-500">₹{(totalRevenue || 184000).toLocaleString("en-IN")}</span>
        </div>
      </div>
      <div className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} border rounded-2xl p-6 flex justify-center`}>
        <div className="h-44 w-44"><Doughnut data={donutData} options={{ maintainAspectRatio:false, plugins:{legend:{display:false}}, cutout:"70%" }} /></div>
      </div>
    </div>
  );
}

export function AITab({ darkMode }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-violet-600 to-rose-500 rounded-[2rem] p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><Star size={20} /></div>
          <div>
            <p className="font-black text-lg">AI Assistant</p>
            <p className="text-white/70 text-sm">Powered by GPT · Your personal PG business advisor</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {["Suggest optimal pricing", "Which amenities attract leads?", "Write a description", "How to get verified?"].map(q => (
            <button key={q} type="button" className="text-left text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 font-medium transition-all">✦ {q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}