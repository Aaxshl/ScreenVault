import { IMG_BASE } from "../api/index.js";
import StarRating from "./ui/StarRating";

export default function MediaCard({ item, onSelect, libraryStatus, onUpdateStatus }) {
  const title = item.title || item.name || "Untitled";
  const year = (item.release_date || item.first_air_date)?.split("-")[0];

  let poster = "https://placehold.co/300x450/161b27/555?text=" + encodeURIComponent(title);
  if (item.posterUrl) {
    poster = item.posterUrl;
  } else if (item.poster_path) {
    poster = item.poster_path.startsWith("http") ? item.poster_path : `${IMG_BASE}${item.poster_path}`;
  }

  const currentStatus = libraryStatus || item.status || null;

  const statusBadges = {
    to_watch: { label: "To Watch", bg: "rgba(14, 116, 144, 0.9)", color: "#7dd3fc" },
    watching: { label: "Watching", bg: "rgba(161, 98, 7, 0.9)", color: "#fef08a" },
    finished: { label: "Finished", bg: "rgba(21, 128, 61, 0.9)", color: "#86efac" },
  };

  const statusInfo = currentStatus ? statusBadges[currentStatus] : null;

  const handleQuickCycle = (e) => {
    e.stopPropagation();
    if (!currentStatus) onUpdateStatus(item, "to_watch");
    else if (currentStatus === "to_watch") onUpdateStatus(item, "watching");
    else if (currentStatus === "watching") onUpdateStatus(item, "finished");
    else onUpdateStatus(item, null);
  };

  return (
    <div
      onClick={() => onSelect(item.id)}
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        transition: "transform var(--transition), box-shadow var(--transition)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(229,9,20,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
      }}
    >
      {/* Top Status Tag */}
      {statusInfo && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            background: statusInfo.bg,
            color: statusInfo.color,
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 6,
            backdropFilter: "blur(4px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {statusInfo.label}
        </div>
      )}

      {/* Custom Entry Tag */}
      {item.isCustom && (
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 8,
            zIndex: 2,
            background: "rgba(229, 9, 20, 0.85)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 4,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Custom
        </div>
      )}

      {/* Bookmark / Quick Action button */}
      <button
        aria-label="Toggle status"
        onClick={handleQuickCycle}
        title={currentStatus ? `Status: ${currentStatus}. Click to cycle` : "Add to watch list"}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2,
          background: currentStatus ? "var(--red)" : "rgba(0,0,0,0.65)",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          fontSize: 14,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background var(--transition), transform 0.15s",
          backdropFilter: "blur(4px)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {currentStatus === "finished" ? "✓" : currentStatus ? "★" : "+"}
      </button>

      {/* Poster */}
      <img
        src={poster}
        alt={title}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/300x450/161b27/888?text=" + encodeURIComponent(title);
        }}
        style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover" }}
      />

      <div style={{ padding: "10px 12px 12px", marginTop: "auto" }}>
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 16,
            color: "var(--text)",
            marginBottom: 4,
            letterSpacing: 0.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {item.userRating ? (
            <span style={{ color: "#f5c518", fontSize: 13, fontWeight: 600 }}>
              {item.userRating} ★ <span style={{ color: "var(--text-dim)", fontSize: 10 }}>(Mine)</span>
            </span>
          ) : (
            <StarRating rating={item.vote_average} />
          )}
          <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{year}</span>
        </div>
      </div>
    </div>
  );
}
