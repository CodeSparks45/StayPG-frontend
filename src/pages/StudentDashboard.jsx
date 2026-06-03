import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard, Search, Heart, MapPin, Settings as SettingsIcon,
  HelpCircle, LogOut, Bell, Sun, Moon, Globe, Menu, X,
  Sparkles, ChevronDown, Check, User, Flame, Clock,
  Gift, Star, FileText, Zap, ChevronRight, Headphones, Tag
} from "lucide-react";

// Pages
import StudentHome   from "./StudentHome";
import Explore       from "./Explore";
import Wishlist      from "./Wishlist";
import MyLocation    from "./MyLocation";
import Profile       from "./Profile";
import Settings      from "./Settings";
import Help          from "./Help";

// Smart Feature Pages
import TrendingPGs      from "./Trendingpgs";
import RecentlyViewed   from "./Recentlyviewed";
import OffersDeals      from "./Offersdeals";
import MyReviews        from "./Myreviews";
import MyDocuments      from "./Mydocuments";
import ReferAndEarn     from "./Referandearn";

// ─── LANGUAGE DATA ────────────────────────────────────────────────────────
const LANGS = {
  en: { flag: "🇬🇧", label: "English",  nav: { dashboard:"Dashboard", explore:"Explore PGs", location:"My Location", wishlist:"Wishlist", profile:"Profile", settings:"Settings", help:"Help Center", signout:"Sign Out", trending:"Trending PGs", recent:"Recently Viewed", offers:"Offers & Deals", reviews:"My Reviews", documents:"My Documents", refer:"Refer & Earn" } },
  hi: { flag: "🇮🇳", label: "हिन्दी",   nav: { dashboard:"डैशबोर्ड", explore:"PG खोजें", location:"मेरी लोकेशन", wishlist:"विशलिस्ट", profile:"प्रोफ़ाइल", settings:"सेटिंग्स", help:"सहायता", signout:"लॉग आउट", trending:"ट्रेंडिंग", recent:"हाल ही में देखा", offers:"ऑफर्स", reviews:"मेरी समीक्षाएं", documents:"दस्तावेज़", refer:"रेफर करें" } },
  mr: { flag: "🇮🇳", label: "मराठी",   nav: { dashboard:"डॅशबोर्ड", explore:"PG शोधा", location:"माझे स्थान", wishlist:"इच्छासूची", profile:"प्रोफाइल", settings:"सेटिंग्ज", help:"मदत", signout:"साइन आउट", trending:"ट्रेंडिंग", recent:"नुकतेच पाहिले", offers:"ऑफर्स", reviews:"माझ्या रिव्ह्यू", documents:"कागदपत्रे", refer:"रेफर करा" } },
  te: { flag: "🇮🇳", label: "తెలుగు",  nav: { dashboard:"డాష్‌బోర్డ్", explore:"PG వెతకండి", location:"నా స్థానం", wishlist:"విష్‌లిస్ట్", profile:"ప్రొఫైల్", settings:"సెట్టింగ్‌లు", help:"సహాయం", signout:"సైన్ అవుట్", trending:"ట్రెండింగ్", recent:"ఇటీవల చూసారు", offers:"ఆఫర్లు", reviews:"నా సమీక్షలు", documents:"పత్రాలు", refer:"రెఫర్ చేయండి" } },
  ta: { flag: "🇮🇳", label: "தமிழ்",   nav: { dashboard:"டாஷ்போர்டு", explore:"PG தேடுங்கள்", location:"என் இடம்", wishlist:"விருப்பப்பட்டியல்", profile:"சுயவிவரம்", settings:"அமைப்புகள்", help:"உதவி", signout:"வெளியேறு", trending:"டிரெண்டிங்", recent:"சமீபத்தில் பார்த்தது", offers:"சலுகைகள்", reviews:"என் மதிப்புரைகள்", documents:"ஆவணங்கள்", refer:"பரிந்துரை" } },
};

const MAIN_NAV = [
  { id: "dashboard", icon: LayoutDashboard, key: "dashboard" },
  { id: "explore",   icon: Search,          key: "explore"   },
  { id: "location",  icon: MapPin,          key: "location"  },
  { id: "wishlist",  icon: Heart,           key: "wishlist"  },
];

const SMART_NAV = [
  { id: "trending",   icon: Flame,     key: "trending",   badge: "🔥 Hot",   badgeStyle: { background: "#fff0f2", color: "#f43f5e" } },
  { id: "recent",     icon: Clock,     key: "recent",     badge: null,       badgeStyle: {} },
  { id: "offers",     icon: Tag,       key: "offers",     badge: "3 New",    badgeStyle: { background: "#fef3c7", color: "#d97706" } },
  { id: "reviews",    icon: Star,      key: "reviews",    badge: null,       badgeStyle: {} },
  { id: "documents",  icon: FileText,  key: "documents",  badge: null,       badgeStyle: {} },
  { id: "refer",      icon: Zap,       key: "refer",      badge: "₹200",     badgeStyle: { background: "#fff0f2", color: "#f43f5e" } },
];

