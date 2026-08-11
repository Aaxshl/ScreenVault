export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      zIndex: 999, display: "flex", flexDirection: "column", gap: 10,
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          style={{
            background: t.type === "info" ? "#1a2035" : "#1a2d1a",
            border: `1px solid ${t.type === "info" ? "#2a3a5a" : "#2a5a2a"}`,
            color: t.type === "info" ? "#7aadff" : "#7eff9a",
            borderRadius: 10, padding: "12px 18px",
            fontSize: 14, cursor: "pointer",
            maxWidth: 320, lineHeight: 1.4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            animation: "slideIn 0.25s ease",
            fontFamily: "var(--font-body)",
          }}
        >
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
