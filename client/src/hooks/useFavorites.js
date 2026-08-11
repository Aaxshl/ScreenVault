import { useState, useEffect, useCallback } from "react";

const KEY = "cinescout_favs";

export function useFavorites(toast) {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFav = useCallback((id) => favorites.some((f) => f.id === id), [favorites]);

  const toggleFav = useCallback((item) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) {
        toast?.(`Removed "${item.title || item.name}" from favorites`, "info");
        return prev.filter((f) => f.id !== item.id);
      }
      toast?.(`Added "${item.title || item.name}" to favorites ♥`, "success");
      return [...prev, item];
    });
  }, [toast]);

  return { favorites, isFav, toggleFav };
}
