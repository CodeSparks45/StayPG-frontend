import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Gift, Clock, Zap, Check, Copy, Star, Shield, ArrowRight, Sparkles, Users } from "lucide-react";

const OFFERS = [
  {
    id: "FIRST500",
    icon: Gift,
    title: "First Booking Offer",
    desc: "Get ₹500 off on your very first PG booking. Valid for new users only.",
    discount: "₹500 OFF",
    code: "FIRST500",
    color: "#f43f5e",
    bg: "#fff0f2",
    border: "#fecdd3",
    badge: "New User",
    expiry: "30 Jun 2026",
    uses: "2,341 used",
  },
  {
    id: "REFER200",
    icon: Users,
    title: "Refer & Earn ₹200",
    desc: "Share your referral code with a friend. Both of you get ₹200 when they book.",
    discount: "₹200 EACH",
    code: "REFER200",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    badge: "Popular",
    expiry: "Ongoing",
    uses: "8,102 used",
  },
  {
    id: "WEEKEND100",
    icon: Clock,
    title: "Weekend Visit Bonus",
    desc: "Book a site visit on Saturday or Sunday and get priority slot + ₹100 cashback.",
    discount: "₹100 BACK",
    code: "WEEKEND100",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    badge: "Every Weekend",
    expiry: "Every Sat & Sun",
    uses: "987 used",
  },
  {
    id: "WIFI50",
    icon: Zap,
    title: "WiFi PG Discount",
    desc: "Book any PG with WiFi amenity and get 50% off on platform fee.",
    discount: "50% OFF FEE",
    code: "WIFI50",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    badge: "Limited",
    expiry: "15 Jun 2026",
    uses: "543 used",
  },
  {
    id: "STAR5",
    icon: Star,
    title: "Rate & Save",
    desc: "Rate any past stay with 5 stars + a review and unlock ₹150 off your next booking.",
    discount: "₹150 OFF",
    code: "STAR5",
    color: "#d97706",
    bg: "#fef3c7",
    border: "#fde68a",
    badge: "Loyalty",
    expiry: "Ongoing",
    uses: "1,234 used",
  },
  {
    id: "SAFE200",
    icon: Shield,
    title: "Verified Stay Bonus",
    desc: "Book a StayPG-verified PG and get ₹200 security deposit cashback after move-in.",
    discount: "₹200 CASHBACK",
    code: "SAFE200",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
    badge: "Verified PGs",
    expiry: "31 Jul 2026",
    uses: "3,567 used",
  },
];

function CountdownTimer({ expiry }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    if (expiry === "Ongoing" || expiry.includes("Every")) {
      setTime(expiry);
      return;
    }
    const tick = () => {
      const end = new Date(expiry).getTime();
      const diff = end - Date.now();
      if (diff <= 0) { setTime("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(`${d}d ${h}h ${m}m left`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [expiry]);

  return <span>{time}</span>;
}

function OfferCard({ offer, claimed, onClaim }) {
  const [copied, setCopied] = useState(false);

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(offer.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: `0 16px 40px ${offer.color}15` }}
      className="rounded-[1.5rem] overflow-hidden transition-all"
      style={{
        background: "white",
        border: `1.5px solid ${offer.border}`,
        boxShadow: `0 2px 16px ${offer.color}08`
      }}
    >
      {/* Top color strip */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${offer.color}, ${offer.color}80)` }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: offer.bg, color: offer.color }}>
            <offer.icon size={22} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm" style={{ color: "#111827" }}>{offer.title}</h3>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: offer.bg, color: offer.color, border: `1px solid ${offer.border}` }}>
                {offer.badge}
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6b7280" }}>{offer.desc}</p>
          </div>

          {/* Discount badge */}
          <div className="flex-shrink-0 text-center px-3 py-2 rounded-2xl font-black text-xs"
            style={{ background: offer.bg, color: offer.color, border: `1.5px solid ${offer.border}` }}>
            {offer.discount}
          </div>
        </div>

        {/* Code row */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: offer.bg, border: `1.5px dashed ${offer.color}60` }}>
            <Tag size={12} style={{ color: offer.color }} />
            <span className="font-black text-sm tracking-wider" style={{ color: offer.color }}>{offer.code}</span>
          </div>

          <button onClick={copyCode}
            className="px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
            style={copied
              ? { background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0" }
              : { background: offer.bg, color: offer.color, border: `1.5px solid ${offer.border}` }}>
            {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onClaim(offer.id)}
            className="px-4 py-2 rounded-xl text-xs font-black text-white transition-all flex items-center gap-1.5 shadow-md"
            style={claimed
              ? { background: "#f0fdf4", color: "#16a34a", boxShadow: "none" }
              : { background: `linear-gradient(135deg, ${offer.color}, ${offer.color}cc)`, boxShadow: `0 4px 12px ${offer.color}30` }}>
            {claimed ? <><Check size={11} /> Claimed!</> : <>Claim <ArrowRight size={11} /></>}
          </motion.button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: `1px solid ${offer.bg}` }}>
          <span className="text-[9px] font-bold flex items-center gap-1" style={{ color: "#9ca3af" }}>
            <Clock size={9} /> <CountdownTimer expiry={offer.expiry} />
          </span>
          <span className="text-[9px]" style={{ color: "#9ca3af" }}>{offer.uses}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function OffersDeals() {
  const [claimed, setClaimed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("claimedOffers") || "[]"); } catch { return []; }
  });

  const claimOffer = (id) => {
    const updated = claimed.includes(id) ? claimed : [...claimed, id];
    setClaimed(updated);
    localStorage.setItem("claimedOffers", JSON.stringify(updated));
  };

  const unclaimedCount = OFFERS.filter(o => !claimed.includes(o.id)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)", color: "#d97706" }}>
            <Tag size={20} />
          </div>
          <div>
            <h2 className="font-black text-lg" style={{ color: "#111827" }}>Offers & Deals</h2>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              {unclaimedCount} unclaimed offers available
            </p>
          </div>
        </div>
        {unclaimedCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white" }}>
            <Sparkles size={11} /> {unclaimedCount} new
          </div>
        )}
      </div>

      {/* Savings summary */}
      <div className="p-4 rounded-2xl flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #fff0f2, #fce7f3)", border: "1.5px solid #fecdd3" }}>
        <div>
          <p className="font-black text-2xl" style={{ color: "#f43f5e" }}>
            ₹{OFFERS.filter(o => claimed.includes(o.id)).reduce((s, o) => {
              const match = o.discount.match(/₹(\d+)/);
              return s + (match ? parseInt(match[1]) : 0);
            }, 0).toLocaleString("en-IN")}
          </p>
          <p className="text-xs font-bold mt-0.5" style={{ color: "#6b7280" }}>Total savings claimed</p>
        </div>
        <div className="text-right">
          <p className="font-black" style={{ color: "#111827" }}>{claimed.length}/{OFFERS.length}</p>
          <p className="text-xs" style={{ color: "#9ca3af" }}>Offers claimed</p>
        </div>
      </div>

      {/* Offers list */}
      <div className="space-y-4">
        {OFFERS.map((offer, i) => (
          <motion.div key={offer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <OfferCard offer={offer} claimed={claimed.includes(offer.id)} onClaim={claimOffer} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}