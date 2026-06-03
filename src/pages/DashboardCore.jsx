import React, { useState, useEffect } from "react";
import AnimatedGuide from "./AnimatedGuide"; // Import the trendy guide
import { LayoutDashboard, Building2, Users, Wallet, BarChart2, Bell, Plus, Moon, Sun } from "lucide-react";
// ... (Import your other UI components like OverviewTab, PropertiesTab, etc. here)

// RICH DUMMY DATA INJECTION
const DUMMY_PROPERTIES = [
  { id: "d1", name: "StayPG Ultra", city: "Nagpur", area: "Shankar Nagar", price: 8500, type: "Boys", sharing: "Double", photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"] },
  { id: "d2", name: "StayPG Elite", city: "Pune", area: "Kothrud", price: 12000, type: "Girls", sharing: "Single", photos: ["https://images.unsplash.com/photo-1502672260266-1c1de2d9d0cb?w=500"] },
];

export default function DashboardCore() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showWizard, setShowWizard] = useState(false);
  
  // Use dummy data immediately if the database is empty to keep it looking like a $10M startup
  const [myPgs, setMyPgs] = useState(DUMMY_PROPERTIES); 
  const [isFirstTime, setIsFirstTime] = useState(true); // Control the animated guide

  // Toggle Dark Mode natively
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-72 hidden xl:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight">StayPG <span className="text-rose-500">PRO</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {/* Navigation Buttons */}
          {[
            { id: "overview", icon: <LayoutDashboard size={20} />, label: "Command Center" },
            { id: "properties", icon: <Building2 size={20} />, label: "Inventory" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setIsFirstTime(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group ${activeTab === t.id && !isFirstTime ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/10 scale-[1.02]" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              <div className={`${activeTab === t.id && !isFirstTime ? "text-rose-400 dark:text-rose-500" : "text-slate-400 group-hover:text-rose-500"} transition-colors`}>{t.icon}</div>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="mt-auto bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 flex relative mb-4">
          <div className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-white dark:bg-slate-700 rounded-xl shadow transition-transform duration-300 ${darkMode ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`} />
          <button onClick={() => setDarkMode(false)} className={`flex-1 py-2 flex justify-center items-center gap-2 relative z-10 font-bold text-xs ${!darkMode ? 'text-slate-900' : 'text-slate-500'}`}><Sun size={14}/> Light</button>
          <button onClick={() => setDarkMode(true)} className={`flex-1 py-2 flex justify-center items-center gap-2 relative z-10 font-bold text-xs ${darkMode ? 'text-white' : 'text-slate-500'}`}><Moon size={14}/> Dark</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="sticky top-0 z-40 bg-[#F8FAFC]/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black capitalize tracking-tight flex items-center gap-3">
            {isFirstTime ? "Welcome" : activeTab}
          </h1>
          <button 
            onClick={() => setShowWizard(true)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full font-black text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={16} className="stroke-[3px]" /> New Listing
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Injecting the highly requested Animated Guide */}
          {isFirstTime ? (
            <AnimatedGuide onComplete={() => { setIsFirstTime(false); setShowWizard(true); }} />
          ) : (
            <>
              {/* Add your OverviewTab or PropertiesTab here passing `myPgs` as props */}
              <h2 className="text-xl font-bold dark:text-white">Dashboard is Live.</h2>
              <p className="text-slate-500">Your dummy data has been successfully mapped.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}