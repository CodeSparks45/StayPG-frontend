import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Star, Building2, MapPin, Edit3, Check, MessageSquare, Sparkles } from "lucide-react";

function StarRow({ rating, onRate, editable }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          disabled={!editable}
          onClick={() => editable && onRate(s)}
          onMouseEnter={() => editable && setHover(s)}
          onMouseLeave={() => editable && setHover(0)}
          className={`transition-transform ${editable ? "hover:scale-125 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            size={18}
            fill={(hover || rating) >= s ? "#fbbf24" : "none"}
            style={{ color: (hover || rating) >= s ? "#fbbf24" : "#e5e7eb" }}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ booking, onUpdateReview }) {
  const [editing, setEditing]   = useState(false);
  const [review, setReview]     = useState(booking.review || "");
  const [rating, setRating]     = useState(booking.rating || 0);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [imgErr, setImgErr]     = useState(false);

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, "bookings", booking.id), { rating, review });
    onUpdateReview(booking.id, { rating, review });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.5rem] overflow-hidden"
      style={{ background: "white", border: "1.5px solid #ffe4e6", boxShadow: "0 2px 16px rgba(244,63,94,0.05)" }}
    >
      {/* PG info row */}
      <div className="flex items-center gap-3 p-4" style={{ background: "#fff8f9", borderBottom: "1px solid #ffe4e6" }}>
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: "#fff0f2" }}>
          {booking.image && !imgErr
            ? <img src={booking.image} alt={booking.pgName} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
            : <div className="w-full h-full flex items-center justify-center"><Building2 size={18} style={{ color: "#fda4af" }} /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-sm truncate" style={{ color: "#111827" }}>{booking.pgName}</h3>
          <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#9ca3af" }}>
            <MapPin size={8} />{booking.city}
          </p>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ background: booking.status === "Active" ? "#f0fdf4" : "#fff0f2", color: booking.status === "Active" ? "#16a34a" : "#f43f5e" }}>
            {booking.status}
          </span>
        </div>
        <div className="text-right">
          <p className="font-black text-sm" style={{ color: "#f43f5e" }}>₹{Number(booking.price || 0).toLocaleString("en-IN")}</p>
          <p className="text-[9px]" style={{ color: "#9ca3af" }}>/mo</p>
        </div>
      </div>

      {/* Review area */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: "#6b7280" }}>Your Rating</p>
            <StarRow rating={rating} onRate={(r) => { setRating(r); setEditing(true); }} editable />
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#fff0f2", color: "#f43f5e", border: "1.5px solid #fecdd3" }}>
              <Edit3 size={11} /> {booking.review ? "Edit" : "Write Review"}
            </button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white"
              style={{ background: saved ? "#16a34a" : "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
              {saved ? <><Check size={11} /> Saved!</> : saving ? "Saving…" : <><Check size={11} /> Save</>}
            </motion.button>
          )}
        </div>

        {/* Review text */}
        <AnimatePresence>
          {editing ? (
            <motion.textarea
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 88 }} exit={{ opacity: 0, height: 0 }}
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Share your experience — food, cleanliness, owner behaviour, WiFi speed…"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{
                background: "#fff8f9",
                border: "1.5px solid #fecdd3",
                color: "#111827",
                fontSize: "13px"
              }}
            />
          ) : booking.review ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="px-3 py-2.5 rounded-xl text-sm" style={{ background: "#fff8f9", color: "#374151" }}>
              "{booking.review}"
            </motion.div>
          ) : (
            <p className="text-xs italic" style={{ color: "#d1d5db" }}>No review written yet. Share your experience!</p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MyReviews() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!auth.currentUser) { setLoading(false); return; }
      try {
        const snap = await getDocs(query(collection(db, "bookings"), where("studentId", "==", auth.currentUser.uid)));
        setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.status !== "Cancelled"));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const updateReview = (id, data) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const rated   = bookings.filter(b => b.rating > 0).length;
  const avgRating = rated ? (bookings.filter(b => b.rating > 0).reduce((s, b) => s + b.rating, 0) / rated).toFixed(1) : "–";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", color: "#d97706" }}>
          <Star size={20} />
        </div>
        <div>
          <h2 className="font-black text-lg" style={{ color: "#111827" }}>My Reviews</h2>
          <p className="text-xs" style={{ color: "#9ca3af" }}>{rated}/{bookings.length} stays rated</p>
        </div>
      </div>

      {/* Stats */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Stays",         value: bookings.length, color: "#f43f5e", bg: "#fff0f2" },
            { label: "Rated",         value: rated,           color: "#d97706", bg: "#fef3c7" },
            { label: "Avg Rating",    value: avgRating,       color: "#16a34a", bg: "#f0fdf4" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-2xl text-center"
              style={{ background: "white", border: "1.5px solid #ffe4e6" }}>
              <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-bold mt-0.5" style={{ color: "#9ca3af" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 rounded-full border-4 border-t-transparent"
            style={{ borderColor: "#fda4af", borderTopColor: "#f43f5e" }} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg"
            style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}>
            <MessageSquare size={36} style={{ color: "#d97706" }} />
          </motion.div>
          <h3 className="font-black text-lg mb-2" style={{ color: "#111827" }}>No stays to review yet</h3>
          <p className="text-sm max-w-xs" style={{ color: "#9ca3af" }}>
            Book a PG to get started. After your stay, share your honest experience here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <ReviewCard key={b.id} booking={b} onUpdateReview={updateReview} />
          ))}
        </div>
      )}
    </div>
  );
}