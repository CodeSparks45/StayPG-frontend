// pages/BookPG.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import {
  User, Bed, CheckCircle2, ArrowLeft, ShieldCheck, Zap, Info,
  Loader2, Calendar, Clock, Home, Phone, CreditCard, MapPin,
  Sparkles, Check, Star, Wifi, Wind, Utensils, Eye, ChevronRight,
  Building2, AlertCircle, X, MessageCircle
} from "lucide-react";

// ─── STEP DEFINITIONS ─────────────────────────────────────────────────────
const STEPS = [
  { id: 1, icon: Info,         label: "About You",       desc: "Just your name & number — we keep it safe" },
  { id: 2, icon: Bed,          label: "Room Type",        desc: "Pick your room & comfort level" },
  { id: 3, icon: Calendar,     label: "Choose Action",    desc: "Visit first, or book directly" },
  { id: 4, icon: CheckCircle2, label: "Confirm",          desc: "Review and confirm your booking" },
];

// Time slots for visit scheduling
const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
];
// Next 7 days
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i + 1);
  return {
    value: d.toISOString().split("T")[0],
    label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    isWeekend: d.getDay() === 0 || d.getDay() === 6
  };
});

// ─── PROGRESS INDICATOR ────────────────────────────────────────────────────
function StepProgress({ step }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const done   = step > s.id;
        const active = step === s.id;
        const Icon   = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${done ? "bg-emerald-500 border-emerald-500" : active ? "bg-rose-500 border-rose-500" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"}`}>
                {done ? <Check size={16} className="text-white" /> : <Icon size={15} className={active ? "text-white" : "text-slate-400"} />}
              </div>
              <span className={`text-[10px] font-bold mt-1 hidden md:block ${active ? "text-rose-500" : done ? "text-emerald-500" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${step > s.id ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ANIMATED GUIDE CARD ───────────────────────────────────────────────────
function GuideCard({ step }) {
  const items = {
    1: { emoji: "👋", title: "Quick & Easy", body: "Just your name and phone. We never share it with anyone except the PG owner." },
    2: { emoji: "🛏️", title: "Choose Your Comfort", body: "Pick the room type and AC preference. Pricing updates live as you choose." },
    3: { emoji: "🗓️", title: "Visit or Book Directly", body: "Visit first to see the PG in person, or book directly and pay at site on move-in." },
    4: { emoji: "✅", title: "Almost There!", body: "Review your choices and confirm. The owner will be notified immediately." },
  };
  const g = items[step];
  return (
    <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl p-4 flex items-start gap-3">
      <span className="text-2xl">{g.emoji}</span>
      <div>
        <p className="font-black text-rose-800 dark:text-rose-300 text-sm">{g.title}</p>
        <p className="text-rose-700 dark:text-rose-400 text-xs mt-0.5 leading-relaxed">{g.body}</p>
      </div>
    </motion.div>
  );
}

// ─── MAIN BOOK PG ──────────────────────────────────────────────────────────
export default function BookPG() {
  const location = useLocation();
  const navigate  = useNavigate();
  const pg = location.state?.selectedPg;

  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingType, setBookingType] = useState(null); // "visit" | "book"
  const [form, setForm] = useState({
    name: auth.currentUser?.displayName || "",
    phone: "",
    sharing: "Double",
    acType: "Non-AC",
    visitDate: "",
    visitTime: "",
    foodType: "Veg",
  });

  // Dynamic pricing
  const pricing = useMemo(() => {
    const base = pg?.price || 8000;
    const m = { Single: 1.5, Double: 1, Triple: 0.75 };
    const acSurcharge = form.acType === "AC" ? 2000 : 0;
    const subtotal    = Math.round(base * (m[form.sharing] || 1)) + acSurcharge;
    const platformFee = 199;
    return { subtotal, platformFee, total: subtotal + platformFee };
  }, [form, pg]);

  if (!pg) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#F4F5FA] dark:bg-slate-950">
      <AlertCircle size={48} className="text-slate-300" />
      <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Session expired. Please select a PG again.</p>
      <button onClick={() => navigate("/student")} className="text-rose-500 font-bold hover:underline">← Back to dashboard</button>
    </div>
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const notifyOwner = async (pgId, message) => {
    try {
      await addDoc(collection(db, "alerts"), {
        ownerId: pg.ownerId,
        pgId,
        message,
        type: "lead",
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch(e) { /* non-blocking */ }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { alert("Please fill your name and phone number."); return; }
    if (bookingType === "visit" && (!form.visitDate || !form.visitTime)) {
      alert("Please select a visit date and time."); return;
    }
    setLoading(true);
    try {
      const payload = {
        studentId:   auth.currentUser?.uid,
        pgId:        pg.id,
        pgName:      pg.name,
        city:        pg.city,
        area:        pg.area,
        ownerId:     pg.ownerId,
        ownerPhone:  pg.contact,
        image:       pg.photoUrl || "",
        name:        form.name,
        phone:       form.phone,
        sharing:     form.sharing,
        acType:      form.acType,
        foodType:    form.foodType,
        bookingType,
        visitDate:   form.visitDate,
        visitTime:   form.visitTime,
        price:       pricing.subtotal,
        status:      bookingType === "visit" ? "Visited" : "Active",
        rating:      0,
        createdAt:   serverTimestamp(),
        date:        new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      };

      await addDoc(collection(db, "bookings"), payload);

      // Update PG lead count
      if (pg.id) {
        await updateDoc(doc(db, "pgs", pg.id), { leads: increment(1) }).catch(() => {});
      }

      // Notify owner
      const msg = bookingType === "visit"
        ? `🗓️ ${form.name} wants to visit ${pg.name} on ${form.visitDate} at ${form.visitTime}`
        : `🏠 ${form.name} confirmed booking at ${pg.name}! Contact: ${form.phone}`;
      await notifyOwner(pg.id, msg);

      navigate("/student", { state: { tab: "dashboard", message: bookingType === "visit" ? "Visit scheduled!" : "Booking confirmed! 🎉" } });
    } catch(err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const canProceed = {
    1: form.name.trim() && form.phone.trim(),
    2: true,
    3: bookingType !== null && (bookingType === "book" || (form.visitDate && form.visitTime)),
    4: true,
  };

  return (
    <div className="min-h-screen bg-[#F4F5FA] dark:bg-slate-950 py-6 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-6 text-sm font-bold">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-800">
          <StepProgress step={step} />
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* ── FORM AREA ──────────────── */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/30">
              {/* Header */}
              <div className="px-8 pt-8 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black">{step}</div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{STEPS[step-1].label}</h2>
                </div>
                <p className="text-slate-400 text-sm">{STEPS[step-1].desc}</p>
              </div>

              {/* Guide */}
              <div className="px-8 pb-4">
                <AnimatePresence mode="wait">
                  <GuideCard step={step} />
                </AnimatePresence>
              </div>

              {/* Step content */}
              <div className="px-8 pb-8">
                <AnimatePresence mode="wait">
                  {/* ── STEP 1 ── */}
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Full Name *</label>
                        <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name"
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-rose-400 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Phone Number *</label>
                        <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" type="tel"
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-rose-400 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                        <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                        Your details are shared only with the PG owner. We never sell your data.
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 2 ── */}
                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Room Occupancy</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { t: "Single", mult: "1.5×", desc: "Full room" },
                            { t: "Double", mult: "1×",   desc: "2 people" },
                            { t: "Triple", mult: "0.75×",desc: "3 people" },
                          ].map(({ t, mult, desc }) => (
                            <button key={t} onClick={() => set("sharing", t)}
                              className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all
                                ${form.sharing === t ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600" : "border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-200"}`}>
                              <span className="block font-black text-sm">{t}</span>
                              <span className="text-[10px] text-slate-400">{desc}</span>
                              <span className={`block text-[10px] font-bold mt-1 ${form.sharing === t ? "text-rose-500" : "text-slate-400"}`}>{mult} base</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Room Comfort</label>
                        <div className="flex gap-3">
                          {["Non-AC", "AC"].map(ac => (
                            <button key={ac} onClick={() => set("acType", ac)}
                              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm border-2 transition-all
                                ${form.acType === ac ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}>
                              {ac} {ac === "AC" && <span className="text-[10px] opacity-60">+₹2,000</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Live price preview */}
                      <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl p-4">
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Live price estimate</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-rose-500">₹{pricing.subtotal.toLocaleString("en-IN")}</span>
                          <span className="text-slate-400 text-sm pb-0.5">/month</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 3 ── */}
                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      {/* Choose action */}
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setBookingType("visit")}
                          className={`p-5 rounded-2xl border-2 text-left transition-all
                            ${bookingType === "visit" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-100 dark:border-slate-700 hover:border-slate-200"}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bookingType === "visit" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                            <Calendar size={20} className={bookingType === "visit" ? "text-blue-500" : "text-slate-400"} />
                          </div>
                          <p className={`font-black text-sm ${bookingType === "visit" ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-white"}`}>Book a Visit</p>
                          <p className="text-xs text-slate-400 mt-1">See the PG first, then decide</p>
                          {bookingType === "visit" && <div className="mt-2 text-blue-500"><Check size={14} /></div>}
                        </button>
                        <button onClick={() => setBookingType("book")}
                          className={`p-5 rounded-2xl border-2 text-left transition-all
                            ${bookingType === "book" ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20" : "border-slate-100 dark:border-slate-700 hover:border-slate-200"}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bookingType === "book" ? "bg-rose-100 dark:bg-rose-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                            <Home size={20} className={bookingType === "book" ? "text-rose-500" : "text-slate-400"} />
                          </div>
                          <p className={`font-black text-sm ${bookingType === "book" ? "text-rose-700 dark:text-rose-300" : "text-slate-800 dark:text-white"}`}>Confirm & Book</p>
                          <p className="text-xs text-slate-400 mt-1">Pay at site on move-in day</p>
                          {bookingType === "book" && <div className="mt-2 text-rose-500"><Check size={14} /></div>}
                        </button>
                      </div>

                      {/* Visit scheduler */}
                      <AnimatePresence>
                        {bookingType === "visit" && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pick a date</p>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {DATES.map(d => (
                                  <button key={d.value} onClick={() => set("visitDate", d.value)}
                                    className={`flex-shrink-0 px-4 py-3 rounded-xl text-center transition-all border-2
                                      ${form.visitDate === d.value ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-200"}`}>
                                    <span className="text-xs font-black block">{d.label.split(", ")[0]}</span>
                                    <span className="text-sm font-black">{d.label.split(", ")[1]}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pick a time</p>
                              <div className="grid grid-cols-3 gap-2">
                                {TIME_SLOTS.map(t => (
                                  <button key={t} onClick={() => set("visitTime", t)}
                                    className={`py-2.5 rounded-xl text-xs font-black transition-all border-2
                                      ${form.visitTime === t ? "border-blue-500 bg-blue-500 text-white" : "border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-200"}`}>
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {bookingType === "book" && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-black text-emerald-800 dark:text-emerald-300 text-sm">Pay at site on move-in day</p>
                              <p className="text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">No online payment now. Visit the PG, see the room, and pay directly to the owner.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* ── STEP 4 ── */}
                  {step === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      {/* Checklist */}
                      {[
                        { label: "Name", value: form.name, icon: User },
                        { label: "Phone", value: form.phone, icon: Phone },
                        { label: "Room", value: `${form.sharing} sharing · ${form.acType}`, icon: Bed },
                        { label: "Action", value: bookingType === "visit" ? `Visit on ${form.visitDate} at ${form.visitTime}` : "Confirm & pay at site", icon: Calendar },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                          <div className="w-8 h-8 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <item.icon size={15} className="text-rose-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value || "–"}</p>
                          </div>
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                      ))}

                      <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-2xl p-4 flex items-start gap-3">
                        <Sparkles size={16} className="text-violet-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-violet-700 dark:text-violet-300">
                          The owner will be notified immediately after you confirm. You can also call them directly.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer nav */}
              <div className="px-8 pb-8 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  ← Back
                </button>
                {step < 4 ? (
                  <button onClick={() => setStep(s => s + 1)} disabled={!canProceed[step]}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black rounded-xl hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white disabled:opacity-40 transition-all flex items-center gap-2">
                    Continue <ChevronRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading}
                    className="px-8 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-rose-200 dark:shadow-rose-900/30 disabled:opacity-50">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {loading ? "Confirming…" : bookingType === "visit" ? "Confirm Visit 🗓️" : "Confirm Booking 🏠"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── ORDER SUMMARY ─────────── */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl sticky top-6">
              {/* PG image */}
              <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                {pg.photoUrl
                  ? <img src={pg.photoUrl} alt={pg.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Building2 size={36} className="text-slate-300" /></div>}
                <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">{pg.type}</div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">{pg.name}</h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-1"><MapPin size={11} />{pg.area}, {pg.city}</p>
                </div>

                {/* Amenities */}
                {pg.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pg.amenities.slice(0,5).map(a => (
                      <span key={a} className="text-[10px] bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 px-2 py-1 rounded-lg font-bold capitalize">{a}</span>
                    ))}
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2 border-t border-slate-50 dark:border-slate-800 pt-5">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{form.sharing} Sharing ({form.acType})</span>
                    <span className="font-bold">₹{pricing.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>Platform fee</span>
                    <span className="font-bold">₹{pricing.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white pt-3 border-t border-dashed border-slate-100 dark:border-slate-800">
                    <span>Monthly total</span>
                    <span className="text-rose-500">₹{pricing.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Owner contact */}
                {pg.contact && (
                  <a href={`tel:${pg.contact}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors">
                    <Phone size={15} /> Call owner: {pg.contact}
                  </a>
                )}

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {[
                    { icon: ShieldCheck, label: "Secure" },
                    { icon: CheckCircle2, label: "Verified" },
                    { icon: Zap, label: "Instant" },
                  ].map(b => (
                    <div key={b.label} className="flex flex-col items-center gap-1">
                      <b.icon size={18} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-400">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}