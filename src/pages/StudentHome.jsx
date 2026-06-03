import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection, query, where, onSnapshot, doc, updateDoc,
  getDocs, orderBy, limit
} from "firebase/firestore";
import {
  Home, Loader2, Star, MapPin, Phone, MessageCircle,
  CheckCircle2, Clock, X, Eye, Wallet, Search, Heart,
  Zap, TrendingUp, Gift, ChevronRight, Sparkles, Building2,
  ArrowUpRight, Shield, Coffee, Wifi, Wind, Bell, Tag,
  FileText, BookOpen, Flame, ArrowRight, Check
} from "lucide-react";

// ── STAT CARD ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, color, bg, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: bg, border: `1.5px solid ${color}25` }}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          <Icon size={18} />
        </div>
        <ArrowUpRight size={14} style={{ color: `${color}60` }} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "#111827" }}>{value}</p>
        <p className="text-xs font-bold mt-0.5" style={{ color: "#6b7280" }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ── QUICK ACTION ─────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, color, bg, onClick, badge }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
      style={{
        background: "white",
        border: "1.5px solid #ffe4e6",
        boxShadow: "0 2px 12px rgba(244,63,94,0.06)"
      }}
    >
      {badge && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
          {badge}
        </span>
      )}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: bg, color }}>
        <Icon size={20} />
      </div>
      <span className="text-xs font-bold text-center leading-tight" style={{ color: "#374151" }}>{label}</span>
    </motion.button>
  );
}

// ── TRENDING PG CARD ─────────────────────────────────────────────────────
function TrendingCard({ pg, rank, onBook }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: "white",
        border: "1.5px solid #ffe4e6",
        boxShadow: "0 2px 16px rgba(244,63,94,0.06)"
      }}
      onClick={() => onBook(pg)}
    >
      <div className="h-32 relative overflow-hidden" style={{ background: "#fff0f2" }}>
        {pg.photoUrl && !imgErr
          ? <img src={pg.photoUrl} alt={pg.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" onError={() => setImgErr(true)} />
          : <div className="w-full h-full flex items-center justify-center"><Building2 size={24} style={{ color: "#fda4af" }} /></div>}
        {/* Rank badge */}
        <div className="absolute top-2 left-2 w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-lg"
          style={{ background: rank <= 3 ? "linear-gradient(135deg, #f43f5e, #e11d48)" : "linear-gradient(135deg, #fb7185, #f43f5e)" }}>
          #{rank}
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black"
          style={{ background: "rgba(255,255,255,0.9)", color: "#f43f5e" }}>
          <Flame size={9} /> Hot
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-black text-sm truncate" style={{ color: "#111827" }}>{pg.name}</h4>
        <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#9ca3af" }}>
          <MapPin size={8} />{pg.area}, {pg.city}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-black text-sm" style={{ color: "#f43f5e" }}>
            ₹{Number(pg.price || 0).toLocaleString("en-IN")}<span className="text-[9px] font-normal" style={{ color: "#9ca3af" }}>/mo</span>
          </span>
          {pg.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: "#d97706" }}>
              <Star size={9} fill="currentColor" />{Number(pg.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── OFFER CARD ────────────────────────────────────────────────────────────
function OfferCard({ title, desc, discount, color, icon: Icon, expiry }) {
  const [claimed, setClaimed] = useState(false);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}12, ${color}06)`,
        border: `1.5px solid ${color}25`
      }}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
        style={{ background: color }} />
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20`, color }}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-black text-sm" style={{ color: "#111827" }}>{title}</p>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white"
            style={{ background: color }}>{discount}</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{desc}</p>
        <p className="text-[10px] mt-1" style={{ color: "#9ca3af" }}>Expires: {expiry}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setClaimed(true)}
        className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all"
        style={claimed
          ? { background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0" }
          : { background: `${color}15`, color, border: `1.5px solid ${color}40` }
        }
      >
        {claimed ? <><Check size={11} className="inline mr-1" />Done!</> : "Claim"}
      </motion.button>
    </motion.div>
  );
}

