import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, CalendarDays, Loader2 } from "lucide-react";
// Firebase imports
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Dashboard({ goExplore }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // 1. Sirf logged-in student ki bookings lao
    const q = query(
      collection(db, "bookings"), 
      where("studentId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex justify-center mt-20">
      <Loader2 className="animate-spin text-rose-500" size={40} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Home className="text-rose-500" size={28} />
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
      </div>

      {/* EMPTY STATE */}
      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center mt-32 text-center"
        >
          <CalendarDays size={60} className="text-gray-300 mb-6" />

          <p className="text-xl text-gray-600 mb-8 max-w-md">
            You haven’t booked any PG yet.  
            Start exploring comfortable stays near your city ✨
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={goExplore}
            className="bg-rose-500 text-white px-10 py-4 rounded-full shadow-xl text-lg font-bold"
          >
            Explore PGs 🚀
          </motion.button>
        </motion.div>
      ) : (
        /* LIVE BOOKINGS UI */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-[2rem] shadow-lg p-6 border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-rose-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-bold uppercase">
                Active Booking
              </div>
              
              <h3 className="font-black text-xl text-gray-900 mb-2 leading-tight">
                {booking.pgName}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-500">
                <p className="flex justify-between"><span>City:</span> <b className="text-gray-800">{booking.city}</b></p>
                <p className="flex justify-between"><span>Price Paid:</span> <b className="text-rose-500">₹{booking.price}</b></p>
                <p className="flex justify-between"><span>Booking Date:</span> <b className="text-gray-800">{booking.date || "Pending"}</b></p>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-slate-100">
                <p className="text-amber-500 font-bold flex items-center gap-1">
                  ⭐ {booking.rating || "4.8"} <span className="text-gray-300 text-xs font-normal">(User Rating)</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}