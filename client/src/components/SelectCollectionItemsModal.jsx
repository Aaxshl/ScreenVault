import { useState, useMemo } from "react";
import { IMG_BASE } from "../api/index.js";

export default function SelectCollectionItemsModal({
  isOpen,
  onClose,
  collection,
  library,
  onToggleItemInCollection,
}) {
  const [statusTab, setStatusTab] = useState("all");
  const [query, setQuery] = useState("");

  const filteredLibrary = useMemo(() => {
    if (!library) return [];
    return library.filter((item) => {
      const matchStatus = statusTab === "all" || item.status === statusTab;
      const title = (item.title || item.name || "").toLowerCase();
      const matchQuery = !query.trim() || title.includes(query.toLowerCase().trim());
      return matchStatus && matchQuery;
    });
  }, [library, statusTab, query]);

  if (!isOpen || !collection) return null;

  const collectionItemIds = collection.itemIds ? collection.itemIds.map(String) : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 260,
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
          maxWidth: 620,
          width: "100%",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: 24, letterSpacing: 0.5 }}>
              {collection.emoji} Add Titles to "{collection.name}"
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
              Choose from your saved library (To Watch, Watching, Finished)
            </p>
          </div>
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

        {/* Controls: Search + Filter Tabs */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12, background: "var(--bg-input)" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved titles..."
            style={{
              width: "100%",
              background: "#080c14",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "8px 14px",
              color: "var(--text)",
              fontSize: 13,
              outline: "none",
            }}
          />

          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {[
              { key: "all", label: "All Saved" },
              { key: "to_watch", label: "🎯 To Watch" },
              { key: "watching", label: "📺 Watching" },
              { key: "finished", label: "✅ Finished" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                style={{
                  background: statusTab === tab.key ? "var(--red)" : "transparent",
                  border: `1px solid ${statusTab === tab.key ? "var(--red)" : "var(--border)"}`,
                  borderRadius: 16,
                  padding: "4px 12px",
                  color: statusTab === tab.key ? "#fff" : "var(--text-muted)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Titles */}
        <div style={{ padding: "16px 24px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredLibrary.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              No titles match your filter.
            </div>
          ) : (
            filteredLibrary.map((item) => {
              const inCollection = collectionItemIds.includes(String(item.id));
              const title = item.title || item.name || "Untitled";
              const year = (item.release_date || item.first_air_date)?.split("-")[0];

              let poster = "https://placehold.co/100x150/161b27/555?text=" + encodeURIComponent(title);
              if (item.posterUrl) {
                poster = item.posterUrl;
              } else if (item.poster_path) {
                poster = item.poster_path.startsWith("http") ? item.poster_path : `${IMG_BASE}${item.poster_path}`;
              }

              const statusLabels = {
                to_watch: { label: "To Watch", bg: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" },
                watching: { label: "Watching", bg: "rgba(250, 204, 21, 0.15)", color: "#facc15" },
                finished: { label: "Finished", bg: "rgba(74, 222, 128, 0.15)", color: "#4ade80" },
              };
              const sInfo = item.status ? statusLabels[item.status] : null;

              return (
                <div
                  key={item.id}
                  style={{
                    background: "var(--bg-card)",
                    border: `1px solid ${inCollection ? "rgba(229, 9, 20, 0.5)" : "var(--border)"}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "border-color 0.2s",
                  }}
                >
                  <img
                    src={poster}
                    alt={title}
                    style={{ width: 40, height: 60, borderRadius: 6, objectFit: "cover" }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      {year && <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{year}</span>}
                      {sInfo && (
                        <span style={{ background: sInfo.bg, color: sInfo.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6 }}>
                          {sInfo.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleItemInCollection(collection.id, item.id)}
                    style={{
                      background: inCollection ? "var(--red)" : "transparent",
                      border: `1px solid ${inCollection ? "var(--red)" : "var(--border)"}`,
                      color: inCollection ? "#fff" : "var(--text-muted)",
                      borderRadius: 8,
                      padding: "7px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                    }}
                  >
                    {inCollection ? "✓ In Collection" : "+ Add"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "var(--red)",
              border: "none",
              borderRadius: 8,
              padding: "9px 24px",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
