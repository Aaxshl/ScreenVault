import { useState } from "react";

export default function EpisodeTrackerPanel({
  item,
  showId,
  getShowData,
  toggleEpisodeWatched,
  setEpisodeNote,
}) {
  const [openSeason, setOpenSeason] = useState(1);
  const [expandedEpNote, setExpandedEpNote] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!item) return null;

  const seasons = item.seasons?.filter(
    (s) => s.season_number > 0 && s.episode_count > 0
  ) || [];

  if (seasons.length === 0) {
    // Fallback: generate from number_of_seasons / number_of_episodes
    const numSeasons = item.number_of_seasons || 1;
    const epPerSeason = item.number_of_episodes
      ? Math.ceil(item.number_of_episodes / numSeasons)
      : 10;
    for (let s = 1; s <= numSeasons; s++) {
      seasons.push({ season_number: s, name: `Season ${s}`, episode_count: epPerSeason });
    }
  }

  const showData = getShowData(showId);
  const totalEpisodes = seasons.reduce((acc, s) => acc + s.episode_count, 0);
  const watchedCount = Object.values(showData.watched || {}).filter(Boolean).length;
  const progressPct = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

  return (
    <div
      style={{
        background: "rgba(14, 20, 36, 0.8)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        marginTop: 20,
      }}
    >
      {/* Panel Header */}
      <button
        onClick={() => setIsCollapsed((c) => !c)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
            📺 Episode Tracker
          </span>
          <span
            style={{
              fontSize: 12,
              background: "rgba(74,222,128,0.15)",
              color: "#4ade80",
              padding: "2px 10px",
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            {watchedCount} / {totalEpisodes} watched
          </span>
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
          {isCollapsed ? "▼ Expand" : "▲ Collapse"}
        </span>
      </button>

      {/* Progress Bar */}
      {!isCollapsed && (
        <div style={{ padding: "0 18px 14px" }}>
          <div style={{ width: "100%", height: 6, background: "var(--bg-input)", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: "linear-gradient(90deg, #4ade80, #22c55e)",
                borderRadius: 4,
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {/* Season Accordions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {seasons.map((season) => {
              const isOpen = openSeason === season.season_number;
              const seasonWatched = Array.from({ length: season.episode_count }, (_, i) => i + 1).filter(
                (ep) => showData.watched?.[`${season.season_number}_${ep}`]
              ).length;

              return (
                <div
                  key={season.season_number}
                  style={{
                    background: "var(--bg-input)",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Season Header */}
                  <button
                    onClick={() => setOpenSeason(isOpen ? null : season.season_number)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {season.name || `Season ${season.season_number}`}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {seasonWatched}/{season.episode_count} eps
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {/* Episode List */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {Array.from({ length: season.episode_count }, (_, i) => i + 1).map((epNum) => {
                        const key = `${season.season_number}_${epNum}`;
                        const watched = !!showData.watched?.[key];
                        const note = showData.notes?.[key] || "";
                        const noteOpen = expandedEpNote === key;

                        return (
                          <div
                            key={epNum}
                            style={{
                              borderBottom: epNum < season.episode_count ? "1px solid rgba(255,255,255,0.04)" : "none",
                              background: watched ? "rgba(74,222,128,0.04)" : "transparent",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "8px 14px",
                              }}
                            >
                              {/* Checkbox */}
                              <button
                                onClick={() => toggleEpisodeWatched(showId, season.season_number, epNum)}
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 5,
                                  border: `2px solid ${watched ? "#4ade80" : "var(--border)"}`,
                                  background: watched ? "#4ade80" : "transparent",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 11,
                                  color: "#000",
                                  fontWeight: 700,
                                  transition: "all 0.15s",
                                }}
                              >
                                {watched ? "✓" : ""}
                              </button>

                              {/* Episode label */}
                              <span
                                style={{
                                  fontSize: 13,
                                  color: watched ? "#4ade80" : "var(--text-muted)",
                                  flex: 1,
                                  fontWeight: watched ? 500 : 400,
                                  textDecoration: watched ? "none" : "none",
                                  transition: "color 0.15s",
                                }}
                              >
                                Episode {epNum}
                              </span>

                              {/* Note toggle */}
                              <button
                                onClick={() => setExpandedEpNote(noteOpen ? null : key)}
                                title={note ? "View/Edit Note" : "Add Note"}
                                style={{
                                  background: note ? "rgba(251,146,60,0.15)" : "transparent",
                                  border: `1px solid ${note ? "#fb923c" : "var(--border)"}`,
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: 11,
                                  color: note ? "#fb923c" : "var(--text-dim)",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                              >
                                📝
                              </button>
                            </div>

                            {/* Expandable Note Field */}
                            {noteOpen && (
                              <div style={{ padding: "0 14px 12px 44px" }}>
                                <textarea
                                  rows={2}
                                  value={note}
                                  onChange={(e) => setEpisodeNote(showId, season.season_number, epNum, e.target.value)}
                                  placeholder="Add your thoughts on this episode..."
                                  style={{
                                    width: "100%",
                                    background: "#080c14",
                                    border: "1px solid var(--border)",
                                    borderRadius: 7,
                                    padding: "8px 10px",
                                    color: "var(--text)",
                                    fontSize: 12,
                                    outline: "none",
                                    fontFamily: "var(--font-body)",
                                    resize: "vertical",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
