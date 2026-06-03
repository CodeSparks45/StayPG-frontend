import { useState, useEffect, useRef, useCallback } from "react";
import { db, auth, storage } from "../firebase";
import {
  collection, addDoc, query, where, onSnapshot,
  serverTimestamp, doc, updateDoc, deleteDoc, getDocs, orderBy, limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  LayoutDashboard, Building2, Plus, X, Loader2, MapPin,
  Wifi, Wind, Utensils, Zap, Camera, LogOut, Users, Wallet,
  Sparkles, Bell, TrendingUp, ChevronRight, CheckCircle2,
  AlertCircle, Star, Phone, Edit2, Trash2, Eye, BarChart2,
  Shield, Clock, Home, Search, Filter, RefreshCw,
  Flame, Target, Award, Globe, ChevronDown,
  ArrowUpRight, Inbox, Copy, Check, Info,
  DollarSign, Activity, MessageCircle,
  Image as ImageIcon, AlertTriangle, Sun, Moon, Lock,
  Headphones, User as UserIcon, Settings as SettingsIcon
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Filler, Legend, ArcElement
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler, Legend, ArcElement);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CITIES = ["Delhi","Mumbai","Bangalore","Pune","Noida","Gurgaon","Kota","Nagpur","Hyderabad","Chennai","Jaipur","Ahmedabad","Chandigarh","Bhopal","Indore"];
const AMENITIES_LIST = [
  { id:"wifi",      label:"WiFi",       icon:Wifi,      desc:"High-speed internet" },
  { id:"ac",        label:"AC Rooms",   icon:Wind,      desc:"Air conditioned" },
  { id:"food",      label:"Meals",      icon:Utensils,  desc:"Breakfast & dinner" },
  { id:"laundry",   label:"Laundry",    icon:Zap,       desc:"Washing machine" },
  { id:"parking",   label:"Parking",    icon:Shield,    desc:"2-wheeler / 4-wheeler" },
  { id:"cctv",      label:"CCTV",       icon:Eye,       desc:"24×7 surveillance" },
  { id:"gym",       label:"Gym",        icon:Activity,  desc:"Fitness centre" },
  { id:"hot_water", label:"Hot Water",  icon:Flame,     desc:"Geyser every floor" },
];
const EMPTY_FORM = {
  name:"", city:"Nagpur", area:"", price:"", contact:"",
  type:"Boys", sharing:"Double", rooms:"", floor:"",
  deposit:"", address:"", description:"", rules:"", amenities:[], photoUrl:""
};

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────────
const LANGS = {
  en: { code:"en", label:"English", flag:"🇬🇧" },
  hi: { code:"hi", label:"हिन्दी",  flag:"🇮🇳" },
  mr: { code:"mr", label:"मराठी",   flag:"🇮🇳" },
  te: { code:"te", label:"తెలుగు",  flag:"🇮🇳" },
  ta: { code:"ta", label:"தமிழ்",   flag:"🇮🇳" },
};
const T = {
  en: {
    overview:"Overview", properties:"Properties", leads:"Leads", revenue:"Revenue",
    ai:"AI Assistant", analytics:"Analytics", alerts:"Alerts", addProperty:"+ Add Property",
    signOut:"Sign out", search:"Search properties, leads…", upgrade:"Upgrade to Elite",
    noProperties:"No properties listed yet", noPropertiesDesc:"Add your first PG to start receiving leads from students.",
    listFirst:"List My PG — It's Free →", monthly:"Monthly Revenue", occupancy:"Avg Occupancy",
    activeLeads:"Active Leads", rating:"Avg Rating",
    publish:"Publish Now 🚀", saveChanges:"Save Changes", back:"Back", next:"Continue →",
    publishingLive:"Going live…", saving:"Saving…",
    deleteConfirm:"Delete this property? This cannot be undone.",
    noLeadsYet:"No leads yet — they'll appear once your PG is live.",
    totalLeads:"Total leads", hotLeads:"Hot leads", converted:"Converted",
    editProperty:"Edit Property", listProperty:"List Your Property",
    photoTip1:"Good lighting", photoTip2:"Show entrance", photoTip3:"Wide angle",
    pgName:"PG name", pgNamePlaceholder:"e.g. Sunshine Boys PG",
    city:"City", area:"Area / locality", areaPlaceholder:"e.g. Shankar Nagar",
    whatsapp:"WhatsApp / Phone", whatsappPlaceholder:"+91 98765 43210",
    address:"Full address", addressPlaceholder:"House no, street, landmark, city",
    aboutPg:"About this PG", aboutPlaceholder:"Describe your PG — nearby colleges, why tenants love it…",
    rent:"Monthly rent (₹)", deposit:"Security deposit (₹)", totalRooms:"Total rooms",
    floor:"Floor", pgType:"PG type", sharingType:"Sharing type", houseRules:"House rules",
    houseRulesPlaceholder:"e.g. No smoking, no pets, guests allowed till 10pm",
    whatYouOffer:"What do you offer?", readiness:"Readiness checklist",
    photoUploaded:"Photo uploaded", pgNameSet:"PG name added", cityAreaSet:"City & area set",
    contactSet:"Contact number", rentSet:"Rent defined", amenitiesAdded:"Amenities selected",
    competitive:"competitive! Great price 🔥", goodPrice:"Looks good.",
    avgRent:"Average rent in", isRange:"is ₹6,000–₹9,000/mo. Your price is",
    manageProps:"Manage your PG business", filter:"Filter",
    propCountPlural:"ies", propCountSingle:"y",
    copy:"Copy link", notifications:"Notifications",
    upgradeDesc:"AI pricing + unlimited listings", upgradeBtn:"Upgrade Plan",
    thisMonth:"This month", totalEarned:"Total earned",
    pendingRent:"Pending rent", revenueByProp:"Revenue by property", shareOfRevenue:"Share of revenue",
    noPgRevenue:"Add properties to see revenue", revenueTrend:"Revenue trend",
    profileCompletion:"Profile completion", responseRate:"Response rate",
    conversionRate:"Conversion rate", viewsVsLeads:"Views vs Leads",
    smartAlerts:"Smart alerts", hotLeadLabel:"Hot 🔥",
    warmLabel:"Warm", newLabel:"New", leadPipeline:"Lead pipeline", byUrgency:"By urgency",
    noAlertsYet:"All clear — no alerts right now.",
    onboardingProgress:"Your setup progress", whyStayPg:"Why StayPG PRO?",
    enquiries:"3× more enquiries vs others", activeSearchers:"50K+ active students/month",
    alwaysFree:"Listing is always free", ownerScore:"4.8★ owner satisfaction",
    accountCreated:"Account created ✓", addFirstPg:"List your first PG",
    getVerified:"Get verified badge", receiveLeads:"Receive student leads",
    addPgDesc:"Takes 2 minutes. Just 5 steps.",
    verifiedDesc:"Upload ID for trust badge.",
    receiveLeadsDesc:"Students contact you directly.",
    startNow:"Start now",
    heroTitle:"One step away from your first lead",
    heroDesc:"Thousands of students search for PGs in your city every day. Get listed in under 2 minutes.",
    step1:"Upload Photo", step2:"Basic Details", step3:"Price & Rooms",
    step4:"Amenities", step5:"Review & Go Live",
    stepDesc1:"A clear front photo gets 3× more enquiries",
    stepDesc2:"Name, city, area — so students can find you",
    stepDesc3:"Rent, deposit and available rooms",
    stepDesc4:"Tick what you offer: WiFi, AC, food…",
    stepDesc5:"Double-check everything and go live",
  },
  hi: {
    overview:"अवलोकन", properties:"प्रॉपर्टीज़", leads:"लीड्स", revenue:"आय",
    ai:"AI सहायक", analytics:"विश्लेषण", alerts:"अलर्ट", addProperty:"+ प्रॉपर्टी जोड़ें",
    signOut:"साइन आउट", search:"प्रॉपर्टी, लीड खोजें…",
    noProperties:"अभी कोई PG नहीं", noPropertiesDesc:"पहला PG जोड़ें और छात्रों से लीड पाएं।",
    listFirst:"मेरा PG लिस्ट करें — बिल्कुल फ्री →",
    publish:"अभी पब्लिश करें 🚀", saveChanges:"बदलाव सेव करें", back:"वापस", next:"आगे →",
    deleteConfirm:"इस प्रॉपर्टी को हटाएं?",
    heroTitle:"पहली लीड से एक कदम दूर", heroDesc:"हर दिन हजारों छात्र आपके शहर में PG ढूंढते हैं।",
    startNow:"अभी शुरू करें", manageProps:"अपना PG व्यवसाय मैनेज करें",
    step1:"फोटो अपलोड", step2:"बेसिक जानकारी", step3:"कीमत और रूम",
    step4:"सुविधाएं", step5:"समीक्षा और लाइव",
  },
  mr: {
    overview:"आढावा", properties:"मालमत्ता", leads:"लीड्स", revenue:"उत्पन्न",
    ai:"AI सहाय्यक", analytics:"विश्लेषण", alerts:"सूचना", addProperty:"+ मालमत्ता जोडा",
    signOut:"साइन आउट", search:"मालमत्ता, लीड शोधा…",
    noProperties:"अद्याप कोणतेही PG नाही", noPropertiesDesc:"पहिले PG जोडा आणि विद्यार्थ्यांकडून लीड मिळवा.",
    listFirst:"माझे PG लिस्ट करा — पूर्णपणे मोफत →",
    publish:"आता प्रकाशित करा 🚀", saveChanges:"बदल सेव्ह करा", back:"मागे", next:"पुढे →",
    deleteConfirm:"ही मालमत्ता हटवायची?",
    heroTitle:"पहिल्या लीडपासून एक पाऊल दूर", heroDesc:"दररोज हजारो विद्यार्थी तुमच्या शहरात PG शोधतात.",
    startNow:"आता सुरू करा", manageProps:"तुमचा PG व्यवसाय व्यवस्थापित करा",
    step1:"फोटो अपलोड", step2:"मूलभूत माहिती", step3:"किंमत आणि खोल्या",
    step4:"सुविधा", step5:"तपासा आणि लाइव्ह जा",
  },
};
function useT(lang) { return (key) => (T[lang]?.[key] || T.en[key] || key); }

