import { Router } from "express";
import fetch from "node-fetch";

const router = Router();
const BASE = "https://api.themoviedb.org/3";

async function tmdb(path, params = {}) {
  const query = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY,
    ...params,
  });
  const res = await fetch(`${BASE}${path}?${query}`);
  if (!res.ok) {
    const err = new Error(`TMDB error: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Helper to format provider details (US region default, fallback to first available region)
function extractWatchProviders(providersData) {
  if (!providersData || !providersData.results) return null;
  const regionData = providersData.results.US || Object.values(providersData.results)[0] || null;
  if (!regionData) return null;
  return {
    link: regionData.link || null,
    flatrate: (regionData.flatrate || []).map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`,
    })),
    rent: (regionData.rent || []).map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`,
    })),
    buy: (regionData.buy || []).map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`,
    })),
  };
}

// ── Movies ────────────────────────────────────────────────────────────────────

router.get("/movies/trending", async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const data = await tmdb("/trending/movie/week", { page });
    res.json({
      results: data.results || [],
      page: data.page || 1,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/movies/search", async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ error: "query is required" });
    const data = await tmdb("/search/movie", { query, page, include_adult: false });
    res.json({
      results: data.results || [],
      page: data.page || 1,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/movies/discover", async (req, res, next) => {
  try {
    const { genre, year, min_rating, sort_by = "popularity.desc", page = 1 } = req.query;
    const params = { sort_by, page };
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    if (min_rating) params["vote_average.gte"] = min_rating;
    const data = await tmdb("/discover/movie", params);
    res.json({
      results: data.results || [],
      page: data.page || 1,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/movies/:id", async (req, res, next) => {
  try {
    const [detail, credits, videos, similar, providers] = await Promise.all([
      tmdb(`/movie/${req.params.id}`),
      tmdb(`/movie/${req.params.id}/credits`),
      tmdb(`/movie/${req.params.id}/videos`),
      tmdb(`/movie/${req.params.id}/similar`),
      tmdb(`/movie/${req.params.id}/watch/providers`),
    ]);
    const trailer =
      videos.results?.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
      videos.results?.[0] ||
      null;
    res.json({
      ...detail,
      cast: credits.cast?.slice(0, 8) || [],
      trailer,
      similar: similar.results?.slice(0, 6) || [],
      watch_providers: extractWatchProviders(providers),
    });
  } catch (e) {
    next(e);
  }
});

// ── TV Shows ──────────────────────────────────────────────────────────────────

router.get("/tv/trending", async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const data = await tmdb("/trending/tv/week", { page });
    res.json({
      results: data.results || [],
      page: data.page || 1,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/tv/search", async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ error: "query is required" });
    const data = await tmdb("/search/tv", { query, page, include_adult: false });
    res.json({
      results: data.results || [],
      page: data.page || 1,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/tv/discover", async (req, res, next) => {
  try {
    const { genre, year, min_rating, sort_by = "popularity.desc", page = 1 } = req.query;
    const params = { sort_by, page };
    if (genre) params.with_genres = genre;
    if (year) params.first_air_date_year = year;
    if (min_rating) params["vote_average.gte"] = min_rating;
    const data = await tmdb("/discover/tv", params);
    res.json({
      results: data.results || [],
      page: data.page || 1,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/tv/:id", async (req, res, next) => {
  try {
    const [detail, credits, videos, similar, providers] = await Promise.all([
      tmdb(`/tv/${req.params.id}`),
      tmdb(`/tv/${req.params.id}/credits`),
      tmdb(`/tv/${req.params.id}/videos`),
      tmdb(`/tv/${req.params.id}/similar`),
      tmdb(`/tv/${req.params.id}/watch/providers`),
    ]);
    const trailer =
      videos.results?.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
      videos.results?.[0] ||
      null;
    res.json({
      ...detail,
      title: detail.name,
      release_date: detail.first_air_date,
      cast: credits.cast?.slice(0, 8) || [],
      trailer,
      similar: similar.results?.slice(0, 6) || [],
      watch_providers: extractWatchProviders(providers),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
