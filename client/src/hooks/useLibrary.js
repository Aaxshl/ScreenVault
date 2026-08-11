import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cinescout_library";
const OLD_FAVS_KEY = "cinescout_favs";

export function useLibrary(toast, logEvent) {
  const [library, setLibrary] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);

      // Migrate from old cinescout_favs if exists
      const oldFavs = localStorage.getItem(OLD_FAVS_KEY);
      if (oldFavs) {
        const parsedOld = JSON.parse(oldFavs);
        const migrated = parsedOld.map((item) => ({
          ...item,
          status: "to_watch",
          userRating: null,
          userNotes: "",
          updatedAt: new Date().toISOString(),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        localStorage.removeItem(OLD_FAVS_KEY);
        return migrated;
      }
      return [];
    } catch (e) {
      console.error("[useLibrary] Storage parse error:", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    } catch (e) {
      console.error("[useLibrary] Storage save error:", e);
    }
  }, [library]);

  const getItem = useCallback(
    (id) => library.find((item) => String(item.id) === String(id)) || null,
    [library]
  );

  const getStatus = useCallback(
    (id) => {
      const found = getItem(id);
      return found ? found.status : null;
    },
    [getItem]
  );

  const updateStatus = useCallback(
    (item, status) => {
      setLibrary((prev) => {
        const existingIndex = prev.findIndex((i) => String(i.id) === String(item.id));

        if (!status) {
          if (existingIndex > -1) {
            toast?.(`Removed "${item.title || item.name}" from library`, "info");
            logEvent?.("removed", item);
            return prev.filter((i) => String(i.id) !== String(item.id));
          }
          return prev;
        }

        const statusLabels = {
          to_watch: "To Watch",
          watching: "Currently Watching",
          finished: "Finished Watching",
        };

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...item,
            status,
            updatedAt: new Date().toISOString(),
          };
          toast?.(`Set "${item.title || item.name}" to ${statusLabels[status]}`, "success");
          logEvent?.(status, item);
          return updated;
        } else {
          const newItem = {
            ...item,
            status,
            userRating: item.userRating || null,
            userNotes: item.userNotes || "",
            updatedAt: new Date().toISOString(),
          };
          toast?.(`Added "${item.title || item.name}" to ${statusLabels[status]}`, "success");
          logEvent?.("added", item);
          return [newItem, ...prev];
        }
      });
    },
    [toast, logEvent]
  );

  const updateRating = useCallback(
    (id, rating) => {
      setLibrary((prev) =>
        prev.map((item) => {
          if (String(item.id) === String(id)) {
            toast?.(`Updated rating to ${rating} ★`, "success");
            logEvent?.("rated", item, { rating });
            return { ...item, userRating: rating, updatedAt: new Date().toISOString() };
          }
          return item;
        })
      );
    },
    [toast, logEvent]
  );

  const updateNotes = useCallback(
    (id, notes) => {
      setLibrary((prev) =>
        prev.map((item) => {
          if (String(item.id) === String(id)) {
            toast?.("Saved personal notes", "success");
            logEvent?.("note_saved", item);
            return { ...item, userNotes: notes, updatedAt: new Date().toISOString() };
          }
          return item;
        })
      );
    },
    [toast, logEvent]
  );

  const addCustomTitle = useCallback(
    (customData) => {
      const newId = `custom_${Date.now()}`;
      const newItem = {
        id: newId,
        isCustom: true,
        title: customData.title,
        name: customData.title,
        mediaType: customData.mediaType || "movie",
        release_date: customData.year ? `${customData.year}-01-01` : "",
        first_air_date: customData.year ? `${customData.year}-01-01` : "",
        poster_path: customData.posterUrl || null,
        posterUrl: customData.posterUrl || null,
        overview: customData.overview || "Custom title added by user.",
        status: customData.status || "finished",
        userRating: customData.userRating ? Number(customData.userRating) : null,
        vote_average: customData.userRating ? Number(customData.userRating) : 0,
        userNotes: customData.userNotes || "",
        updatedAt: new Date().toISOString(),
      };

      setLibrary((prev) => [newItem, ...prev]);
      toast?.(`Added custom title "${customData.title}" to library!`, "success");
      logEvent?.("added", newItem);
      return newItem;
    },
    [toast, logEvent]
  );

  const editCustomTitle = useCallback(
    (id, customData) => {
      setLibrary((prev) =>
        prev.map((item) => {
          if (String(item.id) === String(id)) {
            toast?.(`Updated "${customData.title}"`, "success");
            return {
              ...item,
              title: customData.title,
              name: customData.title,
              mediaType: customData.mediaType || item.mediaType,
              release_date: customData.year ? `${customData.year}-01-01` : "",
              first_air_date: customData.year ? `${customData.year}-01-01` : "",
              poster_path: customData.posterUrl || null,
              posterUrl: customData.posterUrl || null,
              overview: customData.overview || item.overview,
              status: customData.status || item.status,
              userRating: customData.userRating ? Number(customData.userRating) : item.userRating,
              vote_average: customData.userRating ? Number(customData.userRating) : item.vote_average,
              userNotes: customData.userNotes !== undefined ? customData.userNotes : item.userNotes,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );
    },
    [toast]
  );

  const deleteItem = useCallback(
    (id) => {
      const found = getItem(id);
      setLibrary((prev) => prev.filter((i) => String(i.id) !== String(id)));
      if (found) {
        toast?.(`Deleted "${found.title || found.name}" from library`, "info");
        logEvent?.("removed", found);
      }
    },
    [getItem, toast, logEvent]
  );

  return {
    library,
    getItem,
    getStatus,
    updateStatus,
    updateRating,
    updateNotes,
    addCustomTitle,
    editCustomTitle,
    deleteItem,
  };
}
