import { IMG_BASE } from "../api/index.js";
import { EVENT_TYPES } from "../hooks/useActivityLog.js";

function relativeTime(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityLog({ activityLog = [], onClear }) {
  if (activityLog.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, marginBottom: 8, color: "var(--text)" }}>
          No Activity Yet
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          Your watch history will appear here as you add titles,<br />change statuses, and save ratings.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, letterSpacing: 0.5 }}>📋 Activity Log</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
            {activityLog.length} event{activityLog.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 14px",
            color: "#f87171",
            fontSize: 12,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.1)";
            e.currentTarget.style.borderColor = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          🗑️ Clear History
        </button>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 0,
            bottom: 0,
            width: 2,
            background: "var(--border)",
            borderRadius: 2,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {activityLog.map((event, idx) => {
            const evType = EVENT_TYPES[event.type] || EVENT_TYPES.status_changed;
            let poster = null;
            if (event.poster_path) {
              poster = event.poster_path.startsWith("http")
                ? event.poster_path
                : `${IMG_BASE}${event.poster_path}`;
            }

            return (
              <div
                key={event.id || idx}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  padding: "10px 0 10px 52px",
                  position: "relative",
                }}
              >
                {/* Event dot/icon */}
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 12,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: `${evType.color}22`,
                    border: `2px solid ${evType.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    zIndex: 1,
                  }}
                >
                  {evType.icon}
                </div>

                {/* Poster thumbnail */}
                {poster && (
                  <img
                    src={poster}
                    alt={event.title}
                    style={{
                      width: 36,
                      height: 54,
                      objectFit: "cover",
                      borderRadius: 6,
                      flexShrink: 0,
                      border: "1px solid var(--border)",
                    }}
                  />
                )}

                {/* Event content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: evType.color,
                        }}
                      >
                        {evType.label}
                      </span>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#fff",
                          marginTop: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 360,
                        }}
                      >
                        {event.title}
                      </div>
                      {event.rating && (
                        <div style={{ fontSize: 12, color: "#f5c518", marginTop: 2 }}>
                          ★ {event.rating} / 10
                        </div>
                      )}
                    </div>
                    <span style={{ color: "var(--text-dim)", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {relativeTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
