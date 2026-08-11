import FilterBar from "../components/FilterBar";
import MediaGrid from "../components/MediaGrid";
import SkeletonGrid from "../components/ui/SkeletonGrid";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function Browse({
  mediaType,
  items,
  loading,
  loadingMore,
  hasMore,
  loadMore,
  error,
  sectionTitle,
  filters,
  onFilterUpdate,
  onFilterReset,
  onMediaTypeChange,
  onSelect,
  getStatus,
  onUpdateStatus,
  onOpenAddCustom,
}) {
  const hasFilters = Object.entries(filters).some(
    ([k, v]) => v !== "" && (k !== "sort_by" || v !== "popularity.desc")
  );

  return (
    <>
      <FilterBar
        mediaType={mediaType}
        filters={filters}
        onUpdate={onFilterUpdate}
        onReset={onFilterReset}
        onMediaTypeChange={onMediaTypeChange}
      />
      <main style={{ padding: "28px 24px" }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, letterSpacing: 0.5 }}>
            {sectionTitle}
          </h1>
          {!loading && items.length > 0 && (
            <span style={{ color: "var(--text-dim)", fontSize: 13 }}>Showing {items.length} titles</span>
          )}
        </div>

        <ErrorBanner message={error} />

        {loading ? (
          <SkeletonGrid count={12} />
        ) : (
          <>
            <MediaGrid
              items={items}
              onSelect={onSelect}
              getStatus={getStatus}
              onUpdateStatus={onUpdateStatus}
              isLibraryTab={false}
              hasFilters={hasFilters}
              onOpenAddCustom={onOpenAddCustom}
            />

            {/* Load More Button */}
            {hasMore && items.length > 0 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 36, marginBottom: 12 }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    background: loadingMore ? "var(--bg-input)" : "var(--red)",
                    border: "1px solid",
                    borderColor: loadingMore ? "var(--border)" : "var(--red)",
                    borderRadius: 10,
                    padding: "12px 32px",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    boxShadow: loadingMore ? "none" : "0 4px 20px rgba(229,9,20,0.35)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.background = "#ff1a1a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMore) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.background = "var(--red)";
                    }
                  }}
                >
                  {loadingMore ? "Loading more titles..." : `Load More ${mediaType === "movie" ? "Movies" : "TV Shows"} ↓`}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}