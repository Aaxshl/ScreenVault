import { useState, useMemo } from "react";
import MediaGrid from "../components/MediaGrid";
import SelectCollectionItemsModal from "../components/SelectCollectionItemsModal";
import ActivityLog from "../components/ActivityLog";

export default function Library({
  library,
  onSelect,
  getStatus,
  onUpdateStatus,
  onOpenAddCustom,
  collections = [],
  onOpenCreateCollection,
  onEditCollection,
  onDeleteCollection,
  onToggleItemInCollection,
  achievements = [],
  unlockedCount = 0,
  totalBadges = 0,
  activityLog = [],
  onClearActivityLog,
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [isSelectItemsOpen, setIsSelectItemsOpen] = useState(false);

  const counts = useMemo(() => {
    return {
      all: library.length,
      to_watch: library.filter((i) => i.status === "to_watch").length,
      watching: library.filter((i) => i.status === "watching").length,
      finished: library.filter((i) => i.status === "finished").length,
    };
  }, [library]);

  const activeCollection = useMemo(() => {
    return collections.find((c) => c.id === activeCollectionId) || null;
  }, [collections, activeCollectionId]);

  const filteredItems = useMemo(() => {
    return library.filter((item) => {
      // If collection is selected, filter by collection items
      if (filterStatus === "collections" && activeCollectionId) {
        if (!activeCollection || !activeCollection.itemIds.map(String).includes(String(item.id))) {
          return false;
        }
      } else if (filterStatus !== "all" && filterStatus !== "collections" && filterStatus !== "analytics") {
        if (item.status !== filterStatus) return false;
      }

      const title = (item.title || item.name || "").toLowerCase();
      const matchQuery = !searchQuery.trim() || title.includes(searchQuery.toLowerCase().trim());
      return matchQuery;
    });
  }, [library, filterStatus, activeCollectionId, activeCollection, searchQuery]);

  // Analytics & Stats Calculations
  const stats = useMemo(() => {
    const finishedItems = library.filter((i) => i.status === "finished" || i.status === "watching");
    const movies = finishedItems.filter((i) => i.mediaType === "movie" || i.title);
    const tvShows = finishedItems.filter((i) => i.mediaType === "tv" || (!i.title && i.name));

    // Calculate runtime minutes
    let totalMinutes = 0;
    library.forEach((item) => {
      if (item.status === "finished" || item.status === "watching") {
        if (item.runtime) {
          totalMinutes += Number(item.runtime);
        } else if (item.mediaType === "tv") {
          totalMinutes += (item.number_of_episodes || 10) * 45;
        } else {
          totalMinutes += 110;
        }
      }
    });

    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = (totalHours / 24).toFixed(1);

    // Calculate User Rating Average
    const ratedItems = library.filter((i) => i.userRating !== null && i.userRating !== undefined);
    const avgRating = ratedItems.length
      ? (ratedItems.reduce((acc, curr) => acc + Number(curr.userRating), 0) / ratedItems.length).toFixed(1)
      : null;

    // Calculate Genre Distribution
    const genreMap = {};
    library.forEach((item) => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach((g) => {
          genreMap[g.name] = (genreMap[g.name] || 0) + 1;
        });
      }
    });

    const sortedGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const maxGenreCount = sortedGenres.length ? sortedGenres[0][1] : 1;

    return {
      totalMovies: movies.length,
      totalTV: tvShows.length,
      totalHours,
      totalDays,
      avgRating,
      ratedCount: ratedItems.length,
      topGenres: sortedGenres,
      maxGenreCount,
    };
  }, [library]);

  return (
    <main
      style={{
        padding: "28px 24px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔔 Continue Watching Reminder Banner */}
      {(() => {
        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const pausedShows = library.filter((item) => {
          if (item.status !== "watching") return false;
          const updatedAt = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
          return (now - updatedAt) > sevenDaysMs;
        });
        if (pausedShows.length === 0) return null;
        return (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(250,204,21,0.1), rgba(250,204,21,0.04))",
              border: "1px solid rgba(250,204,21,0.3)",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 20 }}>⏰</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#facc15" }}>
                Continue Watching Reminder
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                You haven't watched{" "}
                <strong style={{ color: "#fff" }}>
                  {pausedShows.map((s) => s.title || s.name).slice(0, 2).join(", ")}
                  {pausedShows.length > 2 ? ` +${pausedShows.length - 2} more` : ""}
                </strong>{" "}
                in over a week. Time to continue!
              </div>
            </div>
            <button
              onClick={() => setFilterStatus("watching")}
              style={{
                background: "rgba(250,204,21,0.15)",
                border: "1px solid rgba(250,204,21,0.4)",
                borderRadius: 8,
                padding: "6px 14px",
                color: "#facc15",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              View Watching List
            </button>
          </div>
        );
      })()}

      {/* Title Header */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 28, letterSpacing: 0.5 }}>
            📚 My Library
          </h1>
          {filterStatus !== "analytics" && (
            <span style={{ color: "var(--text-dim)", fontSize: 13 }}>
              {filteredItems.length} {filteredItems.length === 1 ? "title" : "titles"}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onOpenCreateCollection(null)}
            style={{
              background: "#1e2535",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "8px 16px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            📁 New Collection
          </button>

          <button
            onClick={() => onOpenAddCustom("")}
            style={{
              background: "var(--red)",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 14px rgba(229,9,20,0.4)",
            }}
          >
            ➕ Add Custom Title
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {[
            { key: "all", label: `All (${counts.all})` },
            { key: "to_watch", label: `🎯 To Watch (${counts.to_watch})` },
            { key: "watching", label: `📺 Watching (${counts.watching})` },
            { key: "finished", label: `✅ Finished (${counts.finished})` },
            { key: "collections", label: `📁 Collections (${collections.length})` },
            { key: "analytics", label: `📊 Stats & Insights` },
            { key: "achievements", label: `🏆 Achievements (${unlockedCount}/${totalBadges})` },
            { key: "activity", label: `📋 Activity (${activityLog.length})` },
          ].map((tab) => {
            const active = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setFilterStatus(tab.key);
                  if (tab.key !== "collections") setActiveCollectionId(null);
                }}
                style={{
                  background: active ? "var(--red)" : "var(--bg-input)",
                  border: `1px solid ${active ? "var(--red)" : "var(--border)"}`,
                  borderRadius: 20,
                  padding: "6px 16px",
                  color: active ? "#fff" : "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search within Library */}
        {filterStatus !== "analytics" && filterStatus !== "collections" && library.length > 0 && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter library..."
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 14px",
              color: "var(--text)",
              fontSize: 13,
              outline: "none",
              maxWidth: 220,
            }}
          />
        )}
      </div>

      {/* 📁 COLLECTIONS VIEW */}
      {filterStatus === "collections" && (
        <div style={{ flex: 1 }}>
          {/* Active Collection Header Bar */}
          {activeCollectionId && activeCollection && (
            <div style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 32 }}>{activeCollection.emoji}</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{activeCollection.name}</h3>
                  {activeCollection.description && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{activeCollection.description}</p>}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setIsSelectItemsOpen(true)}
                  style={{
                    background: "var(--red)",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 16px",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(229,9,20,0.3)",
                  }}
                >
                  ➕ Add Titles to Collection
                </button>
                <button
                  onClick={() => setActiveCollectionId(null)}
                  style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 14px", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}
                >
                  Show All Collections
                </button>
              </div>
            </div>
          )}

          {!activeCollectionId ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setActiveCollectionId(col.id)}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: 20,
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 36 }}>{col.emoji}</span>
                    <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "4px 10px", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                      {col.itemIds.length} {col.itemIds.length === 1 ? "title" : "titles"}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-head)", fontSize: 20, letterSpacing: 0.5, marginBottom: 4, color: "#fff" }}>
                    {col.name}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.4, marginBottom: 16, flex: 1 }}>
                    {col.description || "No description."}
                  </p>

                  <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCollection(col);
                      }}
                      style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}
                    >
                      ✏️ Edit
                    </button>
                    {col.id !== "col_favorites" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCollection(col.id);
                        }}
                        style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", color: "#ff7b7b", fontSize: 12, cursor: "pointer" }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MediaGrid
              items={filteredItems}
              onSelect={onSelect}
              getStatus={getStatus}
              onUpdateStatus={onUpdateStatus}
              isLibraryTab={true}
              onOpenAddCustom={onOpenAddCustom}
            />
          )}
        </div>
      )}

      {/* 📊 STATS & ANALYTICS DASHBOARD VIEW */}
      {filterStatus === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Stat Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>🎬</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 32, color: "#fff" }}>{stats.totalMovies}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>Movies Finished</div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>📺</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 32, color: "#fff" }}>{stats.totalTV}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>TV Shows Watched</div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>⏱️</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 32, color: "#4ade80" }}>{stats.totalHours} hrs</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>~{stats.totalDays} Days Watch Time</div>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>⭐</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 32, color: "#f5c518" }}>
                {stats.avgRating ? `${stats.avgRating} / 10` : "N/A"}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>Avg Rating ({stats.ratedCount} rated)</div>
            </div>
          </div>

          {/* Top Genres Breakdown Progress Bars */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, letterSpacing: 0.5, marginBottom: 16 }}>
              📊 Top Watched Genres
            </h3>

            {stats.topGenres.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No genre data recorded yet. Start watching titles!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {stats.topGenres.map(([genreName, count]) => {
                  const percentage = Math.round((count / stats.maxGenreCount) * 100);
                  return (
                    <div key={genreName}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: "#fff", fontWeight: 500 }}>{genreName}</span>
                        <span style={{ color: "var(--text-muted)" }}>{count} {count === 1 ? "title" : "titles"}</span>
                      </div>
                      <div style={{ width: "100%", height: 8, background: "var(--bg-input)", borderRadius: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, var(--red) 0%, #ff5252 100%)",
                            borderRadius: 4,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🏆 ACHIEVEMENTS VIEW */}
      {filterStatus === "achievements" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Progress Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(245,197,24,0.12) 0%, rgba(229,9,20,0.08) 100%)",
              border: "1px solid rgba(245,197,24,0.25)",
              borderRadius: 14,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ fontFamily: "var(--font-head)", fontSize: 22, color: "#f5c518", letterSpacing: 0.5 }}>🏆 Cinephile Achievements</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Earn badges by watching, rating, and collecting titles.</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 36, color: "#f5c518" }}>{unlockedCount}<span style={{ fontSize: 20, color: "var(--text-muted)" }}>/{totalBadges}</span></div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Unlocked</div>
            </div>
          </div>

          {/* Achievement Badge Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {achievements.map((badge) => (
              <div
                key={badge.id}
                style={{
                  background: badge.unlocked ? "linear-gradient(135deg, rgba(245,197,24,0.08), rgba(229,9,20,0.06))" : "var(--bg-card)",
                  border: `1px solid ${badge.unlocked ? "rgba(245,197,24,0.35)" : "var(--border)"}`,
                  borderRadius: 14,
                  padding: 18,
                  opacity: badge.unlocked ? 1 : 0.65,
                  boxShadow: badge.unlocked ? "0 0 20px rgba(245,197,24,0.07)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 32,
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: badge.unlocked ? "rgba(245,197,24,0.15)" : "rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {badge.unlocked ? badge.emoji : "🔒"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: badge.unlocked ? "#fff" : "var(--text-muted)" }}>{badge.title}</div>
                    <div style={{ fontSize: 11, color: badge.unlocked ? "#f5c518" : "var(--text-dim)", fontWeight: 600 }}>
                      {badge.unlocked ? "✓ Unlocked" : `${badge.currentProgress} / ${badge.target}`}
                    </div>
                  </div>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{badge.description}</p>
                {/* Progress Bar */}
                <div style={{ width: "100%", height: 5, background: "var(--bg-input)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.round((badge.currentProgress / badge.target) * 100)}%`,
                      height: "100%",
                      background: badge.unlocked ? "linear-gradient(90deg, #f5c518, #facc15)" : "linear-gradient(90deg, var(--red), #ff5252)",
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📋 ACTIVITY LOG VIEW */}
      {filterStatus === "activity" && (
        <div style={{ flex: 1 }}>
          <ActivityLog activityLog={activityLog} onClear={onClearActivityLog} />
        </div>
      )}

      {/* STANDARD MEDIA GRID VIEW */}
      {filterStatus !== "analytics" && filterStatus !== "collections" && filterStatus !== "achievements" && filterStatus !== "activity" && (
        <div style={{ flex: 1 }}>
          <MediaGrid
            items={filteredItems}
            onSelect={onSelect}
            getStatus={getStatus}
            onUpdateStatus={onUpdateStatus}
            isLibraryTab={true}
            onOpenAddCustom={onOpenAddCustom}
          />
        </div>
      )}

      {/* Select Titles to Collection Modal */}
      <SelectCollectionItemsModal
        isOpen={isSelectItemsOpen}
        onClose={() => setIsSelectItemsOpen(false)}
        collection={activeCollection}
        library={library}
        onToggleItemInCollection={onToggleItemInCollection}
      />
    </main>
  );
}
