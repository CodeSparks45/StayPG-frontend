export default function AddPG() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-6">Add PG</h2>
        <input className="w-full p-2 mb-3 border" placeholder="PG Name" />
        <input className="w-full p-2 mb-3 border" placeholder="City" />
        <input className="w-full p-2 mb-3 border" placeholder="Rent" />
        <button className="w-full bg-black text-white py-2 rounded">
          Add PG
        </button>
      </div>
    </div>
  );
}