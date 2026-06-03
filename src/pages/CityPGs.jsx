/*import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function CityPGs() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get("city");

  const [loading, setLoading] = useState(true);
  const [pgs, setPGs] = useState([]);

  useEffect(() => {
    // Fake backend delay (realistic)
    setTimeout(() => {
      const data = Array.from({ length: 12 }, (_, i) => ({
        name: ${city} Comfort PG ${i + 1},
        rent: 4500 + i * 300,
      }));
      setPGs(data);
      setLoading(false);
    }, 1200);
  }, [city]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-14">
        <h2 className="text-3xl font-bold mb-6">
          PGs in {city}
        </h2>

        {loading ? (
          <div className="text-center text-xl mt-20 animate-pulse">
            Loading PGs...
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-8">
            {pgs.map((pg, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow hover:shadow-xl transition p-6"
              >
                <h3 className="text-xl font-bold mb-2">{pg.name}</h3>
                <p className="text-gray-600">Fully Furnished</p>
                <p className="mt-2 font-semibold">₹ {pg.rent}</p>
                <button className="mt-4 w-full bg-black text-white py-2 rounded">
                  Contact Owner
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}*/