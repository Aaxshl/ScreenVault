import MediaGrid from "../components/MediaGrid";

export default function Favorites({ favorites, onSelect, isFav, onToggleFav }) {
  return (
    <main style={{
      padding: "28px 24px",
      flex: 1,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", gap: 10 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, letterSpacing: 0.5 }}>
          Saved Titles
        </h1>
        {favorites.length > 0 && (
          <span style={{ color: "var(--text-dim)", fontSize: 13 }}>{favorites.length} titles</span>
        )}
      </div>

      <div style={{
        flex: 1,
        display: "flex", alignItems: favorites.length === 0 ? "center" : "flex-start",
        justifyContent: favorites.length === 0 ? "center" : "flex-start",
      }}>
        <MediaGrid
          items={favorites}
          onSelect={onSelect}
          isFav={isFav}
          onToggleFav={onToggleFav}
          isFavoritesTab={true}
        />
      </div>
    </main>
  );
}