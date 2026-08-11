function SkeletonCard() {
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: "var(--radius)",
      overflow: "hidden",
    }}>
      <div style={{
        width: "100%", aspectRatio: "2/3",
        background: "linear-gradient(90deg, #1a2035 25%, #1e2840 50%, #1a2035 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }} />
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 16, borderRadius: 4, background: "#1e2535", animation: "shimmer 1.4s infinite" }} />
        <div style={{ height: 12, width: "60%", borderRadius: 4, background: "#1e2535", animation: "shimmer 1.4s infinite" }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default function SkeletonGrid({ count = 12 }) {
  return (
    <div className="media-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
