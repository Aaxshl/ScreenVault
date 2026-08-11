import { useState, useEffect, useRef } from "react";
import { IMG_BASE } from "../api/index.js";

const SOURCES = [
  { key: "to_watch", label: "🎯 My To Watch List" },
  { key: "watching", label: "📺 Currently Watching" },
  { key: "finished", label: "✅ Finished" },
  { key: "all", label: "📚 All Saved Titles" },
];

export default function MovieRouletteModal({ isOpen, onClose, library = [], onSelect }) {
  const [source, setSource] = useState("to_watch");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [shuffleItems, setShuffleItems] = useState([]);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setWinner(null);
      setSpinning(false);
      setShuffleItems([]);
      clearInterval(intervalRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pool = library.filter((item) => {
    if (source === "all") return true;
    return item.status === source;
  });

  const handleSpin = () => {
    if (pool.length === 0) return;
    if (pool.length === 1) {
      setWinner(pool[0]);
      return;
    }

    setWinner(null);
    setSpinning(true);

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setShuffleItems(shuffled);
    setShuffleIndex(0);

    let i = 0;
    let delay = 80;
    let elapsed = 0;
    const totalDuration = 2400;

    const tick = () => {
      setShuffleIndex(i % shuffled.length);
      i++;
      elapsed += delay;

      // Gradually slow down near the end
      if (elapsed > totalDuration * 0.6) delay = Math.min(delay * 1.18, 400);

      if (elapsed >= totalDuration) {
        clearInterval(intervalRef.current);
        const picked = shuffled[Math.floor(Math.random() * shuffled.length)];
        setSpinning(false);
        setWinner(picked);
      } else {
        clearTimeout(intervalRef.current);
        intervalRef.current = setTimeout(tick, delay);
      }
    };

    clearTimeout(intervalRef.current);
    intervalRef.current = setTimeout(tick, delay);
  };

  const handleSpinAgain = () => {
    setWinner(null);
    setSpinning(false);
  };

  const getPoster = (item) => {
    if (item?.posterUrl) return item.posterUrl;
    if (item?.poster_path) {
      return item.poster_path.startsWith("http") ? item.poster_path : `${IMG_BASE}${item.poster_path}`;
    }
    return null;
  };

  const currentShuffleItem = shuffleItems[shuffleIndex];

  const statusColors = {
    to_watch: "#38bdf8",
    watching: "#facc15",
    finished: "#4ade80",
  };
  const statusLabels = {
    to_watch: "To Watch",
    watching: "Currently Watching",
    finished: "Finished",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #0d1120 0%, #0a0e18 100%)",
          borderRadius: 20,
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(229,9,20,0.08)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(229,9,20,0.05) 100%)",
            padding: "22px 26px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: 24, letterSpacing: 0.5, color: "#fff" }}>
              🎲 Movie Roulette
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
              Can't decide? Let ScreenVault pick for you!
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

        <div style={{ padding: "22px 26px 28px" }}>
          {/* Source Picker */}
          {!spinning && !winner && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                  Pick from:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SOURCES.map((s) => {
                    const count = library.filter((i) => s.key === "all" || i.status === s.key).length;
                    const active = source === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setSource(s.key)}
                        style={{
                          background: active ? "rgba(229,9,20,0.18)" : "var(--bg-input)",
                          border: `1px solid ${active ? "var(--red)" : "var(--border)"}`,
                          borderRadius: 10,
                          padding: "10px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          color: active ? "#fff" : "var(--text-muted)",
                          fontSize: 14,
                          fontWeight: active ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.18s",
                        }}
                      >
                        <span>{s.label}</span>
                        <span style={{ fontSize: 12, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "2px 10px", color: "var(--text-dim)" }}>
                          {count} titles
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {pool.length === 0 ? (
                <div style={{ textAlign: "center", padding: "14px", color: "var(--text-muted)", fontSize: 14, background: "var(--bg-input)", borderRadius: 10, marginBottom: 20 }}>
                  No titles in this category. Add some titles first!
                </div>
              ) : (
                <div style={{ textAlign: "center", marginBottom: 16, color: "var(--text-muted)", fontSize: 13 }}>
                  {pool.length} title{pool.length !== 1 ? "s" : ""} to choose from
                </div>
              )}
            </>
          )}

          {/* Spinning Shuffle Display */}
          {spinning && currentShuffleItem && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 160,
                  height: 240,
                  margin: "0 auto 16px",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 0 40px rgba(229,9,20,0.5), 0 20px 40px rgba(0,0,0,0.8)",
                  border: "2px solid var(--red)",
                  position: "relative",
                  animation: "roulettePulse 0.15s ease-in-out infinite alternate",
                }}
              >
                {getPoster(currentShuffleItem) ? (
                  <img
                    src={getPoster(currentShuffleItem)}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#1a2035", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: 40 }}>
                    🎬
                  </div>
                )}
                <div style={{ position: "absolute", inset: 0, background: "rgba(229,9,20,0.08)" }} />
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500 }}>🎲 Spinning...</div>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                {currentShuffleItem.title || currentShuffleItem.name}
              </div>
            </div>
          )}

          {/* Winner Display */}
          {winner && !spinning && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ color: "#f5c518", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
                🎉 Tonight's Pick!
              </div>
              <div
                style={{
                  width: 180,
                  height: 270,
                  margin: "0 auto 16px",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 0 60px rgba(245, 197, 24, 0.35), 0 20px 50px rgba(0,0,0,0.8)",
                  border: "3px solid #f5c518",
                  position: "relative",
                }}
              >
                {getPoster(winner) ? (
                  <img
                    src={getPoster(winner)}
                    alt={winner.title || winner.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#1a2035", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50 }}>
                    🎬
                  </div>
                )}
              </div>

              <h3 style={{ fontFamily: "var(--font-head)", fontSize: 26, letterSpacing: 0.5, color: "#fff", marginBottom: 6 }}>
                {winner.title || winner.name}
              </h3>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
                {winner.status && (
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 10, background: "rgba(255,255,255,0.07)", color: statusColors[winner.status] || "var(--text-muted)" }}>
                    {statusLabels[winner.status] || winner.status}
                  </span>
                )}
                {(winner.release_date || winner.first_air_date) && (
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 10, background: "rgba(255,255,255,0.07)", color: "var(--text-muted)" }}>
                    {(winner.release_date || winner.first_air_date).split("-")[0]}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    onSelect(winner.id);
                    onClose();
                  }}
                  style={{
                    background: "var(--red)",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 22px",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(229,9,20,0.4)",
                  }}
                >
                  ▶ Open Details
                </button>
                <button
                  onClick={handleSpinAgain}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 22px",
                    color: "var(--text)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🎲 Spin Again
                </button>
              </div>
            </div>
          )}

          {/* Spin Button */}
          {!spinning && !winner && (
            <button
              onClick={handleSpin}
              disabled={pool.length === 0}
              style={{
                width: "100%",
                background: pool.length === 0 ? "#1a2035" : "var(--red)",
                border: "none",
                borderRadius: 12,
                padding: "14px",
                color: pool.length === 0 ? "var(--text-dim)" : "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: pool.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: 0.5,
                boxShadow: pool.length > 0 ? "0 6px 20px rgba(229,9,20,0.4)" : "none",
                transition: "all 0.2s",
              }}
            >
              🎲 Spin the Wheel!
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes roulettePulse {
          from { box-shadow: 0 0 30px rgba(229,9,20,0.4), 0 20px 40px rgba(0,0,0,0.8); }
          to   { box-shadow: 0 0 55px rgba(229,9,20,0.75), 0 20px 40px rgba(0,0,0,0.8); }
        }
      `}</style>
    </div>
  );
}