const ACCOUNT_NAV = [
  { id: "profile",  icon: User,          key: "profile"  },
  { id: "settings", icon: SettingsIcon,  key: "settings" },
  { id: "help",     icon: Headphones,    key: "help"     },
];

// ─── LANG SWITCHER ─────────────────────────────────────────────────────────
function LangSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold"
        style={{ background: "#fff0f2", color: "#f43f5e" }}>
        <Globe size={12} />{LANGS[lang]?.flag}<ChevronDown size={9} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="absolute right-0 top-10 w-36 rounded-2xl shadow-xl overflow-hidden z-50"
              style={{ background: "white", border: "1.5px solid #fecdd3" }}>
              {Object.entries(LANGS).map(([code, { flag, label }]) => (
                <button key={code} onClick={() => { setLang(code); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-left transition-colors"
                  style={lang === code ? { background: "#fff0f2", color: "#f43f5e" } : { color: "#374151" }}>
                  {flag} {label}
                  {lang === code && <Check size={9} className="ml-auto" style={{ color: "#f43f5e" }} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SIDEBAR ITEM ───────────────────────────────────────────────────────────
function SidebarItem({ icon: Icon, label, active, onClick, badge, badgeStyle }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200"
      style={active
        ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white", boxShadow: "0 4px 15px rgba(244,63,94,0.3)" }
        : { color: "#6b7280" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#fff0f2"; e.currentTarget.style.color = "#f43f5e"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1 text-left truncate">{label}</span>
      {badge && (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={active ? { background: "rgba(255,255,255,0.25)", color: "white" } : badgeStyle}>
          {badge}
        </span>
      )}
    </motion.button>
  );
}

// ─── SECTION LABEL ──────────────────────────────────────────────────────────
function SectionLabel({ text }) {
  return <p className="text-[9px] font-black uppercase tracking-widest px-3 pt-4 pb-1.5" style={{ color: "#d1d5db" }}>{text}</p>;
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { lang, setLang, dark, setDark } = useApp();
  const [activeTab, setActiveTab]   = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifOpen, setNotifOpen]   = useState(false);

  const t = LANGS[lang]?.nav || LANGS.en.nav;

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) setUserProfile(snap.data());
    };
    load();
  }, []);

  useEffect(() => {
    const wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlistCount(wl.length);
  }, [activeTab]);

  const navigate = (tab) => { setActiveTab(tab); setMobileOpen(false); };
  const handleLogout = () => { auth.signOut(); window.location.href = "/login"; };

  const emailInitial = auth.currentUser?.email?.[0]?.toUpperCase() || "S";
  const displayName  = userProfile?.name || auth.currentUser?.email?.split("@")[0] || "Student";

  const renderTab = () => {
    const props = { setActiveTab: navigate, lang, dark };
    switch (activeTab) {
      case "dashboard":  return <StudentHome  {...props} goExplore={() => navigate("explore")} />;
      case "explore":    return <Explore      {...props} />;
      case "wishlist":   return <Wishlist     {...props} />;
      case "location":   return <MyLocation   {...props} />;
      case "profile":    return <Profile      {...props} userProfile={userProfile} />;
      case "settings":   return <Settings     {...props} />;
      case "help":       return <Help         {...props} />;
      // Smart features — LIVE pages
      case "trending":   return <TrendingPGs  {...props} />;
      case "recent":     return <RecentlyViewed {...props} />;
      case "offers":     return <OffersDeals  {...props} />;
      case "reviews":    return <MyReviews    {...props} />;
      case "documents":  return <MyDocuments  {...props} />;
      case "refer":      return <ReferAndEarn {...props} />;
      default:           return <StudentHome  {...props} goExplore={() => navigate("explore")} />;
    }
  };

  const currentLabel = () => {
    const all = [...MAIN_NAV, ...SMART_NAV, ...ACCOUNT_NAV];
    return t[all.find(n => n.id === activeTab)?.key] || t.dashboard;
  };

  // No dark background by default — pure pink/white
  const pageBg = dark
    ? "bg-slate-950"
    : "";
  const pageStyle = dark ? {} : {
    background: "linear-gradient(160deg, #fff5f7 0%, #ffffff 50%, #fef2f4 100%)"
  };

  const sidebarStyle = dark
    ? { background: "#0f172a", borderColor: "#1e293b" }
    : { background: "white", borderColor: "#ffe4e6" };

  const headerStyle = dark
    ? { background: "rgba(15,23,42,0.9)", borderColor: "#1e293b" }
    : { background: "rgba(255,255,255,0.88)", borderColor: "#ffe4e6", backdropFilter: "blur(16px)" };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${pageBg}`} style={pageStyle}>

      {/* ── SIDEBAR ── */}
      <aside className="fixed lg:relative inset-y-0 left-0 z-50 w-64 flex flex-col border-r shadow-xl lg:shadow-none transition-transform duration-300"
        style={{ ...sidebarStyle, transform: mobileOpen ? "translateX(0)" : undefined }}
        data-mobile-open={mobileOpen}>
        <style>{`.fixed.lg\\:relative { transform: ${mobileOpen ? "translateX(0)" : "translateX(-100%)"}; } @media (min-width: 1024px) { .fixed.lg\\:relative { transform: translateX(0) !important; position: relative !important; } }`}</style>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: "1.5px solid #ffe4e6" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            <span className="text-white font-black text-sm">SP</span>
          </div>
          <div>
            <div className="font-black text-lg leading-none" style={{ color: "#111827" }}>
              Stay<span style={{ color: "#f43f5e" }}>PG</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>Student</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X size={18} style={{ color: "#9ca3af" }} />
          </button>
        </div>

        {/* User card → opens profile */}
        <button onClick={() => navigate("profile")}
          className="mx-3 my-3 flex items-center gap-3 p-3 rounded-2xl transition-all"
          style={{ background: "#fff8f9", border: "1.5px solid #fecdd3" }}
          onMouseEnter={e => e.currentTarget.style.background = "#fff0f2"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff8f9"}>
          <div className="w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>{emailInitial}</div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-black truncate" style={{ color: "#111827" }}>{displayName}</p>
            <p className="text-[10px] truncate" style={{ color: "#9ca3af" }}>{auth.currentUser?.email}</p>
          </div>
          <ChevronRight size={13} style={{ color: "#d1d5db" }} className="flex-shrink-0" />
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 py-1 overflow-y-auto">
          <SectionLabel text="Navigation" />
          {MAIN_NAV.map(item => (
            <SidebarItem key={item.id}
              icon={item.icon} label={t[item.key]}
              active={activeTab === item.id}
              onClick={() => navigate(item.id)}
              badge={item.id === "wishlist" && wishlistCount > 0 ? String(wishlistCount) : null}
              badgeStyle={{ background: "#fff0f2", color: "#f43f5e" }}
            />
          ))}

          <SectionLabel text="Smart Features" />
          {SMART_NAV.map(item => (
            <SidebarItem key={item.id}
              icon={item.icon} label={t[item.key]}
              active={activeTab === item.id}
              onClick={() => navigate(item.id)}
              badge={item.badge} badgeStyle={item.badgeStyle}
            />
          ))}

          <SectionLabel text="Account" />
          {ACCOUNT_NAV.map(item => (
            <SidebarItem key={item.id}
              icon={item.icon} label={t[item.key]}
              active={activeTab === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 pt-3" style={{ borderTop: "1.5px solid #ffe4e6" }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all"
            style={{ color: "#9ca3af" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff0f2"; e.currentTarget.style.color = "#f43f5e"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9ca3af"; }}>
            <LogOut size={16} />{t.signout}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center gap-3 border-b"
          style={headerStyle}>
          <button className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#fff0f2", color: "#f43f5e" }}
            onClick={() => setMobileOpen(true)}>
            <Menu size={17} />
          </button>

          <h1 className="flex-1 font-black text-lg truncate" style={{ color: dark ? "white" : "#111827" }}>
            {currentLabel()}
          </h1>

          <div className="flex items-center gap-2">
            <LangSwitcher lang={lang} setLang={setLang} />

            <button onClick={() => setDark(!dark)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition"
              style={{ background: dark ? "#1e293b" : "#fff0f2", color: dark ? "#94a3b8" : "#f43f5e" }}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#fff0f2", color: "#f43f5e" }}>
                <Bell size={15} />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-12 w-72 rounded-2xl shadow-xl p-4 z-50"
                      style={{ background: "white", border: "1.5px solid #fecdd3" }}>
                      <p className="font-black text-sm mb-3" style={{ color: "#111827" }}>Notifications</p>
                      <div className="text-center py-6">
                        <Sparkles size={24} style={{ color: "#fda4af" }} className="mx-auto mb-2" />
                        <p className="text-xs" style={{ color: "#9ca3af" }}>All caught up! 🎉</p>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <button onClick={() => navigate("profile")}
              className="w-9 h-9 rounded-xl text-white text-sm font-black flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
              {emailInitial}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="p-4 md:p-6 max-w-7xl mx-auto w-full">
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden sticky bottom-0 z-30 flex items-center justify-around px-1 py-2 border-t"
          style={dark ? { background: "#0f172a", borderColor: "#1e293b" } : { background: "white", borderColor: "#ffe4e6" }}>
          {[...MAIN_NAV, ACCOUNT_NAV[0]].map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl relative transition-colors"
              style={{ color: activeTab === item.id ? "#f43f5e" : "#9ca3af" }}>
              <item.icon size={19} />
              <span className="text-[9px] font-bold">{t[item.key]?.split(" ")[0]}</span>
              {item.id === "wishlist" && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[8px] font-black rounded-full flex items-center justify-center"
                  style={{ background: "#f43f5e" }}>{wishlistCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}