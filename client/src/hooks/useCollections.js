import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "screenvault_collections";

const DEFAULT_COLLECTIONS = [
  {
    id: "col_favorites",
    name: "Favorites",
    description: "Your top favorite movies & TV shows",
    emoji: "⭐",
    itemIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "col_watchlist",
    name: "Weekend Binge",
    description: "Must-watch shows for the weekend",
    emoji: "🍿",
    itemIds: [],
    createdAt: new Date().toISOString(),
  },
];

export function useCollections(toast) {
  const [collections, setCollections] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COLLECTIONS));
      return DEFAULT_COLLECTIONS;
    } catch (e) {
      console.error("[useCollections] Storage parse error:", e);
      return DEFAULT_COLLECTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch (e) {
      console.error("[useCollections] Storage save error:", e);
    }
  }, [collections]);

  const createCollection = useCallback(
    ({ name, description = "", emoji = "📁" }) => {
      const newCollection = {
        id: `col_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        emoji: emoji || "📁",
        itemIds: [],
        createdAt: new Date().toISOString(),
      };

      setCollections((prev) => [...prev, newCollection]);
      toast?.(`Created collection "${newCollection.name}" ${newCollection.emoji}`, "success");
      return newCollection;
    },
    [toast]
  );

  const editCollection = useCallback(
    (id, { name, description, emoji }) => {
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            toast?.(`Updated collection "${name}"`, "success");
            return {
              ...c,
              name: name.trim(),
              description: description ? description.trim() : c.description,
              emoji: emoji || c.emoji,
            };
          }
          return c;
        })
      );
    },
    [toast]
  );

  const deleteCollection = useCallback(
    (id) => {
      setCollections((prev) => {
        const found = prev.find((c) => c.id === id);
        if (found) {
          toast?.(`Deleted collection "${found.name}"`, "info");
        }
        return prev.filter((c) => c.id !== id);
      });
    },
    [toast]
  );

  const toggleItemInCollection = useCallback(
    (collectionId, itemId) => {
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id === collectionId) {
            const exists = c.itemIds.map(String).includes(String(itemId));
            let updatedIds;
            if (exists) {
              updatedIds = c.itemIds.filter((id) => String(id) !== String(itemId));
              toast?.(`Removed title from "${c.name}"`, "info");
            } else {
              updatedIds = [...c.itemIds, itemId];
              toast?.(`Added title to "${c.name}" ${c.emoji}`, "success");
            }
            return { ...c, itemIds: updatedIds };
          }
          return c;
        })
      );
    },
    [toast]
  );

  const isItemInCollection = useCallback(
    (collectionId, itemId) => {
      const found = collections.find((c) => c.id === collectionId);
      return found ? found.itemIds.map(String).includes(String(itemId)) : false;
    },
    [collections]
  );

  const getCollectionsForItem = useCallback(
    (itemId) => {
      return collections.filter((c) => c.itemIds.map(String).includes(String(itemId)));
    },
    [collections]
  );

  return {
    collections,
    createCollection,
    editCollection,
    deleteCollection,
    toggleItemInCollection,
    isItemInCollection,
    getCollectionsForItem,
  };
}
