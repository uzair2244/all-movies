import Link from "next/link";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import type { Movie } from "@/lib/types";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/${movie.slug}`} className="group block">
      <article className="relative rounded-xl overflow-hidden bg-[var(--color-bg-card)] transition-all duration-300 hover:scale-[1.03] hover:z-10 hover:shadow-2xl hover:shadow-[var(--color-accent-glow)]">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-accent)] text-white shadow-2xl shadow-[var(--color-accent-glow)]">
              <Play size={20} fill="white" className="ml-0.5" />
            </span>
          </div>
          {/* Language chip */}
          <span className="absolute top-2 left-2 chip text-[10px] backdrop-blur-md">{movie.language}</span>
          {/* Year badge */}
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">
            {movie.year}
          </span>
        </div>
        <div className="p-2.5">
          <h3 className="font-display font-bold text-sm leading-tight line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
            {movie.title}
          </h3>
          {movie.actors.length > 0 && (
            <p className="text-xs text-[var(--color-text-faint)] mt-0.5 line-clamp-1">
              {movie.actors.slice(0, 2).join(", ")}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
