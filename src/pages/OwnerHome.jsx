import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Home, Users, Wallet, Plus, TrendingUp, MoreVertical } from "lucide-react";

export default function OwnerHome() {
  const stats = [
    { label: "Total Properties", value: "12", icon: Home, color: "bg-blue-500" },
    { label: "Active Tenants", value: "48", icon: Users, color: "bg-purple-500" },
    { label: "Monthly Revenue", value: "₹5.2L", icon: Wallet, color: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Property Console</h1>
          <p className="text-slate-500 font-medium">Welcome back, manage your listings and revenue.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200"
        >
          <Plus size={20} /> List New Property
        </motion.button>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6"
          >
            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* RECENT PROPERTIES / ACTIVITY */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">Your Properties</h3>
            <button className="text-slate-400 hover:text-slate-900 transition-colors"><MoreVertical size={20} /></button>
          </div>
          
          {/* MOCK PROPERTY LIST */}
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="group flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=200" className="w-full h-full object-cover" alt="property" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">Royal Heights PG</h4>
                  <p className="text-slate-400 text-sm font-medium">Navi Mumbai • 24 Units</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">₹1.2L</p>
                  <p className="text-emerald-500 text-xs font-bold">Invoiced</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
           <div className="relative z-10">
              <TrendingUp className="text-rose-500 mb-6" size={40} />
              <h3 className="text-2xl font-black mb-2 italic">Growth Insights</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Your occupancy rate is up by 12% this month. Good job!</p>
              <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black hover:bg-rose-500 hover:text-white transition-all">View Reports</button>
           </div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}