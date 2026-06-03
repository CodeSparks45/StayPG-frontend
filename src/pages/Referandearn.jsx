import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
  Zap, Copy, Check, Share2, Users, Gift, ArrowRight,
  Star, IndianRupee, ChevronRight, Sparkles, Clock
} from "lucide-react";

function StatBox({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="p-4 rounded-2xl flex flex-col gap-2"
      style={{ background: bg, border: `1.5px solid ${color}20` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, color }}>
        <Icon size={17} />
      </div>
      <p className="text-2xl font-black" style={{ color: "#111827" }}>{value}</p>
      <p className="text-[10px] font-bold" style={{ color: "#6b7280" }}>{label}</p>
    </div>
  );
}

const HOW_IT_WORKS = [
  { n: "1", icon: Share2, color: "#f43f5e", bg: "#fff0f2", title: "Share your code", desc: "Copy and share your unique referral code with friends" },
  { n: "2", icon: Users,  color: "#2563eb", bg: "#eff6ff", title: "Friend signs up",  desc: "They create an account using your referral code" },
  { n: "3", icon: Gift,   color: "#d97706", bg: "#fef3c7", title: "Both earn ₹200",   desc: "You get ₹200 and they get ₹200 on their first booking" },
];

export default function ReferAndEarn() {
  const [refCode, setRefCode]     = useState("");
  const [copied, setCopied]       = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [earnings, setEarnings]   = useState(0);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!auth.currentUser) { setLoading(false); return; }
      const uid = auth.currentUser.uid;

      // Generate / fetch referral code
      const userRef = doc(db, "users", uid);
      const snap    = await getDoc(userRef);
      let code = snap.data()?.referralCode;
      if (!code) {
        code = "SP" + uid.slice(0, 6).toUpperCase();
        await setDoc(userRef, { referralCode: code }, { merge: true });
      }
      setRefCode(code);

      // Fetch referrals
      try {
        const rsnap = await getDocs(query(collection(db, "referrals"), where("referrerId", "==", uid)));
        const refs  = rsnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setReferrals(refs);
        setEarnings(refs.filter(r => r.status === "completed").length * 200);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    init();
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(refCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyLink = () => {
    const link = `https://staypg.in/signup?ref=${refCode}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareNative = async () => {
    const link = `https://staypg.in/signup?ref=${refCode}`;
    if (navigator.share) {
      await navigator.share({ title: "Join StayPG!", text: `Find verified PGs near your college. Use my code ${refCode} and get ₹200 off! 🏠`, url: link }).catch(() => {});
    } else {
      copyLink();
    }
  };

  const pending   = referrals.filter(r => r.status === "pending").length;
  const completed = referrals.filter(r => r.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #fff0f2, #fce7f3)", color: "#f43f5e" }}>
          <Zap size={20} />
        </div>
        <div>
          <h2 className="font-black text-lg" style={{ color: "#111827" }}>Refer & Earn</h2>
          <p className="text-xs" style={{ color: "#9ca3af" }}>Earn ₹200 for every friend who books</p>
        </div>
      </div>

      {/* Big hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[2rem] p-7 overflow-hidden text-center"
        style={{
          background: "linear-gradient(145deg, #fff0f2 0%, #fce7f3 50%, #fff5f7 100%)",
          border: "1.5px solid #fecdd3"
        }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f43f5e, transparent)" }} />
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-xl"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
          <Gift size={30} className="text-white" />
        </motion.div>
        <p className="text-3xl font-black mb-1" style={{ color: "#f43f5e" }}>₹200</p>
        <p className="font-black text-lg mb-1" style={{ color: "#111827" }}>per successful referral</p>
        <p className="text-sm" style={{ color: "#9ca3af" }}>Your friend also gets ₹200 on their first booking!</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox icon={Users}        label="Total Referred"  value={referrals.length} color="#f43f5e" bg="#fff8f9" />
        <StatBox icon={Check}        label="Completed"       value={completed}        color="#16a34a" bg="#f8fffe" />
        <StatBox icon={IndianRupee}  label="Total Earned"    value={`₹${earnings}`}  color="#d97706" bg="#fffdf5" />
      </div>

      {/* Referral code */}
      <div className="p-5 rounded-2xl space-y-4"
        style={{ background: "white", border: "1.5px solid #fecdd3" }}>
        <p className="font-black text-sm" style={{ color: "#111827" }}>Your Referral Code</p>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center justify-center py-4 rounded-2xl"
            style={{ background: "#fff0f2", border: "2px dashed #f43f5e" }}>
            <span className="font-black text-2xl tracking-[0.2em]" style={{ color: "#f43f5e" }}>
              {loading ? "Loading…" : refCode}
            </span>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={copyCode}
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-xs font-black transition-all"
            style={copied
              ? { background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0" }
              : { background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white" }}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={copyLink}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all"
            style={copiedLink
              ? { background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0" }
              : { background: "#fff0f2", color: "#f43f5e", border: "1.5px solid #fecdd3" }}>
            {copiedLink ? <Check size={13} /> : <Copy size={13} />}
            {copiedLink ? "Link Copied!" : "Copy Link"}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={shareNative}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black text-white"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            <Share2 size={13} /> Share Now
          </motion.button>
        </div>
      </div>

      {/* How it works */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>How it works</p>
        <div className="grid md:grid-cols-3 gap-3">
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl relative overflow-hidden"
              style={{ background: "white", border: "1.5px solid #ffe4e6" }}>
              <div className="absolute top-2 right-3 text-4xl font-black select-none" style={{ color: "#fff0f2" }}>{s.n}</div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg, color: s.color }}>
                <s.icon size={17} />
              </div>
              <p className="font-black text-sm" style={{ color: "#111827" }}>{s.title}</p>
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Referrals list */}
      {referrals.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>Your Referrals</p>
          <div className="space-y-2">
            {referrals.map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "white", border: "1.5px solid #ffe4e6" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
                    {(r.friendEmail || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#111827" }}>{r.friendEmail || "Friend"}</p>
                    <p className="text-[10px]" style={{ color: "#9ca3af" }}>{r.status === "completed" ? "Booking completed" : "Signed up, awaiting booking"}</p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full"
                  style={r.status === "completed"
                    ? { background: "#f0fdf4", color: "#16a34a" }
                    : { background: "#fef3c7", color: "#d97706" }}>
                  {r.status === "completed" ? "+₹200" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}