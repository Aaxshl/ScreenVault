export const IMG_BASE     = "https://image.tmdb.org/t/p/w500";
export const IMG_BACKDROP = "https://image.tmdb.org/t/p/w1280";

async function request(path, params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null))
  );
  const url = `/api${path}${query.toString() ? `?${query}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server error: ${res.status}`);
  }
  return res.json();
}

// ── Movies ────────────────────────────────────────────────────────────────────
export const getTrendingMovies = (page = 1) => request("/movies/trending", { page });
export const searchMovies      = (query, page = 1) => request("/movies/search", { query, page });
export const discoverMovies    = (filters, page = 1) => request("/movies/discover", { ...filters, page });
export const getMovieDetail    = (id) => request(`/movies/${id}`);

// ── TV Shows ──────────────────────────────────────────────────────────────────
export const getTrendingTV = (page = 1) => request("/tv/trending", { page });
export const searchTV      = (query, page = 1) => request("/tv/search", { query, page });
export const discoverTV    = (filters, page = 1) => request("/tv/discover", { ...filters, page });
export const getTVDetail   = (id) => request(`/tv/${id}`);
