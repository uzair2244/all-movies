"use client";

import { useState } from "react";
import { Search, TrendingUp, Film } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOVIES } from "@/lib/data";
import Link from "next/link";

export default function Sidebar() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const trending = [...MOVIES].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);

  return (
    <aside className="space-y-4">
      <div className="card p-4">
        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--color-text-faint)] mb-3 flex items-center gap-2">
          <Search size={12} /> Search
        </h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Movie By Name..."
            className="field text-sm"
          />
          <button type="submit" className="btn btn-primary shrink-0 px-3">
            <Search size={14} />
          </button>
        </form>
      </div>

      <div className="card p-4">
        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--color-text-faint)] mb-3 flex items-center gap-2">
          <TrendingUp size={12} /> Trending
        </h4>
        <ul className="space-y-2">
          {trending.map((m) => (
            <li key={m.id}>
              <Link
                href={`/${m.slug}`}
                className="flex items-center gap-2.5 group"
              >
                <div className="relative w-10 h-14 rounded-md overflow-hidden shrink-0 bg-[var(--color-bg-card)]">
                  <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {m.title}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-faint)]">
                    {m.year} • {m.language}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-4">
        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--color-text-faint)] mb-3 flex items-center gap-2">
          <Film size={12} /> Stats
        </h4>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-[var(--color-bg)] p-2">
            <div className="font-display font-extrabold text-lg text-[var(--color-accent)]">
              {MOVIES.length.toLocaleString()}
            </div>
            <div className="text-[10px] text-[var(--color-text-faint)] uppercase">Movies</div>
          </div>
          <div className="rounded-lg bg-[var(--color-bg)] p-2">
            <div className="font-display font-extrabold text-lg text-[var(--color-accent)]">
              {new Set(MOVIES.flatMap((m) => m.actors)).size.toLocaleString()}
            </div>
            <div className="text-[10px] text-[var(--color-text-faint)] uppercase">Actors</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
