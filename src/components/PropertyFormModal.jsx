import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Camera, Loader2, MapPin, TrendingUp, ChevronRight } from "lucide-react";

export const ONBOARDING_STEPS = [
  { id:1, title:"Photos", desc:"Upload up to 4 clear photos." },
  { id:2, title:"Basic Details", desc:"PG name, city, area and address." },
  { id:3, title:"Pricing", desc:"Set rent, deposit and rooms." },
  { id:4, title:"Amenities", desc:"Tick what you offer." },
  { id:5, title:"Publish", desc:"Review and go live." }
];

export const CITIES = ["Delhi","Mumbai","Bangalore","Pune","Noida","Gurgaon","Kota","Nagpur","Hyderabad","Chennai"];
export const AMENITIES_LIST = [
  { id:"wifi", label:"WiFi" }, { id:"ac", label:"AC" }, { id:"food", label:"Meals" },
  { id:"laundry", label:"Laundry" }, { id:"parking", label:"Parking" }, { id:"cctv", label:"CCTV" }
];

export function IBox({ label, type="text", value, onChange, placeholder="" }) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
      <input required type={type} placeholder={placeholder} className="w-full p-3 bg-slate-50 dark:bg-slate-700 dark:text-white rounded-xl font-medium border-2 border-transparent focus:border-rose-500 outline-none text-sm transition-all" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export default function PropertyFormModal({ 
  showForm, setShowForm, formStep, setFormStep, formData, setFormData, 
  handleImageUpload, handleSubmit, loading, uploading, editPg, darkMode 
}) {
  if (!showForm) return null;

  const set = (k,v) => setFormData(p => ({ ...p, [k]:v }));
  const toggleAmenity = (id) => setFormData(p => ({
    ...p, amenities: p.amenities.includes(id) ? p.amenities.filter(x=>x!==id) : [...p.amenities,id]
  }));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowForm(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
      <motion.div initial={{y:60,opacity:0,scale:0.95}} animate={{y:0,opacity:1,scale:1}} exit={{y:60,opacity:0,scale:0.95}} className={`w-full max-w-4xl rounded-[2.5rem] relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-8 pt-7 pb-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{editPg ? "Edit Property" : "List Your Property"}</h3>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Step {formStep} of 5 — {ONBOARDING_STEPS[formStep-1].title}</p>
          </div>
          <button type="button" onClick={()=>setShowForm(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-rose-500 transition"><X size={18} /></button>
        </div>

        {/* Progress Bar */}
        <div className={`px-8 py-4 flex items-center gap-2 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
          {ONBOARDING_STEPS.map((s,i) => {
            const done = formStep > s.id;
            const active = formStep === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <button type="button" onClick={() => (done || active) && setFormStep(s.id)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all flex-shrink-0 ${done ? "bg-emerald-500 border-emerald-500 text-white" : active ? "bg-rose-500 border-rose-500 text-white" : "bg-transparent border-slate-300 text-slate-400"}`}>{done ? <CheckCircle2 size={14} /> : s.id}</button>
                {i < 4 && <div className={`h-0.5 flex-1 rounded-full ${done ? "bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}`} />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div key={formStep} initial={{x:20,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-20,opacity:0}} transition={{duration:0.2}}>
              
              {/* Step 1: Photos (Max 4 Array) */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <div className={`grid grid-cols-2 gap-4 h-72 border-2 border-dashed p-4 rounded-3xl relative overflow-y-auto ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    {formData.photos && formData.photos.length > 0 ? (
                      formData.photos.map((url, idx) => (
                        <div key={idx} className="relative h-28 rounded-2xl overflow-hidden shadow-sm">
                          <img src={url} className="w-full h-full object-cover" alt="preview" />
                          <button type="button" onClick={() => setFormData(p => ({ ...p, photos: p.photos.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full"><X size={10} /></button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 flex flex-col items-center justify-center text-slate-400 py-10">
                        {uploading ? <Loader2 className="animate-spin text-rose-500" size={40} /> : <Camera size={40} />}
                        <p className="font-bold text-sm mt-2">{uploading ? "Uploading..." : "Upload up to 4 photos"}</p>
                      </div>
                    )}
                    {(!formData.photos || formData.photos.length < 4) && (
                      <label className="absolute inset-0 cursor-pointer opacity-0"><input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" /></label>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Basic */}
              {formStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <IBox label="PG Name *" value={formData.name} onChange={v=>set("name",v)} placeholder="e.g. Shree Ram PG" />
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">City *</label>
                    <select className="w-full p-3 rounded-xl font-bold outline-none bg-slate-50 dark:bg-slate-700 dark:text-white" value={formData.city} onChange={e=>set("city",e.target.value)}>{CITIES.map(c => <option key={c}>{c}</option>)}</select>
                  </div>
                  <IBox label="Area / Locality *" value={formData.area} onChange={v=>set("area",v)} placeholder="e.g. Shankar Nagar" />
                  <IBox label="WhatsApp / Phone *" value={formData.contact} onChange={v=>set("contact",v)} placeholder="+91 98765 43210" />
                  <div className="md:col-span-2"><IBox label="Full Address *" value={formData.address} onChange={v=>set("address",v)} placeholder="House no, Street, Landmark, City" /></div>
                </div>
              )}

              {/* Step 3: Pricing */}
              {formStep === 3 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <IBox label="Monthly Rent (₹) *" type="number" value={formData.price} onChange={v=>set("price",v)} placeholder="6000" />
                  <IBox label="Security Deposit" type="number" value={formData.deposit} onChange={v=>set("deposit",v)} placeholder="12000" />
                  <IBox label="Total Rooms" type="number" value={formData.rooms} onChange={v=>set("rooms",v)} placeholder="10" />
                  <IBox label="Floor" value={formData.floor} onChange={v=>set("floor",v)} placeholder="1st Floor" />
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">PG Type</label>
                    <select className="w-full p-3 rounded-xl font-bold outline-none bg-slate-50 dark:bg-slate-700 dark:text-white" value={formData.type} onChange={e=>set("type",e.target.value)}><option>Boys</option><option>Girls</option><option>Unisex</option></select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sharing Type</label>
                    <select className="w-full p-3 rounded-xl font-bold outline-none bg-slate-50 dark:bg-slate-700 dark:text-white" value={formData.sharing} onChange={e=>set("sharing",e.target.value)}><option>Single</option><option>Double</option><option>Triple</option></select>
                  </div>
                </div>
              )}

              {/* Step 4: Amenities */}
              {formStep === 4 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AMENITIES_LIST.map(a => (
                      <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)} className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${formData.amenities.includes(a.id) ? "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-600" : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500"}`}>{a.label}</button>
                    ))}
                  </div>
                  <IBox label="House Rules" value={formData.rules} onChange={v=>set("rules",v)} placeholder="No smoking..." />
                </div>
              )}

              {/* Step 5: Review */}
              {formStep === 5 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`border rounded-3xl overflow-hidden shadow-sm p-4 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                      {formData.photos?.length > 0 ? <img src={formData.photos[0]} className="w-full h-full object-cover" alt="preview" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Camera size={40} /></div>}
                    </div>
                    <p className={`font-black mt-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formData.name || "Untitled PG"}</p>
                    <p className="text-xs text-slate-400 mt-1">{formData.area || "Area Missing"}, {formData.city}</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label:"Photos loaded", ok: formData.photos?.length > 0 },
                      { label:"PG Name set", ok: !!formData.name },
                      { label:"Area set", ok: !!formData.area },
                      { label:"Contact set", ok: !!formData.contact },
                      { label:"Rent set", ok: !!formData.price },
                    ].map(item => (
                      <div key={item.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${item.ok ? "bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:text-emerald-400" : "bg-red-50/50 border-red-100 text-red-500"}`}>{item.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}<span className="text-xs font-bold">{item.label}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-8 py-5 border-t ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'}`}>
          <button type="button" onClick={() => setFormStep(s => Math.max(1, s-1))} disabled={formStep === 1} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-500 disabled:opacity-30">← Back</button>
          {formStep < 5 ? (
            <button type="button" onClick={() => setFormStep(s => s+1)} className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-black rounded-xl hover:bg-rose-500 flex items-center gap-2">Continue <ChevronRight size={16} /></button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading || uploading} className="px-8 py-2.5 bg-rose-500 text-white text-sm font-black rounded-xl hover:bg-rose-600 flex items-center gap-2">{loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}{loading ? "Publishing…" : editPg ? "Save Changes" : "Publish Live 🚀"}</button>
          )}
        </div>

      </motion.div>
    </div>
  );
}