const slogans = [
  {
    title: "Your Safety, Our Priority",
    desc: "Verified stays for peace of mind"
  },
  {
    title: "Feels Like Home",
    desc: "Comfortable PGs wherever you go"
  },
  {
    title: "Zero Brokers",
    desc: "Direct owner connections"
  },
  {
    title: "Smart Booking",
    desc: "Book PGs in seconds"
  },
  {
    title: "Trusted by Thousands",
    desc: "Students & professionals trust StayPG"
  }
];

export default function SloganCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10">
      {slogans.map((item, index) => (
        <div
          key={index}
          className="bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition"
        >
          <h3 className="text-lg font-semibold text-blue-600">
            {item.title}
          </h3>
          <p className="text-gray-600 mt-2">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}