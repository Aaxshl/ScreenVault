import { useState, useEffect } from "react";

const EMOJI_OPTIONS = ["📁", "⭐", "🍿", "🎬", "🎃", "🚀", "💖", "😱", "📺", "🧠", "🏆", "🔥", "🎉", "☕", "🎮"];

export default function AddCollectionModal({ isOpen, onClose, onSave, initialData = null }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📁");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setEmoji(initialData.emoji || "📁");
    } else {
      setName("");
      setDescription("");
      setEmoji("🍿");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), emoji });
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
          maxWidth: 480,
          width: "100%",
          padding: 26,
          boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
          border: "1px solid var(--border)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 24, letterSpacing: 0.5 }}>
            {initialData ? "✏️ Edit Collection" : "📁 Create New Playlist / Collection"}
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
          {/* Emoji Selection */}
          <div>
            <label style={labelStyle}>Choose Icon</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EMOJI_OPTIONS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    background: emoji === e ? "var(--red)" : "var(--bg-input)",
                    border: `1px solid ${emoji === e ? "var(--red)" : "var(--border)"}`,
                    borderRadius: 8,
                    width: 38,
                    height: 38,
                    fontSize: 18,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.15s",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Collection Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Halloween Horror Nights"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this collection about?"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
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
              {initialData ? "Save Changes" : "Create Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
