const API_KEY = process.env.TMDB_API_KEY || "07486183d27e9f78ac76710bf94657bd";
const BASE = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
export const IMG_BASE = process.env.TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p";

export interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  media_type?: string;
}

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

export async function getProviders(region = "US") {
  const data = await tmdbFetch("/watch/providers/movie", { watch_region: region });
  return (data.results || [])
    .filter((p: TmdbProvider) => p.logo_path)
    .sort((a: TmdbProvider, b: TmdbProvider) => a.display_priority - b.display_priority)
    .slice(0, 60);
}

export async function getTvProviders(region = "US") {
  const data = await tmdbFetch("/watch/providers/tv", { watch_region: region });
  return (data.results || [])
    .filter((p: TmdbProvider) => p.logo_path)
    .sort((a: TmdbProvider, b: TmdbProvider) => a.display_priority - b.display_priority)
    .slice(0, 60);
}

export async function discoverMovies(params: {
  provider?: string;
  page?: number;
  region?: string;
  sort?: string;
  genre?: string;
}) {
  const p: Record<string, string> = {
    sort_by: params.sort || "popularity.desc",
    page: String(params.page || 1),
    watch_region: params.region || "US",
    include_adult: "false",
  };
  if (params.provider) {
    p.with_watch_providers = params.provider;
  }
  if (params.genre) {
    p.with_genres = params.genre;
  }
  return tmdbFetch("/discover/movie", p);
}

export async function discoverTv(params: {
  provider?: string;
  page?: number;
  region?: string;
  sort?: string;
  genre?: string;
}) {
  const p: Record<string, string> = {
    sort_by: params.sort || "popularity.desc",
    page: String(params.page || 1),
    watch_region: params.region || "US",
  };
  if (params.provider) {
    p.with_watch_providers = params.provider;
  }
  if (params.genre) {
    p.with_genres = params.genre;
  }
  return tmdbFetch("/discover/tv", p);
}

export async function getMovieDetails(id: number) {
  return tmdbFetch(`/movie/${id}`, { append_to_response: "credits,videos,watch/providers" });
}

export async function getTvDetails(id: number) {
  return tmdbFetch(`/tv/${id}`, { append_to_response: "credits,videos,watch/providers" });
}

export async function getTvSeason(id: number, seasonNumber: number) {
  return tmdbFetch(`/tv/${id}/season/${seasonNumber}`);
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch("/search/multi", { query, page: String(page), include_adult: "false" });
}

export async function getTvExternalIds(id: number) {
  return tmdbFetch(`/tv/${id}/external_ids`);
}

export function imgUrl(path: string | null, size = "w342") {
  if (!path) return "";
  return `${IMG_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "w1280") {
  if (!path) return "";
  return `${IMG_BASE}/${size}${path}`;
}
