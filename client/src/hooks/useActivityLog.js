import { useState, useCallback } from "react";

const STORAGE_KEY = "screenvault_activity";
const MAX_EVENTS = 200;

export const EVENT_TYPES = {
  added: { label: "Added to Library", icon: "➕", color: "#38bdf8" },
  status_changed: { label: "Status Changed", icon: "🔄", color: "#a78bfa" },
  watching: { label: "Started Watching", icon: "📺", color: "#facc15" },
  finished: { label: "Finished", icon: "✅", color: "#4ade80" },
  to_watch: { label: "Added to Watch List", icon: "🎯", color: "#38bdf8" },
  rated: { label: "Rated", icon: "⭐", color: "#f5c518" },
  note_saved: { label: "Review Saved", icon: "📝", color: "#fb923c" },
  removed: { label: "Removed from Library", icon: "🗑️", color: "#f87171" },
};

function loadLog() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLog(log) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch (e) {
    console.error("[useActivityLog] Save error:", e);
  }
}

export function useActivityLog() {
  const [activityLog, setActivityLog] = useState(loadLog);

  const logEvent = useCallback((type, item, extra = {}) => {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      timestamp: new Date().toISOString(),
      itemId: item?.id,
      title: item?.title || item?.name || "Unknown Title",
      mediaType: item?.mediaType || "movie",
      poster_path: item?.poster_path || item?.posterUrl || null,
      ...extra,
    };

    setActivityLog((prev) => {
      const updated = [event, ...prev].slice(0, MAX_EVENTS);
      saveLog(updated);
      return updated;
    });
  }, []);

  const clearLog = useCallback(() => {
    setActivityLog([]);
    saveLog([]);
  }, []);

  return { activityLog, logEvent, clearLog };
}
