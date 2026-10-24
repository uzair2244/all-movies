"use client";

import { useState, useEffect } from "react";
import { Play, ChevronDown } from "lucide-react";

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
  runtime: number | null;
}

interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
}

export default function EpisodesSection({ tvId, seasons }: { tvId: number; seasons: Season[] }) {
  const [selectedSeason, setSelectedSeason] = useState(seasons?.[0]?.season_number || 1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!selectedSeason) return;
    setLoading(true);
    fetch(`/api/hollywood/tv/${tvId}/season?season=${selectedSeason}`)
      .then((r) => r.json())
      .then((d) => setEpisodes(d.season?.episodes || []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false));
  }, [tvId, selectedSeason]);

  if (!seasons || seasons.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-lg">Episodes</h3>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-strong)] text-sm"
          >
            Season {selectedSeason}
            <ChevronDown size={14} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 z-50 glass rounded-lg shadow-2xl border border-[var(--color-border-strong)] max-h-60 overflow-y-auto min-w-[140px]" style={{ backgroundColor: "var(--color-bg-elev)" }}>
              {seasons.map((s) => (
                <button
                  key={s.season_number}
                  onClick={() => {
                    setSelectedSeason(s.season_number);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] ${
                    s.season_number === selectedSeason ? "text-[var(--color-accent)]" : "text-[var(--color-text-dim)]"
                  }`}
                >
                  {s.name} ({s.episode_count} eps)
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-[var(--color-bg-card)] animate-pulse">
              <div className="w-28 h-16 rounded bg-[var(--color-bg-hover)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-[var(--color-bg-hover)]" />
                <div className="h-2 w-full rounded bg-[var(--color-bg-hover)]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              className="flex gap-3 p-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors group"
            >
              <div className="relative w-28 h-16 rounded-md overflow-hidden shrink-0 bg-[var(--color-bg-hover)]">
                {ep.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${ep.still_path}`}
                    alt={ep.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)]">
                    <Play size={16} />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <span className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                    <Play size={12} fill="white" className="ml-0.5" />
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-[var(--color-accent)]">E{ep.episode_number}</span>
                  <h4 className="text-sm font-semibold truncate">{ep.name}</h4>
                </div>
                <p className="text-xs text-[var(--color-text-faint)] line-clamp-2">{ep.overview}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--color-text-faint)]">
                  {ep.air_date && <span>{ep.air_date}</span>}
                  {ep.runtime && <span>• {ep.runtime} min</span>}
                  {ep.vote_average > 0 && <span>• ⭐ {ep.vote_average.toFixed(1)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
