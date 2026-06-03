import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  GraduationCap, Home, ArrowRight, Sparkles, Star, Shield,
  Zap, Users, Building2, Wifi, Coffee, Check, ChevronRight,
  BookOpen, Heart, MapPin, Clock
} from "lucide-react";

const STUDENT_PERKS = [
  { icon: Shield,   text: "100% verified safe stays" },
  { icon: Zap,      text: "Book in under 60 seconds" },
  { icon: Star,     text: "Real ratings & reviews" },
  { icon: Wifi,     text: "Filter WiFi, food, AC" },
];
const OWNER_PERKS = [
  { icon: Users,    text: "50,000+ active students" },
  { icon: Building2,text: "Manage all properties" },
  { icon: Sparkles, text: "AI pricing insights" },
  { icon: Coffee,   text: "Free to list, always" },
];

// Soft floating blobs — NO dark colors, all pink/rose tones
function FloatingBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, #fecdd3, #ffe4e6, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, #fbcfe8, #fce7f3, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #f9a8d4, transparent 70%)" }}
      />
      {/* Floating dots */}
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            width: 6 + (i % 4) * 4,
            height: 6 + (i % 4) * 4,
            left: `${8 + i * 7.5}%`,
            top: `${10 + (i % 5) * 18}%`,
            background: i % 2 === 0 ? "#fda4af" : "#f9a8d4",
            opacity: 0.3 + (i % 3) * 0.1,
          }}
          animate={{ y: [0, -16, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 + (i % 4), delay: i * 0.3, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Role card — light pink/white, zero dark
function RoleCard({ role, title, subtitle, icon: Icon, accentColor, perks, selected, hovered, onHover, onLeave, onClick, delay }) {
  const isStudent = role === "student";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 80, damping: 16 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      {/* Selection glow — soft pink, NOT dark */}
      <motion.div
        animate={{ opacity: selected ? 1 : hovered ? 0.5 : 0, scale: selected ? 1 : 0.98 }}
        transition={{ duration: 0.3 }}
        className="absolute -inset-0.5 rounded-[2.5rem] blur-lg"
        style={{ background: `linear-gradient(135deg, ${accentColor}60, ${accentColor}30)` }}
      />

      <motion.div
        animate={{ y: hovered && !selected ? -8 : 0, scale: selected ? 1.01 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative rounded-[2.5rem] p-7 transition-all duration-300 overflow-hidden"
        style={{
          background: selected
            ? `linear-gradient(145deg, #fff, #fff8fa)`
            : hovered
              ? `linear-gradient(145deg, #ffffff, #fff0f2)`
              : `linear-gradient(145deg, #ffffff, #fff5f7)`,
          border: selected
            ? `2px solid ${accentColor}`
            : hovered
              ? `2px solid ${accentColor}50`
              : `2px solid #ffe4e6`,
          boxShadow: selected
            ? `0 20px 60px ${accentColor}25, 0 8px 24px ${accentColor}15`
            : hovered
              ? `0 12px 40px ${accentColor}15, 0 4px 16px rgba(0,0,0,0.04)`
              : `0 4px 24px rgba(0,0,0,0.04)`,
        }}
      >
        {/* Decorative top-right blob */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor}, transparent)` }}
        />

        {/* Selected checkmark */}
        <motion.div
          animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
        >
          <Check size={16} className="text-white" strokeWidth={3} />
        </motion.div>

        {/* Icon box — light pink bg, NOT dark */}
        <div className="mb-7 relative">
          <motion.div
            animate={{ rotate: hovered ? [0, -6, 6, 0] : 0 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
          >
            <Icon size={40} className="text-white" strokeWidth={1.5} />
          </motion.div>

          {/* Sparkle on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 30 }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
              >
                <Sparkles size={15} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="text-2xl font-black mb-2 tracking-tight" style={{ color: "#111827" }}>{title}</h2>
        <p className="text-sm mb-7 leading-relaxed" style={{ color: "#6b7280" }}>{subtitle}</p>

        {/* Perks */}
        <div className="space-y-3 mb-7">
          {perks.map((perk, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: hovered || selected ? 1 : 0.65, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${accentColor}18`, color: accentColor }}>
                <perk.icon size={13} />
              </div>
              <span className="text-sm font-semibold" style={{ color: "#374151" }}>{perk.text}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          animate={{ x: hovered || selected ? 5 : 0 }}
          className="flex items-center gap-2 text-sm font-black"
          style={{ color: accentColor }}
        >
          {selected ? "✓ Selected!" : "Get Started"}
          <ArrowRight size={15} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function RoleSelect() {
  const navigate = useNavigate();
  const [hovered, setHovered]   = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);

  const selectRole = async (role) => {
    if (loading) return;
    setSelected(role);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), { email: user.email, role, updatedAt: new Date() }, { merge: true });
      }
      await new Promise(r => setTimeout(r, 900));
      navigate(role === "student" ? "/student" : "/owner");
    } catch (e) {
      console.error(e);
      setSelected(null);
      setLoading(false);
    }
  };

  return (
    // FULLY LIGHT — soft pink-to-white gradient, zero dark
    <div className="min-h-screen relative overflow-hidden font-sans flex items-center justify-center px-5 py-14"
      style={{ background: "linear-gradient(160deg, #fff1f2 0%, #ffffff 35%, #fdf2f8 65%, #fff5f7 100%)" }}>

      <FloatingBlobs />

      <div className="relative z-10 max-w-4xl w-full">

        {/* ── HEADER ── */}
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center gap-2.5 mb-8"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
              <span className="text-white font-black text-sm">SP</span>
            </div>
            <span className="text-xl font-black" style={{ color: "#111827" }}>Stay<span style={{ color: "#f43f5e" }}>PG</span></span>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-full mb-6 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #fff0f2, #fce7f3)",
              color: "#f43f5e",
              border: "1.5px solid #fecdd3"
            }}
          >
            <Sparkles size={12} /> Welcome to StayPG — Set up your experience
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-none"
            style={{ color: "#111827" }}
          >
            Who are
            <motion.span
              className="relative inline-block ml-3"
              style={{ color: "#f43f5e" }}
            >
              you?
              {/* Underline squiggle */}
              <motion.svg
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 100 12" fill="none" preserveAspectRatio="none" style={{ height: 8 }}
              >
                <motion.path d="M2,8 Q25,2 50,8 Q75,14 98,8" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" fill="none"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.7 }} />
              </motion.svg>
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-base max-w-md mx-auto"
            style={{ color: "#9ca3af" }}
          >
            Next-gen student accommodation. Smart, seamless, built for India.
          </motion.p>
        </motion.div>

        {/* ── CARDS ── */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          onMouseLeave={() => setHovered(null)}>
          <RoleCard
            role="student"
            title="I'm a Student"
            subtitle="Find verified PGs near your college. Safe stays, real reviews, zero broker fees."
            icon={GraduationCap}
            accentColor="#f43f5e"
            perks={STUDENT_PERKS}
            selected={selected === "student"}
            hovered={hovered === "student"}
            onHover={() => setHovered("student")}
            onLeave={() => setHovered(null)}
            onClick={() => selectRole("student")}
            delay={0.45}
          />
          <RoleCard
            role="owner"
            title="I'm an Owner"
            subtitle="List your PG, manage bookings, and reach 50K+ students searching right now."
            icon={Home}
            accentColor="#7c3aed"
            perks={OWNER_PERKS}
            selected={selected === "owner"}
            hovered={hovered === "owner"}
            onHover={() => setHovered("owner")}
            onLeave={() => setHovered(null)}
            onClick={() => selectRole("owner")}
            delay={0.55}
          />
        </div>

        {/* ── SOCIAL PROOF ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          {[
            { icon: Users,   value: "50K+", label: "Students trust us" },
            { icon: Building2, value: "12K+", label: "Verified PGs" },
            { icon: Star,    value: "4.8★",  label: "Avg rating" },
            { icon: MapPin,  value: "40+",   label: "Cities covered" },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.07 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid #ffe4e6" }}
            >
              <stat.icon size={14} style={{ color: "#f43f5e" }} />
              <span className="font-black text-sm" style={{ color: "#111827" }}>{stat.value}</span>
              <span className="text-xs" style={{ color: "#9ca3af" }}>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── LOADING OVERLAY — light, NOT dark ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
            style={{ background: "rgba(255,241,242,0.9)", backdropFilter: "blur(16px)" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
            >
              <Sparkles size={28} className="text-white" />
            </motion.div>
            <div className="text-center">
              <p className="font-black text-xl" style={{ color: "#111827" }}>Setting up your dashboard…</p>
              <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>Just a moment ✨</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}