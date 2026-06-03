export default function PgCard({ name, city, price }) {
  return (
    <div style={{
      width: 260,
      borderRadius: 10,
      padding: 15,
      margin: 15,
      boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    }}>
      <h3>{name}</h3>
      <p>📍 {city}</p>
      <p>💰 ₹{price}/month</p>
      <button style={{
        marginTop: 10,
        padding: 8,
        width: "100%",
        background: "#000",
        color: "#fff",
        border: "none"
      }}>
        View Details
      </button>
    </div>
  );
}