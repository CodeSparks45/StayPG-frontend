import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, ArrowRight, Trash2, Building2, Sparkles, Search, Star } from "lucide-react";

// ─── ANIMATED EMPTY STATE ─────────────────────────────────────────────────
function WishlistEmpty({ onExplore }) {
  // Floating hearts animation
  const hearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 15 + (i * 10) + (Math.random() * 5),
    delay: i * 0.4,
    dur: 3 + Math.random() * 2,
    size: 10 + Math.random() * 18,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative overflow-hidden">

      {/* Floating hearts background */}
      {hearts.map(h => (
        <motion.div
          key={h.id}
          className="absolute pointer-events-none"
          style={{ left: `${h.x}%`, bottom: "0%", opacity: 0 }}
          animate={{ y: [0, -300], opacity: [0, h.opacity, 0], rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: h.dur, delay: h.delay, ease: "easeOut" }}
        >
          <Heart size={h.size} fill="currentColor" className="text-rose-300" />
        </motion.div>
      ))}

      {/* Main animated illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.1 }}
        className="relative mb-8"
      >
        {/* Outer pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(244,63,94,0.2), transparent)", margin: "-24px" }}
        />

        {/* Inner circle */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-36 h-36 rounded-full flex items-center justify-center relative shadow-2xl"
          style={{ background: "linear-gradient(135deg, #fff0f2, #fce7f3)" }}
        >
          {/* Heart icon — main */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Heart size={56} fill="#f43f5e" className="text-rose-500 drop-shadow-lg" />
          </motion.div>

          {/* Small sparkles orbiting */}
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute"
              style={{ top: "50%", left: "50%", transformOrigin: "0 0" }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4 + i, ease: "linear", delay: i * 0.5 }}
            >
              <motion.div
                style={{ x: 55 + i * 8, y: -5 + i * 2 }}
                animate={{ scale: [0.8, 1.3, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
              >
                <Sparkles size={10 + i * 2} className="text-rose-300" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini floating cards */}
        <motion.div
          animate={{ y: [-4, 4, -4], rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="absolute -top-4 -right-8 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-1.5 border border-rose-100"
        >
          <Star size={12} fill="#fbbf24" className="text-amber-400" />
          <span className="text-xs font-black text-slate-700">4.8</span>
        </motion.div>

        <motion.div
          animate={{ y: [4, -4, 4], rotate: [3, -3, 3] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.7 }}
          className="absolute -bottom-2 -left-10 bg-white rounded-2xl shadow-lg px-3 py-2 border border-rose-100"
        >
          <span className="text-xs font-black text-rose-500">₹8,000/mo</span>
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-xs"
      >
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
          Your wishlist is empty
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          Save PGs you love by tapping the{" "}
          <Heart size={12} fill="#f43f5e" className="text-rose-500 inline mb-0.5" />{" "}
          heart icon while browsing
        </p>
        <p className="text-slate-300 text-xs mb-8">
          They'll appear here so you never lose track of your favorites
        </p>

        {/* Steps hint */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { icon: Search, label: "Browse PGs" },
            { icon: Heart, label: "Tap ❤️" },
            { icon: Sparkles, label: "Saved here!" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, #fff0f2, #fce7f3)" }}>
                  <step.icon size={16} className="text-rose-400" />
                </div>
                <span className="text-[9px] font-bold text-slate-400">{step.label}</span>
              </div>
              {i < 2 && <ArrowRight size={12} className="text-slate-200 flex-shrink-0 mb-4" />}
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={onExplore}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 mx-auto px-7 py-3.5 text-white font-black rounded-2xl text-sm shadow-xl"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 8px 24px rgba(244,63,94,0.35)" }}
        >
          <Search size={16} />
          Explore PGs
          <ArrowRight size={14} />
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── WISHLIST ITEM ────────────────────────────────────────────────────────
function WishlistCard({ pg, onRemove, onBook }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.93, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -30 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="bg-white rounded-3xl border border-rose-100/60 overflow-hidden flex gap-0 shadow-sm hover:shadow-lg hover:shadow-rose-100 transition-all group"
    >
      {/* Image */}
      <div className="w-32 h-full bg-rose-50 relative flex-shrink-0">
        {pg.photoUrl && !imgErr
          ? <img src={pg.photoUrl} alt={pg.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              onError={() => setImgErr(true)} />
          : <div className="w-full h-full flex items-center justify-center py-10">
              <Building2 size={24} className="text-rose-200" />
            </div>}

        {/* Remove button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(pg.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart size={13} fill="#f43f5e" className="text-rose-500" />
        </motion.button>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 truncate text-sm">{pg.name}</h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin size={9} />{pg.area}, {pg.city}
            </p>
          </div>
          {pg.rating > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star size={10} fill="#fbbf24" className="text-amber-400" />
              <span className="text-[10px] font-bold text-slate-700">{Number(pg.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {pg.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {pg.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[9px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-lg font-bold capitalize">{a}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-rose-500 font-black">₹{Number(pg.price || 0).toLocaleString("en-IN")}</span>
            <span className="text-slate-400 text-[10px]">/mo</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onRemove(pg.id)}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
              <Trash2 size={13} />
            </button>
            <button onClick={() => onBook(pg)}
              className="flex items-center gap-1 px-3 py-1.5 text-white text-xs font-black rounded-xl transition-all shadow-md"
              style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
              Book <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function Wishlist({ setActiveTab }) {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("wishlist") || "[]"));

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(pg => pg.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const bookPG = (pg) => navigate("/book", { state: { selectedPg: pg } });

  const goExplore = () => {
    if (setActiveTab) setActiveTab("explore");
  };

  return (
    <div className="space-y-5">
      {wishlist.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900 text-lg">Saved PGs</h2>
            <p className="text-xs text-slate-400">{wishlist.length} PG{wishlist.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button onClick={() => { setWishlist([]); localStorage.setItem("wishlist", "[]"); }}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
            <Trash2 size={12} /> Clear all
          </button>
        </div>
      )}

      {wishlist.length === 0 ? (
        <WishlistEmpty onExplore={goExplore} />
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {wishlist.map(pg => (
              <WishlistCard key={pg.id} pg={pg} onRemove={removeFromWishlist} onBook={bookPG} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}