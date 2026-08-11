export default function StarRating({ rating, size = 13 }) {
  const stars = Math.round((rating / 10) * 5);
  return (
    <span style={{ color: "#f5c518", letterSpacing: 1, fontSize: size }}>
      {"★".repeat(Math.max(0, stars))}
      {"☆".repeat(Math.max(0, 5 - stars))}
      <span style={{ color: "var(--text-muted)", fontSize: size - 1, marginLeft: 5 }}>
        {rating?.toFixed(1)}
      </span>
    </span>
  );
}
