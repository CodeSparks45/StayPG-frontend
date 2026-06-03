import { useState, useEffect, useRef, useCallback } from "react";
import { db, auth, storage } from "../firebase";
import {
  collection, addDoc, query, where, onSnapshot,
  serverTimestamp, doc, updateDoc, deleteDoc, getDocs, orderBy, limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Plus, X, Loader2, MapPin,
  Wifi, Wind, Utensils, Zap, Camera, LogOut, Users, Wallet,
  Sparkles, Bell, TrendingUp, ChevronRight, CheckCircle2,
  AlertCircle, Star, Phone, Edit2, Trash2, Eye, BarChart2,
  Shield, Clock, Home, Search, Filter, Flame, Target, Award,
  Globe, ChevronDown, ArrowUpRight, Inbox, Copy, Check, Info,
  Activity, MessageCircle, Image as ImageIcon, Lock,
  Headphones, User as UserIcon, Settings as SettingsIcon,
  Sun, Moon, ChevronLeft, Upload, PlusCircle, BadgeCheck,
  IndianRupee, Users2, Menu
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Filler, Legend, ArcElement
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler, Legend, ArcElement);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CITIES = [
  "Latur","Nanded","Vishnupuri",
  "Nagpur","Pune","Mumbai","Delhi","Bangalore","Noida","Gurgaon",
  "Kota","Hyderabad","Chennai","Jaipur","Ahmedabad","Chandigarh","Bhopal","Indore"
];

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
  name:"", city:"Latur", area:"", price:"", contact:"",
  type:"Boys", sharing:"Double", rooms:"", floor:"",
  deposit:"", address:"", description:"", rules:"",
  amenities:[], customAmenities:"",
  photos:[], photoUrl:""
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
    ai:"AI Assistant", analytics:"Analytics", alerts:"Alerts", addProperty:"Add PG",
    signOut:"Sign out", search:"Search…", upgrade:"Upgrade to Elite",
    noProperties:"No properties listed yet",
    noPropertiesDesc:"Add your first PG to start receiving leads from students.",
    listFirst:"List My PG — It's Free →",
    monthly:"Monthly Revenue", activeLeads:"Active Leads", rating:"Avg Rating",
    publish:"Publish Now 🚀", saveChanges:"Save Changes", back:"Back", next:"Continue →",
    publishingLive:"Going live…", saving:"Saving…",
    deleteConfirm:"Delete this property? This cannot be undone.",
    noLeadsYet:"No leads yet — they'll appear once your PG is live.",
    totalLeads:"Total leads", hotLeads:"Hot leads", converted:"Converted",
    editProperty:"Edit Property", listProperty:"List Your PG",
    pgName:"PG name", pgNamePlaceholder:"e.g. Sunshine Boys PG",
    city:"City", area:"Area / locality", areaPlaceholder:"e.g. Shankar Nagar",
    whatsapp:"WhatsApp / Phone", whatsappPlaceholder:"+91 98765 43210",
    address:"Full address", addressPlaceholder:"House no, street, landmark",
    aboutPg:"About this PG", aboutPlaceholder:"Describe your PG…",
    rent:"Monthly rent (₹)", deposit:"Security deposit (₹)", totalRooms:"Total rooms",
    floor:"Floor", pgType:"PG type", sharingType:"Sharing type", houseRules:"House rules",
    houseRulesPlaceholder:"e.g. No smoking, guests allowed till 10pm",
    whatYouOffer:"Amenities you offer", customAmenitiesLabel:"Other amenities (write your own)",
    customAmenitiesPlaceholder:"e.g. Terrace, Library, Backup Power, Parking, Indoor Games…",
    readiness:"Readiness checklist", photoUploaded:"Photos uploaded (min 1)",
    pgNameSet:"PG name added", cityAreaSet:"City & area set",
    contactSet:"Contact number", rentSet:"Rent defined", amenitiesAdded:"Amenities selected",
    manageProps:"Manage your PG business",
    revenueTrend:"Revenue trend", revenueByProp:"Revenue by property",
    shareOfRevenue:"Share of revenue", noPgRevenue:"Add properties to see revenue",
    thisMonth:"This month", totalEarned:"Total earned", pendingRent:"Pending rent",
    profileCompletion:"Profile completion", conversionRate:"Conversion rate",
    viewsVsLeads:"Views vs Leads", smartAlerts:"Smart alerts",
    hotLeadLabel:"Hot 🔥", warmLabel:"Warm", newLabel:"New",
    leadPipeline:"Lead pipeline", byUrgency:"By urgency",
    noAlertsYet:"All clear — no alerts right now.",
    onboardingProgress:"Your setup progress", whyStayPg:"Why StayPG PRO?",
    startNow:"Start now", heroTitle:"One step away from your first lead",
    heroDesc:"Thousands of students search for PGs in your city every day.",
    accountCreated:"Account created ✓", addFirstPg:"List your first PG",
    getVerified:"Get verified badge", receiveLeads:"Receive student leads",
    addPgDesc:"Takes 2 minutes.", verifiedDesc:"Upload ID for trust badge.",
    receiveLeadsDesc:"Students contact you directly.",
    step1:"Photos", step2:"Details", step3:"Pricing", step4:"Amenities", step5:"Review",
    stepDesc1:"Upload 1–15 clear photos of your PG",
    stepDesc2:"Name, city, area — so students can find you",
    stepDesc3:"Rent, deposit and available rooms",
    stepDesc4:"Select amenities you offer",
    stepDesc5:"Review and publish your listing",
    certified100:"Certified at 100 Bookings",
    certified200:"Elite at 200 Bookings",
    certifiedDesc:"Build trust with a verified badge — students prefer certified PGs",
    notifications:"Notifications", upgradeDesc:"AI pricing + unlimited listings",
    upgradeBtn:"Upgrade Plan", avgRent:"Avg rent in",
    isRange:"is ₹6,000–₹9,000/mo. Your price is",
    competitive:"competitive! 🔥", goodPrice:"looks good.",
    photoTip1:"Good lighting", photoTip2:"Show entrance", photoTip3:"Wide angle",
  },
  hi: {
    overview:"अवलोकन", properties:"प्रॉपर्टीज़", leads:"लीड्स", revenue:"आय",
    ai:"AI सहायक", analytics:"विश्लेषण", alerts:"अलर्ट", addProperty:"PG जोड़ें",
    signOut:"साइन आउट", search:"खोजें…",
    noProperties:"अभी कोई PG नहीं",
    noPropertiesDesc:"पहला PG जोड़ें और छात्रों से लीड पाएं।",
    listFirst:"मेरा PG लिस्ट करें — बिल्कुल फ्री →",
    publish:"अभी पब्लिश करें 🚀", saveChanges:"बदलाव सेव करें", back:"वापस", next:"आगे →",
    deleteConfirm:"इस प्रॉपर्टी को हटाएं?",
    heroTitle:"पहली लीड से एक कदम दूर", heroDesc:"हर दिन हजारों छात्र आपके शहर में PG ढूंढते हैं।",
    startNow:"अभी शुरू करें", manageProps:"अपना PG व्यवसाय मैनेज करें",
  },
  mr: {
    overview:"आढावा", properties:"मालमत्ता", leads:"लीड्स", revenue:"उत्पन्न",
    ai:"AI सहाय्यक", analytics:"विश्लेषण", alerts:"सूचना", addProperty:"PG जोडा",
    signOut:"साइन आउट", search:"शोधा…",
    noProperties:"अद्याप कोणतेही PG नाही",
    noPropertiesDesc:"पहिले PG जोडा आणि विद्यार्थ्यांकडून लीड मिळवा.",
    listFirst:"माझे PG लिस्ट करा — पूर्णपणे मोफत →",
    publish:"आता प्रकाशित करा 🚀", saveChanges:"बदल सेव्ह करा", back:"मागे", next:"पुढे →",
    deleteConfirm:"ही मालमत्ता हटवायची?",
    heroTitle:"पहिल्या लीडपासून एक पाऊल दूर", heroDesc:"दररोज हजारो विद्यार्थी तुमच्या शहरात PG शोधतात.",
    startNow:"आता सुरू करा", manageProps:"तुमचा PG व्यवसाय व्यवस्थापित करा",
  },
};
function useT(lang) { return (key) => (T[lang]?.[key] || T.en[key] || key); }

