"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HollywoodCard from "@/components/HollywoodCard";
import { Search, Filter, X, ChevronLeft, ChevronRight, Film, Tv, Loader2 } from "lucide-react";

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: string;
  genre_ids?: number[];
  popularity?: number;
  vote_count?: number;
}

const MOVIE_GENRES: { id: number; name: string }[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const TV_GENRES: { id: number; name: string }[] = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

export default function HollywoodPage() {
  const [tab, setTab] = useState<"movie" | "tv" | "all">("movie");
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TmdbItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerOpen, setProviderOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [debouncing, setDebouncing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const genres = tab === "tv" ? TV_GENRES : MOVIE_GENRES;

  // Local cache of popular titles for strong prefix search
  const [localCache, setLocalCache] = useState<TmdbItem[]>([]);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Load local cache on mount
  useEffect(() => {
    const loadCache = async () => {
      try {
        const [m1, m2, m3, m4, m5, t1, t2, t3] = await Promise.all([
          fetch("/api/hollywood/movies?page=1").then((r) => r.json()),
          fetch("/api/hollywood/movies?page=2").then((r) => r.json()),
          fetch("/api/hollywood/movies?page=3").then((r) => r.json()),
          fetch("/api/hollywood/movies?page=4").then((r) => r.json()),
          fetch("/api/hollywood/movies?page=5").then((r) => r.json()),
          fetch("/api/hollywood/tv?page=1").then((r) => r.json()),
          fetch("/api/hollywood/tv?page=2").then((r) => r.json()),
          fetch("/api/hollywood/tv?page=3").then((r) => r.json()),
        ]);
        const all: TmdbItem[] = [];
        const seen = new Set<number>();
        for (const d of [m1, m2, m3, m4, m5, t1, t2, t3]) {
          for (const r of d.results || []) {
            if (seen.has(r.id)) continue;
            seen.add(r.id);
            all.push({ ...r, media_type: r.media_type || (r.title ? "movie" : "tv") });
          }
        }
        setLocalCache(all);
        setCacheLoaded(true);
      } catch {
        setCacheLoaded(true);
      }
    };
    loadCache();
  }, []);

  // Fetch providers
  useEffect(() => {
    fetch(`/api/hollywood/providers?type=${tab === "tv" ? "tv" : "movie"}`)
      .then((r) => r.json())
      .then((d) => setProviders(d.providers || []))
      .catch(() => setProviders([]));
  }, [tab]);

  // Clear filters when tab changes (provider/genre ids differ between movie & tv)
  useEffect(() => {
    setSelectedProviders([]);
    setSelectedGenres([]);
  }, [tab]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setActiveSearch("");
      setDebouncing(false);
      return;
    }
    setDebouncing(true);
    debounceRef.current = setTimeout(() => {
      setActiveSearch(searchQuery.trim());
      setDebouncing(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Fetch content
  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      if (activeSearch.trim()) {
        const params = new URLSearchParams();
        params.set("q", activeSearch);
        params.set("page", String(page));
        const res = await fetch(`/api/hollywood/search?${params}`);
        const data = await res.json();
        let results = data.results || [];

        // Local prefix matching: boost titles starting with query
        const lower = activeSearch.toLowerCase();
        const apiIds = new Set(results.map((r: any) => r.id));
        const localMatches = localCache.filter((item) => {
          const title = (item.title || item.name || "").toLowerCase();
          return title.startsWith(lower) || title.includes(lower);
        });
        for (const lm of localMatches) {
          if (!apiIds.has(lm.id)) {
            results.push(lm);
            apiIds.add(lm.id);
          }
        }

        // Genre filter (client-side, OR)
        if (selectedGenres.length) {
          results = results.filter((r: any) =>
            (r.genre_ids || []).some((g: number) => selectedGenres.includes(g))
          );
        }
        // Tab filter for search results
        if (tab !== "all") {
          results = results.filter((r: any) => {
            const mt = r.media_type || (r.title ? "movie" : "tv");
            return tab === "movie" ? mt === "movie" : mt === "tv";
          });
        }
        // Sort: prefix matches first, then by popularity
        results.sort((a: any, b: any) => {
          const aTitle = (a.title || a.name || "").toLowerCase();
          const bTitle = (b.title || b.name || "").toLowerCase();
          const aPrefix = aTitle.startsWith(lower) ? 0 : 1;
          const bPrefix = bTitle.startsWith(lower) ? 0 : 1;
          if (aPrefix !== bPrefix) return aPrefix - bPrefix;
          return (b.popularity || b.vote_count || 0) - (a.popularity || a.vote_count || 0);
        });

        setItems(results.slice(0, 40));
        setTotalPages(Math.min(data.total_pages || 1, 500));
        setTotalResults(Math.max(data.total_results || 0, results.length));
      } else {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("sort", sortBy);
        if (selectedProviders.length) params.set("provider", selectedProviders.join(","));
        if (selectedGenres.length) params.set("genre", selectedGenres.join("|"));
        const endpoint = tab === "tv" ? "/api/hollywood/tv" : "/api/hollywood/movies";
        const res = await fetch(`${endpoint}?${params}`);
        const data = await res.json();
        setItems(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
        setTotalResults(data.total_results || 0);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, selectedProviders, page, activeSearch, sortBy, selectedGenres, localCache]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    setPage(1);
  }, [tab, selectedProviders, activeSearch, sortBy, selectedGenres]);

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };
  const toggleProvider = (id: number) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };
  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedProviders([]);
  };

  const hasFilters = selectedGenres.length > 0 || selectedProviders.length > 0;

  return (
    <>
      <Header />
      <main className="container-x py-8">
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl md:text-5xl mb-2">Hollywood</h1>
          <p className="text-sm text-[var(--color-text-dim)]">
            {activeSearch
              ? `${totalResults.toLocaleString()} result${totalResults !== 1 ? "s" : ""} for “${activeSearch}”`
              : `${totalResults.toLocaleString()}+ ${tab === "tv" ? "TV shows" : tab === "movie" ? "movies" : "titles"}${hasFilters ? " (filtered)" : ""}`}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] w-fit">
              {(["movie", "tv", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    tab === t
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {t === "movie" && <Film size={14} />}
                  {t === "tv" && <Tv size={14} />}
                  {t === "movie" ? "Movies" : t === "tv" ? "TV Shows" : "All"}
                </button>
              ))}
            </div>

            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, shows, actors…"
                  className="field pl-9 text-sm"
                />
                {debouncing && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-text-faint)]" />
                )}
                {searchQuery && !debouncing && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {!activeSearch && (
              <>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="field text-sm w-auto"
                >
                  <option value="popularity.desc">Popular</option>
                  <option value="vote_average.desc">Top rated</option>
                  <option value="release_date.desc">Newest</option>
                  <option value="release_date.asc">Oldest</option>
                </select>
                <button
                  onClick={() => setGenreOpen((v) => !v)}
                  className={`btn ${selectedGenres.length ? "btn-primary" : "btn-ghost"} text-sm`}
                >
                  <Filter size={16} />
                  Genres{selectedGenres.length ? ` (${selectedGenres.length})` : ""}
                </button>
                <button
                  onClick={() => setProviderOpen((v) => !v)}
                  className={`btn ${selectedProviders.length ? "btn-primary" : "btn-ghost"} text-sm`}
                >
                  <Filter size={16} />
                  Providers{selectedProviders.length ? ` (${selectedProviders.length})` : ""}
                </button>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost text-sm px-3"
                    aria-label="Clear filters"
                  >
                    <X size={16} />
                  </button>
                )}
              </>
            )}
          </div>

          {genreOpen && !activeSearch && (
            <div className="card p-4 fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-sm">Filter by genre (multi-select)</h3>
                <button onClick={() => setGenreOpen(false)} className="text-[var(--color-text-faint)] hover:text-[var(--color-text)]">
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => {
                  const active = selectedGenres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGenre(g.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                          : "bg-[var(--color-bg)] text-[var(--color-text-dim)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {providerOpen && !activeSearch && (
            <div className="card p-4 fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-sm">Filter by provider (multi-select)</h3>
                <button onClick={() => setProviderOpen(false)} className="text-[var(--color-text-faint)] hover:text-[var(--color-text)]">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                {providers.map((p) => {
                  const active = selectedProviders.includes(p.provider_id);
                  return (
                    <button
                      key={p.provider_id}
                      onClick={() => toggleProvider(p.provider_id)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                        active
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                          : "border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg)]"
                      }`}
                    >
                      {p.logo_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                          alt={p.provider_name}
                          className="w-8 h-8 rounded-md object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-[var(--color-bg-hover)]" />
                      )}
                      <span className="text-[9px] text-center line-clamp-2 leading-tight text-[var(--color-text-dim)]">
                        {p.provider_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-[var(--color-bg-card)]">
                <div className="skeleton aspect-[2/3] w-full" />
                <div className="p-2.5 space-y-2">
                  <div className="skeleton h-3.5 w-3/4" />
                  <div className="skeleton h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[var(--color-text-dim)]">No results found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((item) => (
                <HollywoodCard
                  key={item.id}
                  item={item}
                  type={item.media_type === "tv" ? "tv" : "movie"}
                />
              ))}
            </div>
            {!activeSearch && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn btn-ghost text-sm disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-sm text-[var(--color-text-dim)]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn btn-ghost text-sm disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
