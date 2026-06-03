import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import {
  FileText, Upload, Trash2, Download, Eye, Check,
  Shield, AlertCircle, Plus, File, Image, Loader2
} from "lucide-react";

const DOC_TYPES = [
  { id: "aadhar",   label: "Aadhaar Card",       icon: Shield, color: "#2563eb", bg: "#eff6ff" },
  { id: "pan",      label: "PAN Card",            icon: FileText, color: "#7c3aed", bg: "#f5f3ff" },
  { id: "student",  label: "Student ID",          icon: FileText, color: "#f43f5e", bg: "#fff0f2" },
  { id: "rent",     label: "Rent Agreement",      icon: File,   color: "#16a34a", bg: "#f0fdf4" },
  { id: "photo",    label: "Passport Photo",      icon: Image,  color: "#d97706", bg: "#fef3c7" },
  { id: "other",    label: "Other",               icon: File,   color: "#6b7280", bg: "#f8fafc" },
];

function DocCard({ doc: d, onDelete }) {
  const docType = DOC_TYPES.find(t => t.id === d.type) || DOC_TYPES[5];
  const IconComp = docType.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(244,63,94,0.1)" }}
      className="p-4 rounded-2xl flex items-center gap-4 group transition-all"
      style={{ background: "white", border: "1.5px solid #ffe4e6" }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: docType.bg, color: docType.color }}>
        <IconComp size={22} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-black text-sm truncate" style={{ color: "#111827" }}>{d.name}</p>
        <p className="text-[10px] mt-0.5" style={{ color: "#9ca3af" }}>{docType.label}</p>
        <p className="text-[9px]" style={{ color: "#d1d5db" }}>
          {d.uploadedAt?.toDate ? d.uploadedAt.toDate().toLocaleDateString("en-IN") : "Recently uploaded"}
        </p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={d.url} target="_blank" rel="noopener noreferrer"
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "#eff6ff", color: "#2563eb" }}>
          <Eye size={14} />
        </a>
        <a href={d.url} download={d.name}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "#f0fdf4", color: "#16a34a" }}>
          <Download size={14} />
        </a>
        <button onClick={() => onDelete(d)}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "#fff0f2", color: "#f43f5e" }}>
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function MyDocuments() {
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selType, setSelType]   = useState("aadhar");
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const fetch = async () => {
      if (!auth.currentUser) { setLoading(false); return; }
      try {
        const snap = await getDocs(query(collection(db, "documents"), where("uid", "==", auth.currentUser.uid)));
        setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleUpload = async (file) => {
    if (!file || !auth.currentUser) return;
    setUploading(true);
    setProgress(0);
    try {
      const path = `documents/${auth.currentUser.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed",
        snap => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
        err  => { console.error(err); setUploading(false); },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          const docRef = await addDoc(collection(db, "documents"), {
            uid: auth.currentUser.uid,
            name: file.name,
            type: selType,
            url,
            path,
            uploadedAt: serverTimestamp(),
          });
          setDocs(prev => [...prev, { id: docRef.id, name: file.name, type: selType, url }]);
          setUploading(false);
          setShowUpload(false);
          setProgress(0);
        }
      );
    } catch (e) { console.error(e); setUploading(false); }
  };

  const handleDelete = async (d) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await deleteDoc(doc(db, "documents", d.id));
      if (d.path) await deleteObject(ref(storage, d.path)).catch(() => {});
      setDocs(prev => prev.filter(x => x.id !== d.id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", color: "#16a34a" }}>
            <FileText size={20} />
          </div>
          <div>
            <h2 className="font-black text-lg" style={{ color: "#111827" }}>My Documents</h2>
            <p className="text-xs" style={{ color: "#9ca3af" }}>{docs.length} documents stored securely</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowUpload(o => !o)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
          <Plus size={15} /> Upload
        </motion.button>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-3 p-3 rounded-2xl"
        style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
        <Shield size={16} style={{ color: "#16a34a" }} />
        <p className="text-xs font-bold" style={{ color: "#16a34a" }}>
          All documents are encrypted and stored securely. Only you can access them.
        </p>
      </div>

      {/* Upload panel */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl space-y-4"
              style={{ background: "white", border: "1.5px solid #fecdd3" }}>
              <p className="font-black text-sm" style={{ color: "#111827" }}>Upload a Document</p>

              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                {DOC_TYPES.map(t => (
                  <button key={t.id} onClick={() => setSelType(t.id)}
                    className="p-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center gap-2"
                    style={selType === t.id
                      ? { background: t.bg, color: t.color, border: `1.5px solid ${t.color}50` }
                      : { background: "#f8fafc", color: "#6b7280", border: "1.5px solid #f1f5f9" }}>
                    <t.icon size={13} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => !uploading && fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl cursor-pointer"
                style={{ background: "#fff8f9", border: "2px dashed #fecdd3" }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={28} className="animate-spin" style={{ color: "#f43f5e" }} />
                    <p className="text-sm font-black" style={{ color: "#f43f5e" }}>Uploading… {progress}%</p>
                    <div className="w-40 h-2 rounded-full" style={{ background: "#ffe4e6" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "#f43f5e", width: `${progress}%` }} />
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={28} style={{ color: "#fda4af" }} />
                    <p className="text-sm font-bold text-center" style={{ color: "#6b7280" }}>
                      Click to choose file<br />
                      <span className="text-[11px]" style={{ color: "#9ca3af" }}>PDF, JPG, PNG · Max 10MB</span>
                    </p>
                  </>
                )}
              </motion.div>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Docs list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 rounded-full border-4 border-t-transparent"
            style={{ borderColor: "#fda4af", borderTopColor: "#f43f5e" }} />
        </div>
      ) : docs.length === 0 && !showUpload ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg"
            style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
            <FileText size={36} style={{ color: "#16a34a" }} />
          </motion.div>
          <h3 className="font-black text-lg mb-2" style={{ color: "#111827" }}>No documents yet</h3>
          <p className="text-sm max-w-xs" style={{ color: "#9ca3af" }}>
            Store your Aadhaar, PAN, student ID & rent agreements here — safe & accessible anytime.
          </p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowUpload(true)}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
            <Upload size={15} /> Upload First Document
          </motion.button>
        </div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {docs.map(d => <DocCard key={d.id} doc={d} onDelete={handleDelete} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}