// ─── FIRESTORE HOOKS ──────────────────────────────────────────────────────────
function useMyPgs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!auth.currentUser) { setLoading(false); return; }
    const q = query(collection(db, "pgs"), where("ownerId","==",auth.currentUser.uid));
    const unsub = onSnapshot(q, snap => { setPgs(snap.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false); }, ()=>setLoading(false));
    return unsub;
  }, []);
  return { pgs, loading };
}
function useLeads(pgIds) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!pgIds?.length) { setLeads([]); return; }
    setLoading(true);
    const q = query(collection(db,"leads"), where("pgId","in",pgIds.slice(0,10)), orderBy("createdAt","desc"), limit(50));
    const unsub = onSnapshot(q, snap=>{ setLeads(snap.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false); }, ()=>setLoading(false));
    return unsub;
  }, [pgIds?.join(",")]);
  return { leads, loading };
}
function useAlerts(pgIds) {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    if (!pgIds?.length) return;
    const q = query(collection(db,"alerts"), where("ownerId","==",auth.currentUser?.uid), orderBy("createdAt","desc"), limit(20));
    const unsub = onSnapshot(q, snap=>setAlerts(snap.docs.map(d=>({id:d.id,...d.data()}))), ()=>{});
    return unsub;
  }, [pgIds?.join(",")]);
  return alerts;
}

