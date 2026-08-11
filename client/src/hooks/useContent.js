import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "./useDebounce";
import {
  getTrendingMovies, searchMovies, discoverMovies,
  getTrendingTV, searchTV, discoverTV,
} from "../api/index.js";

const INITIAL_FILTERS = { genre: "", year: "", min_rating: "", sort_by: "popularity.desc" };

export function useContent(mediaType) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sectionTitle, setSectionTitle] = useState("Trending This Week");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const isMovie = mediaType === "movie";

  const fetcherRef = useRef(null);

  // Initial load or filter change
  useEffect(() => {
    let isSubscribed = true;
    setLoading(true);
    setError(null);
    setPage(1);

    const hasFilters = Object.entries(filters).some(
      ([k, v]) => v !== "" && (k !== "sort_by" || v !== "popularity.desc")
    );

    let fetcherFn;
    let titleStr;

    if (debouncedQuery.trim()) {
      fetcherFn = (p) => isMovie ? searchMovies(debouncedQuery, p) : searchTV(debouncedQuery, p);
      titleStr = `Results for "${debouncedQuery}"`;
    } else if (hasFilters) {
      fetcherFn = (p) => isMovie ? discoverMovies(filters, p) : discoverTV(filters, p);
      titleStr = "Filtered Results";
    } else {
      fetcherFn = (p) => isMovie ? getTrendingMovies(p) : getTrendingTV(p);
      titleStr = "Trending This Week";
    }

    fetcherRef.current = fetcherFn;
    setSectionTitle(titleStr);

    fetcherFn(1)
      .then((data) => {
        if (!isSubscribed) return;
        const list = data.results || (Array.isArray(data) ? data : []);
        setItems(list);
        const currentPage = data.page || 1;
        const totalPages = data.total_pages || 1;
        setHasMore(currentPage < totalPages);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setError(err.message || "Failed to load. Is the server running?");
        setItems([]);
        setHasMore(false);
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [debouncedQuery, filters, isMovie]);

  // Load more pages
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !fetcherRef.current) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const data = await fetcherRef.current(nextPage);
      const newItems = data.results || [];
      setItems((prev) => {
        // Prevent duplicate entries
        const existingIds = new Set(prev.map((i) => i.id));
        const filteredNew = newItems.filter((i) => !existingIds.has(i.id));
        return [...prev, ...filteredNew];
      });
      setPage(nextPage);
      setHasMore(nextPage < (data.total_pages || 1));
    } catch (err) {
      console.error("[loadMore] Error fetching next page:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setQuery("");
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setQuery("");
  }, []);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    query,
    setQuery,
    filters,
    updateFilter,
    resetFilters,
    sectionTitle,
  };
}