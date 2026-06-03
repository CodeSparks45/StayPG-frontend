import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, HelpCircle, Sparkles, MessageSquare, ChevronRight, Mic, MicOff } from "lucide-react";

export default function Help() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Welcome to StayPG! 🏠 I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);

  // --- Voice Recognition Logic ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Automatically send the voice message
      handleSend(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const toggleListen = () => {
    if (!recognition) return alert("Voice recognition not supported in this browser.");
    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  // --- Chat Logic ---
  const handleSend = (text = input) => {
    const messageText = typeof text === 'string' ? text : input;
    if (!messageText.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "";
      const query = messageText.toLowerCase();

      if (query.includes("find")) botResponse = "Go to the **Explore PG** tab to find stays!";
      else if (query.includes("book")) botResponse = "Click **'Request Booking'** on any property page.";
      else if (query.includes("add")) botResponse = "Owners: Click **'List My PG'** to get started.";
      else botResponse = "I'm here to help! Ask about finding, booking, or listing PGs.";

      setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50">
      
      {/* 1. HEADER */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-rose-500 p-3 rounded-2xl shadow-lg text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="font-black text-xl text-white tracking-tight">StayPG AI Support</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 ${isListening ? 'bg-rose-500 animate-ping' : 'bg-green-500'} rounded-full`}></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {isListening ? "Listening..." : "Ready to Help"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHAT BODY */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-transparent to-rose-50/20 no-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`p-5 rounded-3xl text-sm font-medium ${
              msg.role === "user" 
                ? "bg-rose-500 text-white rounded-tr-none shadow-lg shadow-rose-500/20" 
                : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm"
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && <div className="text-xs text-slate-400 font-bold ml-2 animate-pulse">Bot is thinking...</div>}
        <div ref={scrollRef} />
      </div>

      {/* 3. INPUT AREA WITH VOICE */}
      <div className="p-6 bg-white border-t border-slate-100 flex gap-3 items-center">
        
        {/* Voice Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleListen}
          className={`p-4 rounded-2xl transition-all shadow-lg ${
            isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:text-rose-500'
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </motion.button>

        <div className="flex-1 bg-slate-100 rounded-[1.5rem] px-5 py-1 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "Listening..." : "Ask me anything..."}
            className="flex-1 bg-transparent py-4 text-sm font-semibold text-slate-700 outline-none"
          />
        </div>

        <button
          onClick={() => handleSend()}
          className="bg-slate-900 hover:bg-rose-500 text-white p-4 rounded-2xl transition-all shadow-xl"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}