// ─── SHARED UI ATOMS ──────────────────────────────────────────────────────────
function IBox({ label, type="text", value, onChange, placeholder="", required=false }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color: "#9ca3af" }}>
        {label}{required && <span style={{ color: "#f43f5e" }} className="ml-0.5">*</span>}
      </label>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl font-medium outline-none text-sm transition-all placeholder:text-slate-400"
        style={{ background: "#fff8f9", border: "1.5px solid #fecdd3", color: "#111827" }}
        onFocus={e=>e.target.style.borderColor="#f43f5e"}
        onBlur={e=>e.target.style.borderColor="#fecdd3"} />
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, bg, delay = 0 }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: bg || "white", border: `1.5px solid ${color}22` }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color }}><Icon size={18} /></div>
        <ArrowUpRight size={13} style={{ color: `${color}50` }} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "#111827" }}>{value}</p>
        <p className="text-xs font-bold mt-0.5" style={{ color: "#6b7280" }}>{label}</p>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, desc, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#fff0f2" }}><Icon size={28} style={{ color: "#fda4af" }} /></div>
      <p className="font-black text-sm mb-1" style={{ color: "#374151" }}>{title}</p>
      <p className="text-sm mb-6 max-w-xs" style={{ color: "#9ca3af" }}>{desc}</p>
      {action && (
        <button onClick={action} className="px-6 py-2.5 text-white rounded-xl text-sm font-black shadow-md transition-all"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 4px 16px rgba(244,63,94,0.3)" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── SIDEBAR NAV ITEM ─────────────────────────────────────────────────────────
function SBtn({ icon: Icon, label, active, onClick, badge, badgeColor = "#f43f5e" }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 relative"
      style={active
        ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white", boxShadow: "0 4px 15px rgba(244,63,94,0.3)" }
        : { color: "#6b7280" }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background="#fff0f2"; e.currentTarget.style.color="#f43f5e"; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6b7280"; }}}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: "rgba(255,255,255,0.4)" }} />}
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1 text-left truncate">{label}</span>
      {badge && (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={active ? { background: "rgba(255,255,255,0.25)", color: "white" } : { background: `${badgeColor}15`, color: badgeColor }}>
          {badge}
        </span>
      )}
    </motion.button>
  );
}

function SectionLabel({ text }) {
  return <p className="text-[9px] font-black uppercase tracking-widest px-3 pt-4 pb-1.5" style={{ color: "#d1d5db" }}>{text}</p>;
}

// ─── LANG SWITCHER ────────────────────────────────────────────────────────────
function LangSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o=>!o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold"
        style={{ background: "#fff0f2", color: "#f43f5e" }}>
        <Globe size={12} />{LANGS[lang]?.flag}<ChevronDown size={9} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:6, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:6 }}
            className="absolute right-0 top-10 w-36 rounded-2xl shadow-xl overflow-hidden z-50"
            style={{ background: "white", border: "1.5px solid #fecdd3" }}>
            {Object.values(LANGS).map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold transition-colors text-left"
                style={lang===l.code ? { background:"#fff0f2", color:"#f43f5e" } : { color:"#374151" }}>
                {l.flag} {l.label}
                {lang===l.code && <Check size={9} className="ml-auto" style={{ color:"#f43f5e" }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EXTRAORDINARY STEP DEFINITIONS ──────────────────────────────────────────
const STEP_DEFS = [
  {
    id: 1, stepKey: "step1", descKey: "stepDesc1",
    icon: Camera, color: "#f43f5e", lightBg: "#fff0f2",
    Visual: () => (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="relative">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fff0f2, #fce7f3)", border: "2px solid #fecdd3" }}>
            <Camera size={48} style={{ color: "#f43f5e" }} />
          </div>
          {/* Flash sparkles */}
          {[0,1,2,3].map(i => (
            <motion.div key={i}
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: "#f43f5e",
                top: i < 2 ? -6 : "auto", bottom: i >= 2 ? -6 : "auto",
                left: i % 2 === 0 ? -6 : "auto", right: i % 2 !== 0 ? -6 : "auto"
              }} />
          ))}
        </motion.div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <motion.div key={i} animate={{ scale:[1,1.4,1], opacity:[0.4,1,0.4] }}
              transition={{ repeat:Infinity, duration:1.5, delay:i*0.25 }}
              className="w-2 h-2 rounded-full" style={{ background: "#f43f5e" }} />
          ))}
        </div>
        <p className="text-[10px] font-black" style={{ color: "#f43f5e" }}>TAP TO UPLOAD</p>
      </div>
    ),
  },
  {
    id: 2, stepKey: "step2", descKey: "stepDesc2",
    icon: Home, color: "#2563eb", lightBg: "#eff6ff",
    Visual: () => (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        {["PG Name ✓", "City ✓", "Area ✓"].map((label, i) => (
          <motion.div key={label}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.2, type: "spring", stiffness: 200 }}
            className="w-40 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2"
            style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", color: "#2563eb" }}>
            <CheckCircle2 size={13} />
            {label}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 3, stepKey: "step3", descKey: "stepDesc3",
    icon: Wallet, color: "#16a34a", lightBg: "#f0fdf4",
    Visual: () => (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <motion.div animate={{ scale:[1,1.07,1] }} transition={{ repeat:Infinity, duration:2 }}>
          <p className="text-4xl font-black" style={{ color: "#16a34a" }}>₹6,500</p>
          <p className="text-xs font-bold text-center mt-1" style={{ color: "#9ca3af" }}>per month</p>
        </motion.div>
        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.2, delay: 0.3 }}
          className="h-1.5 rounded-full mt-3" style={{ background: "#16a34a", maxWidth: 100 }} />
        <p className="text-[10px] font-black" style={{ color: "#16a34a" }}>COMPETITIVE PRICE 🔥</p>
      </div>
    ),
  },
  {
    id: 4, stepKey: "step4", descKey: "stepDesc4",
    icon: Sparkles, color: "#7c3aed", lightBg: "#f5f3ff",
    Visual: () => (
      <div className="flex flex-wrap gap-2 items-center justify-center h-full p-3">
        {["WiFi", "AC", "Meals", "CCTV", "Gym"].map((a, i) => (
          <motion.div key={a}
            initial={{ scale:0, rotate: -10 }} animate={{ scale:1, rotate:0 }}
            transition={{ delay: i*0.12, type:"spring", stiffness:260 }}
            className="px-3 py-1.5 rounded-full text-xs font-black"
            style={{ background: "#f5f3ff", border: "1.5px solid #ddd6fe", color: "#7c3aed" }}>
            {a}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 5, stepKey: "step5", descKey: "stepDesc5",
    icon: CheckCircle2, color: "#f43f5e", lightBg: "#fff0f2",
    Visual: () => (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <motion.div animate={{ scale:[1,1.12,1] }} transition={{ repeat:Infinity, duration:2 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 8px 24px rgba(244,63,94,0.4)" }}>
          <CheckCircle2 size={36} className="text-white" />
        </motion.div>
        <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ repeat:Infinity, duration:1.5 }}
          className="text-xs font-black tracking-widest" style={{ color: "#f43f5e" }}>
          🎉 LIVE ON STAYPG
        </motion.div>
        {/* Confetti dots */}
        <div className="flex gap-2">
          {["#f43f5e","#7c3aed","#16a34a","#d97706"].map((c,i)=>(
            <motion.div key={i} animate={{ y:[0,-8,0] }} transition={{ repeat:Infinity, duration:1.2, delay:i*0.15 }}
              className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>
    ),
  },
];

// ─── EXTRAORDINARY FIRST-TIME / ONBOARDING VIEW ───────────────────────────────
function FirstTimeView({ onAdd, t }) {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay]     = useState(true);

  // Auto-cycle through steps
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => setActiveStep(s => (s + 1) % STEP_DEFS.length), 2500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const currentStep = STEP_DEFS[activeStep];
  const StepVisual  = currentStep.Visual;

  return (
    <div className="space-y-8">

      {/* ── HERO BANNER ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="relative rounded-[2rem] overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #fff0f2 0%, #fce7f3 50%, #fff1f2 100%)",
          border: "1.5px solid #fecdd3",
          boxShadow: "0 8px 40px rgba(244,63,94,0.12)"
        }}>
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #fda4af55, transparent)" }} />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #f9a8d433, transparent)" }} />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} transition={{ delay:0.1 }}
              className="inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full mb-5"
              style={{ background:"white", color:"#f43f5e", border:"1.5px solid #fecdd3", boxShadow:"0 2px 8px rgba(244,63,94,0.12)" }}>
              <Sparkles size={11} /> Welcome to StayPG PRO
            </motion.div>
            <h2 className="text-2xl md:text-4xl font-black leading-tight mb-3" style={{ color: "#111827" }}>
              {t("heroTitle")} <span style={{ color: "#f43f5e" }}>🚀</span>
            </h2>
            <p className="text-sm mb-7 max-w-md leading-relaxed" style={{ color: "#6b7280" }}>{t("heroDesc")}</p>
            <motion.button onClick={onAdd} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              className="flex items-center gap-2 px-7 py-4 text-white font-black rounded-2xl text-sm shadow-xl"
              style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow:"0 8px 24px rgba(244,63,94,0.35)" }}>
              <Plus size={18} /> {t("listFirst")}
            </motion.button>
            {/* Trust badges */}
            <div className="flex items-center gap-5 mt-6">
              {[
                { icon: Shield, label: "Verified Only", color: "#16a34a" },
                { icon: Zap,    label: "Instant Leads",  color: "#d97706" },
                { icon: Star,   label: "Free Listing",   color: "#f43f5e" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <item.icon size={12} style={{ color: item.color }} />
                  <span className="text-xs font-bold" style={{ color: "#374151" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Animated stat cluster */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full md:w-56">
            {[
              { stat:"3×",    label:"More enquiries",   color:"#f43f5e", bg:"white" },
              { stat:"50K+",  label:"Students/month",   color:"#7c3aed", bg:"white" },
              { stat:"Free",  label:"Always free",      color:"#16a34a", bg:"white" },
              { stat:"4.8★",  label:"Owner rating",     color:"#d97706", bg:"white" },
            ].map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1+i*0.08, type:"spring" }}
                className="rounded-2xl p-4 text-center"
                style={{ background:item.bg, border:`1.5px solid ${item.color}20`, boxShadow:"0 2px 12px rgba(244,63,94,0.06)" }}>
                <p className="text-xl font-black" style={{ color: item.color }}>{item.stat}</p>
                <p className="text-[9px] font-bold mt-0.5" style={{ color: "#9ca3af" }}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── EXTRAORDINARY STEP SHOWCASE ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#9ca3af" }}>
            How to list your PG — 5 simple steps
          </p>
          <button onClick={() => setAutoPlay(a=>!a)}
            className="text-[10px] font-black px-3 py-1.5 rounded-full transition-all"
            style={{ background: autoPlay ? "#fff0f2" : "#f0fdf4", color: autoPlay ? "#f43f5e" : "#16a34a" }}>
            {autoPlay ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>

        {/* Step progress bar */}
        <div className="flex gap-1.5 mb-6">
          {STEP_DEFS.map((s, i) => (
            <button key={s.id} onClick={() => { setActiveStep(i); setAutoPlay(false); }}
              className="relative flex-1 h-1.5 rounded-full overflow-hidden transition-all"
              style={{ background: "#ffe4e6" }}>
              {i === activeStep && (
                <motion.div className="absolute inset-0 rounded-full" style={{ background: s.color }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: autoPlay ? [0,1] : 1 }}
                  transition={{ duration: autoPlay ? 2.5 : 0.2, ease:"linear" }} />
              )}
              {i < activeStep && (
                <div className="absolute inset-0 rounded-full" style={{ background: s.color }} />
              )}
            </button>
          ))}
        </div>

        {/* Step content — big animated card */}
        <div className="grid md:grid-cols-5 gap-4">
          {/* Step thumbnail row */}
          <div className="md:col-span-5 grid grid-cols-5 gap-3">
            {STEP_DEFS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeStep;
              return (
                <motion.button key={step.id}
                  onClick={() => { setActiveStep(i); setAutoPlay(false); }}
                  animate={{ scale: isActive ? 1.04 : 1 }}
                  className="relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${step.color}18, ${step.color}08)` : "white",
                    border: isActive ? `2px solid ${step.color}40` : "1.5px solid #ffe4e6",
                    boxShadow: isActive ? `0 8px 24px ${step.color}18` : "0 2px 8px rgba(244,63,94,0.04)"
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? step.color : step.lightBg, color: isActive ? "white" : step.color }}>
                    <Icon size={17} />
                  </div>
                  <span className="text-[10px] font-black leading-tight text-center" style={{ color: isActive ? step.color : "#9ca3af" }}>
                    {t(step.stepKey)}
                  </span>
                  {/* Step number */}
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center"
                    style={{ background: isActive ? step.color : "#f8fafc", color: isActive ? "white" : "#9ca3af" }}>
                    {step.id}
                  </span>
                  {/* Active dot */}
                  {isActive && (
                    <motion.div animate={{ scale:[1,1.4,1] }} transition={{ repeat:Infinity, duration:1 }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ background: step.color }} />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Big active step showcase */}
          <AnimatePresence mode="wait">
            <motion.div key={activeStep}
              initial={{ opacity:0, y:16, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-12, scale:0.97 }}
              transition={{ duration:0.3, ease:"easeOut" }}
              className="md:col-span-5 rounded-[1.75rem] overflow-hidden flex flex-col md:flex-row"
              style={{ border:`2px solid ${currentStep.color}30`, boxShadow:`0 12px 40px ${currentStep.color}12` }}>

              {/* Visual panel */}
              <div className="md:w-72 h-52 md:h-auto flex-shrink-0 flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${currentStep.color}10, ${currentStep.color}05)` }}>
                {/* Big step number watermark */}
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
                  style={{ fontSize: 120, fontWeight: 900, color: `${currentStep.color}08`, lineHeight:1 }}>
                  {currentStep.id}
                </div>
                <StepVisual />
              </div>

              {/* Info panel */}
              <div className="flex-1 p-7 flex flex-col justify-center" style={{ background: "white" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: currentStep.lightBg, color: currentStep.color }}>
                    <currentStep.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${currentStep.color}90` }}>
                      Step {currentStep.id} of 5
                    </p>
                    <p className="font-black text-lg" style={{ color: "#111827" }}>{t(currentStep.stepKey)}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#6b7280" }}>{t(currentStep.descKey)}</p>

                {/* Step navigation */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setActiveStep(s => Math.max(0, s-1)); setAutoPlay(false); }}
                    disabled={activeStep === 0}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                    style={{ background: "#fff0f2", color: "#f43f5e" }}>
                    ← Back
                  </button>
                  {activeStep < STEP_DEFS.length - 1 ? (
                    <button
                      onClick={() => { setActiveStep(s => s+1); setAutoPlay(false); }}
                      className="px-5 py-2 rounded-xl text-sm font-black text-white transition-all"
                      style={{ background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}cc)` }}>
                      Next →
                    </button>
                  ) : (
                    <motion.button onClick={onAdd} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                      className="px-6 py-2.5 text-white text-sm font-black rounded-xl shadow-md"
                      style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow:"0 4px 16px rgba(244,63,94,0.35)" }}>
                      🚀 List My PG Now
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── SETUP CHECKLIST + WHY STAYPG ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Setup checklist */}
        <div className="rounded-[1.75rem] p-6" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <h3 className="font-black text-sm flex items-center gap-2 mb-5" style={{ color: "#111827" }}>
            <Target size={16} style={{ color: "#f43f5e" }} /> Your setup progress
          </h3>
          <div className="space-y-4">
            {[
              { label: t("accountCreated"), done: true  },
              { label: t("addFirstPg"),     done: false, action: true },
              { label: t("getVerified"),    done: false },
              { label: t("receiveLeads"),   done: false },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }}
                className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 border-2 transition-all"
                  style={item.done
                    ? { background:"#16a34a", borderColor:"#16a34a", color:"white" }
                    : { background:"white", borderColor:"#fecdd3", color:"#d1d5db" }}>
                  {item.done ? <Check size={14} /> : i+1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: item.done ? "#16a34a" : "#374151" }}>{item.label}</p>
                </div>
                {item.action && (
                  <button onClick={onAdd} className="text-xs font-black flex items-center gap-1" style={{ color:"#f43f5e" }}>
                    {t("startNow")} <ChevronRight size={12} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why StayPG */}
        <div className="rounded-[1.75rem] p-6" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <h3 className="font-black text-sm flex items-center gap-2 mb-5" style={{ color: "#111827" }}>
            <Award size={16} style={{ color: "#7c3aed" }} /> {t("whyStayPg")}
          </h3>
          <div className="space-y-4">
            {[
              { icon: Flame,      color:"#f43f5e", label: t("enquiries")      },
              { icon: Users,      color:"#2563eb", label: t("activeSearchers") },
              { icon: TrendingUp, color:"#16a34a", label: t("alwaysFree")     },
              { icon: Star,       color:"#d97706", label: t("ownerScore")      },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:`${item.color}12`, color:item.color }}>
                  <item.icon size={18} />
                </div>
                <p className="text-sm font-bold" style={{ color:"#374151" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ pgs, leads, alerts, t, onAdd }) {
  const totalRevenue = pgs.reduce((s,p)=>s+Number(p.price||0),0);
  const hotLeads     = leads.filter(l=>l.status==="hot");
  const avgRating    = pgs.length ? (pgs.reduce((s,p)=>s+(Number(p.rating)||0),0)/pgs.length).toFixed(1) : "–";
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";

  const chartData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun"],
    datasets:[{ fill:true, label:"Revenue",
      data:[0,0,0,0,0,totalRevenue].map((v,i)=>i===5?v:Math.floor(v*0.5+Math.random()*v*0.4)),
      borderColor:"#f43f5e", backgroundColor:"rgba(244,63,94,0.07)", tension:0.4, pointRadius:4, pointBackgroundColor:"#f43f5e"
    }]
  };

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="rounded-2xl px-6 py-4 flex items-center justify-between"
        style={{ background:"linear-gradient(135deg, #fff0f2, #fce7f3)", border:"1.5px solid #fecdd3" }}>
        <div>
          <h3 className="font-black text-lg" style={{ color:"#111827" }}>{greeting}! 👋</h3>
          <p className="text-sm mt-0.5" style={{ color:"#6b7280" }}>{pgs.length} active propert{pgs.length===1?"y":"ies"} · {leads.length} total leads</p>
        </div>
        {hotLeads.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
            style={{ background:"white", color:"#f43f5e", border:"1.5px solid #fecdd3" }}>
            <Flame size={13} /> {hotLeads.length} hot lead{hotLeads.length!==1?"s":""}
          </div>
        )}
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Monthly Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={Wallet}       color="#f43f5e" bg="#fff8f9" delay={0} />
        <KpiCard label="Active Leads"    value={String(leads.length)}                         icon={Users}        color="#2563eb" bg="#f8fbff" delay={0.05} />
        <KpiCard label="Total Views"     value={String(pgs.reduce((s,p)=>s+Number(p.views||0),0))} icon={Eye} color="#16a34a" bg="#f8fffe" delay={0.1} />
        <KpiCard label="Avg Rating"      value={avgRating}                                    icon={Star}         color="#d97706" bg="#fffdf5" delay={0.15} />
      </div>

      {pgs.length === 0 && <EmptyState icon={Building2} title={t("noProperties")} desc={t("noPropertiesDesc")} action={onAdd} actionLabel={t("listFirst")} />}

      {pgs.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Revenue chart */}
          <div className="rounded-2xl p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
            <p className="font-black text-sm flex items-center gap-2 mb-4" style={{ color:"#111827" }}>
              <BarChart2 size={15} style={{ color:"#f43f5e" }} /> {t("revenueTrend")}
            </p>
            <div className="h-44">
              <Line data={chartData} options={{ maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{display:false}, x:{grid:{display:false}} } }} />
            </div>
          </div>
          {/* Recent leads */}
          <div className="rounded-2xl p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
            <p className="font-black text-sm flex items-center gap-2 mb-4" style={{ color:"#111827" }}>
              <Users size={15} style={{ color:"#f43f5e" }} /> Recent Leads
            </p>
            {leads.length === 0
              ? <p className="text-sm" style={{ color:"#9ca3af" }}>{t("noLeadsYet")}</p>
              : leads.slice(0,4).map((l,i) => (
                <div key={l.id||i} className="flex items-center gap-3 py-2.5" style={{ borderBottom:"1px solid #fff0f2" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ background:"#fff0f2", color:"#f43f5e" }}>{(l.name||"?")[0].toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color:"#111827" }}>{l.name||"Anonymous"}</p>
                    <p className="text-[10px]" style={{ color:"#9ca3af" }}>{l.pgName||""}</p>
                  </div>
                  {l.phone && (
                    <a href={`tel:${l.phone}`} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background:"#f0fdf4", color:"#16a34a" }}>
                      <Phone size={11} />
                    </a>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROPERTIES TAB ───────────────────────────────────────────────────────────
function PropertiesTab({ pgs, loading, onEdit, onDelete, searchQ, t, onAdd }) {
  const [copied, setCopied] = useState(null);
  const filtered = pgs.filter(p =>
    (p.name||"").toLowerCase().includes((searchQ||"").toLowerCase()) ||
    (p.city||"").toLowerCase().includes((searchQ||"").toLowerCase())
  );
  const copyLink = (pg) => {
    navigator.clipboard.writeText(`https://staypg.in/pg/${pg.id}`);
    setCopied(pg.id); setTimeout(()=>setCopied(null),2000);
  };
  if (loading) return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0,1,2].map(i=>(
        <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <div className="h-44" style={{ background:"#fff0f2" }} />
          <div className="p-4 space-y-2">
            <div className="h-4 rounded-xl w-3/4" style={{ background:"#fff0f2" }} />
            <div className="h-3 rounded-xl w-1/2" style={{ background:"#fff8f9" }} />
          </div>
        </div>
      ))}
    </div>
  );
  if (filtered.length === 0) return <EmptyState icon={Building2} title={t("noProperties")} desc={t("noPropertiesDesc")} action={onAdd} actionLabel={t("listFirst")} />;
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold px-1" style={{ color:"#9ca3af" }}>
        {filtered.length} propert{filtered.length===1?t("propCountSingle"):t("propCountPlural")}
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((pg,i) => (
            <motion.div key={pg.id}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
              transition={{ delay:i*0.04 }} whileHover={{ y:-4, boxShadow:"0 16px 40px rgba(244,63,94,0.1)" }}
              className="rounded-2xl overflow-hidden group transition-all"
              style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
              <div className="h-44 relative overflow-hidden" style={{ background:"#fff0f2" }}>
                {pg.photoUrl
                  ? <img src={pg.photoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={pg.name} />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} style={{ color:"#fda4af" }} /></div>}
                <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase"
                  style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)" }}>{pg.type}</div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={()=>onEdit(pg)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm transition-all" style={{ color:"#2563eb" }}>
                    <Edit2 size={11} />
                  </button>
                  <button onClick={()=>onDelete(pg.id)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm transition-all" style={{ color:"#f43f5e" }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black truncate" style={{ color:"#111827" }}>{pg.name}</h3>
                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color:"#9ca3af" }}>
                  <MapPin size={10} />{pg.area}, {pg.city}
                </p>
                <div className="flex items-center gap-3 mt-3 pt-3 text-xs" style={{ borderTop:"1px solid #fff0f2", color:"#9ca3af" }}>
                  <span className="flex items-center gap-1"><Eye size={10} /> {pg.views||0}</span>
                  <span className="flex items-center gap-1"><Users size={10} /> {pg.leads||0} leads</span>
                  <span className="flex items-center gap-1 ml-auto"><Star size={10} style={{ color:"#fbbf24" }} /> {pg.rating||"–"}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-black text-lg" style={{ color:"#f43f5e" }}>
                    ₹{Number(pg.price||0).toLocaleString("en-IN")}<span className="text-xs font-normal" style={{ color:"#9ca3af" }}>/mo</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase" style={{ background:"#fff0f2", color:"#f43f5e" }}>
                    {pg.sharing} sharing
                  </span>
                </div>
                {pg.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pg.amenities.slice(0,3).map(a=>(
                      <span key={a} className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background:"#fff0f2", color:"#f43f5e" }}>{a}</span>
                    ))}
                    {pg.amenities.length>3 && <span className="text-[10px] font-bold" style={{ color:"#9ca3af" }}>+{pg.amenities.length-3}</span>}
                  </div>
                )}
                <button onClick={()=>copyLink(pg)}
                  className="mt-3 w-full text-xs font-bold flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all"
                  style={{ background:"#fff8f9", color: copied===pg.id ? "#16a34a" : "#9ca3af" }}>
                  {copied===pg.id ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy link</>}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── LEADS TAB ────────────────────────────────────────────────────────────────
