import { useState, useCallback } from "react";

const STORAGE_KEY = "screenvault_episodes";

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("[useEpisodeTracker] Save error:", e);
  }
}

export function useEpisodeTracker() {
  const [episodeData, setEpisodeData] = useState(load);

  const getShowData = useCallback(
    (showId) => {
      return episodeData[String(showId)] || { watched: {}, notes: {} };
    },
    [episodeData]
  );

  const toggleEpisodeWatched = useCallback((showId, seasonNum, epNum) => {
    const key = `${seasonNum}_${epNum}`;
    setEpisodeData((prev) => {
      const showData = prev[String(showId)] || { watched: {}, notes: {} };
      const updated = {
        ...prev,
        [String(showId)]: {
          ...showData,
          watched: {
            ...showData.watched,
            [key]: !showData.watched[key],
          },
        },
      };
      save(updated);
      return updated;
    });
  }, []);

  const setEpisodeNote = useCallback((showId, seasonNum, epNum, note) => {
    const key = `${seasonNum}_${epNum}`;
    setEpisodeData((prev) => {
      const showData = prev[String(showId)] || { watched: {}, notes: {} };
      const updated = {
        ...prev,
        [String(showId)]: {
          ...showData,
          notes: {
            ...showData.notes,
            [key]: note,
          },
        },
      };
      save(updated);
      return updated;
    });
  }, []);

  const getWatchedCount = useCallback(
    (showId) => {
      const showData = episodeData[String(showId)] || { watched: {} };
      return Object.values(showData.watched).filter(Boolean).length;
    },
    [episodeData]
  );

  return {
    getShowData,
    toggleEpisodeWatched,
    setEpisodeNote,
    getWatchedCount,
  };
}
