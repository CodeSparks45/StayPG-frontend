export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <input className="w-full p-2 mb-3 border" placeholder="Name" />
        <input className="w-full p-2 mb-3 border" placeholder="Email" />
        <input
          className="w-full p-2 mb-3 border"
          placeholder="Password"
          type="password"
        />
        <button className="w-full bg-black text-white py-2 rounded">
          Register
        </button>
      </div>
    </div>
  );
}