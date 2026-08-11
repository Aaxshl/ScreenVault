export default function Header({
  query,
  onQueryChange,
  activeTab,
  onTabChange,
  libraryCount,
  onOpenAddCustom,
  onOpenRoulette,
}) {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 16,
        padding: "0 24px",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8,12,20,0.96)",
        backdropFilter: "blur(12px)",
        height: 64,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => onTabChange("browse")}
        style={{
          fontFamily: "var(--font-head)",
          fontSize: 26,
          color: "var(--red)",
          letterSpacing: 3,
          cursor: "pointer",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        🎬 SCREENVAULT
      </div>

      {/* Search — centered */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <input
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            onTabChange("browse");
          }}
          placeholder="Search movies & shows..."
          style={{
            width: "100%",
            maxWidth: 480,
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "9px 16px",
            color: "var(--text)",
            fontSize: 14,
            outline: "none",
            fontFamily: "var(--font-body)",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#555")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Right Controls: Roulette + My Library + Add Custom */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onOpenRoulette}
          title="What Should I Watch Next?"
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "7px 14px",
            color: "#facc15",
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#facc15";
            e.currentTarget.style.background = "rgba(250,204,21,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--bg-input)";
          }}
        >
          🎲 Roulette
        </button>

        <button
          onClick={() => onTabChange(activeTab === "library" ? "browse" : "library")}
          style={{
            background: activeTab === "library" ? "var(--red)" : "var(--bg-input)",
            border: "1px solid",
            borderColor: activeTab === "library" ? "var(--red)" : "var(--border)",
            borderRadius: 8,
            padding: "7px 16px",
            color: activeTab === "library" ? "#fff" : "var(--text-muted)",
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
            cursor: "pointer",
            transition: "background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.04)";
            if (activeTab !== "library") {
              e.currentTarget.style.borderColor = "#555";
              e.currentTarget.style.color = "#fff";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            if (activeTab !== "library") {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }
          }}
        >
          📚 My Library {libraryCount > 0 && `(${libraryCount})`}
        </button>

        <button
          onClick={onOpenAddCustom}
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "7px 14px",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--red)";
            e.currentTarget.style.background = "rgba(229,9,20,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--bg-input)";
          }}
        >
          ➕ Add Title
        </button>
      </div>
    </header>
  );
}