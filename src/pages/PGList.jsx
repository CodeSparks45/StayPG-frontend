import Navbar from "../components/Navbar";

export default function PGList() {
  const pgs = [
    { name: "Royal PG", city: "Latur", price: 5000 },
    { name: "Sai PG", city: "Pune", price: 6500 },
    { name: "Green Villa", city: "Nagpur", price: 7000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-8">Available PGs</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {pgs.map((pg, i) => (
            <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
              <h3 className="text-xl font-bold">{pg.name}</h3>
              <p className="text-gray-500">{pg.city}</p>
              <p className="mt-3 font-semibold text-lg">₹ {pg.price}</p>
              <button className="mt-5 w-full bg-black text-white py-2 rounded">
                Contact Owner
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}