function LeadsTab({ leads, loading, pgs, t }) {
  const statusStyles = {
    hot:       { bg:"#fff0f2", color:"#f43f5e",  label: t("hotLeadLabel") },
    warm:      { bg:"#fffbeb", color:"#d97706",  label: t("warmLabel") },
    new:       { bg:"#eff6ff", color:"#2563eb",  label: t("newLabel") },
    converted: { bg:"#f0fdf4", color:"#16a34a",  label: "Converted" },
  };
  const pgMap = Object.fromEntries(pgs.map(p=>[p.id,p.name]));
  const hot = leads.filter(l=>l.status==="hot");
  const converted = leads.filter(l=>l.status==="converted");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total Leads" value={String(leads.length)} icon={Users}        color="#2563eb" bg="#f8fbff" />
        <KpiCard label="Hot Leads"   value={String(hot.length)}   icon={Flame}        color="#f43f5e" bg="#fff8f9" />
        <KpiCard label="Converted"   value={String(converted.length)} icon={CheckCircle2} color="#16a34a" bg="#f8fffe" />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid #fff0f2" }}>
          <p className="font-black text-sm" style={{ color:"#111827" }}>{t("leadPipeline")}</p>
          <span className="text-xs font-medium" style={{ color:"#9ca3af" }}>{t("byUrgency")}</span>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[0,1,2].map(i=><div key={i} className="h-14 rounded-xl animate-pulse" style={{ background:"#fff8f9" }} />)}
          </div>
        ) : leads.length===0 ? (
          <EmptyState icon={Inbox} title="No leads yet" desc={t("noLeadsYet")} />
        ) : (
          <div>
            {leads.map((l,i) => {
              const status = l.status||"new";
              const s = statusStyles[status]||statusStyles.new;
              return (
                <motion.div key={l.id||i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                  className="flex items-center gap-4 px-5 py-4 transition-all"
                  style={{ borderBottom: i < leads.length-1 ? "1px solid #fff0f2" : "none" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#fff8f9"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background:s.bg, color:s.color }}>{(l.name||"?")[0].toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color:"#111827" }}>{l.name||"Anonymous"}</p>
                    <p className="text-xs truncate" style={{ color:"#9ca3af" }}>{pgMap[l.pgId]||l.pgName||""}{l.budget?` · ₹${l.budget}`:""}</p>
                  </div>
                  <span className="text-[10px] font-black px-3 py-1 rounded-full flex-shrink-0" style={{ background:s.bg, color:s.color }}>{s.label}</span>
                  {l.phone && (
                    <a href={`tel:${l.phone}`} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                      style={{ background:"#f0fdf4", color:"#16a34a" }}>
                      <Phone size={13} />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REVENUE TAB ──────────────────────────────────────────────────────────────
function RevenueTab({ pgs, t }) {
  const total = pgs.reduce((s,p)=>s+Number(p.price||0),0);
  const donutData = {
    labels: pgs.map(p=>p.name||"PG"),
    datasets:[{ data:pgs.map(p=>Number(p.price||0)), backgroundColor:["#f43f5e","#fb923c","#fbbf24","#34d399","#60a5fa","#a78bfa"], borderWidth:0 }]
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label={t("thisMonth")}   value={`₹${total.toLocaleString("en-IN")}`}      icon={Wallet}      color="#f43f5e" bg="#fff8f9" />
        <KpiCard label={t("totalEarned")} value={`₹${(total*6).toLocaleString("en-IN")}`}  icon={TrendingUp}  color="#16a34a" bg="#f8fffe" />
        <KpiCard label="Properties"       value={String(pgs.length)}                        icon={Building2}   color="#2563eb" bg="#f8fbff" />
        <KpiCard label={t("pendingRent")} value="₹0"                                        icon={AlertCircle} color="#d97706" bg="#fffdf5" />
      </div>
      {pgs.length===0 ? <EmptyState icon={Wallet} title="No revenue data" desc={t("noPgRevenue")} /> : (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 rounded-2xl p-6" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
            <p className="font-black text-sm mb-5" style={{ color:"#111827" }}>{t("revenueByProp")}</p>
            <div className="space-y-5">
              {pgs.map(p=>{
                const amt=Number(p.price||0), pct=total>0?Math.round((amt/total)*100):0;
                return (
                  <div key={p.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold truncate max-w-[60%]" style={{ color:"#111827" }}>{p.name}</span>
                      <span className="text-sm font-black" style={{ color:"#111827" }}>₹{amt.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[10px] font-medium mb-1.5" style={{ color:"#9ca3af" }}>{p.area}, {p.city}</p>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background:"#fff0f2" }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, ease:"easeOut" }}
                        className="h-full rounded-full" style={{ background:"linear-gradient(90deg, #f43f5e, #fb7185)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl p-6 flex flex-col items-center" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
            <p className="font-black text-sm mb-5 self-start" style={{ color:"#111827" }}>{t("shareOfRevenue")}</p>
            <div className="h-44 w-44">
              <Doughnut data={donutData} options={{ maintainAspectRatio:false, plugins:{legend:{display:false}}, cutout:"70%" }} />
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full">
              {pgs.map((p,i)=>(
                <div key={p.id} className="flex items-center gap-2 text-xs font-medium" style={{ color:"#374151" }}>
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ background:["#f43f5e","#fb923c","#fbbf24","#34d399","#60a5fa","#a78bfa"][i%6] }} />
                  {p.name||"PG"}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI TAB ───────────────────────────────────────────────────────────────────
function AITab({ pgs, leads, t }) {
  const [query, setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const suggestions = [
    "Suggest optimal rent for my PG based on current market",
    "Which amenities attract more leads in my city?",
    "Write an attractive description for my PG listing",
    "How do I get more leads this week?",
  ];
  const ask = async (q) => {
    if (!q.trim()||loading) return;
    const userMsg = q.trim();
    setQuery(""); setLoading(true);
    setHistory(h=>[...h,{role:"user",content:userMsg}]);
    const pgCtx = pgs.map(p=>`${p.name} in ${p.city} (₹${p.price}/mo)`).join("; ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`You are a PG business advisor for Indian property owners on StayPG. Properties: ${pgCtx||"None yet"}. Total leads: ${leads.length}. Be concise, practical, use Indian context. 2-3 paragraphs max.`,
          messages:[...history.map(m=>({role:m.role,content:m.content})),{role:"user",content:userMsg}]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c=>c.text||"").join("")||"Something went wrong.";
      setHistory(h=>[...h,{role:"assistant",content:text}]);
    } catch { setHistory(h=>[...h,{role:"assistant",content:"Could not connect. Please try again."}]); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] p-6 text-white" style={{ background:"linear-gradient(135deg, #7c3aed, #f43f5e)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:"rgba(255,255,255,0.2)" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-black text-lg">AI Business Advisor</p>
            <p className="text-white/70 text-xs">Ask anything about your PG business</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map(q=>(
            <button key={q} onClick={()=>ask(q)}
              className="text-left text-sm p-4 rounded-2xl font-medium transition-all"
              style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.9)" }}>
              ✦ {q}
            </button>
          ))}
        </div>
      </div>
      {history.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <div className="max-h-96 overflow-y-auto p-5 space-y-4">
            {history.map((m,i)=>(
              <div key={i} className={`flex gap-3 ${m.role==="user"?"flex-row-reverse":""}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                  style={m.role==="user"?{background:"linear-gradient(135deg,#f43f5e,#e11d48)",color:"white"}:{background:"#f5f3ff",color:"#7c3aed"}}>
                  {m.role==="user"?"U":"AI"}
                </div>
                <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={m.role==="user"?{background:"#fff0f2",color:"#9f1239",borderTopRightRadius:4}:{background:"#f8fafc",color:"#374151",borderTopLeftRadius:4}}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background:"#f5f3ff", color:"#7c3aed" }}>AI</div>
                <div className="px-4 py-3 rounded-2xl flex items-center gap-2" style={{ background:"#f8fafc" }}>
                  <Loader2 size={14} className="animate-spin" style={{ color:"#9ca3af" }} />
                  <span className="text-sm" style={{ color:"#9ca3af" }}>Thinking…</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 flex gap-3" style={{ borderTop:"1px solid #fff0f2" }}>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask(query)}
              placeholder="Ask about pricing, leads, amenities…"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none placeholder:text-slate-400"
              style={{ background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" }} />
            <button onClick={()=>ask(query)} disabled={loading||!query.trim()}
              className="px-5 py-2.5 text-white rounded-xl text-sm font-black transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background:"linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
              {loading?<Loader2 size={14} className="animate-spin"/>:<ChevronRight size={14}/>} Ask
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ALERTS TAB ───────────────────────────────────────────────────────────────
function AlertsTab({ alerts, t }) {
  if (alerts.length===0) return <EmptyState icon={Bell} title={t("noAlertsYet")} desc="You're all caught up! Alerts will appear here." />;
  return (
    <div className="space-y-3">
      {alerts.map((a,i)=>(
        <motion.div key={a.id||i} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
          className="rounded-2xl px-5 py-4 flex items-start gap-4"
          style={{ background:"white", border:"1.5px solid #fef3c7" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"#fef3c7", color:"#d97706" }}>
            <AlertCircle size={18} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color:"#111827" }}>{a.title||a.message}</p>
            {a.desc && <p className="text-xs mt-0.5" style={{ color:"#9ca3af" }}>{a.desc}</p>}
          </div>
          {a.time && <span className="text-[10px] flex-shrink-0" style={{ color:"#9ca3af" }}>{a.time}</span>}
        </motion.div>
      ))}
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
function AnalyticsTab({ pgs, leads, t }) {
  const totalViews = pgs.reduce((s,p)=>s+Number(p.views||0),0);
  const convRate   = totalViews>0?((leads.length/totalViews)*100).toFixed(1):"0";
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-3">
        <KpiCard label={t("profileCompletion")} value="80%"       icon={Target}        color="#f43f5e" bg="#fff8f9" />
        <KpiCard label={t("responseRate")}       value="—"         icon={MessageCircle} color="#2563eb" bg="#f8fbff" />
        <KpiCard label={t("conversionRate")}     value={`${convRate}%`} icon={TrendingUp} color="#16a34a" bg="#f8fffe" />
      </div>
      {pgs.length===0 ? <EmptyState icon={BarChart2} title="No data yet" desc="Add properties to track analytics." /> : (
        <div className="rounded-2xl p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <p className="font-black text-sm mb-4" style={{ color:"#111827" }}>{t("viewsVsLeads")}</p>
          <div className="grid grid-cols-2 gap-3">
            {pgs.map(p=>(
              <div key={p.id} className="rounded-xl p-4" style={{ background:"#fff8f9" }}>
                <p className="text-xs font-black truncate" style={{ color:"#111827" }}>{p.name}</p>
                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color:"#9ca3af" }}>
                  <span><Eye size={10} className="inline mr-1" />{p.views||0} views</span>
                  <span><Users size={10} className="inline mr-1" />{p.leads||0} leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FORM MODAL ───────────────────────────────────────────────────────────────
function FormModal({ show, onClose, editPg, t }) {
  const [formStep, setFormStep]   = useState(1);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const set = (k,v) => setFormData(p=>({...p,[k]:v}));
  const toggleAmenity = (id) => setFormData(p=>({
    ...p, amenities: p.amenities.includes(id)?p.amenities.filter(x=>x!==id):[...p.amenities,id]
  }));

  useEffect(() => {
    if (editPg) setFormData({...EMPTY_FORM,...editPg});
    else setFormData(EMPTY_FORM);
    setFormStep(1);
  }, [editPg, show]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const sRef = ref(storage,`pg-pics/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(sRef,file);
      set("photoUrl", await getDownloadURL(snap.ref));
    } catch { alert("Photo upload failed."); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.photoUrl) return alert("Please upload a photo first!");
    if (!formData.name||!formData.price||!formData.contact) return alert("Fill all required fields.");
    setLoading(true);
    try {
      const payload = { ...formData, price:Number(formData.price), deposit:Number(formData.deposit)||0, rooms:Number(formData.rooms)||0, ownerId:auth.currentUser.uid };
      if (editPg?.id) { await updateDoc(doc(db,"pgs",editPg.id),payload); }
      else { payload.createdAt=serverTimestamp(); payload.leads=0; payload.views=0; payload.rating=0; await addDoc(collection(db,"pgs"),payload); }
      onClose();
    } catch(err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const checklist = [
    { label:t("photoUploaded"), ok:!!formData.photoUrl },
    { label:t("pgNameSet"),     ok:!!formData.name },
    { label:t("cityAreaSet"),   ok:!!formData.area },
    { label:t("contactSet"),    ok:!!formData.contact },
    { label:t("rentSet"),       ok:!!formData.price },
    { label:t("amenitiesAdded"),ok:formData.amenities.length>0 },
  ];
  const readyCount = checklist.filter(c=>c.ok).length;
  const stepDef    = STEP_DEFS[formStep-1];
  const StepVisual = stepDef?.Visual;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div initial={{ y:60, opacity:0, scale:0.95 }} animate={{ y:0, opacity:1, scale:1 }} exit={{ y:60, opacity:0, scale:0.95 }}
            className="w-full max-w-4xl rounded-[2rem] relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            style={{ background:"white", boxShadow:"0 32px 80px rgba(244,63,94,0.2)" }}>

            {/* Progress bar */}
            <div className="h-1.5" style={{ background:"#fff0f2" }}>
              <motion.div className="h-full rounded-full"
                style={{ background:"linear-gradient(90deg, #f43f5e, #fb7185)" }}
                animate={{ width:`${(formStep/5)*100}%` }} transition={{ duration:0.4, ease:"easeInOut" }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-5 pb-3">
              <div>
                <h3 className="text-xl font-black" style={{ color:"#111827" }}>
                  {editPg?.id ? t("editProperty") : t("listProperty")}
                </h3>
                <p className="text-xs mt-0.5" style={{ color:"#9ca3af" }}>
                  Step {formStep}/5 — {t(stepDef?.stepKey)}
                </p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background:"#fff0f2", color:"#f43f5e" }}>
                <X size={17} />
              </button>
            </div>

            {/* Step bubbles */}
            <div className="px-7 pb-4 flex items-center gap-2">
              {STEP_DEFS.map((s,i) => {
                const done=formStep>s.id, active=formStep===s.id;
                const Icon=s.icon;
                return (
                  <div key={s.id} className="flex items-center gap-2 flex-1">
                    <button onClick={()=>done&&setFormStep(s.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all flex-shrink-0"
                      style={done?{background:"#16a34a",borderColor:"#16a34a",color:"white"}
                        :active?{borderColor:s.color,color:s.color,background:`${s.lightBg}`}
                        :{background:"white",borderColor:"#fecdd3",color:"#d1d5db"}}>
                      {done?<Check size={14}/>:<Icon size={14}/>}
                    </button>
                    {i<STEP_DEFS.length-1 && (
                      <div className="h-0.5 flex-1 rounded-full transition-all duration-500"
                        style={{ background:done?"#16a34a":"#ffe4e6" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 flex">
              <AnimatePresence mode="wait">
                <motion.div key={formStep}
                  initial={{ x:30, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:-30, opacity:0 }}
                  transition={{ duration:0.2 }}
                  className="flex-1 p-7 flex gap-7">
                  {/* Visual */}
                  <div className="hidden md:flex w-48 flex-shrink-0 rounded-2xl items-center justify-center min-h-[200px]"
                    style={{ background:`linear-gradient(135deg, ${stepDef?.color}10, ${stepDef?.color}05)`, border:`1.5px solid ${stepDef?.color}20` }}>
                    {StepVisual && <StepVisual />}
                  </div>
                  {/* Form */}
                  <div className="flex-1 space-y-4">
                    <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background:"#fff8f9" }}>
                      <Info size={15} style={{ color:"#fda4af" }} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed" style={{ color:"#6b7280" }}>{t(stepDef?.descKey)}</p>
                    </div>

                    {/* Step 1: Photo */}
                    {formStep===1 && (
                      <div>
                        <div className={`h-52 rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer group`}
                          style={{ border: formData.photoUrl ? "none" : "2px dashed #fecdd3", background:"#fff8f9" }}>
                          {formData.photoUrl ? (
                            <>
                              <img src={formData.photoUrl} className="w-full h-full object-cover rounded-2xl" alt="PG" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-2xl">
                                <label className="cursor-pointer px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2"
                                  style={{ background:"white", color:"#f43f5e" }}>
                                  <Camera size={15} /> Change Photo
                                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                              </div>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-3 transition-all"
                              style={{ color:"#fda4af" }}
                              onMouseEnter={e=>e.currentTarget.style.color="#f43f5e"}
                              onMouseLeave={e=>e.currentTarget.style.color="#fda4af"}>
                              {uploading ? <Loader2 className="animate-spin" size={36} style={{ color:"#f43f5e" }} /> : <Camera size={36} />}
                              <span className="font-black text-sm">{uploading?"Uploading…":"Tap to upload your PG photo"}</span>
                              <span className="text-xs" style={{ color:"#9ca3af" }}>JPG or PNG, up to 5MB</span>
                              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                            </label>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {[t("photoTip1"),t("photoTip2"),t("photoTip3")].map(tip=>(
                            <div key={tip} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                              style={{ background:"#fef3c7", border:"1px solid #fde68a" }}>
                              <Star size={10} style={{ color:"#d97706" }} />
                              <span className="text-[10px] font-bold" style={{ color:"#92400e" }}>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Details */}
                    {formStep===2 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <IBox label={t("pgName")} required value={formData.name} onChange={v=>set("name",v)} placeholder={t("pgNamePlaceholder")} />
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color:"#9ca3af" }}>{t("city")}<span style={{ color:"#f43f5e" }}>*</span></label>
                          <select className="w-full px-4 py-3 rounded-2xl font-bold outline-none text-sm"
                            style={{ background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" }}
                            value={formData.city} onChange={e=>set("city",e.target.value)}>
                            {CITIES.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <IBox label={t("area")} required value={formData.area} onChange={v=>set("area",v)} placeholder={t("areaPlaceholder")} />
                        <IBox label={t("whatsapp")} required value={formData.contact} onChange={v=>set("contact",v)} placeholder={t("whatsappPlaceholder")} />
                        <div className="md:col-span-2">
                          <IBox label={t("address")} required value={formData.address} onChange={v=>set("address",v)} placeholder={t("addressPlaceholder")} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color:"#9ca3af" }}>{t("aboutPg")}</label>
                          <textarea rows={3} placeholder={t("aboutPlaceholder")} value={formData.description} onChange={e=>set("description",e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl outline-none resize-none text-sm placeholder:text-slate-400"
                            style={{ background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" }} />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Price */}
                    {formStep===3 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <IBox label={t("rent")} required type="number" value={formData.price} onChange={v=>set("price",v)} placeholder="6500" />
                          <IBox label={t("deposit")} type="number" value={formData.deposit} onChange={v=>set("deposit",v)} placeholder="13000" />
                          <IBox label={t("totalRooms")} type="number" value={formData.rooms} onChange={v=>set("rooms",v)} placeholder="10" />
                          <IBox label={t("floor")} value={formData.floor} onChange={v=>set("floor",v)} placeholder="Ground / 1st" />
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color:"#9ca3af" }}>{t("pgType")}</label>
                            <select className="w-full px-4 py-3 rounded-2xl font-bold outline-none text-sm"
                              style={{ background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" }}
                              value={formData.type} onChange={e=>set("type",e.target.value)}>
                              <option>Boys</option><option>Girls</option><option>Unisex</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color:"#9ca3af" }}>{t("sharingType")}</label>
                            <select className="w-full px-4 py-3 rounded-2xl font-bold outline-none text-sm"
                              style={{ background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" }}
                              value={formData.sharing} onChange={e=>set("sharing",e.target.value)}>
                              <option>Single</option><option>Double</option><option>Triple</option>
                            </select>
                          </div>
                        </div>
                        {formData.price && (
                          <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
                            <TrendingUp size={16} style={{ color:"#16a34a" }} />
                            <p className="text-sm font-medium" style={{ color:"#166534" }}>
                              {t("avgRent")} <b>{formData.city}</b> {t("isRange")} {Number(formData.price)<6500?t("competitive"):t("goodPrice")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Amenities */}
                    {formStep===4 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest block mb-3" style={{ color:"#9ca3af" }}>{t("whatYouOffer")}</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {AMENITIES_LIST.map(a=>{
                              const Icon=a.icon, sel=formData.amenities.includes(a.id);
                              return (
                                <button key={a.id} type="button" onClick={()=>toggleAmenity(a.id)}
                                  className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                                  style={sel
                                    ? { border:"2px solid #f43f5e", background:"#fff0f2", color:"#f43f5e" }
                                    : { border:"1.5px solid #ffe4e6", background:"#fff8f9", color:"#6b7280" }}>
                                  <Icon size={20} />
                                  <span className="text-xs font-black">{a.label}</span>
                                  {sel && <Check size={12} style={{ color:"#f43f5e" }} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color:"#9ca3af" }}>{t("houseRules")}</label>
                          <textarea rows={4} placeholder={t("houseRulesPlaceholder")} value={formData.rules} onChange={e=>set("rules",e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl outline-none resize-none text-sm placeholder:text-slate-400"
                            style={{ background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" }} />
                        </div>
                      </div>
                    )}

                    {/* Step 5: Review */}
                    {formStep===5 && (
                      <div className="grid md:grid-cols-2 gap-5">
                        {/* Preview */}
                        <div className="rounded-2xl overflow-hidden" style={{ border:"1.5px solid #ffe4e6" }}>
                          <div className="h-36 relative overflow-hidden" style={{ background:"#fff0f2" }}>
                            {formData.photoUrl
                              ? <img src={formData.photoUrl} className="w-full h-full object-cover" alt="preview" />
                              : <div className="w-full h-full flex items-center justify-center"><Camera size={32} style={{ color:"#fda4af" }} /></div>}
                            <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase"
                              style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)" }}>{formData.type}</div>
                          </div>
                          <div className="p-4" style={{ background:"white" }}>
                            <p className="font-black" style={{ color:"#111827" }}>{formData.name||"PG Name"}</p>
                            <p className="text-xs flex items-center gap-1 mt-1" style={{ color:"#9ca3af" }}><MapPin size={10} />{formData.area||"Area"}, {formData.city}</p>
                            <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop:"1px solid #fff0f2" }}>
                              <span className="font-black text-lg" style={{ color:"#f43f5e" }}>₹{formData.price||"0"}<span className="text-xs font-normal" style={{ color:"#9ca3af" }}>/mo</span></span>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase" style={{ background:"#fff0f2", color:"#f43f5e" }}>{formData.sharing} sharing</span>
                            </div>
                            {formData.amenities.length>0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {formData.amenities.map(a=><span key={a} className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background:"#fff0f2", color:"#f43f5e" }}>{a}</span>)}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Checklist */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-black text-sm" style={{ color:"#111827" }}>Readiness checklist</p>
                            <span className="text-xs font-black px-2.5 py-1 rounded-full"
                              style={readyCount===6?{background:"#f0fdf4",color:"#16a34a"}:{background:"#fef3c7",color:"#d97706"}}>
                              {readyCount}/6
                            </span>
                          </div>
                          {checklist.map(item=>(
                            <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                              style={item.ok?{background:"#f0fdf4",border:"1px solid #bbf7d0"}:{background:"#fff0f2",border:"1px solid #fecdd3"}}>
                              {item.ok?<CheckCircle2 size={15} style={{ color:"#16a34a" }}/>:<AlertCircle size={15} style={{ color:"#fda4af" }}/>}
                              <span className="text-sm font-bold" style={{ color:item.ok?"#16a34a":"#f43f5e" }}>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-7 py-5" style={{ borderTop:"1.5px solid #fff0f2" }}>
              <button onClick={()=>setFormStep(s=>Math.max(1,s-1))} disabled={formStep===1}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                style={{ background:"#fff0f2", color:"#f43f5e" }}>
                ← {t("back")}
              </button>
              {formStep<5 ? (
                <button onClick={()=>setFormStep(s=>s+1)}
                  className="px-6 py-2.5 text-white text-sm font-black rounded-xl transition-all"
                  style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow:"0 4px 16px rgba(244,63,94,0.3)" }}>
                  {t("next")}
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading||uploading||readyCount<5}
                  className="px-8 py-2.5 text-white text-sm font-black rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow:"0 6px 20px rgba(244,63,94,0.4)" }}>
                  {loading?<Loader2 size={16} className="animate-spin"/>:<Sparkles size={16}/>}
                  {loading?(editPg?.id?t("saving"):t("publishingLive")):editPg?.id?t("saveChanges"):t("publish")}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN OWNER DASHBOARD ─────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm]   = useState(false);
  const [editPg, setEditPg]       = useState(null);
  const [searchQ, setSearchQ]     = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [dark, setDark]           = useState(false);
  const [lang, setLang]           = useState("en");
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useT(lang);

  const { pgs, loading: pgsLoading } = useMyPgs();
  const pgIds = pgs.map(p=>p.id);
  const { leads, loading: leadsLoading } = useLeads(pgIds);
  const alerts = useAlerts(pgIds);

  const openAdd  = () => { setEditPg(null);  setShowForm(true); };
  const openEdit = (pg) => { setEditPg(pg);  setShowForm(true); };
  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    await deleteDoc(doc(db,"pgs",id));
  };

  const emailInitial = auth.currentUser?.email?.[0]?.toUpperCase()||"O";
  const displayName  = auth.currentUser?.email?.split("@")[0]||"Owner";

  const TABS = [
    { id:"overview",   icon:LayoutDashboard, label:t("overview") },
    { id:"properties", icon:Building2,       label:t("properties"), badge:pgs.length||null },
    { id:"leads",      icon:Users,           label:t("leads"),      badge:leads.length||null, badgeColor:"#2563eb" },
    { id:"revenue",    icon:Wallet,          label:t("revenue") },
    { id:"ai",         icon:Sparkles,        label:t("ai"),         badge:"NEW", badgeColor:"#7c3aed" },
    { id:"analytics",  icon:BarChart2,       label:t("analytics") },
    { id:"alerts",     icon:Bell,            label:t("alerts"),     badge:alerts.length||null, badgeColor:"#d97706" },
  ];

  const navigate = (tab) => { setActiveTab(tab); setMobileOpen(false); };

  // Pink/white page background
  const pageStyle = dark
    ? { background:"#0f172a" }
    : { background:"linear-gradient(160deg, #fff5f7 0%, #ffffff 50%, #fef2f4 100%)" };

  const sidebarStyle = dark
    ? { background:"#1e293b", borderColor:"#334155" }
    : { background:"white", borderColor:"#ffe4e6" };

  const headerStyle = dark
    ? { background:"rgba(15,23,42,0.95)", borderColor:"#334155" }
    : { background:"rgba(255,255,255,0.9)", borderColor:"#ffe4e6", backdropFilter:"blur(16px)" };

  return (
    <div className="min-h-screen flex font-sans transition-colors duration-300" style={pageStyle}>

      {/* ── SIDEBAR ── */}
      <aside
        className="fixed lg:relative inset-y-0 left-0 z-50 w-64 flex flex-col border-r shadow-xl lg:shadow-none transition-transform duration-300"
        style={{ ...sidebarStyle, transform: mobileOpen ? "translateX(0)" : undefined }}>
        <style>{`
          @media (max-width: 1023px) {
            aside { transform: ${mobileOpen?"translateX(0)":"translateX(-100%)"}; }
          }
          @media (min-width: 1024px) {
            aside { transform: translateX(0) !important; position: relative !important; }
          }
        `}</style>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom:"1.5px solid #ffe4e6" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            <span className="text-white font-black text-sm">SP</span>
          </div>
          <div>
            <div className="font-black text-lg leading-none" style={{ color: dark?"white":"#111827" }}>
              Stay<span style={{ color:"#f43f5e" }}>PG</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color:"#9ca3af" }}>Owner PRO</div>
          </div>
          <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background:"#fff0f2", color:"#f43f5e", border:"1px solid #fecdd3" }}>PRO</span>
          <button className="lg:hidden ml-1" onClick={()=>setMobileOpen(false)}>
            <X size={17} style={{ color:"#9ca3af" }} />
          </button>
        </div>

        {/* Owner card */}
        <div className="mx-3 my-3 flex items-center gap-3 p-3 rounded-2xl"
          style={{ background:"#fff8f9", border:"1.5px solid #fecdd3" }}>
          <div className="w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)" }}>{emailInitial}</div>
          <div className="min-w-0">
            <p className="text-sm font-black truncate" style={{ color: dark?"white":"#111827" }}>{displayName}</p>
            <p className="text-[10px] truncate" style={{ color:"#9ca3af" }}>{auth.currentUser?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-1 overflow-y-auto space-y-0.5">
          <SectionLabel text="Main" />
          {TABS.slice(0,3).map(tab=>(
            <SBtn key={tab.id} icon={tab.icon} label={tab.label} active={activeTab===tab.id}
              onClick={()=>navigate(tab.id)} badge={tab.badge} badgeColor={tab.badgeColor} />
          ))}
          <SectionLabel text="Finance & Tools" />
          {TABS.slice(3).map(tab=>(
            <SBtn key={tab.id} icon={tab.icon} label={tab.label} active={activeTab===tab.id}
              onClick={()=>navigate(tab.id)} badge={tab.badge} badgeColor={tab.badgeColor} />
          ))}
          <SectionLabel text="Account" />
          <SBtn icon={SettingsIcon} label="Settings" active={false} onClick={()=>{}} />
          <SBtn icon={Headphones}   label="Help"     active={false} onClick={()=>{}} />
        </nav>

        {/* Upgrade card */}
        <div className="mx-3 mb-3 p-4 rounded-2xl"
          style={{ background:"linear-gradient(135deg, #fff0f2, #fce7f3)", border:"1.5px solid #fecdd3" }}>
          <p className="font-black text-sm mb-1" style={{ color:"#111827" }}>{t("upgrade")}</p>
          <p className="text-[10px] mb-3" style={{ color:"#9ca3af" }}>{t("upgradeDesc")}</p>
          <button className="w-full text-[11px] font-black py-2 rounded-xl flex items-center justify-center gap-1.5 text-white transition-all"
            style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow:"0 4px 12px rgba(244,63,94,0.3)" }}>
            <Lock size={10} /> {t("upgradeBtn")}
          </button>
        </div>

        {/* Logout */}
        <div className="px-3 pb-5 pt-3" style={{ borderTop:"1.5px solid #ffe4e6" }}>
          <button onClick={()=>{ auth.signOut(); window.location.href="/"; }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all"
            style={{ color:"#9ca3af" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#fff0f2";e.currentTarget.style.color="#f43f5e";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#9ca3af";}}>
            <LogOut size={15} />{t("signOut")}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={()=>setMobileOpen(false)} />}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-40 px-4 md:px-6 py-3 flex items-center gap-3 border-b" style={headerStyle}>
          <button className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"#fff0f2", color:"#f43f5e" }}
            onClick={()=>setMobileOpen(true)}>
            <LayoutDashboard size={16} />
          </button>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 max-w-xs"
            style={{ background:"#fff8f9", border:"1.5px solid #fecdd3" }}>
            <Search size={14} style={{ color:"#fda4af" }} />
            <input className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
              style={{ color:"#111827" }}
              placeholder={t("search")} value={searchQ} onChange={e=>setSearchQ(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <LangSwitcher lang={lang} setLang={setLang} />
            <button onClick={()=>setDark(d=>!d)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition"
              style={{ background: dark?"#1e293b":"#fff0f2", color: dark?"#94a3b8":"#f43f5e" }}>
              {dark?<Sun size={15}/>:<Moon size={15}/>}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={()=>setNotifOpen(o=>!o)}
                className="w-9 h-9 rounded-xl flex items-center justify-center relative transition"
                style={{ background:"#fff0f2", color:"#f43f5e" }}>
                <Bell size={15} />
                {(leads.length>0||alerts.length>0) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                    style={{ background:"#f43f5e" }} />
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={()=>setNotifOpen(false)} />
                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
                      className="absolute right-0 top-12 w-72 rounded-2xl shadow-xl p-4 z-50"
                      style={{ background:"white", border:"1.5px solid #fecdd3" }}>
                      <p className="font-black text-sm mb-3" style={{ color:"#111827" }}>{t("notifications")}</p>
                      {leads.length===0&&alerts.length===0 ? (
                        <p className="text-xs text-center py-4" style={{ color:"#9ca3af" }}>All caught up! 🎉</p>
                      ) : leads.slice(0,3).map((l,i)=>(
                        <div key={l.id||i} className="flex items-center gap-3 py-2.5" style={{ borderBottom:"1px solid #fff0f2" }}>
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background:"#eff6ff", color:"#2563eb" }}><Users size={12} /></div>
                          <div>
                            <p className="text-xs font-bold" style={{ color:"#111827" }}>New lead: {l.name||"Anonymous"}</p>
                            <p className="text-[10px]" style={{ color:"#9ca3af" }}>just now</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl text-white text-sm font-black flex items-center justify-center shadow-md"
              style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)" }}>{emailInitial}</div>

            {/* Add property CTA */}
            <motion.button onClick={openAdd} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className="px-4 py-2 text-white rounded-xl font-black text-sm flex items-center gap-1.5 shadow-md"
              style={{ background:"linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow:"0 4px 16px rgba(244,63,94,0.35)" }}>
              <Plus size={15} /> {t("addProperty")}
            </motion.button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              transition={{ duration:0.15 }}
              className="p-4 md:p-6 max-w-7xl mx-auto w-full">

              {/* Page title */}
              <div className="mb-5">
                <h2 className="text-2xl font-black capitalize" style={{ color: dark?"white":"#111827" }}>
                  {TABS.find(tab=>tab.id===activeTab)?.label||t("overview")}
                </h2>
                <p className="text-sm font-medium" style={{ color:"#9ca3af" }}>{t("manageProps")}</p>
              </div>

              {activeTab==="overview" && !pgsLoading && pgs.length===0 && <FirstTimeView onAdd={openAdd} t={t} />}
              {activeTab==="overview" && (pgsLoading||pgs.length>0) && (
                <OverviewTab pgs={pgs} leads={leads} alerts={alerts} t={t} onAdd={openAdd} />
              )}
              {activeTab==="properties" && (
                <PropertiesTab pgs={pgs} loading={pgsLoading} onEdit={openEdit} onDelete={handleDelete} searchQ={searchQ} t={t} onAdd={openAdd} />
              )}
              {activeTab==="leads"     && <LeadsTab leads={leads} loading={leadsLoading} pgs={pgs} t={t} />}
              {activeTab==="revenue"   && <RevenueTab pgs={pgs} t={t} />}
              {activeTab==="ai"        && <AITab pgs={pgs} leads={leads} t={t} />}
              {activeTab==="analytics" && <AnalyticsTab pgs={pgs} leads={leads} t={t} />}
              {activeTab==="alerts"    && <AlertsTab alerts={alerts} t={t} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden sticky bottom-0 z-40 flex items-center justify-around px-1 py-2 border-t"
          style={dark?{background:"#1e293b",borderColor:"#334155"}:{background:"white",borderColor:"#ffe4e6"}}>
          {TABS.slice(0,5).map(tab=>(
            <button key={tab.id} onClick={()=>navigate(tab.id)}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl relative transition-colors"
              style={{ color: activeTab===tab.id?"#f43f5e":"#9ca3af" }}>
              <tab.icon size={19} />
              <span className="text-[9px] font-bold">{tab.label.split(" ")[0]}</span>
              {tab.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[8px] font-black rounded-full flex items-center justify-center"
                  style={{ background:"#f43f5e" }}>{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <FormModal show={showForm} onClose={()=>setShowForm(false)} editPg={editPg} t={t} />
    </div>
  );
}