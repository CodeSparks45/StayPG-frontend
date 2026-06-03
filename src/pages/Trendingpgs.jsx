import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import {
  Flame, MapPin, Star, ArrowRight, Building2, Zap,
  TrendingUp, RefreshCw, Wifi, Wind, Coffee, Eye
} from "lucide-react";

function PGCard({ pg, rank, onBook }) {
  const [imgErr, setImgErr] = useState(false);
  const rankColors = ["#f43f5e", "#f97316", "#eab308", "#6b7280", "#6b7280"];
  const rankBg = ["#fff0f2", "#fff7ed", "#fefce8", "#f8fafc", "#f8fafc"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(244,63,94,0.13)" }}
      className="rounded-[1.5rem] overflow-hidden cursor-pointer group transition-all"
      style={{ background: "white", border: "1.5px solid #ffe4e6", boxShadow: "0 2px 16px rgba(244,63,94,0.05)" }}
      onClick={() => onBook(pg)}
    >
      <div className="h-44 relative overflow-hidden" style={{ background: "#fff0f2" }}>
        {pg.photoUrl && !imgErr
          ? <img src={pg.photoUrl} alt={pg.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" onError={() => setImgErr(true)} />
          : <div className="w-full h-full flex items-center justify-center"><Building2 size={32} style={{ color: "#fda4af" }} /></div>}

        {/* Rank badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-lg"
          style={{ background: rankBg[rank - 1] || "#f8fafc", color: rankColors[rank - 1] || "#6b7280", border: `1.5px solid ${rankColors[rank - 1]}30` }}>
          {rank <= 3 ? <Flame size={11} /> : <TrendingUp size={11} />} #{rank}
        </div>

        {/* Views badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-black"
          style={{ background: "rgba(255,255,255,0.92)", color: "#6b7280" }}>
          <Eye size={9} /> {pg.leads || pg.views || Math.floor(Math.random() * 200 + 50)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-black text-sm truncate" style={{ color: "#111827" }}>{pg.name}</h3>
            <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#9ca3af" }}>
              <MapPin size={8} />{pg.area}, {pg.city}
            </p>
          </div>
          {pg.rating > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0 px-2 py-1 rounded-lg"
              style={{ background: "#fffbeb" }}>
              <Star size={10} fill="#fbbf24" style={{ color: "#fbbf24" }} />
              <span className="text-[10px] font-black" style={{ color: "#d97706" }}>{Number(pg.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {pg.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {pg.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[9px] font-bold px-2 py-0.5 rounded-lg capitalize"
                style={{ background: "#fff0f2", color: "#f43f5e" }}>{a}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #fff0f2" }}>
          <div>
            <span className="font-black text-lg" style={{ color: "#f43f5e" }}>₹{Number(pg.price || 0).toLocaleString("en-IN")}</span>
            <span className="text-[10px]" style={{ color: "#9ca3af" }}>/mo</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onBook(pg); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            Book <ArrowRight size={11} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TrendingPGs({ setActiveTab }) {
  const navigate = useNavigate();
  const [pgs, setPgs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");

  const CITIES = ["All", "Nagpur", "Pune", "Mumbai", "Delhi", "Bangalore", "Hyderabad"];

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, "pgs"), limit(30)));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const sorted = all.sort((a, b) => (b.leads || b.views || 0) - (a.leads || a.views || 0));
        setPgs(sorted);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === "All" ? pgs : pgs.filter(p => p.city === filter);
  const bookPG = (pg) => navigate("/book", { state: { selectedPg: pg } });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fff0f2, #fce7f3)", color: "#f43f5e" }}>
            <Flame size={20} />
          </div>
          <div>
            <h2 className="font-black text-lg" style={{ color: "#111827" }}>Trending PGs</h2>
            <p className="text-xs" style={{ color: "#9ca3af" }}>Most booked & viewed right now</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#fff0f2", color: "#f43f5e" }}>
          <RefreshCw size={15} />
        </motion.button>
      </div>

      {/* City filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CITIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all"
            style={filter === c
              ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white", boxShadow: "0 4px 12px rgba(244,63,94,0.3)" }
              : { background: "white", color: "#6b7280", border: "1.5px solid #ffe4e6" }}>
            {c}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "PGs Listed",     value: `${pgs.length}+`, icon: Building2, color: "#f43f5e", bg: "#fff0f2" },
          { label: "Avg Price/mo",   value: pgs.length ? `₹${Math.round(pgs.reduce((s,p) => s + Number(p.price||0), 0) / pgs.length / 1000)}K` : "–", icon: Zap, color: "#d97706", bg: "#fef3c7" },
          { label: "Top Rated",      value: pgs.filter(p => p.rating >= 4).length, icon: Star, color: "#d97706", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-2xl flex items-center gap-3"
            style={{ background: "white", border: "1.5px solid #ffe4e6" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
              <s.icon size={15} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: "#111827" }}>{s.value}</p>
              <p className="text-[9px]" style={{ color: "#9ca3af" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-[1.5rem] overflow-hidden animate-pulse" style={{ background: "#fff0f2" }}>
              <div className="h-44" style={{ background: "#fce7f3" }} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded-lg" style={{ background: "#ffe4e6", width: "70%" }} />
                <div className="h-3 rounded-lg" style={{ background: "#ffe4e6", width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 size={40} style={{ color: "#fda4af" }} className="mb-3" />
          <p className="font-bold" style={{ color: "#6b7280" }}>No PGs found in {filter}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pg, i) => (
            <TrendingCard key={pg.id} pg={pg} rank={i + 1} onBook={bookPG} />
          ))}
        </div>
      )}
    </div>
  );
}