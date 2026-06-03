import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import {
  Search, MapPin, Heart, Star, Wifi, Wind, Utensils, Eye, Shield,
  X, Loader2, Building2, SlidersHorizontal, ArrowRight, Check, Zap, Coffee
} from "lucide-react";

const CITIES = ["All Cities","Delhi","Mumbai","Bangalore","Pune","Noida","Gurgaon","Nagpur","Hyderabad","Chennai","Kota","Jaipur"];
const AMENITY_ICONS = { wifi: Wifi, ac: Wind, food: Utensils, parking: Shield, cctv: Eye, laundry: Zap, gym: Zap, hot_water: Coffee };
const PRICE_RANGES = [
  { label: "Any",        min: 0,     max: Infinity },
  { label: "Under ₹5K", min: 0,     max: 5000 },
  { label: "₹5K–₹8K",  min: 5000,  max: 8000 },
  { label: "₹8K–₹12K", min: 8000,  max: 12000 },
  { label: "₹12K+",     min: 12000, max: Infinity },
];

// ── PG CARD ───────────────────────────────────────────────────────────────────
function PGCard({ pg, wishlisted, onWishlist, onBook, onView, delay = 0 }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(244,63,94,0.12)" }}
      className="rounded-[1.5rem] overflow-hidden group transition-all"
      style={{ background: "white", border: "1.5px solid #ffe4e6", boxShadow: "0 2px 16px rgba(244,63,94,0.06)" }}
    >
      <div className="h-48 relative overflow-hidden" style={{ background: "#fff0f2" }}>
        {pg.photoUrl && !imgErr
          ? <img src={pg.photoUrl} alt={pg.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              onError={() => setImgErr(true)} />
          : <div className="w-full h-full flex items-center justify-center">
              <Building2 size={36} style={{ color: "#fda4af" }} />
            </div>}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>{pg.type}</span>
          {pg.rating >= 4.5 && (
            <span className="text-white text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background: "#f59e0b" }}>⭐ Top Rated</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); onWishlist(pg); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: wishlisted ? "#f43f5e" : "rgba(255,255,255,0.9)",
            color: wishlisted ? "white" : "#f43f5e"
          }}
        >
          <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-black truncate" style={{ color: "#111827" }}>{pg.name}</h3>
        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#9ca3af" }}>
          <MapPin size={10} />{pg.area}, {pg.city}
        </p>

        {pg.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10} fill={s <= Math.round(pg.rating) ? "#fbbf24" : "none"} style={{ color: "#fbbf24" }} />
              ))}
            </div>
            <span className="text-xs font-bold" style={{ color: "#374151" }}>{Number(pg.rating).toFixed(1)}</span>
            <span className="text-[10px] ml-auto" style={{ color: "#9ca3af" }}>{pg.sharing} sharing</span>
          </div>
        )}

        {pg.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {pg.amenities.slice(0, 4).map(a => {
              const Icon = AMENITY_ICONS[a] || Zap;
              return (
                <span key={a} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg capitalize"
                  style={{ background: "#fff8f9", color: "#6b7280" }}>
                  <Icon size={9} />{a}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1.5px solid #fff0f2" }}>
          <div>
            <span className="font-black text-xl" style={{ color: "#f43f5e" }}>
              ₹{Number(pg.price || 0).toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>/mo</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onView(pg)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: "#f8fafc", color: "#6b7280", border: "1.5px solid #f1f5f9" }}
            >
              <Eye size={12} />
            </button>
            <button
              onClick={() => onBook(pg)}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-black rounded-xl transition-all"
              style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 4px 12px rgba(244,63,94,0.3)" }}
            >
              Book <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── FILTER PANEL ──────────────────────────────────────────────────────────────
function FilterPanel({ show, filters, setFilters, onClose }) {
  const pgTypes  = ["All", "Boys", "Girls", "Unisex"];
  const sharingT = ["All", "Single", "Double", "Triple"];
  return (
    <AnimatePresence>
      {show && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
            className="fixed right-0 top-0 h-full w-80 z-50 overflow-y-auto"
            style={{ background: "white", borderLeft: "1.5px solid #ffe4e6", boxShadow: "-8px 0 40px rgba(244,63,94,0.1)" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-lg" style={{ color: "#111827" }}>Filters</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: "#fff0f2", color: "#f43f5e" }}>
                  <X size={16} />
                </button>
              </div>

              {/* Budget */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>Budget</p>
                <div className="space-y-2">
                  {PRICE_RANGES.map(r => (
                    <button key={r.label}
                      onClick={() => setFilters(f => ({ ...f, priceRange: r }))}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center"
                      style={filters.priceRange?.label === r.label
                        ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white", boxShadow: "0 4px 12px rgba(244,63,94,0.3)" }
                        : { background: "#fff8f9", color: "#374151" }}
                    >
                      {r.label}
                      {filters.priceRange?.label === r.label && <Check size={14} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* PG Type */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>PG Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {pgTypes.map(t => (
                    <button key={t}
                      onClick={() => setFilters(f => ({ ...f, type: t }))}
                      className="py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={filters.type === t
                        ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white" }
                        : { background: "#fff8f9", color: "#374151" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sharing */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>Sharing</p>
                <div className="grid grid-cols-2 gap-2">
                  {sharingT.map(s => (
                    <button key={s}
                      onClick={() => setFilters(f => ({ ...f, sharing: s }))}
                      className="py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={filters.sharing === s
                        ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white" }
                        : { background: "#fff8f9", color: "#374151" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setFilters({ type: "All", sharing: "All", priceRange: PRICE_RANGES[0] }); onClose(); }}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: "#fff0f2", color: "#f43f5e", border: "1.5px solid #fecdd3" }}
              >
                Reset all filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Explore() {
  const navigate = useNavigate();
  const [pgs, setPgs]             = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [city, setCity]           = useState("All Cities");
  const [showFilter, setShowFilter] = useState(false);
  const [wishlist, setWishlist]   = useState(() => JSON.parse(localStorage.getItem("wishlist") || "[]"));
  const [filters, setFilters]     = useState({ type: "All", sharing: "All", priceRange: PRICE_RANGES[0] });

  const fetchPGs = useCallback(async () => {
    setLoading(true);
    try {
      const constraints = [];
      if (city !== "All Cities") constraints.push(where("city", "==", city));
      if (filters.type !== "All") constraints.push(where("type", "==", filters.type));
      const snap = await getDocs(query(collection(db, "pgs"), ...constraints, limit(30)));
      let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (search.trim()) {
        const s = search.toLowerCase();
        results = results.filter(p =>
          (p.name||"").toLowerCase().includes(s) ||
          (p.area||"").toLowerCase().includes(s) ||
          (p.city||"").toLowerCase().includes(s)
        );
      }
      if (filters.sharing !== "All") results = results.filter(p => p.sharing === filters.sharing);
      const { min, max } = filters.priceRange;
      results = results.filter(p => Number(p.price||0) >= min && Number(p.price||0) <= max);
      setPgs(results);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [city, search, filters]);

  useEffect(() => {
    const t = setTimeout(fetchPGs, 300);
    return () => clearTimeout(t);
  }, [fetchPGs]);

  // Track recently viewed
  const trackView = (pg) => {
    const recents = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const updated = [pg, ...recents.filter(r => r.id !== pg.id)].slice(0, 10);
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
  };

  const toggleWishlist = (pg) => {
    const exists = wishlist.find(w => w.id === pg.id);
    const updated = exists ? wishlist.filter(w => w.id !== pg.id) : [...wishlist, pg];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const bookPG = (pg) => { trackView(pg); navigate("/book", { state: { selectedPg: pg } }); };
  const viewPG = (pg) => { trackView(pg); navigate("/pg/" + pg.id, { state: { pg } }); };

  const activeFilters = [
    filters.type !== "All" && filters.type,
    filters.sharing !== "All" && filters.sharing,
    filters.priceRange.label !== "Any" && filters.priceRange.label,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="rounded-2xl p-4 space-y-3 shadow-sm" style={{ background: "white", border: "1.5px solid #ffe4e6" }}>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "#fff8f9", border: "1.5px solid #fecdd3" }}>
            <Search size={16} style={{ color: "#fda4af" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search PG, area, college…"
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
              style={{ color: "#111827" }}
            />
            {search && <button onClick={() => setSearch("")}><X size={13} style={{ color: "#9ca3af" }} /></button>}
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={activeFilters.length > 0
              ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white" }
              : { background: "#fff0f2", color: "#f43f5e", border: "1.5px solid #fecdd3" }}
          >
            <SlidersHorizontal size={15} />
            {activeFilters.length > 0 ? `${activeFilters.length} active` : "Filter"}
          </button>
        </div>

        {/* City tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
          {CITIES.map(c => (
            <button key={c}
              onClick={() => setCity(c)}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-black transition-all"
              style={city === c
                ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white", boxShadow: "0 4px 12px rgba(244,63,94,0.3)" }
                : { background: "#fff8f9", color: "#6b7280" }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {activeFilters.map(f => (
              <span key={f} className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "#fff0f2", color: "#f43f5e", border: "1.5px solid #fecdd3" }}>
                {f} <X size={10} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm font-bold px-1" style={{ color: "#6b7280" }}>
        {loading ? "Searching…" : `${pgs.length} PG${pgs.length !== 1 ? "s" : ""} found`}
        {city !== "All Cities" && ` in ${city}`}
      </p>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className="rounded-[1.5rem] overflow-hidden animate-pulse"
              style={{ background: "white", border: "1.5px solid #ffe4e6" }}>
              <div className="h-48" style={{ background: "linear-gradient(135deg, #fff0f2, #fce7f3)" }} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded-xl w-3/4" style={{ background: "#fff0f2" }} />
                <div className="h-3 rounded-xl w-1/2" style={{ background: "#fff8f9" }} />
                <div className="h-8 rounded-xl w-full mt-4" style={{ background: "#fff0f2" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && pgs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#fff0f2" }}>
            <Building2 size={28} style={{ color: "#fda4af" }} />
          </div>
          <p className="font-black text-sm mb-1" style={{ color: "#374151" }}>No PGs found</p>
          <p className="text-xs mb-6" style={{ color: "#9ca3af" }}>Try a different city or clear your filters</p>
          <button
            onClick={() => { setSearch(""); setCity("All Cities"); setFilters({ type: "All", sharing: "All", priceRange: PRICE_RANGES[0] }); }}
            className="px-5 py-2.5 text-white text-sm font-black rounded-xl"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", boxShadow: "0 4px 12px rgba(244,63,94,0.3)" }}
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && pgs.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pgs.map((pg, i) => (
            <PGCard
              key={pg.id} pg={pg} delay={i * 0.04}
              wishlisted={!!wishlist.find(w => w.id === pg.id)}
              onWishlist={toggleWishlist}
              onBook={bookPG}
              onView={viewPG}
            />
          ))}
        </div>
      )}

      <FilterPanel show={showFilter} filters={filters} setFilters={setFilters} onClose={() => setShowFilter(false)} />
    </div>
  );
}