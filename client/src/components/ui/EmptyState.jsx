export default function EmptyState({ isFavorites, hasFilters, onOpenAddCustom }) {
  const emoji = isFavorites ? "📚" : hasFilters ? "🔍" : "🍿";
  const message = isFavorites
    ? "No titles in your library for this filter. Start adding titles from search or create a custom one!"
    : hasFilters
    ? "No results match your filters. Try adjusting them or add a custom title."
    : "Nothing found. Try a different search or add a custom title!";

  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{emoji}</div>
      <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 20 }}>{message}</p>
      {onOpenAddCustom && (
        <button
          onClick={onOpenAddCustom}
          style={{
            background: "var(--red)",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(229,9,20,0.4)",
          }}
        >
          ➕ Add Custom Movie/Show
        </button>
      )}
    </div>
  );
}
