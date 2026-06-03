import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Mail, Phone, MapPin, Calendar, BookOpen, Camera, Save,
  Loader2, CheckCircle2, Edit2, User, Shield, Star
} from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState({ name: "", phone: "", city: "", college: "", bio: "", photoUrl: "" });
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) { setLoading(false); return; }
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) setProfile(p => ({ ...p, ...snap.data() }));
      setLoading(false);
    };
    load();
  }, []);

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = ref(storage, `profiles/${auth.currentUser.uid}/${Date.now()}`);
      const snap = await uploadBytes(r, file);
      const url = await getDownloadURL(snap.ref);
      setProfile(p => ({ ...p, photoUrl: url }));
    } catch { alert("Photo upload failed."); }
    finally { setUploading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), { ...profile, email: auth.currentUser.email, updatedAt: new Date() }, { merge: true });
      setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert("Save failed."); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const joinDate = auth.currentUser?.metadata?.creationTime
    ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "–";
  const initial = (profile.name || auth.currentUser?.email || "S")[0].toUpperCase();

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-rose-500" size={36} /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center border-4 border-white/30">
              {profile.photoUrl
                ? <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                : <span className="text-3xl font-black text-white">{initial}</span>}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-lg hover:scale-110 transition-transform">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          </div>
          <div>
            <h2 className="text-2xl font-black">{profile.name || "Your Name"}</h2>
            <p className="text-white/80 text-sm">{auth.currentUser?.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Shield size={12} className="text-white/60" />
              <span className="text-xs text-white/60">Joined {joinDate}</span>
            </div>
          </div>
          <button onClick={() => setEditing(e => !e)}
            className="ml-auto w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-slate-900 dark:text-white">Profile Details</h3>
          {saved && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
              <CheckCircle2 size={14} /> Saved!
            </motion.div>
          )}
        </div>

        {[
          { key: "name",    label: "Full Name",     icon: User,     type: "text",  placeholder: "Pavan Sharma" },
          { key: "phone",   label: "Phone",         icon: Phone,    type: "tel",   placeholder: "+91 98765 43210" },
          { key: "city",    label: "City",          icon: MapPin,   type: "text",  placeholder: "Nagpur" },
          { key: "college", label: "College / Work", icon: BookOpen, type: "text",  placeholder: "VNIT Nagpur" },
        ].map(f => (
          <div key={f.key}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <f.icon size={11} /> {f.label}
            </label>
            {editing
              ? <input type={f.type} value={profile[f.key] || ""} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-2 border-transparent focus:border-rose-400 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all" />
              : <p className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium">
                  {profile[f.key] || <span className="text-slate-400 italic">Not set</span>}
                </p>
            }
          </div>
        ))}

        {/* Bio */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Bio</label>
          {editing
            ? <textarea rows={3} value={profile.bio || ""} onChange={e => set("bio", e.target.value)}
                placeholder="Tell us a bit about yourself…"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-2 border-transparent focus:border-rose-400 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition-all" />
            : <p className="px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-sm text-slate-900 dark:text-white">
                {profile.bio || <span className="text-slate-400 italic">Not set</span>}
              </p>
          }
        </div>

        {editing && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={save} disabled={saving}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving…" : "Save Changes"}
          </motion.button>
        )}
      </div>
    </div>
  );
}