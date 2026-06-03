import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Star, ArrowRight, Building2, Trash2, Eye } from "lucide-react";

// Call this from Explore/PGCard when user clicks View
export function trackRecentlyViewed(pg) {
  try {
    const existing = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const filtered = existing.filter(p => p.id !== pg.id);
    const updated  = [{ ...pg, viewedAt: Date.now() }, ...filtered].slice(0, 20);
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
  } catch (e) {}
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function RecentCard({ pg, onBook, onRemove }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(244,63,94,0.1)" }}
      className="flex gap-0 rounded-2xl overflow-hidden cursor-pointer group transition-all"
      style={{ background: "white", border: "1.5px solid #ffe4e6" }}
    >
      <div className="w-28 relative flex-shrink-0" style={{ background: "#fff0f2" }}>
        {pg.photoUrl && !imgErr
          ? <img src={pg.photoUrl} alt={pg.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" onError={() => setImgErr(true)} />
          : <div className="w-full h-full flex items-center justify-center py-8"><Building2 size={22} style={{ color: "#fda4af" }} /></div>}
        <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ background: "#fff0f2", color: "#f43f5e", border: "1px solid #fecdd3" }}>
          {pg.type || "PG"}
        </span>
      </div>

      <div className="p-3.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-black text-sm truncate" style={{ color: "#111827" }}>{pg.name}</h4>
            <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#9ca3af" }}>
              <MapPin size={8} />{pg.area}, {pg.city}
            </p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(pg.id); }}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "#fff0f2", color: "#f43f5e" }}>
            <Trash2 size={11} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm" style={{ color: "#f43f5e" }}>
              ₹{Number(pg.price || 0).toLocaleString("en-IN")}<span className="text-[9px] font-normal" style={{ color: "#9ca3af" }}>/mo</span>
            </span>
            {pg.rating > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold" style={{ color: "#d97706" }}>
                <Star size={9} fill="currentColor" />{Number(pg.rating).toFixed(1)}
              </span>
            )}
          </div>
          <span className="text-[9px]" style={{ color: "#9ca3af" }}>
            {timeAgo(pg.viewedAt || Date.now())}
          </span>
        </div>

        <div className="flex gap-2 mt-2.5">
          <button onClick={() => onBook(pg)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            Book <ArrowRight size={9} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function RecentlyViewed() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setItems(data);
  }, []);

  const remove = (id) => {
    const updated = items.filter(p => p.id !== id);
    setItems(updated);
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
  };

  const clearAll = () => {
    setItems([]);
    localStorage.setItem("recentlyViewed", "[]");
  };

  const bookPG = (pg) => navigate("/book", { state: { selectedPg: pg } });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", color: "#2563eb" }}>
            <Clock size={20} />
          </div>
          <div>
            <h2 className="font-black text-lg" style={{ color: "#111827" }}>Recently Viewed</h2>
            <p className="text-xs" style={{ color: "#9ca3af" }}>{items.length} PGs in your history</p>
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: "#fff0f2", color: "#f43f5e", border: "1.5px solid #fecdd3" }}>
            <Trash2 size={11} /> Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-28 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg"
            style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
            <Eye size={36} style={{ color: "#2563eb" }} />
          </motion.div>
          <h3 className="font-black text-lg mb-2" style={{ color: "#111827" }}>No recently viewed PGs</h3>
          <p className="text-sm max-w-xs" style={{ color: "#9ca3af" }}>
            When you view PGs on Explore, they'll show up here so you can easily come back.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/student")}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            Explore PGs <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {items.map((pg) => (
              <RecentCard key={pg.id} pg={pg} onBook={bookPG} onRemove={remove} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}