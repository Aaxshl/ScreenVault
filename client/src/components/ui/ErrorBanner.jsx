export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: "#2a0a0a", border: "1px solid #5a1a1a",
      borderRadius: 10, padding: "14px 20px",
      color: "#ff7b7b", marginBottom: 24, fontSize: 14,
    }}>
      ⚠️ {message}
    </div>
  );
}
