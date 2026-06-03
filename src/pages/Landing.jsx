export default function Landing() {
  const slogans = [
    {
      title: "Your Safety, Our Priority",
      desc: "Verified stays for complete peace of mind.",
      icon: "🛡️",
    },
    {
      title: "Feels Like Home",
      desc: "Comfortable PGs wherever you go.",
      icon: "🏠",
    },
    {
      title: "Zero Brokers",
      desc: "Direct owner connections. No hidden charges.",
      icon: "🤝",
    },
    {
      title: "Smart Booking",
      desc: "Book PGs in seconds with confidence.",
      icon: "⚡",
    },
    {
      title: "Trusted by Thousands",
      desc: "Students & professionals trust StayPG.",
      icon: "⭐",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 px-6 py-10">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-slate-800 mb-6">
        Find Your Perfect PG with <span className="text-green-600">StayPG</span>
      </h1>

      <p className="text-center text-slate-600 mb-12">
        Safe • Verified • Student Friendly
      </p>

      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {slogans.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {item.title}
            </h3>
            <p className="text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}