// ─── FIRESTORE HOOKS ──────────────────────────────────────────────────────────
function useMyPgs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!auth.currentUser) { setLoading(false); return; }
    const q = query(collection(db,"pgs"), where("ownerId","==",auth.currentUser.uid));
    const unsub = onSnapshot(q, snap=>{
      setPgs(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    }, ()=>setLoading(false));
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
    const unsub = onSnapshot(q, snap=>{
      setLeads(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    }, ()=>setLoading(false));
    return unsub;
  }, [pgIds?.join(",")]);
  return { leads, loading };
}
function useAlerts(ownerId) {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    if (!ownerId) return;
    const q = query(collection(db,"alerts"), where("ownerId","==",ownerId), orderBy("createdAt","desc"), limit(30));
    const unsub = onSnapshot(q, snap=>setAlerts(snap.docs.map(d=>({id:d.id,...d.data()}))), ()=>{});
    return unsub;
  }, [ownerId]);
  return alerts;
}

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────
function IBox({ label, type="text", value, onChange, placeholder="", required=false, multiline=false, rows=3 }) {
  const cls = "w-full px-4 py-3 rounded-2xl font-medium outline-none text-sm transition-all placeholder:text-slate-400";
  const style = { background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" };
  const focusStyle = (e) => e.target.style.borderColor = "#f43f5e";
  const blurStyle  = (e) => e.target.style.borderColor = "#fecdd3";
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color:"#9ca3af" }}>
        {label}{required && <span style={{ color:"#f43f5e" }} className="ml-0.5">*</span>}
      </label>
      {multiline
        ? <textarea rows={rows} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
            className={cls} style={style} onFocus={focusStyle} onBlur={blurStyle} />
        : <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
            className={cls} style={style} onFocus={focusStyle} onBlur={blurStyle} />}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, bg, delay=0 }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background:bg||"white", border:`1.5px solid ${color}22` }}>
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background:`${color}15`, color }}><Icon size={17} /></div>
        <ArrowUpRight size={12} style={{ color:`${color}50` }} />
      </div>
      <div>
        <p className="text-xl font-black" style={{ color:"#111827" }}>{value}</p>
        <p className="text-xs font-bold mt-0.5" style={{ color:"#6b7280" }}>{label}</p>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, desc, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background:"#fff0f2" }}>
        <Icon size={28} style={{ color:"#fda4af" }} />
      </div>
      <p className="font-black text-sm mb-1" style={{ color:"#374151" }}>{title}</p>
      <p className="text-sm mb-5 max-w-xs" style={{ color:"#9ca3af" }}>{desc}</p>
      {action && (
        <button onClick={action} className="px-6 py-2.5 text-white rounded-2xl text-sm font-black shadow-lg"
          style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow:"0 4px 16px rgba(244,63,94,0.3)" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function SBtn({ icon: Icon, label, active, onClick, badge, badgeColor="#f43f5e", collapsed=false }) {
  return (
    <motion.button whileTap={{ scale:0.97 }} onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 relative"
      style={active
        ? { background:"linear-gradient(135deg,#f43f5e,#e11d48)", color:"white", boxShadow:"0 4px 15px rgba(244,63,94,0.3)" }
        : { color:"#6b7280" }}
      onMouseEnter={e=>{ if(!active){e.currentTarget.style.background="#fff0f2";e.currentTarget.style.color="#f43f5e";}}}
      onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#6b7280";}}}>
      <Icon size={16} className="flex-shrink-0" />
      {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
      {badge && !collapsed && (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={active?{background:"rgba(255,255,255,0.25)",color:"white"}:{background:`${badgeColor}18`,color:badgeColor}}>
          {badge}
        </span>
      )}
      {badge && collapsed && (
        <span className="absolute -top-1 -right-1 w-4 h-4 text-white text-[8px] font-black rounded-full flex items-center justify-center"
          style={{ background:badgeColor }}>{badge}</span>
      )}
    </motion.button>
  );
}

function SectionLabel({ text }) {
  return <p className="text-[9px] font-black uppercase tracking-widest px-3 pt-4 pb-1.5" style={{ color:"#d1d5db" }}>{text}</p>;
}

function LangSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold"
        style={{ background:"#fff0f2", color:"#f43f5e" }}>
        <Globe size={12}/>{LANGS[lang]?.flag}<ChevronDown size={9}/>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={()=>setOpen(false)}/>
            <motion.div initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:6 }}
              className="absolute right-0 top-10 w-36 rounded-2xl shadow-xl overflow-hidden z-50"
              style={{ background:"white", border:"1.5px solid #fecdd3" }}>
              {Object.values(LANGS).map(l=>(
                <button key={l.code} onClick={()=>{setLang(l.code);setOpen(false);}}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-left"
                  style={lang===l.code?{background:"#fff0f2",color:"#f43f5e"}:{color:"#374151"}}>
                  {l.flag} {l.label}
                  {lang===l.code && <Check size={9} className="ml-auto" style={{ color:"#f43f5e" }}/>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CERTIFIED BADGE COMPONENT ────────────────────────────────────────────────
function CertifiedBadgeSection({ pgs, t }) {
  const totalBookings = pgs.reduce((s,p)=>s+Number(p.leads||0),0);
  const is100 = totalBookings >= 100;
  const is200 = totalBookings >= 200;

  const tiers = [
    { threshold:100, label:"StayPG Verified",     color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe", icon:BadgeCheck, desc:"100 students enrolled", achieved: is100 },
    { threshold:200, label:"StayPG Elite",         color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe", icon:Award,     desc:"200 students enrolled — Top Owner!", achieved: is200 },
  ];

  return (
    <div className="rounded-2xl p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"#eff6ff", color:"#2563eb" }}>
          <BadgeCheck size={16}/>
        </div>
        <p className="font-black text-sm" style={{ color:"#111827" }}>Certified Owner Badges</p>
      </div>
      <p className="text-xs mb-4" style={{ color:"#6b7280" }}>{t("certifiedDesc")}</p>
      <div className="space-y-3">
        {tiers.map((tier,i)=>(
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl"
            style={{ background:tier.bg, border:`1.5px solid ${tier.border}` }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:tier.achieved?tier.color:`${tier.color}20`, color:tier.achieved?"white":tier.color }}>
              <tier.icon size={20}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-black text-sm" style={{ color:tier.color }}>{tier.label}</p>
                {tier.achieved && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background:tier.color }}>ACHIEVED ✓</span>
                )}
              </div>
              <p className="text-[10px] mt-0.5" style={{ color:"#6b7280" }}>{tier.desc}</p>
              {!tier.achieved && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold" style={{ color:"#9ca3af" }}>{totalBookings}/{tier.threshold}</span>
                    <span className="text-[10px] font-bold" style={{ color:tier.color }}>{Math.round((totalBookings/tier.threshold)*100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background:`${tier.color}20` }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(100,(totalBookings/tier.threshold)*100)}%` }}
                      transition={{ duration:1, ease:"easeOut" }}
                      className="h-full rounded-full" style={{ background:tier.color }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MULTI-IMAGE UPLOAD ───────────────────────────────────────────────────────
function MultiImageUpload({ photos, onChange, uploading, setUploading, t }) {
  const inputRef = useRef();
  const MAX = 15;

  const handleFiles = async (files) => {
    const remaining = MAX - photos.length;
    if (remaining <= 0) { alert(`Maximum ${MAX} photos allowed.`); return; }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded = await Promise.all(toUpload.map(async (file) => {
        const sRef = ref(storage, `pg-pics/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        const snap = await uploadBytes(sRef, file);
        const url  = await getDownloadURL(snap.ref);
        return { url, path: snap.ref.fullPath };
      }));
      onChange([...photos, ...uploaded]);
    } catch { alert("Some photos failed to upload. Check Firebase Storage rules."); }
    finally { setUploading(false); }
  };

  const removePhoto = async (idx) => {
    const photo = photos[idx];
    try { if (photo.path) await deleteObject(ref(storage, photo.path)).catch(()=>{}); } catch {}
    onChange(photos.filter((_,i)=>i!==idx));
  };

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        onClick={() => !uploading && photos.length < MAX && inputRef.current?.click()}
        className="relative h-44 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
        style={{
          background: photos.length === 0 ? "#fff8f9" : "white",
          border: `2px dashed ${photos.length < MAX ? "#fecdd3" : "#e5e7eb"}`,
          opacity: photos.length >= MAX ? 0.5 : 1
        }}>
        {uploading ? (
          <>
            <Loader2 size={36} className="animate-spin mb-2" style={{ color:"#f43f5e" }}/>
            <p className="text-sm font-bold" style={{ color:"#f43f5e" }}>Uploading…</p>
          </>
        ) : (
          <>
            <Upload size={32} className="mb-2" style={{ color:"#fda4af" }}/>
            <p className="text-sm font-black" style={{ color:"#f43f5e" }}>
              {photos.length === 0 ? "Upload PG Photos" : `Add More Photos (${photos.length}/${MAX})`}
            </p>
            <p className="text-xs mt-1" style={{ color:"#9ca3af" }}>JPG/PNG · Up to {MAX} photos</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
        onChange={e => e.target.files?.length && handleFiles(e.target.files)} />

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, idx) => (
            <motion.div key={idx} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
              className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={photo.url} alt={`PG ${idx+1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <div className="absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                  style={{ background:"#f43f5e" }}>Cover</div>
              )}
              <button onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                style={{ background:"rgba(0,0,0,0.7)", color:"white" }}>
                <X size={10}/>
              </button>
            </motion.div>
          ))}
          {/* Add more slot */}
          {photos.length < MAX && (
            <div onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl flex items-center justify-center cursor-pointer border-2 border-dashed"
              style={{ borderColor:"#fecdd3", background:"#fff8f9" }}>
              <PlusCircle size={22} style={{ color:"#fda4af" }}/>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="grid grid-cols-3 gap-2">
        {[t("photoTip1"),t("photoTip2"),t("photoTip3")].map(tip=>(
          <div key={tip} className="flex items-center gap-2 px-2 py-2 rounded-xl"
            style={{ background:"#fef3c7" }}>
            <Star size={9} style={{ color:"#d97706" }}/>
            <span className="text-[9px] font-bold" style={{ color:"#92400e" }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STEP DEFINITIONS ─────────────────────────────────────────────────────────
const STEP_DEFS = [
  { id:1, stepKey:"step1", descKey:"stepDesc1", icon:Camera,       color:"#f43f5e" },
  { id:2, stepKey:"step2", descKey:"stepDesc2", icon:Home,         color:"#2563eb" },
  { id:3, stepKey:"step3", descKey:"stepDesc3", icon:Wallet,       color:"#16a34a" },
  { id:4, stepKey:"step4", descKey:"stepDesc4", icon:Sparkles,     color:"#7c3aed" },
  { id:5, stepKey:"step5", descKey:"stepDesc5", icon:CheckCircle2, color:"#f43f5e" },
];

// ─── FIRST TIME VIEW ──────────────────────────────────────────────────────────
function FirstTimeView({ onAdd, t }) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
        className="relative rounded-[2rem] p-6 md:p-10 overflow-hidden"
        style={{ background:"linear-gradient(145deg,#fff0f2 0%,#fce7f3 50%,#fff1f2 100%)", border:"1.5px solid #fecdd3" }}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,#fda4af55,transparent)" }}/>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full mb-5"
            style={{ background:"white", color:"#f43f5e", border:"1.5px solid #fecdd3" }}>
            <Sparkles size={11}/> Welcome to StayPG PRO
          </div>
          <h2 className="text-2xl md:text-3xl font-black leading-tight mb-3" style={{ color:"#111827" }}>
            {t("heroTitle")} <span style={{ color:"#f43f5e" }}>🚀</span>
          </h2>
          <p className="text-sm mb-6 max-w-sm" style={{ color:"#6b7280" }}>{t("heroDesc")}</p>
          <motion.button onClick={onAdd} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2 px-6 py-3.5 text-white font-black rounded-2xl text-sm shadow-xl"
            style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow:"0 8px 24px rgba(244,63,94,0.35)" }}>
            <Plus size={17}/> {t("listFirst")}
          </motion.button>
        </div>
      </motion.div>

      {/* Steps */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color:"#9ca3af" }}>How to list — 5 easy steps</p>
        <div className="grid grid-cols-5 gap-2">
          {STEP_DEFS.map((s,i)=>(
            <motion.div key={s.id} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center"
              style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background:`${s.color}15`, color:s.color }}>
                <s.icon size={17}/>
              </div>
              <span className="text-[10px] font-black leading-tight" style={{ color:"#374151" }}>{t(s.stepKey)}</span>
              <span className="w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                style={{ background:s.color }}>{s.id}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Checklist + Why */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-[1.5rem] p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <h3 className="font-black text-sm flex items-center gap-2 mb-4" style={{ color:"#111827" }}>
            <Target size={15} style={{ color:"#f43f5e" }}/> {t("onboardingProgress")}
          </h3>
          {[{label:t("accountCreated"),done:true},{label:t("addFirstPg"),done:false,action:true},{label:t("getVerified"),done:false},{label:t("receiveLeads"),done:false}].map((item,i)=>(
            <motion.div key={i} initial={{ opacity:0,x:-16 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.1 }}
              className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 flex-shrink-0"
                style={item.done?{background:"#16a34a",borderColor:"#16a34a",color:"white"}:{background:"white",borderColor:"#fecdd3",color:"#d1d5db"}}>
                {item.done?<Check size={12}/>:i+1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color:item.done?"#16a34a":"#374151" }}>{item.label}</p>
              </div>
              {item.action && (
                <button onClick={onAdd} className="text-xs font-black flex items-center gap-1" style={{ color:"#f43f5e" }}>
                  {t("startNow")}<ChevronRight size={11}/>
                </button>
              )}
            </motion.div>
          ))}
        </div>
        <div className="rounded-[1.5rem] p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <h3 className="font-black text-sm flex items-center gap-2 mb-4" style={{ color:"#111827" }}>
            <Award size={15} style={{ color:"#7c3aed" }}/> {t("whyStayPg")}
          </h3>
          {[
            { icon:Flame,      color:"#f43f5e", label:"3× more enquiries vs others"     },
            { icon:Users,      color:"#2563eb", label:"50K+ active students/month"     },
            { icon:TrendingUp, color:"#16a34a", label:"Listing is always free"         },
            { icon:Star,       color:"#d97706", label:"4.8★ owner satisfaction score"  },
          ].map((item,i)=>(
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:`${item.color}12`, color:item.color }}>
                <item.icon size={16}/>
              </div>
              <p className="text-sm font-bold" style={{ color:"#374151" }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ pgs, leads, alerts, t, onAdd }) {
  const total = pgs.reduce((s,p)=>s+Number(p.price||0),0);
  const hour  = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const hotLeads = leads.filter(l=>l.status==="hot");

  const chartData = {
    labels:["Jan","Feb","Mar","Apr","May","Jun"],
    datasets:[{ fill:true, data:[0,0,0,0,0,total].map((v,i)=>i===5?v:Math.floor(v*0.5+Math.random()*v*0.3)),
      borderColor:"#f43f5e", backgroundColor:"rgba(244,63,94,0.07)", tension:0.4, pointRadius:4, pointBackgroundColor:"#f43f5e" }]
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
        className="rounded-2xl px-5 py-4 flex items-center justify-between"
        style={{ background:"linear-gradient(135deg,#fff0f2,#fce7f3)", border:"1.5px solid #fecdd3" }}>
        <div>
          <h3 className="font-black text-lg" style={{ color:"#111827" }}>{greeting}! 👋</h3>
          <p className="text-sm mt-0.5" style={{ color:"#6b7280" }}>{pgs.length} PG{pgs.length!==1?"s":""} · {leads.length} leads</p>
        </div>
        {hotLeads.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
            style={{ background:"white", color:"#f43f5e", border:"1.5px solid #fecdd3" }}>
            <Flame size={12}/>{hotLeads.length} hot
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Monthly Revenue" value={`₹${total.toLocaleString("en-IN")}`} icon={Wallet}    color="#f43f5e" bg="#fff8f9" delay={0}/>
        <KpiCard label="Active Leads"    value={String(leads.length)}                icon={Users}     color="#2563eb" bg="#f8fbff" delay={0.05}/>
        <KpiCard label="Total Views"     value={String(pgs.reduce((s,p)=>s+Number(p.views||0),0))} icon={Eye} color="#16a34a" bg="#f8fffe" delay={0.1}/>
        <KpiCard label="Avg Rating"      value={pgs.length?(pgs.reduce((s,p)=>s+(Number(p.rating)||0),0)/pgs.length).toFixed(1):"–"} icon={Star} color="#d97706" bg="#fffdf5" delay={0.15}/>
      </div>

      {pgs.length===0 && <EmptyState icon={Building2} title={t("noProperties")} desc={t("noPropertiesDesc")} action={onAdd} actionLabel={t("listFirst")}/>}

      {pgs.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
            <p className="font-black text-sm flex items-center gap-2 mb-4" style={{ color:"#111827" }}>
              <BarChart2 size={14} style={{ color:"#f43f5e" }}/> Revenue Trend
            </p>
            <div className="h-40">
              <Line data={chartData} options={{ maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{display:false}, x:{grid:{display:false}} } }}/>
            </div>
          </div>
          <div className="rounded-2xl p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
            <p className="font-black text-sm flex items-center gap-2 mb-4" style={{ color:"#111827" }}>
              <Users size={14} style={{ color:"#f43f5e" }}/> Recent Leads
            </p>
            {leads.length===0
              ? <p className="text-sm" style={{ color:"#9ca3af" }}>{t("noLeadsYet")}</p>
              : leads.slice(0,4).map((l,i)=>(
                <div key={l.id||i} className="flex items-center gap-3 py-2.5" style={{ borderBottom:"1px solid #fff0f2" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ background:"#fff0f2", color:"#f43f5e" }}>{(l.name||"?")[0].toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color:"#111827" }}>{l.name||"Anonymous"}</p>
                    <p className="text-[10px]" style={{ color:"#9ca3af" }}>{l.pgName||""}</p>
                  </div>
                  {l.phone && (
                    <a href={`tel:${l.phone}`} className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background:"#f0fdf4", color:"#16a34a" }}>
                      <Phone size={11}/>
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Certified badge section */}
      <CertifiedBadgeSection pgs={pgs} t={t}/>
    </div>
  );
}

// ─── PROPERTIES TAB ───────────────────────────────────────────────────────────
function PropertiesTab({ pgs, loading, onEdit, onDelete, searchQ, t, onAdd }) {
  const [copied, setCopied] = useState(null);
  const filtered = pgs.filter(p=>
    (p.name||"").toLowerCase().includes((searchQ||"").toLowerCase())||
    (p.city||"").toLowerCase().includes((searchQ||"").toLowerCase())
  );

  if (loading) return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0,1,2].map(i=>(
        <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <div className="h-44" style={{ background:"#fff0f2" }}/>
          <div className="p-4 space-y-2">
            <div className="h-4 rounded-xl w-3/4" style={{ background:"#fff0f2" }}/>
            <div className="h-3 rounded-xl w-1/2" style={{ background:"#fff8f9" }}/>
          </div>
        </div>
      ))}
    </div>
  );

  if (filtered.length===0) return <EmptyState icon={Building2} title={t("noProperties")} desc={t("noPropertiesDesc")} action={onAdd} actionLabel={t("listFirst")}/>;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold px-1" style={{ color:"#9ca3af" }}>{filtered.length} propert{filtered.length===1?"y":"ies"}</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((pg,i)=>{
            const coverPhoto = pg.photos?.[0]?.url || pg.photoUrl;
            return (
              <motion.div key={pg.id}
                initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,scale:0.95 }}
                transition={{ delay:i*0.04 }} whileHover={{ y:-4 }}
                className="rounded-2xl overflow-hidden group transition-all"
                style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
                <div className="h-44 relative overflow-hidden" style={{ background:"#fff0f2" }}>
                  {coverPhoto
                    ? <img src={coverPhoto} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={pg.name}/>
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} style={{ color:"#fda4af" }}/></div>}
                  <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase"
                    style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)" }}>{pg.type}</div>
                  {/* Photo count badge */}
                  {pg.photos?.length > 1 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black"
                      style={{ background:"rgba(0,0,0,0.6)", color:"white" }}>
                      <Camera size={9}/> {pg.photos.length}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={()=>onEdit(pg)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm" style={{ color:"#2563eb" }}>
                      <Edit2 size={11}/>
                    </button>
                    <button onClick={()=>onDelete(pg.id)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm" style={{ color:"#f43f5e" }}>
                      <Trash2 size={11}/>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-black truncate" style={{ color:"#111827" }}>{pg.name}</h3>
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color:"#9ca3af" }}>
                    <MapPin size={10}/>{pg.area}, {pg.city}
                  </p>
                  <div className="flex items-center gap-3 mt-3 pt-3 text-xs" style={{ borderTop:"1px solid #fff0f2", color:"#9ca3af" }}>
                    <span className="flex items-center gap-1"><Eye size={10}/>{pg.views||0}</span>
                    <span className="flex items-center gap-1"><Users size={10}/>{pg.leads||0} leads</span>
                    <span className="flex items-center gap-1 ml-auto"><Star size={10} style={{ color:"#fbbf24" }}/>{pg.rating||"–"}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-black text-lg" style={{ color:"#f43f5e" }}>
                      ₹{Number(pg.price||0).toLocaleString("en-IN")}<span className="text-xs font-normal" style={{ color:"#9ca3af" }}>/mo</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase" style={{ background:"#fff0f2", color:"#f43f5e" }}>{pg.sharing}</span>
                  </div>
                  <button onClick={()=>{navigator.clipboard.writeText(`https://staypg.in/pg/${pg.id}`);setCopied(pg.id);setTimeout(()=>setCopied(null),2000);}}
                    className="mt-3 w-full text-xs font-bold flex items-center justify-center gap-1.5 py-2 rounded-xl"
                    style={{ background:"#fff8f9", color:copied===pg.id?"#16a34a":"#9ca3af" }}>
                    {copied===pg.id?<><Check size={11}/>Copied!</>:<><Copy size={11}/>Copy link</>}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── LEADS TAB ────────────────────────────────────────────────────────────────
function LeadsTab({ leads, loading, pgs, t }) {
  const statusStyles = {
    hot:       { bg:"#fff0f2", color:"#f43f5e", label:t("hotLeadLabel") },
    warm:      { bg:"#fffbeb", color:"#d97706", label:t("warmLabel") },
    new:       { bg:"#eff6ff", color:"#2563eb", label:t("newLabel") },
    converted: { bg:"#f0fdf4", color:"#16a34a", label:"Converted" },
  };
  const pgMap = Object.fromEntries(pgs.map(p=>[p.id,p.name]));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total" value={String(leads.length)}                          icon={Users}        color="#2563eb" bg="#f8fbff"/>
        <KpiCard label="Hot"   value={String(leads.filter(l=>l.status==="hot").length)} icon={Flame}     color="#f43f5e" bg="#fff8f9"/>
        <KpiCard label="Done"  value={String(leads.filter(l=>l.status==="converted").length)} icon={CheckCircle2} color="#16a34a" bg="#f8fffe"/>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid #fff0f2" }}>
          <p className="font-black text-sm" style={{ color:"#111827" }}>{t("leadPipeline")}</p>
        </div>
        {loading ? <div className="p-5 space-y-3">{[0,1,2].map(i=><div key={i} className="h-14 rounded-xl animate-pulse" style={{ background:"#fff8f9" }}/>)}</div>
          : leads.length===0 ? <EmptyState icon={Inbox} title="No leads yet" desc={t("noLeadsYet")}/>
          : leads.map((l,i)=>{
            const s=statusStyles[l.status||"new"]||statusStyles.new;
            return (
              <div key={l.id||i} className="flex items-center gap-3 px-4 py-3.5 transition-all"
                style={{ borderBottom: i<leads.length-1?"1px solid #fff0f2":"none" }}
                onMouseEnter={e=>e.currentTarget.style.background="#fff8f9"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background:s.bg, color:s.color }}>{(l.name||"?")[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color:"#111827" }}>{l.name||"Anonymous"}</p>
                  <p className="text-xs truncate" style={{ color:"#9ca3af" }}>{pgMap[l.pgId]||l.pgName||""}</p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0" style={{ background:s.bg, color:s.color }}>{s.label}</span>
                {l.phone && (
                  <a href={`tel:${l.phone}`} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:"#f0fdf4", color:"#16a34a" }}>
                    <Phone size={13}/>
                  </a>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ─── REVENUE TAB ──────────────────────────────────────────────────────────────
function RevenueTab({ pgs, t }) {
  const total = pgs.reduce((s,p)=>s+Number(p.price||0),0);
  const donutData = {
    labels:pgs.map(p=>p.name||"PG"),
    datasets:[{data:pgs.map(p=>Number(p.price||0)),backgroundColor:["#f43f5e","#fb923c","#fbbf24","#34d399","#60a5fa","#a78bfa"],borderWidth:0}]
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="This Month"  value={`₹${total.toLocaleString("en-IN")}`}      icon={Wallet}      color="#f43f5e" bg="#fff8f9"/>
        <KpiCard label="Total Earned" value={`₹${(total*6).toLocaleString("en-IN")}`} icon={TrendingUp}  color="#16a34a" bg="#f8fffe"/>
        <KpiCard label="Properties"   value={String(pgs.length)}                       icon={Building2}   color="#2563eb" bg="#f8fbff"/>
        <KpiCard label="Pending"      value="₹0"                                       icon={AlertCircle} color="#d97706" bg="#fffdf5"/>
      </div>
      {pgs.length===0 ? <EmptyState icon={Wallet} title="No revenue data" desc={t("noPgRevenue")||"Add properties to see revenue."}/> : (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 rounded-2xl p-5" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
            <p className="font-black text-sm mb-5" style={{ color:"#111827" }}>{t("revenueByProp")}</p>
            <div className="space-y-4">
              {pgs.map(p=>{
                const amt=Number(p.price||0),pct=total>0?Math.round((amt/total)*100):0;
                return (
                  <div key={p.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold truncate max-w-[60%]" style={{ color:"#111827" }}>{p.name}</span>
                      <span className="text-sm font-black" style={{ color:"#111827" }}>₹{amt.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background:"#fff0f2" }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8,ease:"easeOut" }}
                        className="h-full rounded-full" style={{ background:"linear-gradient(90deg,#f43f5e,#fb7185)" }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {pgs.length > 0 && (
            <div className="rounded-2xl p-5 flex flex-col items-center" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
              <p className="font-black text-sm mb-4 self-start" style={{ color:"#111827" }}>{t("shareOfRevenue")}</p>
              <div className="h-40 w-40"><Doughnut data={donutData} options={{ maintainAspectRatio:false, plugins:{legend:{display:false}}, cutout:"70%" }}/></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AI TAB ───────────────────────────────────────────────────────────────────
function AITab({ pgs, leads, t }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const suggestions = [
    "Suggest optimal rent for my PG", "Which amenities attract more leads?",
    "Write an attractive description", "How to get more leads this week?",
  ];
  const ask = async (q) => {
    if (!q.trim()||loading) return;
    const msg = q.trim(); setQuery(""); setLoading(true);
    setHistory(h=>[...h,{role:"user",content:msg}]);
    const ctx = pgs.map(p=>`${p.name} in ${p.city} (₹${p.price}/mo)`).join("; ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`PG business advisor for Indian owners on StayPG. Properties: ${ctx||"None"}. Leads: ${leads.length}. Be concise, practical, Indian context.`,
          messages:[...history.map(m=>({role:m.role,content:m.content})),{role:"user",content:msg}]
        })
      });
      const data = await res.json();
      setHistory(h=>[...h,{role:"assistant",content:data.content?.map(c=>c.text||"").join("")||"Error."}]);
    } catch { setHistory(h=>[...h,{role:"assistant",content:"Could not connect."}]); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] p-5 text-white" style={{ background:"linear-gradient(135deg,#7c3aed,#f43f5e)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:"rgba(255,255,255,0.2)" }}><Sparkles size={20}/></div>
          <div><p className="font-black">AI Business Advisor</p><p className="text-white/70 text-xs">Ask anything about your PG business</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.map(q=>(
            <button key={q} onClick={()=>ask(q)} className="text-left text-xs p-3 rounded-xl font-medium"
              style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.9)" }}>
              ✦ {q}
            </button>
          ))}
        </div>
      </div>
      {history.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background:"white", border:"1.5px solid #ffe4e6" }}>
          <div className="max-h-80 overflow-y-auto p-4 space-y-3">
            {history.map((m,i)=>(
              <div key={i} className={`flex gap-2.5 ${m.role==="user"?"flex-row-reverse":""}`}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                  style={m.role==="user"?{background:"linear-gradient(135deg,#f43f5e,#e11d48)",color:"white"}:{background:"#f5f3ff",color:"#7c3aed"}}>
                  {m.role==="user"?"U":"AI"}
                </div>
                <div className="max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={m.role==="user"?{background:"#fff0f2",color:"#9f1239"}:{background:"#f8fafc",color:"#374151"}}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="flex gap-2.5"><div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black" style={{ background:"#f5f3ff",color:"#7c3aed" }}>AI</div><div className="px-3 py-2.5 rounded-2xl flex items-center gap-2" style={{ background:"#f8fafc" }}><Loader2 size={13} className="animate-spin" style={{ color:"#9ca3af" }}/><span className="text-xs" style={{ color:"#9ca3af" }}>Thinking…</span></div></div>}
          </div>
          <div className="flex gap-2 p-3" style={{ borderTop:"1px solid #fff0f2" }}>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask(query)}
              placeholder="Ask about pricing, leads…"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none placeholder:text-slate-400"
              style={{ background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" }}/>
            <button onClick={()=>ask(query)} disabled={loading||!query.trim()}
              className="px-4 py-2.5 text-white rounded-xl text-sm font-black disabled:opacity-40"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)" }}>
              {loading?<Loader2 size={13} className="animate-spin"/>:<ChevronRight size={13}/>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertsTab({ alerts, t }) {
  if (alerts.length===0) return <EmptyState icon={Bell} title={t("noAlertsYet")} desc="You're all caught up!"/>;
  return (
    <div className="space-y-3">
      {alerts.map((a,i)=>(
        <motion.div key={a.id||i} initial={{ opacity:0,x:-16 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.05 }}
          className="rounded-2xl px-4 py-4 flex items-start gap-4"
          style={{ background:"white", border:"1.5px solid #fef3c7" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"#fef3c7",color:"#d97706" }}>
            {a.type==="booking"||a.type==="visit"?<Bell size={17}/>:<AlertCircle size={17}/>}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color:"#111827" }}>{a.message||a.title}</p>
            {a.desc && <p className="text-xs mt-0.5" style={{ color:"#9ca3af" }}>{a.desc}</p>}
          </div>
          {a.read===false && (
            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background:"#f43f5e" }}/>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── FORM MODAL ───────────────────────────────────────────────────────────────
function FormModal({ show, onClose, editPg, t }) {
  const [formStep, setFormStep]     = useState(1);
  const [loading, setLoading]       = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const set = (k,v) => setFormData(p=>({...p,[k]:v}));
  const toggleAmenity = (id) => setFormData(p=>({
    ...p, amenities: p.amenities.includes(id)?p.amenities.filter(x=>x!==id):[...p.amenities,id]
  }));

  useEffect(()=>{
    if (editPg) setFormData({...EMPTY_FORM,...editPg, photos:editPg.photos||[]});
    else setFormData(EMPTY_FORM);
    setFormStep(1);
  }, [editPg, show]);

  const handleSubmit = async () => {
    if (formData.photos.length===0 && !formData.photoUrl) return alert("Please upload at least 1 photo!");
    if (!formData.name||!formData.price||!formData.contact) return alert("Fill all required fields.");
    setLoading(true);
    try {
      const coverUrl = formData.photos?.[0]?.url || formData.photoUrl || "";
      const payload = {
        ...formData, price:Number(formData.price),
        deposit:Number(formData.deposit)||0, rooms:Number(formData.rooms)||0,
        ownerId:auth.currentUser.uid, photoUrl:coverUrl
      };
      if (editPg?.id) { await updateDoc(doc(db,"pgs",editPg.id),payload); }
      else { payload.createdAt=serverTimestamp(); payload.leads=0; payload.views=0; payload.rating=0; await addDoc(collection(db,"pgs"),payload); }
      onClose();
    } catch(err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const checklist = [
    { label:t("photoUploaded"),  ok:formData.photos.length>0||!!formData.photoUrl },
    { label:t("pgNameSet"),      ok:!!formData.name },
    { label:t("cityAreaSet"),    ok:!!formData.area },
    { label:t("contactSet"),     ok:!!formData.contact },
    { label:t("rentSet"),        ok:!!formData.price },
    { label:t("amenitiesAdded"), ok:formData.amenities.length>0||!!formData.customAmenities },
  ];
  const readyCount = checklist.filter(c=>c.ok).length;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>

          {/* Modal — full height on mobile, constrained on desktop */}
          <motion.div
            initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
            transition={{ type:"spring", damping:30, stiffness:300 }}
            className="relative z-10 w-full sm:max-w-2xl sm:rounded-[2rem] overflow-hidden flex flex-col"
            style={{
              background:"white",
              height: "100dvh",
              maxHeight: "100dvh",
            }}>

            {/* Progress bar */}
            <div className="h-1.5 flex-shrink-0" style={{ background:"#fff0f2" }}>
              <motion.div className="h-full rounded-r-full"
                style={{ background:"linear-gradient(90deg,#f43f5e,#fb7185)" }}
                animate={{ width:`${(formStep/5)*100}%` }} transition={{ duration:0.4 }}/>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0" style={{ borderBottom:"1.5px solid #fff0f2" }}>
              <div className="flex items-center gap-3">
                {formStep > 1 && (
                  <button onClick={()=>setFormStep(s=>s-1)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"#fff0f2", color:"#f43f5e" }}>
                    <ChevronLeft size={16}/>
                  </button>
                )}
                <div>
                  <h3 className="text-base font-black" style={{ color:"#111827" }}>
                    {editPg?.id ? t("editProperty") : t("listProperty")}
                  </h3>
                  <p className="text-[10px]" style={{ color:"#9ca3af" }}>Step {formStep}/5 · {t(STEP_DEFS[formStep-1]?.stepKey)}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"#fff0f2", color:"#f43f5e" }}>
                <X size={16}/>
              </button>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 px-5 py-3 flex-shrink-0">
              {STEP_DEFS.map((s,i)=>{
                const done=formStep>s.id, active=formStep===s.id;
                return (
                  <div key={s.id} className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all"
                      style={done?{background:"#16a34a",borderColor:"#16a34a",color:"white"}
                        :active?{borderColor:s.color,color:s.color,background:`${s.color}12`}
                        :{background:"white",borderColor:"#fecdd3",color:"#d1d5db"}}>
                      {done?<Check size={11}/>:s.id}
                    </div>
                    {i<STEP_DEFS.length-1 && <div className="w-5 h-0.5 rounded-full" style={{ background:done?"#16a34a":"#ffe4e6" }}/>}
                  </div>
                );
              })}
            </div>

            {/* Step info */}
            <div className="px-5 pb-2 flex-shrink-0">
              <div className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background:"#fff8f9" }}>
                <Info size={13} style={{ color:"#fda4af" }}/>
                <p className="text-xs" style={{ color:"#6b7280" }}>{t(STEP_DEFS[formStep-1]?.descKey)}</p>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <AnimatePresence mode="wait">
                <motion.div key={formStep}
                  initial={{ x:30,opacity:0 }} animate={{ x:0,opacity:1 }} exit={{ x:-30,opacity:0 }}
                  transition={{ duration:0.2 }} className="space-y-4 pt-2">

                  {/* STEP 1: Multi-image upload */}
                  {formStep===1 && (
                    <MultiImageUpload
                      photos={formData.photos||[]}
                      onChange={p=>set("photos",p)}
                      uploading={uploading}
                      setUploading={setUploading}
                      t={t}
                    />
                  )}

                  {/* STEP 2: Details */}
                  {formStep===2 && (
                    <div className="space-y-4">
                      <IBox label={t("pgName")} required value={formData.name} onChange={v=>set("name",v)} placeholder={t("pgNamePlaceholder")}/>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color:"#9ca3af" }}>{t("city")}<span style={{ color:"#f43f5e" }}>*</span></label>
                        <select className="w-full px-4 py-3 rounded-2xl font-bold outline-none text-sm"
                          style={{ background:"#fff8f9", border:"1.5px solid #fecdd3", color:"#111827" }}
                          value={formData.city} onChange={e=>set("city",e.target.value)}>
                          {CITIES.map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <IBox label={t("area")} required value={formData.area} onChange={v=>set("area",v)} placeholder={t("areaPlaceholder")}/>
                      <IBox label={t("whatsapp")} required value={formData.contact} onChange={v=>set("contact",v)} placeholder={t("whatsappPlaceholder")}/>
                      <IBox label={t("address")} required value={formData.address} onChange={v=>set("address",v)} placeholder={t("addressPlaceholder")}/>
                      <IBox label={t("aboutPg")} value={formData.description} onChange={v=>set("description",v)} placeholder={t("aboutPlaceholder")} multiline rows={3}/>
                    </div>
                  )}

                  {/* STEP 3: Pricing */}
                  {formStep===3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <IBox label={t("rent")} required type="number" value={formData.price} onChange={v=>set("price",v)} placeholder="6500"/>
                        <IBox label={t("deposit")} type="number" value={formData.deposit} onChange={v=>set("deposit",v)} placeholder="13000"/>
                        <IBox label={t("totalRooms")} type="number" value={formData.rooms} onChange={v=>set("rooms",v)} placeholder="10"/>
                        <IBox label={t("floor")} value={formData.floor} onChange={v=>set("floor",v)} placeholder="Ground / 1st"/>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
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
                            <option>Single</option><option>Double</option><option>Triple</option><option>Quadruple</option>
                          </select>
                        </div>
                      </div>
                      {formData.price && (
                        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
                          <TrendingUp size={15} style={{ color:"#16a34a" }}/>
                          <p className="text-sm font-medium" style={{ color:"#166534" }}>
                            {t("avgRent")} {formData.city} {t("isRange")} {Number(formData.price)<6500?t("competitive"):t("goodPrice")}
                          </p>
                        </div>
                      )}
                      <IBox label={t("houseRules")} value={formData.rules} onChange={v=>set("rules",v)} placeholder={t("houseRulesPlaceholder")} multiline rows={3}/>
                    </div>
                  )}

                  {/* STEP 4: Amenities */}
                  {formStep===4 && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest block mb-3" style={{ color:"#9ca3af" }}>{t("whatYouOffer")}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {AMENITIES_LIST.map(a=>{
                            const Icon=a.icon, sel=formData.amenities.includes(a.id);
                            return (
                              <button key={a.id} type="button" onClick={()=>toggleAmenity(a.id)}
                                className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                                style={sel
                                  ?{border:"2px solid #f43f5e",background:"#fff0f2",color:"#f43f5e"}
                                  :{border:"1.5px solid #ffe4e6",background:"#fff8f9",color:"#6b7280"}}>
                                <Icon size={17}/>
                                <span className="text-sm font-bold">{a.label}</span>
                                {sel && <Check size={12} className="ml-auto" style={{ color:"#f43f5e" }}/>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Custom amenities text field */}
                      <IBox
                        label={t("customAmenitiesLabel")}
                        value={formData.customAmenities||""}
                        onChange={v=>set("customAmenities",v)}
                        placeholder={t("customAmenitiesPlaceholder")}
                        multiline rows={3}
                      />
                    </div>
                  )}

                  {/* STEP 5: Review */}
                  {formStep===5 && (
                    <div className="space-y-4">
                      {/* Preview */}
                      <div className="rounded-2xl overflow-hidden" style={{ border:"1.5px solid #ffe4e6" }}>
                        <div className="h-40 relative overflow-hidden" style={{ background:"#fff0f2" }}>
                          {formData.photos?.[0]?.url||formData.photoUrl
                            ? <img src={formData.photos?.[0]?.url||formData.photoUrl} className="w-full h-full object-cover" alt="preview"/>
                            : <div className="w-full h-full flex items-center justify-center"><Camera size={32} style={{ color:"#fda4af" }}/></div>}
                          <div className="absolute top-2 left-2 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase"
                            style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)" }}>{formData.type}</div>
                          {formData.photos?.length > 0 && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-[9px] font-black"
                              style={{ background:"rgba(0,0,0,0.6)", color:"white" }}>
                              {formData.photos.length} photos
                            </div>
                          )}
                        </div>
                        <div className="p-4" style={{ background:"white" }}>
                          <p className="font-black" style={{ color:"#111827" }}>{formData.name||"PG Name"}</p>
                          <p className="text-xs flex items-center gap-1 mt-1" style={{ color:"#9ca3af" }}><MapPin size={10}/>{formData.area||"Area"}, {formData.city}</p>
                          <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop:"1px solid #fff0f2" }}>
                            <span className="font-black text-lg" style={{ color:"#f43f5e" }}>₹{formData.price||"0"}<span className="text-xs font-normal" style={{ color:"#9ca3af" }}>/mo</span></span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase" style={{ background:"#fff0f2", color:"#f43f5e" }}>{formData.sharing} sharing</span>
                          </div>
                        </div>
                      </div>
                      {/* Checklist */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-black text-sm" style={{ color:"#111827" }}>{t("readiness")}</p>
                          <span className="text-xs font-black px-2.5 py-1 rounded-full"
                            style={readyCount>=5?{background:"#f0fdf4",color:"#16a34a"}:{background:"#fef3c7",color:"#d97706"}}>
                            {readyCount}/6
                          </span>
                        </div>
                        {checklist.map(item=>(
                          <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={item.ok?{background:"#f0fdf4",border:"1px solid #bbf7d0"}:{background:"#fff0f2",border:"1px solid #fecdd3"}}>
                            {item.ok?<CheckCircle2 size={14} style={{ color:"#16a34a" }}/>:<AlertCircle size={14} style={{ color:"#fda4af" }}/>}
                            <span className="text-sm font-bold" style={{ color:item.ok?"#16a34a":"#f43f5e" }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom CTA — always visible */}
            <div className="flex-shrink-0 px-5 py-4" style={{ borderTop:"1.5px solid #fff0f2", background:"white" }}>
              {formStep < 5 ? (
                <motion.button
                  onClick={()=>setFormStep(s=>s+1)}
                  whileTap={{ scale:0.97 }}
                  className="w-full py-4 text-white font-black rounded-2xl text-base shadow-lg flex items-center justify-center gap-2"
                  style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow:"0 8px 24px rgba(244,63,94,0.35)" }}>
                  {t("next")} →
                </motion.button>
              ) : (
                <motion.button onClick={handleSubmit} disabled={loading||uploading||readyCount<4}
                  whileTap={{ scale:0.97 }}
                  className="w-full py-4 text-white font-black rounded-2xl text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow:"0 8px 24px rgba(244,63,94,0.35)" }}>
                  {loading?<Loader2 size={18} className="animate-spin"/>:<Sparkles size={18}/>}
                  {loading?(editPg?.id?t("saving"):t("publishingLive")):editPg?.id?t("saveChanges"):t("publish")}
                </motion.button>
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
  const [activeTab, setActiveTab]   = useState("overview");
  const [showForm, setShowForm]     = useState(false);
  const [editPg, setEditPg]         = useState(null);
  const [searchQ, setSearchQ]       = useState("");
  const [notifOpen, setNotifOpen]   = useState(false);
  const [dark, setDark]             = useState(false);
  const [lang, setLang]             = useState("en");
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useT(lang);

  const { pgs, loading: pgsLoading } = useMyPgs();
  const pgIds = pgs.map(p=>p.id);
  const { leads, loading: leadsLoading } = useLeads(pgIds);
  const alerts = useAlerts(auth.currentUser?.uid);
  const unreadAlerts = alerts.filter(a=>a.read===false).length;

  const openAdd  = () => { setEditPg(null);  setShowForm(true); setMobileOpen(false); };
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
    { id:"alerts",     icon:Bell,            label:t("alerts"),     badge:unreadAlerts||null, badgeColor:"#d97706" },
  ];

  const navigate = (tab) => { setActiveTab(tab); setMobileOpen(false); };

  const pageStyle = { background:"linear-gradient(160deg,#fff5f7 0%,#ffffff 50%,#fef2f4 100%)" };
  const sidebarBg = { background:"white", borderColor:"#ffe4e6" };
  const headerBg  = { background:"rgba(255,255,255,0.92)", borderColor:"#ffe4e6", backdropFilter:"blur(16px)" };

  return (
    <div className="min-h-screen flex font-sans" style={pageStyle}>

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 flex flex-col border-r
        transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} style={{ ...sidebarBg, maxHeight:"100dvh" }}>

        {/* Logo */}
        <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom:"1.5px solid #ffe4e6" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
            style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)" }}>
            <span className="text-white font-black text-sm">SP</span>
          </div>
          <div>
            <div className="font-black text-base leading-none" style={{ color:"#111827" }}>
              Stay<span style={{ color:"#f43f5e" }}>PG</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color:"#9ca3af" }}>Owner PRO</div>
          </div>
          <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background:"#fff0f2", color:"#f43f5e", border:"1px solid #fecdd3" }}>PRO</span>
          <button className="lg:hidden" onClick={()=>setMobileOpen(false)}>
            <X size={16} style={{ color:"#9ca3af" }}/>
          </button>
        </div>

        {/* Owner card */}
        <div className="mx-3 my-3 flex items-center gap-3 p-3 rounded-2xl flex-shrink-0"
          style={{ background:"#fff8f9", border:"1.5px solid #fecdd3" }}>
          <div className="w-9 h-9 rounded-xl text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)" }}>{emailInitial}</div>
          <div className="min-w-0">
            <p className="text-sm font-black truncate" style={{ color:"#111827" }}>{displayName}</p>
            <p className="text-[10px] truncate" style={{ color:"#9ca3af" }}>{auth.currentUser?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-1 overflow-y-auto space-y-0.5">
          <SectionLabel text="Main"/>
          {TABS.slice(0,3).map(tab=>(
            <SBtn key={tab.id} icon={tab.icon} label={tab.label} active={activeTab===tab.id}
              onClick={()=>navigate(tab.id)} badge={tab.badge} badgeColor={tab.badgeColor}/>
          ))}
          <SectionLabel text="Finance & Tools"/>
          {TABS.slice(3).map(tab=>(
            <SBtn key={tab.id} icon={tab.icon} label={tab.label} active={activeTab===tab.id}
              onClick={()=>navigate(tab.id)} badge={tab.badge} badgeColor={tab.badgeColor}/>
          ))}
          <SectionLabel text="Account"/>
          <SBtn icon={SettingsIcon} label="Settings" active={false} onClick={()=>{}}/>
          <SBtn icon={Headphones}   label="Help"     active={false} onClick={()=>{}}/>
        </nav>

        {/* Upgrade */}
        <div className="mx-3 mb-3 p-4 rounded-2xl flex-shrink-0"
          style={{ background:"linear-gradient(135deg,#fff0f2,#fce7f3)", border:"1.5px solid #fecdd3" }}>
          <p className="font-black text-sm mb-1" style={{ color:"#111827" }}>{t("upgrade")}</p>
          <p className="text-[10px] mb-3" style={{ color:"#9ca3af" }}>{t("upgradeDesc")}</p>
          <button className="w-full text-[11px] font-black py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5"
            style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow:"0 4px 12px rgba(244,63,94,0.3)" }}>
            <Lock size={10}/> {t("upgradeBtn")}
          </button>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4 pt-2 flex-shrink-0" style={{ borderTop:"1.5px solid #ffe4e6" }}>
          <button onClick={()=>{ auth.signOut(); window.location.href="/"; }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all"
            style={{ color:"#9ca3af" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#fff0f2";e.currentTarget.style.color="#f43f5e";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#9ca3af";}}>
            <LogOut size={15}/>{t("signOut")}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" onClick={()=>setMobileOpen(false)}/>}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-40 px-4 py-3 flex items-center gap-2 border-b flex-shrink-0" style={headerBg}>
          {/* Hamburger — mobile only */}
          <button className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"#fff0f2", color:"#f43f5e" }}
            onClick={()=>setMobileOpen(true)}>
            <Menu size={17}/>
          </button>

          {/* Search — hidden on small screens, visible md+ */}
          <div className="hidden md:flex flex-1 items-center gap-2 rounded-xl px-3 py-2 max-w-xs"
            style={{ background:"#fff8f9", border:"1.5px solid #fecdd3" }}>
            <Search size={13} style={{ color:"#fda4af" }}/>
            <input className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
              style={{ color:"#111827" }}
              placeholder={t("search")} value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
          </div>

          {/* Page title — mobile only */}
          <h1 className="flex-1 font-black text-base truncate lg:hidden" style={{ color:"#111827" }}>
            {TABS.find(tab=>tab.id===activeTab)?.label||t("overview")}
          </h1>
          <h1 className="hidden lg:block font-black text-lg" style={{ color:"#111827" }}>
            {TABS.find(tab=>tab.id===activeTab)?.label||t("overview")}
          </h1>

          <div className="flex items-center gap-2 ml-auto">
            <LangSwitcher lang={lang} setLang={setLang}/>
            <button onClick={()=>setDark(d=>!d)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"#fff0f2", color:"#f43f5e" }}>
              {dark?<Sun size={15}/>:<Moon size={15}/>}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={()=>setNotifOpen(o=>!o)}
                className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                style={{ background:"#fff0f2", color:"#f43f5e" }}>
                <Bell size={15}/>
                {unreadAlerts > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                    style={{ background:"#f43f5e" }}/>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={()=>setNotifOpen(false)}/>
                    <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:8 }}
                      className="absolute right-0 top-12 w-72 rounded-2xl shadow-xl p-4 z-50"
                      style={{ background:"white", border:"1.5px solid #fecdd3" }}>
                      <p className="font-black text-sm mb-3" style={{ color:"#111827" }}>{t("notifications")}</p>
                      {alerts.length===0
                        ? <p className="text-xs text-center py-4" style={{ color:"#9ca3af" }}>All caught up! 🎉</p>
                        : alerts.slice(0,5).map((a,i)=>(
                          <div key={a.id||i} className="flex items-start gap-3 py-2.5" style={{ borderBottom:i<Math.min(alerts.length,5)-1?"1px solid #fff0f2":"none" }}>
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background:a.type==="booking"||a.type==="visit"?"#fff0f2":"#fef3c7",
                                color:a.type==="booking"||a.type==="visit"?"#f43f5e":"#d97706" }}>
                              <Bell size={12}/>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold" style={{ color:"#111827" }}>{a.message||a.title}</p>
                              <p className="text-[10px]" style={{ color:"#9ca3af" }}>
                                {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "just now"}
                              </p>
                            </div>
                            {a.read===false && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background:"#f43f5e" }}/>}
                          </div>
                        ))
                      }
                      {alerts.length > 0 && (
                        <button onClick={()=>navigate("alerts")}
                          className="w-full text-xs font-black mt-3 pt-3 text-center" style={{ color:"#f43f5e", borderTop:"1px solid #fff0f2" }}>
                          See all alerts →
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-9 h-9 rounded-xl text-white text-sm font-black flex items-center justify-center shadow-md"
              style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)" }}>{emailInitial}</div>

            {/* Add PG button */}
            <motion.button onClick={openAdd} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-white rounded-xl font-black text-sm shadow-md"
              style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)", boxShadow:"0 4px 16px rgba(244,63,94,0.35)" }}>
              <Plus size={15}/> {t("addProperty")}
            </motion.button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
              transition={{ duration:0.15 }}
              className="p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 lg:pb-6">

              {activeTab==="overview" && !pgsLoading && pgs.length===0 && <FirstTimeView onAdd={openAdd} t={t}/>}
              {activeTab==="overview" && (pgsLoading||pgs.length>0) && <OverviewTab pgs={pgs} leads={leads} alerts={alerts} t={t} onAdd={openAdd}/>}
              {activeTab==="properties" && <PropertiesTab pgs={pgs} loading={pgsLoading} onEdit={openEdit} onDelete={handleDelete} searchQ={searchQ} t={t} onAdd={openAdd}/>}
              {activeTab==="leads"     && <LeadsTab leads={leads} loading={leadsLoading} pgs={pgs} t={t}/>}
              {activeTab==="revenue"   && <RevenueTab pgs={pgs} t={t}/>}
              {activeTab==="ai"        && <AITab pgs={pgs} leads={leads} t={t}/>}
              {activeTab==="analytics" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <KpiCard label="Profile Completion" value="80%" icon={Target}        color="#f43f5e" bg="#fff8f9"/>
                    <KpiCard label="Conversion Rate"    value={pgs.reduce((s,p)=>s+Number(p.views||0),0)>0?((leads.length/pgs.reduce((s,p)=>s+Number(p.views||0),0))*100).toFixed(1)+"%":"0%"} icon={TrendingUp} color="#16a34a" bg="#f8fffe"/>
                    <KpiCard label="Total Views"        value={String(pgs.reduce((s,p)=>s+Number(p.views||0),0))} icon={Eye} color="#2563eb" bg="#f8fbff"/>
                  </div>
                  <CertifiedBadgeSection pgs={pgs} t={t}/>
                </div>
              )}
              {activeTab==="alerts" && <AlertsTab alerts={alerts} t={t}/>}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden sticky bottom-0 z-40 flex items-center justify-around px-1 py-2 border-t"
          style={{ background:"white", borderColor:"#ffe4e6" }}>
          {TABS.slice(0,4).map(tab=>(
            <button key={tab.id} onClick={()=>navigate(tab.id)}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl relative transition-colors"
              style={{ color:activeTab===tab.id?"#f43f5e":"#9ca3af" }}>
              <tab.icon size={20}/>
              <span className="text-[9px] font-bold">{tab.label.split(" ")[0]}</span>
              {tab.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[8px] font-black rounded-full flex items-center justify-center"
                  style={{ background:tab.badgeColor||"#f43f5e" }}>{tab.badge}</span>
              )}
            </button>
          ))}
          {/* Add PG button in bottom nav — mobile only */}
          <button onClick={openAdd}
            className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all"
            style={{ color:"#f43f5e" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background:"linear-gradient(135deg,#f43f5e,#e11d48)" }}>
              <Plus size={18} className="text-white"/>
            </div>
            <span className="text-[9px] font-black" style={{ color:"#f43f5e" }}>Add PG</span>
          </button>
        </nav>
      </div>

      <FormModal show={showForm} onClose={()=>setShowForm(false)} editPg={editPg} t={t}/>
    </div>
  );
}