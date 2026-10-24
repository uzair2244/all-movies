"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import Image from "next/image";

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

export default function TvPlayerWithEpisodes({
  tvId,
  seasons,
  title,
}: {
  tvId: number;
  seasons: Season[];
  title: string;
}) {
  const [selectedSeason, setSelectedSeason] = useState(seasons?.[0]?.season_number || 1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentEp, setCurrentEp] = useState<{ season: number; episode: number } | null>(
    seasons?.length ? { season: seasons[0].season_number, episode: 1 } : null
  );

  useEffect(() => {
    if (!selectedSeason) return;
    setLoading(true);
    fetch(`/api/hollywood/tv/${tvId}/season?season=${selectedSeason}`)
      .then((r) => r.json())
      .then((d) => setEpisodes(d.season?.episodes || []))
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false));
  }, [tvId, selectedSeason]);

  const playEpisode = (season: number, episode: number) => {
    setCurrentEp({ season, episode });
  };

  const embedUrl = currentEp
    ? `https://ythd.org/embed/${tvId}/${currentEp.season}-${currentEp.episode}`
    : `https://ythd.org/embed/${tvId}`;

  if (!seasons || seasons.length === 0) {
    // No seasons, just show player
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[var(--color-border-strong)]">
        <iframe
          src={`https://ythd.org/embed/${tvId}`}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[var(--color-border-strong)]">
        <iframe
          key={`${currentEp?.season}-${currentEp?.episode}`}
          src={embedUrl}
          title={`${title} S${currentEp?.season}E${currentEp?.episode}`}
          className="absolute inset-0 w-full h-full"
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          loading="eager"
        />
      </div>
      {currentEp && (
        <p className="text-xs text-[var(--color-text-faint)]">
          Now playing: Season {currentEp.season}, Episode {currentEp.episode}
        </p>
      )}

      {/* Season selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
        {seasons.map((s) => (
          <button
            key={s.season_number}
            onClick={() => {
              setSelectedSeason(s.season_number);
              playEpisode(s.season_number, 1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              s.season_number === selectedSeason
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-bg-card)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Episode list */}
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
          {episodes.map((ep) => {
            const isActive = currentEp?.season === selectedSeason && currentEp?.episode === ep.episode_number;
            return (
              <button
                key={ep.id}
                onClick={() => playEpisode(selectedSeason, ep.episode_number)}
                className={`w-full flex gap-3 p-3 rounded-lg border transition-colors text-left group ${
                  isActive
                    ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]"
                    : "bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                }`}
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
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