// ── BOOKING CARD ──────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel, onRate }) {
  const statusMap = {
    Active:    { bg: "#f0fdf4", text: "#16a34a", icon: CheckCircle2, label: "Active" },
    Pending:   { bg: "#fffbeb", text: "#d97706", icon: Clock,        label: "Pending" },
    Cancelled: { bg: "#fff1f2", text: "#f43f5e", icon: X,            label: "Cancelled" },
    Visited:   { bg: "#eff6ff", text: "#2563eb", icon: Eye,          label: "Visited" },
  };
  const s = statusMap[booking.status] || statusMap.Pending;
  const SIcon = s.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(244,63,94,0.12)" }}
      className="rounded-[1.5rem] overflow-hidden transition-all"
      style={{ background: "white", border: "1.5px solid #ffe4e6", boxShadow: "0 2px 16px rgba(244,63,94,0.05)" }}
    >
      <div className="h-36 relative overflow-hidden" style={{ background: "#fff0f2" }}>
        {booking.image
          ? <img src={booking.image} alt={booking.pgName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Home size={28} style={{ color: "#fda4af" }} /></div>}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black backdrop-blur-sm"
          style={{ background: s.bg, color: s.text }}>
          <SIcon size={10} />{s.label}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-black text-base" style={{ color: "#111827" }}>{booking.pgName}</h3>
        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#9ca3af" }}>
          <MapPin size={9} />{booking.city}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl p-2.5 text-center" style={{ background: "#fff0f2" }}>
            <p className="text-[9px]" style={{ color: "#9ca3af" }}>Monthly</p>
            <p className="text-sm font-black" style={{ color: "#f43f5e" }}>₹{Number(booking.price || 0).toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{ background: "#f8fafc" }}>
            <p className="text-[9px]" style={{ color: "#9ca3af" }}>Sharing</p>
            <p className="text-sm font-black" style={{ color: "#111827" }}>{booking.sharing || "Double"}</p>
          </div>
        </div>
        {booking.status !== "Cancelled" && (
          <div className="flex items-center gap-1 mt-3">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => onRate(booking.id, star)}
                className="transition-transform hover:scale-125"
                style={{ color: star <= (booking.rating || 0) ? "#fbbf24" : "#e5e7eb" }}>
                <Star size={15} fill="currentColor" />
              </button>
            ))}
            <span className="text-[10px] ml-1" style={{ color: "#9ca3af" }}>
              {booking.rating ? `${booking.rating}.0` : "Rate stay"}
            </span>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          {booking.ownerPhone && (
            <a href={`tel:${booking.ownerPhone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
              style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <Phone size={12} /> Call
            </a>
          )}
          {booking.ownerWhatsapp && (
            <a href={`https://wa.me/${booking.ownerWhatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: "#eff6ff", color: "#2563eb" }}>
              <MessageCircle size={12} /> WhatsApp
            </a>
          )}
          {booking.status === "Active" && (
            <button onClick={() => onCancel(booking.id)}
              className="px-3 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: "#f8fafc", color: "#9ca3af" }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── EMPTY DASHBOARD ───────────────────────────────────────────────────────
function EmptyDashboard({ goExplore, trendingPGs, onBook }) {
  const OFFERS = [
    { title: "First Booking Offer",   desc: "Get ₹500 off on your first booking",  discount: "₹500 OFF", color: "#f43f5e", icon: Tag,   expiry: "30 Jun 2026" },
    { title: "Refer & Earn",          desc: "Invite a friend, both get ₹200",       discount: "₹200",     color: "#7c3aed", icon: Gift,  expiry: "Ongoing" },
    { title: "Weekend Visit Bonus",   desc: "Book a visit on Sat/Sun, get priority",discount: "Priority", color: "#0891b2", icon: Clock, expiry: "Every weekend" },
  ];

  return (
    <div className="space-y-8">

      {/* ── HERO — LIGHT PINK, NO DARK ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2rem] p-7 md:p-10 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #fff0f2 0%, #fce7f3 50%, #fff1f2 100%)",
          border: "1.5px solid #fecdd3",
          boxShadow: "0 8px 40px rgba(244,63,94,0.1)"
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fda4af, transparent)" }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full mb-5"
            style={{ background: "white", color: "#f43f5e", border: "1.5px solid #fecdd3", boxShadow: "0 2px 8px rgba(244,63,94,0.1)" }}>
            <Sparkles size={11} /> Welcome to StayPG 🎉
          </div>

          <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight" style={{ color: "#111827" }}>
            Find your perfect home<br />away from home 🏠
          </h2>
          <p className="text-sm mb-7 max-w-sm" style={{ color: "#6b7280" }}>
            Thousands of verified PGs near your college. No broker. No hidden fees.
          </p>

          <motion.button onClick={goExplore}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-7 py-3.5 text-white font-black rounded-2xl text-sm shadow-xl"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 8px 24px rgba(244,63,94,0.35)" }}>
            <Search size={16} /> Explore PGs Near Me <ArrowRight size={14} />
          </motion.button>

          {/* Trust row */}
          <div className="flex items-center gap-5 mt-6">
            {[
              { icon: Shield, label: "Verified PGs", color: "#16a34a" },
              { icon: Zap,    label: "Instant Book",  color: "#d97706" },
              { icon: Star,   label: "Rated 4.8★",   color: "#f43f5e" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <item.icon size={12} style={{ color: item.color }} />
                <span className="text-xs font-bold" style={{ color: "#374151" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>Quick Actions</p>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={Search}    label="Explore PGs"  color="#f43f5e" bg="#fff0f2" onClick={goExplore} />
          <QuickAction icon={MapPin}    label="Near Me"      color="#2563eb" bg="#eff6ff" onClick={() => {}} />
          <QuickAction icon={Heart}     label="Wishlist"     color="#e11d48" bg="#fce7f3" onClick={() => {}} />
          <QuickAction icon={Gift}      label="Offers"       color="#d97706" bg="#fef3c7" onClick={() => {}} badge="3" />
        </div>
      </div>

      {/* ── TRENDING PGS — LIVE FROM FIRESTORE ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "#fff0f2", color: "#f43f5e" }}>
              <Flame size={14} />
            </div>
            <p className="font-black text-sm" style={{ color: "#111827" }}>Trending PGs Right Now</p>
          </div>
          <button onClick={goExplore}
            className="text-xs font-bold flex items-center gap-1"
            style={{ color: "#f43f5e" }}>
            See all <ChevronRight size={11} />
          </button>
        </div>
        {trendingPGs.length === 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex-shrink-0 w-44 h-48 rounded-2xl animate-pulse"
                style={{ background: "linear-gradient(135deg, #fff0f2, #fce7f3)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trendingPGs.slice(0, 4).map((pg, i) => (
              <TrendingCard key={pg.id} pg={pg} rank={i + 1} onBook={onBook} />
            ))}
          </div>
        )}
      </div>

      {/* ── OFFERS & DEALS — LIVE ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#fef3c7", color: "#d97706" }}>
            <Tag size={14} />
          </div>
          <p className="font-black text-sm" style={{ color: "#111827" }}>Offers & Deals</p>
        </div>
        <div className="space-y-3">
          {OFFERS.map((offer, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <OfferCard {...offer} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "#9ca3af" }}>How it works</p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { n: "1", icon: Search,       color: "#f43f5e", bg: "#fff0f2", title: "Find a PG",      desc: "Search by city, college, or area" },
            { n: "2", icon: Eye,          color: "#2563eb", bg: "#eff6ff", title: "Visit or Book",  desc: "Schedule a visit or confirm directly" },
            { n: "3", icon: Home,         color: "#16a34a", bg: "#f0fdf4", title: "Move In! 🎉",   desc: "Start your new chapter today" },
          ].map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl relative overflow-hidden"
              style={{ background: "white", border: "1.5px solid #ffe4e6", boxShadow: "0 2px 12px rgba(244,63,94,0.05)" }}
            >
              <div className="absolute top-3 right-3 text-5xl font-black select-none leading-none" style={{ color: "#fff0f2" }}>{s.n}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg, color: s.color }}>
                <s.icon size={19} />
              </div>
              <p className="font-black text-sm" style={{ color: "#111827" }}>{s.title}</p>
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── AMENITIES HIGHLIGHT ── */}
      <div className="p-5 rounded-2xl" style={{ background: "white", border: "1.5px solid #ffe4e6" }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "#9ca3af" }}>What PGs offer</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Wifi,   label: "High-speed WiFi", color: "#2563eb", bg: "#eff6ff" },
            { icon: Wind,   label: "AC Rooms",         color: "#0891b2", bg: "#ecfeff" },
            { icon: Coffee, label: "Meals Included",   color: "#d97706", bg: "#fef3c7" },
            { icon: Shield, label: "24/7 Security",    color: "#16a34a", bg: "#f0fdf4" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: f.bg }}>
              <f.icon size={15} style={{ color: f.color }} />
              <span className="text-xs font-bold" style={{ color: "#374151" }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function StudentHome({ goExplore }) {
  const navigate = useNavigate();
  const [bookings, setBookings]       = useState([]);
  const [trendingPGs, setTrendingPGs] = useState([]);
  const [loading, setLoading]         = useState(true);

  // Live bookings
  useEffect(() => {
    if (!auth.currentUser) { setLoading(false); return; }
    const q = query(collection(db, "bookings"), where("studentId", "==", auth.currentUser.uid));
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // Trending PGs — sorted by leads/views desc
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const snap = await getDocs(query(collection(db, "pgs"), limit(20)));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by leads count (most viewed/booked = trending)
        const sorted = all.sort((a, b) => (b.leads || b.views || 0) - (a.leads || a.views || 0));
        setTrendingPGs(sorted.slice(0, 8));
      } catch (e) { console.error(e); }
    };
    fetchTrending();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    await updateDoc(doc(db, "bookings", id), { status: "Cancelled" });
  };
  const handleRate = async (id, rating) => {
    await updateDoc(doc(db, "bookings", id), { rating });
  };
  const bookPG = (pg) => navigate("/book", { state: { selectedPg: pg } });

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 rounded-full border-4 border-t-transparent"
        style={{ borderColor: "#fda4af", borderTopColor: "#f43f5e" }} />
    </div>
  );

  if (bookings.length === 0) {
    return <EmptyDashboard goExplore={goExplore} trendingPGs={trendingPGs} onBook={bookPG} />;
  }

  const active    = bookings.filter(b => b.status === "Active");
  const totalPaid = bookings.reduce((s, b) => s + Number(b.price || 0), 0);
  const rated     = bookings.filter(b => b.rating);
  const avgRating = rated.length ? (rated.reduce((s,b) => s + b.rating, 0) / rated.length).toFixed(1) : "–";

  return (
    <div className="space-y-6">
      {/* Greeting banner — LIGHT PINK */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl px-6 py-5 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, #fff0f2, #fce7f3)",
          border: "1.5px solid #fecdd3"
        }}>
        <div>
          <h2 className="font-black text-lg" style={{ color: "#111827" }}>Welcome back! 👋</h2>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>{active.length} active booking{active.length !== 1 ? "s" : ""}</p>
        </div>
        <motion.button onClick={goExplore}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-black rounded-xl shadow-md"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
          <Search size={13} /> Find more
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Home}         color="#f43f5e" bg="#fff8f9" label="Total Bookings" value={bookings.length} delay={0}    />
        <StatCard icon={CheckCircle2} color="#16a34a" bg="#f8fffe" label="Active Now"     value={active.length}  delay={0.05} />
        <StatCard icon={Wallet}       color="#2563eb" bg="#f8fbff" label="Total Paid"     value={`₹${totalPaid.toLocaleString("en-IN")}`} delay={0.1} />
        <StatCard icon={Star}         color="#d97706" bg="#fffdf5" label="Avg Rating"     value={avgRating}      delay={0.15} />
      </div>

      {/* Trending */}
      {trendingPGs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "#fff0f2", color: "#f43f5e" }}>
                <Flame size={14} />
              </div>
              <p className="font-black text-sm" style={{ color: "#111827" }}>Trending PGs</p>
            </div>
            <button onClick={goExplore} className="text-xs font-bold flex items-center gap-1" style={{ color: "#f43f5e" }}>
              See all <ChevronRight size={11} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trendingPGs.slice(0, 4).map((pg, i) => (
              <TrendingCard key={pg.id} pg={pg} rank={i+1} onBook={bookPG} />
            ))}
          </div>
        </div>
      )}

      {/* Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black" style={{ color: "#111827" }}>Your Stays</h3>
          <button onClick={goExplore} className="text-xs font-bold flex items-center gap-1" style={{ color: "#f43f5e" }}>
            Explore more <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {bookings.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} onRate={handleRate} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}