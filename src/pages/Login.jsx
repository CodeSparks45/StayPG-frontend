// pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight, Shield } from "lucide-react";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/role");
    } catch (err) {
      const msgs = {
        "auth/user-not-found":  "No account found with this email.",
        "auth/wrong-password":  "Incorrect password. Please try again.",
        "auth/invalid-email":   "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again.",
      };
      setError(msgs[err.code] || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    /* Force light mode on auth pages — always white background */
    <div className="min-h-screen flex bg-white" style={{ colorScheme: "light" }}>
      {/* Left panel — illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Floating circles */}
          {[
            { w:300,h:300,top:"-50px",left:"-50px",opacity:0.15 },
            { w:200,h:200,bottom:"100px",right:"-30px",opacity:0.12 },
            { w:150,h:150,top:"40%",left:"60%",opacity:0.1 },
          ].map((c,i) => (
            <motion.div key={i} animate={{ y:[0,-20,0] }} transition={{ repeat:Infinity, duration:4+i, delay:i*1.5 }}
              style={{ position:"absolute", width:c.w, height:c.h, top:c.top, left:c.left, right:c.right, bottom:c.bottom, borderRadius:"50%", background:"white", opacity:c.opacity }} />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-14 text-white">
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }}>
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-8">
              <span className="text-white font-black text-xl">SP</span>
            </div>
            <h1 className="text-5xl font-black leading-tight mb-4">Find your<br />perfect PG.</h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              Verified stays near your college. No broker fees. Book in 60 seconds.
            </p>
            <div className="flex flex-col gap-3 mt-10">
              {["50,000+ verified listings", "Zero broker fees", "Book in 60 seconds"].map((f,i) => (
                <motion.div key={f} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5+i*0.1 }}
                  className="flex items-center gap-3 text-white/90 text-sm font-medium">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  {f}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        <motion.div className="w-full max-w-md" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
              <span className="text-white font-black text-sm">SP</span>
            </div>
            <span className="font-black text-xl text-slate-900">Stay<span className="text-rose-500">PG</span></span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-1">Welcome back 👋</h2>
          <p className="text-slate-500 mb-8">Login to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-rose-400 focus:bg-white outline-none text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-rose-400 focus:bg-white outline-none text-sm text-slate-900 placeholder:text-slate-400 transition-all" />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-rose-500 font-bold hover:underline">Forgot password?</button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition-all disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
            <Shield size={13} className="text-emerald-500" />
            Secured with Firebase Authentication
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-rose-500 font-black hover:underline">Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}