import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Navigation2, Loader2, Building2, Star, ArrowRight,
  RefreshCw, AlertCircle, Zap, Crosshair, Wifi
} from "lucide-react";

// ─── CUSTOM ICONS ──────────────────────────────────────────────────────────
const YOU_ICON = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="width:20px;height:20px;background:#f43f5e;border-radius:50%;border:3px solid white;
        box-shadow:0 2px 8px rgba(244,63,94,0.5);position:relative;z-index:5;"></div>
      <div style="position:absolute;inset:-8px;background:rgba(244,63,94,0.2);border-radius:50%;
        animation:pulse 2s infinite;"></div>
    </div>
    <style>@keyframes pulse{0%{transform:scale(1);opacity:0.6}50%{transform:scale(1.5);opacity:0.2}100%{transform:scale(1);opacity:0.6}}</style>
  `,
  iconSize: [20, 20], iconAnchor: [10, 10]
});

const PG_ICON = L.divIcon({
  className: "",
  html: `<div style="
    width:32px;height:32px;background:white;border-radius:12px;border:2.5px solid #f43f5e;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 16px rgba(244,63,94,0.25);font-size:11px;font-weight:900;color:#f43f5e;
    transition:transform 0.2s;
  ">PG</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16]
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.8, easeLinearity: 0.2 });
  }, [center, zoom, map]);
  return null;
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function NearbyPGCard({ pg, distance, onBook }) {
  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-rose-100/60 rounded-2xl overflow-hidden flex hover:shadow-md transition-all group cursor-pointer"
      onClick={() => onBook(pg)}>
      <div className="w-24 bg-rose-50 relative flex-shrink-0">
        {pg.photoUrl
          ? <img src={pg.photoUrl} alt={pg.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
          : <div className="w-full h-full flex items-center justify-center py-6"><Building2 size={18} className="text-rose-200" /></div>}
      </div>
      <div className="p-3 flex-1 min-w-0">
        <h4 className="font-black text-slate-900 text-sm truncate">{pg.name}</h4>
        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
          <MapPin size={8} />{pg.area}
          <span className="text-rose-400 font-bold ml-1">
            {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
          </span>
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-rose-500 font-black text-sm">₹{Number(pg.price || 0).toLocaleString("en-IN")}<span className="text-[9px] text-slate-400 font-normal">/mo</span></span>
          <button className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            Book <ArrowRight size={8} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyLocation() {
  const navigate = useNavigate();
  const [position, setPosition]   = useState(null);
  const [accuracy, setAccuracy]   = useState(null);
  const [cityName, setCityName]   = useState("Locating…");
  const [nearbyPGs, setNearbyPGs] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [locError, setLocError]   = useState(null);
  const [radius, setRadius]       = useState(5);

  const fetchNearbyPGs = useCallback(async (lat, lng) => {
    try {
      const snap = await getDocs(collection(db, "pgs"));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const nearby = all
        .filter(pg => pg.lat && pg.lng)
        .map(pg => ({ ...pg, dist: getDistance(lat, lng, pg.lat, pg.lng) }))
        .filter(pg => pg.dist <= radius)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 15);
      setNearbyPGs(nearby);
    } catch (e) { console.error(e); }
  }, [radius]);

  useEffect(() => {
    setLoading(true);
    setLocError(null);

    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    // HIGH ACCURACY — uses GPS chip on mobile, not just IP/WiFi
    const watchId = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const { latitude, longitude, accuracy: acc } = coords;
        setPosition([latitude, longitude]);
        setAccuracy(Math.round(acc));

        try {
          // Nominatim reverse geocoding for precise city/area name
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const name =
            addr.neighbourhood ||
            addr.suburb ||
            addr.quarter ||
            addr.city_district ||
            addr.town ||
            addr.city ||
            addr.county ||
            "Your Location";
          setCityName(name);
        } catch {
          setCityName("GPS Active");
        }

        await fetchNearbyPGs(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: "Location access denied. Please allow location access in your browser settings.",
          2: "Location unavailable. Make sure GPS is enabled on your device.",
          3: "Location request timed out. Please try again.",
        };
        setLocError(messages[err.code] || "Could not get your location.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,  // Uses GPS chip — most precise
        timeout: 15000,
        maximumAge: 0,             // Always fresh, never cached
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [fetchNearbyPGs]);

  const bookPG = (pg) => navigate("/book", { state: { selectedPg: pg } });

  if (locError) return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
        style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)" }}>
        <AlertCircle size={32} className="text-red-400" />
      </motion.div>
      <h3 className="font-black text-slate-800 text-lg mb-2">Location Access Needed</h3>
      <p className="text-slate-400 text-sm max-w-xs mb-6 leading-relaxed">{locError}</p>
      <button onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-6 py-3 text-white font-black rounded-2xl text-sm shadow-lg"
        style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
        <RefreshCw size={15} /> Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-rose-100/60 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#f43f5e" }}>Your Precise Location</p>
          <h2 className="font-black text-slate-900 text-xl flex items-center gap-2 mt-0.5">
            <Crosshair size={18} style={{ color: "#f43f5e" }} />
            {loading ? "Locating…" : cityName}
          </h2>
          {accuracy !== null && !loading && (
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Zap size={9} className="text-emerald-500" />
              Accuracy: ±{accuracy}m · GPS Active
            </p>
          )}
        </div>
        {!loading && (
          <div className="text-right">
            <p className="text-3xl font-black" style={{ color: "#f43f5e" }}>{nearbyPGs.length}</p>
            <p className="text-[10px] text-slate-400">PGs within {radius}km</p>
          </div>
        )}
      </div>

      {/* Radius selector */}
      <div className="bg-white border border-rose-100/60 rounded-2xl p-4 shadow-sm">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Search Radius</p>
        <div className="flex gap-2">
          {[1, 2, 5, 10].map(r => (
            <button key={r} onClick={() => setRadius(r)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${radius === r ? "text-white shadow-md" : "bg-rose-50 text-slate-500 hover:bg-rose-100"}`}
              style={radius === r ? { background: "linear-gradient(135deg, #f43f5e, #e11d48)" } : {}}>
              {r}km
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="relative">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-14 h-14 rounded-full border-4 border-t-transparent"
              style={{ borderColor: "#f43f5e33", borderTopColor: "#f43f5e" }} />
            <MapPin size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: "#f43f5e" }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-slate-700">Getting your precise location…</p>
            <p className="text-xs text-slate-400 mt-1">Using GPS for maximum accuracy</p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-4">
          {/* Map */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-rose-100/60 rounded-[1.5rem] overflow-hidden shadow-sm" style={{ height: 440 }}>
              {position && (
                <MapContainer center={position} zoom={15} className="h-full w-full" zoomControl>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                  <MapController center={position} zoom={15} />
                  <Marker position={position} icon={YOU_ICON}>
                    <Popup><b>You are here</b><br />{cityName}{accuracy && <><br /><small>±{accuracy}m accuracy</small></>}</Popup>
                  </Marker>
                  <Circle center={position} radius={radius * 1000}
                    pathOptions={{ color: "#f43f5e", fillColor: "#f43f5e", fillOpacity: 0.05, weight: 1.5, dashArray: "6 4" }} />
                  {nearbyPGs.filter(pg => pg.lat && pg.lng).map(pg => (
                    <Marker key={pg.id} position={[pg.lat, pg.lng]} icon={PG_ICON}>
                      <Popup>
                        <div style={{ minWidth: 150 }}>
                          <b style={{ display: "block", fontSize: 13 }}>{pg.name}</b>
                          <span style={{ color: "#f43f5e", fontWeight: 900 }}>₹{Number(pg.price || 0).toLocaleString("en-IN")}/mo</span>
                          <button onClick={() => bookPG(pg)}
                            style={{ display: "block", marginTop: 6, background: "#f43f5e", color: "white", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>
                            Book Now
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-5 space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {nearbyPGs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-3">
                  <Building2 size={24} className="text-rose-200" />
                </div>
                <p className="font-bold text-slate-600 text-sm">No PGs found within {radius}km</p>
                <p className="text-xs text-slate-400 mt-1">Try increasing the radius</p>
              </div>
            ) : nearbyPGs.map((pg, i) => (
              <motion.div key={pg.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <NearbyPGCard pg={pg} distance={pg.dist} onBook={bookPG} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}