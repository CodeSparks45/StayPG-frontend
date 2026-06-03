import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <div className="max-w-6xl mx-auto mt-28 grid md:grid-cols-2 gap-12 px-6">
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Discover Verified PGs Near You
          </h1>
          <p className="text-gray-600 mt-6 text-lg">
            StayPG helps students and professionals find affordable and safe PGs.
          </p>
          <button className="mt-8 bg-black text-white px-8 py-3 rounded-lg">
            Explore PGs
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h3 className="text-xl font-semibold mb-4">Why StayPG?</h3>
          <ul className="space-y-3 text-gray-600">
            <li>✔ Verified PG Listings</li>
            <li>✔ Affordable Pricing</li>
            <li>✔ Direct Owner Contact</li>
            <li>✔ Secure Platform</li>
          </ul>
        </div>
      </div>

      {/* PREMIUM HIGHLIGHT SECTION */}
      <div className="max-w-6xl mx-auto mt-32 px-6">
        <h2 className="text-4xl font-bold text-center mb-14">
          Why Students Trust StayPG
        </h2>

        <div className="grid md:grid-cols-3 gap-10">

          {/* SAFETY */}
          <div className="bg-white rounded-3xl shadow-xl p-8 float-card hover:scale-105 transition">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold mb-3">Your Safety</h3>
            <p className="text-gray-600">
              Verified PG owners and secure listings ensure your safety and peace of mind.
            </p>
          </div>

          {/* PRIORITY */}
          <div className="bg-white rounded-3xl shadow-xl p-8 float-card hover:scale-105 transition delay-150">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold mb-3">Priority PG</h3>
            <p className="text-gray-600">
              Get access to priority PGs that match your needs and budget.
            </p>
          </div>

          {/* HOME FEEL */}
          <div className="bg-white rounded-3xl shadow-xl p-8 float-card hover:scale-105 transition delay-300">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold mb-3">Feels Like Home</h3>
            <p className="text-gray-600">
              Comfortable living spaces that feel warm, safe, and welcoming.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}