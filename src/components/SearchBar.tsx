"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Command } from "lucide-react";
import { useRouter } from "next/navigation";

interface Result {
  id: number;
  slug: string;
  title: string;
  year: string | number;
  language: string;
  poster: string;
  actors: string[];
  type: "indian" | "hollywood";
  href: string;
}

export default function SearchBar({ variant = "header" }: { variant?: "header" | "hero" }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [indianRes, hollywoodRes] = await Promise.allSettled([
        fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`),
        fetch(`/api/hollywood/search?q=${encodeURIComponent(q)}&page=1`),
      ]);
      const indianData =
        indianRes.status === "fulfilled" ? await indianRes.value.json() : { results: [] };
      const hollywoodData =
        hollywoodRes.status === "fulfilled" ? await hollywoodRes.value.json() : { results: [] };

      const indian = (indianData.results || []).map((m: any) => ({
        id: m.id,
        slug: m.slug,
        title: m.title,
        year: m.year,
        language: m.language,
        poster: m.poster,
        actors: m.actors || [],
        type: "indian" as const,
        href: `/${m.slug}`,
      }));

      const hollywood = (hollywoodData.results || []).slice(0, 6).map((m: any) => ({
        id: m.id,
        slug: String(m.id),
        title: m.title || m.name,
        year: (m.release_date || m.first_air_date || "").slice(0, 4),
        language: m.media_type === "tv" ? "TV" : "Movie",
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "",
        actors: [],
        type: "hollywood" as const,
        href: `/hollywood/${m.media_type === "tv" ? "tv" : "movie"}/${m.id}`,
      }));

      // Merge: prefix matches first
      const lower = q.toLowerCase();
      const combined = [...indian, ...hollywood].sort((a, b) => {
        const aPrefix = a.title.toLowerCase().startsWith(lower) ? 0 : 1;
        const bPrefix = b.title.toLowerCase().startsWith(lower) ? 0 : 1;
        if (aPrefix !== bPrefix) return aPrefix - bPrefix;
        return 0;
      });

      setResults(combined.slice(0, 12));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchResults(query), 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && results[activeIdx]) {
        e.preventDefault();
        setOpen(false);
        router.push(`/${results[activeIdx].slug}`);
      } else {
        submit();
      }
    }
  };

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-[var(--color-accent)]/30 text-[var(--color-text)] rounded px-0.5">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={`relative ${isHero ? "w-full" : "w-full max-w-md"}`}>
      <form onSubmit={submit} className="relative">
        <Search
          size={18}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] pointer-events-none`}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={isHero ? "Search movies, actors, genres…" : "Search…"}
          className={`field pl-10 pr-20 ${isHero ? "py-3.5 text-base rounded-xl" : "py-2"}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
              aria-label="Clear"
            >
              <X size={14} />
            </button>
          )}
          {!isHero && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[var(--color-border-strong)] bg-[var(--color-bg-card)] text-[10px] text-[var(--color-text-faint)] font-mono">
              <Command size={10} />K
            </kbd>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && (query.trim() || results.length > 0) && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl shadow-2xl overflow-hidden border border-[var(--color-border-strong)] fade-in" style={{ backgroundColor: "var(--color-bg-elev)" }}>
          {loading && results.length === 0 && (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-14 rounded bg-[var(--color-bg-hover)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-[var(--color-bg-hover)]" />
                    <div className="h-2 w-1/3 rounded bg-[var(--color-bg-hover)]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && query.trim() && (
            <div className="p-6 text-center text-sm text-[var(--color-text-dim)]">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.length > 0 && (
            <ul className="max-h-[60vh] overflow-y-auto py-2">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link
                    href={r.href || `/${r.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      i === activeIdx
                        ? "bg-[var(--color-bg-hover)]"
                        : "hover:bg-[var(--color-bg-hover)]"
                    }`}
                  >
                    <div className="relative w-10 h-14 rounded-md overflow-hidden shrink-0 bg-[var(--color-bg-card)]">
                      {r.poster ? (
                        <Image
                          src={r.poster}
                          alt={r.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)] text-[8px]">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate flex items-center gap-2">
                        {highlight(r.title)}
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            r.type === "hollywood"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {r.type === "hollywood" ? "HW" : "IN"}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--color-text-faint)] flex items-center gap-1.5 mt-0.5">
                        <span>{r.year}</span>
                        <span>•</span>
                        <span>{r.language}</span>
                        {r.actors.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <span>•</span>
                            <span className="truncate">{r.actors.join(", ")}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              <li className="border-t border-[var(--color-border)]">
                <button
                  onClick={() => submit()}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  See all results for &ldquo;{query}&rdquo; →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
