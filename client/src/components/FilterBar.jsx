import { MOVIE_GENRES, TV_GENRES, YEARS, SORT_OPTIONS, RATING_OPTIONS } from "../constants/index.js";

const selectStyle = {
  background: "var(--bg-input)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "7px 12px", color: "var(--text)",
  fontSize: 13, outline: "none", cursor: "pointer",
  fontFamily: "var(--font-body)", transition: "border-color 0.2s",
};

export default function FilterBar({ mediaType, filters, onUpdate, onReset, onMediaTypeChange }) {
  const genres = mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;
  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v !== "" && (k !== "sort_by" || v !== "popularity.desc")
  );

  return (
    <div style={{
      position: "sticky", top: 64, zIndex: 40,
      background: "rgba(8,12,20,0.97)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
    }}>

      {/* Row 1: Movies/TV toggle (sticky) + Genre chips (scrollable) */}
      <div style={{
        padding: "10px 24px 8px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {/* Toggle — sticky left, never scrolls */}
        <div style={{
          display: "flex", flexShrink: 0,
          background: "var(--bg-input)",
          border: "1px solid var(--border)",
          borderRadius: 10, padding: 3, gap: 2,
        }}>
          {[{ key: "movie", label: "Movies" }, { key: "tv", label: "TV" }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onMediaTypeChange(key)}
              style={{
                background: mediaType === key ? "#fff" : "transparent",
                color: mediaType === key ? "#000" : "var(--text-muted)",
                border: "none", borderRadius: 7,
                padding: "4px 14px", fontSize: 13, fontWeight: 500,
                cursor: "pointer", whiteSpace: "nowrap",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { if (mediaType !== key) e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { if (mediaType !== key) e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "var(--border)", flexShrink: 0 }} />

        {/* Genre chips — scrollable */}
        <div style={{
          display: "flex", gap: 7,
          overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none",
          paddingBottom: 2,
        }}>
          <style>{`.genre-chips::-webkit-scrollbar { display: none; }`}</style>
          {genres.map((g) => {
            const active = filters.genre === String(g.id);
            return (
              <button
                key={g.id}
                onClick={() => onUpdate("genre", active ? "" : String(g.id))}
                style={{
                  background: active ? "var(--red)" : "var(--bg-input)",
                  border: `1px solid ${active ? "var(--red)" : "var(--border)"}`,
                  borderRadius: 20, padding: "5px 14px",
                  color: active ? "#fff" : "var(--text-muted)",
                  fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  transition: "background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  if (!active) { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  if (!active) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }
                }}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Advanced filters + Reset on the same row */}
      <div style={{
        padding: "0 24px 10px",
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <select value={filters.year} onChange={(e) => onUpdate("year", e.target.value)} style={selectStyle}
          onFocus={(e) => e.target.style.borderColor = "#555"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}>
          <option value="">All Years</option>
          {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
        </select>

        <select value={filters.min_rating} onChange={(e) => onUpdate("min_rating", e.target.value)} style={selectStyle}
          onFocus={(e) => e.target.style.borderColor = "#555"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}>
          {RATING_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        <select value={filters.sort_by} onChange={(e) => onUpdate("sort_by", e.target.value)} style={selectStyle}
          onFocus={(e) => e.target.style.borderColor = "#555"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}>
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 8, padding: "7px 12px",
              color: "var(--text-muted)", fontSize: 13, cursor: "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.background = "rgba(229,9,20,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
          >
            Reset
          </button>
        )}
      </div>

    </div>
  );
}