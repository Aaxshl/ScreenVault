import { useState, useEffect } from "react";

export default function AddCustomModal({ isOpen, onClose, onSave, initialData = null }) {
  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState("movie");
  const [year, setYear] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [overview, setOverview] = useState("");
  const [status, setStatus] = useState("finished");
  const [userRating, setUserRating] = useState(8);
  const [userNotes, setUserNotes] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || initialData.name || "");
      setMediaType(initialData.mediaType || "movie");
      const releaseYear = (initialData.release_date || initialData.first_air_date)?.split("-")[0] || "";
      setYear(releaseYear);
      setPosterUrl(initialData.posterUrl || initialData.poster_path || "");
      setOverview(initialData.overview || "");
      setStatus(initialData.status || "finished");
      setUserRating(initialData.userRating || initialData.vote_average || 8);
      setUserNotes(initialData.userNotes || "");
    } else {
      setTitle("");
      setMediaType("movie");
      setYear(new Date().getFullYear().toString());
      setPosterUrl("");
      setOverview("");
      setStatus("finished");
      setUserRating(8);
      setUserNotes("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      mediaType,
      year: year.trim(),
      posterUrl: posterUrl.trim(),
      overview: overview.trim(),
      status,
      userRating: Number(userRating),
      userNotes: userNotes.trim(),
    });
    onClose();
  };

  const inputStyle = {
    width: "100%",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "var(--font-body)",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 250,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d1120",
          borderRadius: 18,
          maxWidth: 540,
          width: "100%",
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
          border: "1px solid var(--border)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 26, letterSpacing: 0.5 }}>
            {initialData ? "✏️ Edit Custom Title" : "➕ Add Custom Movie/Show"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Favorite Indie Film"
              style={inputStyle}
            />
          </div>

          {/* Type + Year */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Media Type</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                style={inputStyle}
              >
                <option value="movie">Movie 🎬</option>
                <option value="tv">TV Series 📺</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Release Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Poster Image URL */}
          <div>
            <label style={labelStyle}>Poster Image URL (Optional)</label>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://example.com/poster.jpg"
              style={inputStyle}
            />
          </div>

          {/* Watch Status */}
          <div>
            <label style={labelStyle}>Watch Status</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { id: "to_watch", label: "🎯 To Watch" },
                { id: "watching", label: "📺 Watching" },
                { id: "finished", label: "✅ Finished" },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  style={{
                    background: status === s.id ? "var(--red)" : "var(--bg-input)",
                    border: `1px solid ${status === s.id ? "var(--red)" : "var(--border)"}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: status === s.id ? "#fff" : "var(--text-muted)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Rating */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={labelStyle}>Your Rating (1-10)</label>
              <span style={{ color: "#f5c518", fontWeight: 600, fontSize: 14 }}>
                {userRating} / 10 ★
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={userRating}
              onChange={(e) => setUserRating(e.target.value)}
              style={{ width: "100%", accentColor: "var(--red)", cursor: "pointer" }}
            />
          </div>

          {/* Overview */}
          <div>
            <label style={labelStyle}>Overview / Synopsis</label>
            <textarea
              rows={3}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Brief description of the movie/show..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Personal Notes */}
          <div>
            <label style={labelStyle}>Personal Notes / Comments</label>
            <textarea
              rows={2}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Your thoughts, review, where you watched it..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "9px 18px",
                color: "var(--text-muted)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: "var(--red)",
                border: "none",
                borderRadius: 8,
                padding: "9px 24px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(229,9,20,0.4)",
              }}
            >
              {initialData ? "Save Changes" : "Add to Library"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
