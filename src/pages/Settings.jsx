import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { auth } from "../firebase";
import {
  Moon, Sun, Globe, Bell, Shield, Smartphone, Eye, Trash2,
  ChevronRight, Check, Lock, User, Volume2, VolumeX,
  Vibrate, RefreshCw, LogOut, Info, ExternalLink, MapPin,
  Heart, Zap, Star, AlertTriangle
} from "lucide-react";

const LANGS = {
  en: { flag: "🇬🇧", label: "English" },
  hi: { flag: "🇮🇳", label: "हिन्दी" },
  mr: { flag: "🇮🇳", label: "मराठी" },
  te: { flag: "🇮🇳", label: "తెలుగు" },
  ta: { flag: "🇮🇳", label: "தமிழ்" },
};

// Animated toggle switch
function Toggle({ value, onChange, color = "#f43f5e" }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{ background: value ? color : "#e2e8f0" }}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

// Section header
function SectionHeader({ title }) {
  return (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-6 first:mt-0 px-1">{title}</p>
  );
}

// Setting row
function SettingRow({ icon: Icon, iconColor, iconBg, title, desc, children, dangerous, onClick }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all group
        ${dangerous ? "hover:bg-red-50" : "hover:bg-rose-50/50"}`}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${dangerous ? "text-red-600" : "text-slate-900"}`}>{title}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5 truncate">{desc}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings({ dark, setDark, lang, setLang }) {
  // Use local state synced with props if not passed
  const appCtx = useApp();
  const isDark    = dark    !== undefined ? dark    : appCtx.dark;
  const setIsDark = setDark !== undefined ? setDark : appCtx.setDark;
  const curLang   = lang    !== undefined ? lang    : appCtx.lang;
  const setCurLang= setLang !== undefined ? setLang : appCtx.setLang;

  const [notifications, setNotifications]     = useState(true);
  const [emailAlerts, setEmailAlerts]         = useState(true);
  const [sound, setSound]                     = useState(true);
  const [vibration, setVibration]             = useState(true);
  const [locationAccess, setLocationAccess]   = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [langOpen, setLangOpen]               = useState(false);

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure? This will permanently delete your account and all data. This cannot be undone.")) {
      auth.currentUser?.delete().then(() => {
        window.location.href = "/login";
      }).catch(e => {
        if (e.code === "auth/requires-recent-login") {
          alert("For security, please log out and log back in before deleting your account.");
        }
      });
    }
  };

  const cardBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-rose-100/60";

  return (
    <div className="max-w-xl mx-auto pb-12 space-y-2">

      {/* ── APPEARANCE ── */}
      <SectionHeader title="Appearance" />
      <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
        <SettingRow icon={isDark ? Moon : Sun} iconBg={isDark ? "#1e293b" : "#fff0f2"} iconColor={isDark ? "#94a3b8" : "#f43f5e"}
          title="Theme" desc={isDark ? "Dark mode is on" : "Light mode (pink & white)"}>
          <Toggle value={isDark} onChange={setIsDark} color="#0f172a" />
        </SettingRow>

        {/* Language */}
        <div className={`border-t ${isDark ? "border-slate-800" : "border-rose-50"}`}>
          <div className="relative">
            <SettingRow icon={Globe} iconBg="#fff0f2" iconColor="#f43f5e"
              title="Language" desc={`${LANGS[curLang]?.flag} ${LANGS[curLang]?.label}`}
              onClick={() => setLangOpen(o => !o)}>
              <motion.div animate={{ rotate: langOpen ? 90 : 0 }}>
                <ChevronRight size={16} className="text-slate-400" />
              </motion.div>
            </SettingRow>
            <AnimatePresence>
              {langOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className={`grid grid-cols-2 gap-2 p-3 ${isDark ? "bg-slate-800" : "bg-rose-50/50"}`}>
                    {Object.entries(LANGS).map(([code, { flag, label }]) => (
                      <button key={code}
                        onClick={() => { setCurLang(code); setLangOpen(false); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                          ${curLang === code ? "text-white shadow-md" : isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-white text-slate-700 hover:bg-rose-50"}`}
                        style={curLang === code ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)" } : {}}>
                        <span className="text-base">{flag}</span>
                        <span className="flex-1 text-left">{label}</span>
                        {curLang === code && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <SectionHeader title="Notifications" />
      <div className={`rounded-3xl border overflow-hidden divide-y ${cardBg} ${isDark ? "divide-slate-800" : "divide-rose-50"}`}>
        <SettingRow icon={Bell} iconBg="#fff0f2" iconColor="#f43f5e"
          title="Push Notifications" desc="Booking updates, owner messages">
          <Toggle value={notifications} onChange={setNotifications} />
        </SettingRow>
        <SettingRow icon={Zap} iconBg="#fef3c7" iconColor="#d97706"
          title="Email Alerts" desc="Receipts, confirmations, offers">
          <Toggle value={emailAlerts} onChange={setEmailAlerts} color="#d97706" />
        </SettingRow>
        <SettingRow icon={sound ? Volume2 : VolumeX} iconBg="#f0fdf4" iconColor="#16a34a"
          title="Sound" desc="Notification sounds">
          <Toggle value={sound} onChange={setSound} color="#16a34a" />
        </SettingRow>
        <SettingRow icon={Vibrate} iconBg="#eff6ff" iconColor="#2563eb"
          title="Vibration" desc="Haptic feedback">
          <Toggle value={vibration} onChange={setVibration} color="#2563eb" />
        </SettingRow>
      </div>

      {/* ── PRIVACY & LOCATION ── */}
      <SectionHeader title="Privacy & Location" />
      <div className={`rounded-3xl border overflow-hidden divide-y ${cardBg} ${isDark ? "divide-slate-800" : "divide-rose-50"}`}>
        <SettingRow icon={MapPin} iconBg="#fff0f2" iconColor="#f43f5e"
          title="Location Access" desc="Required for nearby PG search">
          <Toggle value={locationAccess} onChange={setLocationAccess} />
        </SettingRow>
        <SettingRow icon={Eye} iconBg="#f5f3ff" iconColor="#7c3aed"
          title="Profile Visibility" desc="Public · Others can see your reviews">
          <ChevronRight size={16} className="text-slate-400" />
        </SettingRow>
        <SettingRow icon={Shield} iconBg="#f0fdf4" iconColor="#16a34a"
          title="Data & Privacy Policy" desc="Read how we handle your data">
          <ExternalLink size={14} className="text-slate-400" />
        </SettingRow>
      </div>

      {/* ── ACCOUNT ── */}
      <SectionHeader title="Account" />
      <div className={`rounded-3xl border overflow-hidden divide-y ${cardBg} ${isDark ? "divide-slate-800" : "divide-rose-50"}`}>
        <SettingRow icon={User} iconBg="#fff0f2" iconColor="#f43f5e"
          title="Edit Profile" desc="Update your name, college, photo">
          <ChevronRight size={16} className="text-slate-400" />
        </SettingRow>
        <SettingRow icon={Lock} iconBg="#fef3c7" iconColor="#d97706"
          title="Change Password" desc="Update your account password">
          <ChevronRight size={16} className="text-slate-400" />
        </SettingRow>
        <SettingRow icon={Smartphone} iconBg="#eff6ff" iconColor="#2563eb"
          title="Active Sessions" desc="Logged in on 1 device">
          <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black">SECURE</span>
        </SettingRow>
        <SettingRow icon={RefreshCw} iconBg="#f8fafc" iconColor="#64748b"
          title="App Version" desc="StayPG v2.1.0 · Up to date">
          <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-black">LATEST</span>
        </SettingRow>
      </div>

      {/* ── DANGER ZONE ── */}
      <SectionHeader title="Danger Zone" />
      <div className="rounded-3xl border border-red-100 overflow-hidden">
        <SettingRow icon={LogOut} iconBg="#fef2f2" iconColor="#ef4444"
          title="Sign Out" desc="Log out from this device" dangerous
          onClick={() => { auth.signOut(); window.location.href = "/login"; }}>
          <ChevronRight size={16} className="text-red-300" />
        </SettingRow>
        <div className="border-t border-red-50">
          <SettingRow icon={Trash2} iconBg="#fef2f2" iconColor="#ef4444"
            title="Delete Account" desc="Permanently remove all your data" dangerous
            onClick={handleDeleteAccount}>
            <AlertTriangle size={14} className="text-red-400" />
          </SettingRow>
        </div>
      </div>

      {/* ── APP INFO ── */}
      <div className="text-center py-6">
        <div className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-md"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
          <span className="text-white font-black text-sm">SP</span>
        </div>
        <p className="text-sm font-black text-slate-400">StayPG v2.1.0</p>
        <p className="text-xs text-slate-300 mt-1">Made with ❤️ for students across India</p>
      </div>
    </div>
  );
}