import Navbar from "../components/Navbar";

const cities = [
  { name: "Pune", img: "https://source.unsplash.com/400x300/?pune,city" },
  { name: "Mumbai", img: "https://source.unsplash.com/400x300/?mumbai,city" },
  { name: "Bangalore", img: "https://source.unsplash.com/400x300/?bangalore,city" },
  { name: "Hyderabad", img: "https://source.unsplash.com/400x300/?hyderabad,city" },
  { name: "Delhi", img: "https://source.unsplash.com/400x300/?delhi,city" },
  { name: "Chennai", img: "https://source.unsplash.com/400x300/?chennai,city" },
  { name: "Nagpur", img: "https://source.unsplash.com/400x300/?nagpur,city" },
  { name: "Indore", img: "https://source.unsplash.com/400x300/?indore,city" },
  { name: "Jaipur", img: "https://source.unsplash.com/400x300/?jaipur,city" },
  { name: "Ahmedabad", img: "https://source.unsplash.com/400x300/?ahmedabad,city" },
];

export default function StudentCities() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-14">
        <h2 className="text-4xl font-bold mb-10 text-center">
          Choose Your City
        </h2>

        <div className="grid md:grid-cols-5 gap-8">
          {cities.map((city) => (
            <div
              key={city.name}
              onClick={() =>
                window.location.href = /city-pgs?city=${city.name}
              }
              className="cursor-pointer bg-white rounded-xl shadow hover:scale-105 transition overflow-hidden"
            >
              <img src={city.img} className="h-32 w-full object-cover" />
              <div className="p-4 text-center font-semibold">
                {city.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
