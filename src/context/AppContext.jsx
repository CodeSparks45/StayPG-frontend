// context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useTranslation } from "../translations";

const AppContext = createContext({});
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  // ── THEME ─────────────────────────────────────────────────────────────────
  const [dark, setDarkState] = useState(() => {
    const saved = localStorage.getItem("staypg_theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme:dark)").matches;
  });

  const setDark = useCallback((val) => {
    const next = typeof val === "function" ? val(dark) : val;
    setDarkState(next);
    localStorage.setItem("staypg_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }, [dark]);

  // Apply on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, []); // eslint-disable-line

  // ── LANGUAGE ──────────────────────────────────────────────────────────────
  const [lang, setLangState] = useState(() => localStorage.getItem("staypg_lang") || "en");

  const setLang = useCallback((code) => {
    setLangState(code);
    localStorage.setItem("staypg_lang", code);
  }, []);

  const t = useTranslation(lang);

  // ── USER ──────────────────────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) { setUserProfile(null); setUserLoading(false); return; }
      const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
        setUserProfile(snap.exists() ? { uid: user.uid, email: user.email, ...snap.data() } : { uid: user.uid, email: user.email });
        setUserLoading(false);
      });
      return unsub;
    });
    return unsubAuth;
  }, []);

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  const [notifCount, setNotifCount] = useState(0);
  useEffect(() => {
    if (!auth.currentUser) return;
    // Count unread bookings/alerts — real Firestore
    import("firebase/firestore").then(({ collection, query, where, onSnapshot: snap }) => {
      const q = query(collection(db, "bookings"), where("studentId", "==", auth.currentUser.uid));
      const unsub = snap(q, (s) => {
        // notify if any pending/visited booking needs attention
        const attention = s.docs.filter(d => ["Pending","Visited"].includes(d.data().status)).length;
        setNotifCount(attention);
      });
      return unsub;
    });
  }, [userProfile]);

  return (
    <AppContext.Provider value={{ dark, setDark, lang, setLang, t, userProfile, userLoading, notifCount }}>
      {children}
    </AppContext.Provider>
  );
}