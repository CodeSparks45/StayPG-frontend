// pages/Signup.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, User, ArrowRight, Shield, CheckCircle2 } from "lucide-react";

const PERKS = [
  "Find PGs near your college",
  "Zero broker, zero hidden fees",
  "Book a visit in 60 seconds",
  "Real reviews from real students",
];

export default function Signup() {
  const [form, setForm]         = useState({ name:"", email:"", password:"", confirm:"" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate = useNavigate();
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const passwordStrength = (p) => {
    if (!p) return { score:0, label:"", color:"" };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ["","Weak","Fair","Good","Strong","Very Strong"];
    const colors = ["","bg-red-400","bg-amber-400","bg-yellow-400","bg-emerald-400","bg-emerald-500"];
    return { score, label: labels[score], color: colors[score] };
  };
  const strength = passwordStrength(form.password);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", user.uid), {
        name: form.name, email: form.email, createdAt: serverTimestamp(), role: null
      });
      navigate("/role");
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "This email is already registered. Try logging in.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password is too weak. Use at least 6 characters.",
      };
      setError(msgs[err.code] || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-white" style={{ colorScheme:"light" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex-col justify-center px-14">
        <div className="absolute inset-0">
          {[
            { w:250,h:250,top:"-40px",right:"-40px",color:"rgba(244,63,94,0.15)" },
            { w:180,h:180,bottom:"80px",left:"-30px",color:"rgba(244,63,94,0.1)" },
          ].map((c,i) => (
            <motion.div key={i} animate={{ rotate:[0,360] }} transition={{ repeat:Infinity, duration:20+i*5, ease:"linear" }}
              style={{ position:"absolute", width:c.w, height:c.h, top:c.top, right:c.right, bottom:c.bottom, left:c.left, borderRadius:"40%", background:c.color }} />
          ))}
        </div>
        <motion.div className="relative z-10 text-white" initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }}>
          <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-rose-900/50">
            <span className="text-white font-black text-xl">SP</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-4 text-white">
            Your home<br />awaits you.
          </h1>
          <p className="text-slate-400 text-lg max-w-sm mb-10">
            Join 50,000+ students who found their perfect PG on StayPG.
          </p>
          <div className="space-y-3">
            {PERKS.map((p,i) => (
              <motion.div key={p} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5+i*0.1 }}
                className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                {p}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        <motion.div className="w-full max-w-md" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
              <span className="text-white font-black text-sm">SP</span>
            </div>
            <span className="font-black text-xl text-slate-900">Stay<span className="text-rose-500">PG</span></span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-1">Create account</h2>
          <p className="text-slate-500 mb-7">Start your StayPG journey</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.name} onChange={e => set("name",e.target.value)}
                  placeholder="Pavan Sharma" required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-rose-400 focus:bg-white outline-none text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.email} onChange={e => set("email",e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-rose-400 focus:bg-white outline-none text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? "text":"password"} value={form.password} onChange={e => set("password",e.target.value)}
                  placeholder="Min. 6 characters" required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-rose-400 focus:bg-white outline-none text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                <button type="button" onClick={() => setShowPass(s=>!s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= strength.score ? strength.color : "bg-slate-100"}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold ${strength.score >= 3 ? "text-emerald-500" : "text-amber-500"}`}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={form.confirm} onChange={e => set("confirm",e.target.value)}
                  placeholder="Repeat your password" required
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none text-sm text-slate-900 placeholder:text-slate-400 transition-all
                    ${form.confirm && form.password !== form.confirm ? "border-red-300 bg-red-50" : "border-transparent focus:border-rose-400 focus:bg-white"}`} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                  className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition-all disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]">
              {loading ? <Loader2 size={18} className="animate-spin"/> : <ArrowRight size={18}/>}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-400">
            <Shield size={13} className="text-emerald-500"/>
            Your data is encrypted and secure
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-rose-500 font-black hover:underline">Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}