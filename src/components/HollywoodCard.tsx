import Link from "next/link";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { imgUrl } from "@/lib/tmdb";

export default function HollywoodCard({ item, type }: { item: any; type: "movie" | "tv" }) {
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const href = `/hollywood/${type}/${item.id}`;
  const poster = imgUrl(item.poster_path, "w342");

  return (
    <Link href={href} className="group block">
      <article className="relative rounded-xl overflow-hidden bg-[var(--color-bg-card)] transition-all duration-300 hover:scale-[1.03] hover:z-10 hover:shadow-2xl hover:shadow-[var(--color-accent-glow)]">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-[var(--color-bg-hover)] flex items-center justify-center">
              <span className="text-[var(--color-text-faint)] text-xs">No poster</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-accent)] text-white shadow-2xl">
              <Play size={20} fill="white" className="ml-0.5" />
            </span>
          </div>
          {item.vote_average > 0 && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-0.5">
              <Star size={9} className="text-[var(--color-gold)]" fill="currentColor" />
              {item.vote_average.toFixed(1)}
            </span>
          )}
          <span className="absolute top-2 left-2 chip text-[10px] backdrop-blur-md">
            {type === "tv" ? "TV" : "Movie"}
          </span>
        </div>
        <div className="p-2.5">
          <h3 className="font-display font-bold text-sm leading-tight line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{year}</p>
        </div>
      </article>
    </Link>
  );
}
