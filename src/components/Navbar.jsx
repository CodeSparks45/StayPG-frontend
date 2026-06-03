export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-blue-600">StayPG</h1>
      <div className="space-x-4">
        <button className="px-4 py-2 rounded bg-blue-600 text-white">
          Login
        </button>
        <button className="px-4 py-2 rounded border border-blue-600 text-blue-600">
          Add PG
        </button>
      </div>
    </nav>
  );
}