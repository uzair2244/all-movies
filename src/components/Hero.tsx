"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, Star } from "lucide-react";
import type { Movie } from "@/lib/types";

export default function Hero({ movie }: { movie: Movie }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.3);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const backdrop = movie.backdrop || movie.poster;

  return (
    <section className="relative w-full h-[78vh] min-h-[500px] max-h-[820px] overflow-hidden">
      <div
        className="absolute inset-0 scale-110"
        style={{ transform: `translateY(${offset}px)` }}
      >
        <Image
          src={backdrop}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      {/* Side gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/70 to-transparent" />
      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/50 to-transparent" />

      <div className="relative container-x h-full flex flex-col justify-end pb-16 md:pb-20">
        <div className="max-w-2xl slide-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="chip backdrop-blur-md">{movie.language}</span>
            <span className="chip backdrop-blur-md">{movie.year}</span>
            {movie.actors.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 chip backdrop-blur-md">
                <Star size={10} className="text-[var(--color-gold)]" fill="currentColor" />
                {movie.actors[0]}
              </span>
            )}
          </div>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] tracking-tight drop-shadow-2xl">
            {movie.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-[var(--color-text-dim)] leading-relaxed line-clamp-3 max-w-xl drop-shadow">
            {movie.synopsis}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-7">
            <Link
              href={`/${movie.slug}`}
              className="btn btn-primary text-base px-7 py-3.5 shadow-2xl shadow-[var(--color-accent-glow)]"
            >
              <Play size={20} fill="white" /> Play Now
            </Link>
            <Link
              href={`/${movie.slug}`}
              className="btn btn-ghost text-base px-7 py-3.5"
            >
              <Info size={20} /> More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
