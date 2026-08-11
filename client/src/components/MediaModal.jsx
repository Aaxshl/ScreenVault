import { useState, useEffect, useCallback } from "react";
import { getMovieDetail, getTVDetail, IMG_BACKDROP, IMG_BASE } from "../api/index.js";
import StarRating from "./ui/StarRating";
import MediaCard from "./MediaCard";
import EpisodeTrackerPanel from "./EpisodeTrackerPanel";

export default function MediaModal({
  id,
  mediaType,
  onClose,
  libraryItem,
  isLibraryTab,
  onUpdateStatus,
  onUpdateRating,
  onUpdateNotes,
  onEditCustom,
  onDeleteCustom,
  collections = [],
  onToggleItemInCollection,
  onSelect,
  getStatus,
  getShowData,
  toggleEpisodeWatched,
  setEpisodeNote,
}) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showProviders, setShowProviders] = useState(false);

  // Local state for notes & rating inside modal
  const [userRating, setUserRating] = useState(8);
  const [userNotes, setUserNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  const handleClose = useCallback(() => {
    setShowTrailer(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const isCustom = String(id).startsWith("custom_") || libraryItem?.isCustom;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setItem(null);
    setShowTrailer(false);
    setShowProviders(false);
    setNotesSaved(false);

    if (libraryItem) {
      setUserRating(libraryItem.userRating || 8);
      setUserNotes(libraryItem.userNotes || "");
    }

    if (isCustom && libraryItem) {
      setItem(libraryItem);
      setLoading(false);
      return;
    }

    const fetcher = mediaType === "movie" ? getMovieDetail : getTVDetail;
    fetcher(id)
      .then((data) => {
        setItem(data);
        if (libraryItem) {
          setUserRating(libraryItem.userRating || data.vote_average || 8);
          setUserNotes(libraryItem.userNotes || "");
        }
      })
      .catch((err) => {
        console.error("[MediaModal] Fetch error:", err);
        if (libraryItem) setItem(libraryItem);
      })
      .finally(() => setLoading(false));
  }, [id, mediaType, libraryItem, isCustom]);

  if (!id) return null;

  let backdrop = item?.backdrop_path
    ? item.backdrop_path.startsWith("http")
      ? item.backdrop_path
      : `${IMG_BACKDROP}${item.backdrop_path}`
    : null;

  if (!backdrop && item?.posterUrl) backdrop = item.posterUrl;
  if (!backdrop && item?.poster_path && item.poster_path.startsWith("http")) backdrop = item.poster_path;
  if (!backdrop && item?.poster_path) backdrop = `${IMG_BASE}${item.poster_path}`;

  const title = item?.title || item?.name || "Untitled";
  const currentStatus = libraryItem?.status || item?.status || null;

  // Can rate & note ONLY if status is watching or finished
  const canRateAndNote = currentStatus === "watching" || currentStatus === "finished";

  const handleStatusChange = (status) => {
    if (!item) return;
    onUpdateStatus(
      {
        id: item.id,
        isCustom: item.isCustom || isCustom,
        title: item.title || item.name,
        name: item.title || item.name,
        mediaType: item.mediaType || mediaType,
        release_date: item.release_date || item.first_air_date || "",
        first_air_date: item.first_air_date || item.release_date || "",
        poster_path: item.poster_path || item.posterUrl || null,
        posterUrl: item.posterUrl || item.poster_path || null,
        overview: item.overview || "",
        vote_average: item.vote_average || 0,
        userRating,
        userNotes,
      },
      status
    );
  };

  const handleSaveNotes = () => {
    if (!canRateAndNote) return;
    onUpdateNotes(id, userNotes);
    onUpdateRating(id, userRating);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const providers = item?.watch_providers;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d1120",
          borderRadius: 18,
          maxWidth: 840,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
          border: "1px solid var(--border)",
          position: "relative",
        }}
      >
        {/* ✕ Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "sticky",
            top: 12,
            float: "right",
            marginRight: 12,
            zIndex: 10,
            background: "rgba(0,0,0,0.7)",
            border: "1px solid #333",
            borderRadius: "50%",
            width: 36,
            height: 36,
            color: "#ccc",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e50914";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.7)";
            e.currentTarget.style.color = "#ccc";
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {loading ? (
          <div style={{ padding: 80, textAlign: "center", color: "var(--text-dim)" }}>
            Loading details...
          </div>
        ) : !item ? (
          <div style={{ padding: 80, textAlign: "center", color: "var(--text-dim)" }}>
            Failed to load details.
          </div>
        ) : (
          <>
            {/* Trailer or Backdrop Header */}
            <div style={{ borderRadius: "18px 18px 0 0", overflow: "hidden" }}>
              {showTrailer && item.trailer ? (
                <div style={{ aspectRatio: "16/9" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${item.trailer.key}?autoplay=1`}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Trailer"
                  />
                </div>
              ) : backdrop ? (
                <div
                  style={{
                    height: 280,
                    backgroundImage: `url(${backdrop})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center 30%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 20%, #0d1120)",
                    }}
                  />
                  {item.trailer && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      style={{
                        position: "absolute",
                        bottom: 20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(229,9,20,0.92)",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 22px",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        transition: "background 0.2s, transform 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ff1a1a";
                        e.currentTarget.style.transform = "translateX(-50%) scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(229,9,20,0.92)";
                        e.currentTarget.style.transform = "translateX(-50%) scale(1)";
                      }}
                    >
                      ▶ Watch Trailer
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <div style={{ padding: "22px 26px 30px" }}>
              {/* Title & Meta */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontFamily: "var(--font-head)", fontSize: 34, letterSpacing: 0.5, lineHeight: 1.1 }}>
                    {title}
                  </h2>
                  {isCustom && (
                    <span
                      style={{
                        background: "var(--red)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      Custom Title
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
                  {(item.release_date || item.first_air_date)?.split("-")[0]}
                  {item.runtime ? ` • ${item.runtime} min` : ""}
                  {item.number_of_seasons ? ` • ${item.number_of_seasons} season${item.number_of_seasons > 1 ? "s" : ""}` : ""}
                  {item.genres?.length ? ` • ${item.genres.map((g) => g.name).join(", ")}` : ""}
                </div>
              </div>

              {/* 🎯 Watch Status Controls & Collections Assignment */}
              <div
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}
                >
                  Watch Status
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                  {[
                    { key: "to_watch", label: "🎯 To Watch", color: "#38bdf8" },
                    { key: "watching", label: "📺 Watching", color: "#facc15" },
                    { key: "finished", label: "✅ Finished", color: "#4ade80" },
                  ].map((s) => {
                    const active = currentStatus === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => handleStatusChange(active ? null : s.key)}
                        style={{
                          background: active ? s.color : "rgba(255,255,255,0.04)",
                          color: active ? "#000" : "var(--text-muted)",
                          border: `1px solid ${active ? s.color : "var(--border)"}`,
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: 13,
                          fontWeight: active ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {s.label} {active ? "✓" : ""}
                      </button>
                    );
                  })}

                  {currentStatus && (
                    <button
                      onClick={() => handleStatusChange(null)}
                      style={{
                        background: "transparent",
                        color: "var(--text-dim)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--red)";
                        e.currentTarget.style.color = "#ff7b7b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-dim)";
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* 📁 Playlist / Collection Selector Badges */}
                {collections.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 8,
                      }}
                    >
                      Add to Playlists:
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {collections.map((col) => {
                        const inCol = col.itemIds.map(String).includes(String(id));
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => onToggleItemInCollection(col.id, id)}
                            style={{
                              background: inCol ? "rgba(229, 9, 20, 0.25)" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${inCol ? "var(--red)" : "var(--border)"}`,
                              color: inCol ? "#fff" : "var(--text-muted)",
                              borderRadius: 20,
                              padding: "4px 12px",
                              fontSize: 12,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            {col.emoji} {col.name} {inCol ? "✓" : "+"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isCustom && (
                  <div style={{ display: "flex", gap: 10, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={() => onEditCustom(item)}
                      style={{
                        background: "#1e2535",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "6px 14px",
                        color: "#fff",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit Custom Entry
                    </button>
                    <button
                      onClick={() => {
                        onDeleteCustom(id);
                        handleClose();
                      }}
                      style={{
                        background: "rgba(229, 9, 20, 0.15)",
                        border: "1px solid var(--red)",
                        borderRadius: 6,
                        padding: "6px 14px",
                        color: "#ff7b7b",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Delete Title
                    </button>
                  </div>
                )}
              </div>

              {/* 🌟 Personal Ratings & Notes Section — ONLY shown if in My Library Page or isCustom */}
              {(isLibraryTab || isCustom) && (
                <div
                  style={{
                    background: canRateAndNote ? "var(--bg-input)" : "rgba(15, 20, 30, 0.5)",
                    border: `1px solid ${canRateAndNote ? "var(--border)" : "#1a2233"}`,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 20,
                    opacity: canRateAndNote ? 1 : 0.75,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Your Personal Rating & Notes
                    </div>
                    <span style={{ color: canRateAndNote ? "#f5c518" : "var(--text-dim)", fontWeight: 700, fontSize: 14 }}>
                      {userRating && canRateAndNote ? `${userRating} / 10 ★` : "Locked"}
                    </span>
                  </div>

                  {!canRateAndNote ? (
                    <div
                      style={{
                        background: "rgba(30, 40, 60, 0.6)",
                        borderRadius: 8,
                        padding: "12px 14px",
                        color: "#94a3b8",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>🔒</span>
                      <span>
                        Set watch status to <strong>"Currently Watching"</strong> or <strong>"Finished Watching"</strong> to unlock ratings & personal comments.
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Rating Slider */}
                      <div style={{ marginBottom: 12 }}>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={userRating}
                          onChange={(e) => setUserRating(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "var(--red)", cursor: "pointer" }}
                        />
                      </div>

                      {/* Notes Textarea */}
                      <textarea
                        rows={3}
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        placeholder="Add your review, thoughts, favorite episodes or scenes..."
                        style={{
                          width: "100%",
                          background: "#0a0e18",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "10px 12px",
                          color: "var(--text)",
                          fontSize: 13,
                          outline: "none",
                          fontFamily: "var(--font-body)",
                          resize: "vertical",
                          marginBottom: 10,
                        }}
                      />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#86efac", fontSize: 13 }}>
                          {notesSaved ? "✓ Notes & rating saved!" : ""}
                        </span>
                        <button
                          onClick={handleSaveNotes}
                          style={{
                            background: "var(--red)",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 18px",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                        >
                          Save Notes & Rating
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Overview */}
              <div style={{ marginBottom: 20 }}>
                <StarRating rating={item.vote_average} size={15} />
                <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.75, marginTop: 10 }}>
                  {item.overview || "No description available."}
                </p>
              </div>

              {/* Cast */}
              {item.cast?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
                    Cast
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {item.cast.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          background: "#1a2035",
                          borderRadius: 8,
                          padding: "5px 12px",
                          fontSize: 13,
                          color: "#ddd",
                        }}
                      >
                        {p.name}
                        {p.character && <span style={{ color: "var(--text-dim)", marginLeft: 4 }}>as {p.character}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🍿 Collapsible Where to Watch (positioned right below Cast) */}
              {providers && (providers.flatrate?.length > 0 || providers.rent?.length > 0 || providers.buy?.length > 0) && (
                <div
                  style={{
                    marginTop: 20,
                    background: "rgba(18, 26, 43, 0.7)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                >
                  <button
                    onClick={() => setShowProviders((prev) => !prev)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "var(--text)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>🍿 Where to Watch</span>
                      {providers.flatrate?.length > 0 && (
                        <span style={{ fontSize: 11, background: "rgba(34, 197, 94, 0.15)", color: "#86efac", padding: "2px 8px", borderRadius: 10 }}>
                          {providers.flatrate.length} streaming
                        </span>
                      )}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {showProviders ? "▲ Hide" : "▼ Expand"}
                    </span>
                  </button>

                  {showProviders && (
                    <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
                      {providers.flatrate?.length > 0 && (
                        <div>
                          <span style={{ fontSize: 12, color: "#86efac", fontWeight: 500, marginRight: 8 }}>Stream:</span>
                          <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 8, verticalAlign: "middle" }}>
                            {providers.flatrate.map((p) => (
                              <img key={p.id} src={p.logo} alt={p.name} title={p.name} style={{ width: 30, height: 30, borderRadius: 6 }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {providers.rent?.length > 0 && (
                        <div>
                          <span style={{ fontSize: 12, color: "#7dd3fc", fontWeight: 500, marginRight: 8 }}>Rent:</span>
                          <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 8, verticalAlign: "middle" }}>
                            {providers.rent.slice(0, 6).map((p) => (
                              <img key={p.id} src={p.logo} alt={p.name} title={p.name} style={{ width: 30, height: 30, borderRadius: 6 }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {providers.buy?.length > 0 && (
                        <div>
                          <span style={{ fontSize: 12, color: "#fef08a", fontWeight: 500, marginRight: 8 }}>Buy:</span>
                          <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 8, verticalAlign: "middle" }}>
                            {providers.buy.slice(0, 6).map((p) => (
                              <img key={p.id} src={p.logo} alt={p.name} title={p.name} style={{ width: 30, height: 30, borderRadius: 6 }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 📺 Episode Tracker — for TV shows when watching or finished */}
              {(item.mediaType === "tv" || (!item.title && item.name) || item.number_of_seasons) &&
                canRateAndNote && getShowData && (
                  <EpisodeTrackerPanel
                    item={item}
                    showId={id}
                    getShowData={getShowData}
                    toggleEpisodeWatched={toggleEpisodeWatched}
                    setEpisodeNote={setEpisodeNote}
                  />
                )}

              {/* Similar titles */}
              {item.similar?.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  <div style={{ color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>
                    More Like This
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
                    {item.similar.map((s) => (
                      <MediaCard
                        key={s.id}
                        item={s}
                        onSelect={onSelect}
                        libraryStatus={getStatus ? getStatus(s.id) : null}
                        onUpdateStatus={onUpdateStatus}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}