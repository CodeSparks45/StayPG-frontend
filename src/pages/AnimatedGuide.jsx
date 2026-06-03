import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Home, Wallet, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Rocket } from "lucide-react";

const GUIDE_STEPS = [
  {
    id: 1,
    title: "Make it Visual",
    desc: "Upload crystal-clear photos. Listings with great lighting get 3x more leads.",
    icon: <Camera size={48} />,
    color: "from-rose-500 to-orange-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    textHover: "group-hover:text-rose-500"
  },
  {
    id: 2,
    title: "The Core Details",
    desc: "Name, exact location, and contact info. Make it effortless for students to find you.",
    icon: <Home size={48} />,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    textHover: "group-hover:text-blue-500"
  },
  {
    id: 3,
    title: "Smart Pricing",
    desc: "Set your rent and deposit. Our AI will tell you if you're hitting the sweet spot.",
    icon: <Wallet size={48} />,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    textHover: "group-hover:text-emerald-500"
  },
  {
    id: 4,
    title: "Vibe & Amenities",
    desc: "High-speed WiFi? AC? Home-cooked meals? Check the boxes and set your house rules.",
    icon: <Sparkles size={48} />,
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    textHover: "group-hover:text-violet-500"
  },
  {
    id: 5,
    title: "Go Live Instantly",
    desc: "Review your bento-styled listing and push it live to thousands of searchers.",
    icon: <CheckCircle2 size={48} />,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-500/10",
    textHover: "group-hover:text-pink-500"
  }
];

export default function AnimatedGuide({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, GUIDE_STEPS.length - 1));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0));

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-violet-600 text-white mb-6 shadow-2xl shadow-rose-500/30"
        >
          <Rocket size={32} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Welcome to StayPG <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-violet-600">PRO</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Let's get your first property earning in under 2 minutes.</p>
      </div>

      {/* The Interactive Carousel */}
      <div className="relative w-full max-w-2xl h-[300px] perspective-1000">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100, rotateY: -15, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, rotateY: 15, scale: 0.9 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            className={`absolute inset-0 rounded-[3rem] p-8 md:p-12 border-2 border-transparent bg-white dark:bg-slate-800 shadow-xl flex flex-col items-center justify-center text-center group hover:border-slate-200 dark:hover:border-slate-700 transition-all overflow-hidden`}
          >
            {/* Background Blur Blob */}
            <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${GUIDE_STEPS[currentStep].color} rounded-full blur-[80px] opacity-20 dark:opacity-40 pointer-events-none`} />
            
            <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${GUIDE_STEPS[currentStep].color} text-white flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
              {GUIDE_STEPS[currentStep].icon}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{GUIDE_STEPS[currentStep].title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed">
              {GUIDE_STEPS[currentStep].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full max-w-2xl mt-12">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Dots */}
        <div className="flex gap-3">
          {GUIDE_STEPS.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: currentStep === idx ? 32 : 12,
                backgroundColor: currentStep === idx ? "#f43f5e" : "#cbd5e1" // rose-500 : slate-300
              }}
              className="h-3 rounded-full"
            />
          ))}
        </div>

        {currentStep === GUIDE_STEPS.length - 1 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-violet-600 text-white font-black rounded-full shadow-xl shadow-rose-500/30 flex items-center gap-2"
          >
            Start Listing <ChevronRight size={20} />
          </motion.button>
        ) : (
          <button
            onClick={nextStep}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-110 transition-all shadow-lg"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}