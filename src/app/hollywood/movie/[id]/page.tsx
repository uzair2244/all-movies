import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMovieDetails, imgUrl, backdropUrl } from "@/lib/tmdb";
import { Play, Star, Calendar, Clock, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const m = await getMovieDetails(Number(id));
    return { title: `${m.title} (${(m.release_date || "").slice(0, 4)}) — CineHD`, description: m.overview };
  } catch {
    return { title: "Movie — CineHD" };
  }
}

export default async function HollywoodMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let movie: any;
  try {
    movie = await getMovieDetails(Number(id));
  } catch {
    notFound();
  }
  if (!movie) notFound();

  const backdrop = backdropUrl(movie.backdrop_path, "w1280");
  const poster = imgUrl(movie.poster_path, "w500");
  const providers = movie["watch/providers"]?.results?.US?.flatrate || [];

  return (
    <>
      <Header />
      <main>
        <div className="relative w-full h-[32vh] sm:h-[50vh] min-h-[220px] sm:min-h-[320px] overflow-hidden">
          {backdrop && (
            <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover scale-105 opacity-40 blur-sm" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)]/80 to-transparent" />
          <div className="relative container-x h-full flex items-end pb-6">
            <div className="flex items-end gap-3 sm:gap-5 w-full min-w-0">
              <div className="relative w-24 sm:w-32 md:w-40 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-[var(--color-border-strong)] shrink-0">
                {poster && <Image src={poster} alt={movie.title} fill sizes="160px" className="object-cover" />}
              </div>
              <div className="pb-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl leading-[1.05] tracking-tight drop-shadow-2xl break-words">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--color-text-dim)]">
                  {movie.release_date && <span className="text-[var(--color-gold)] font-semibold">{movie.release_date.slice(0, 4)}</span>}
                  {movie.runtime && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {movie.runtime} min</span>
                    </>
                  )}
                  {movie.vote_average > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Star size={12} className="text-[var(--color-gold)]" fill="currentColor" /> {movie.vote_average.toFixed(1)}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(movie.genres || []).map((g: any) => (
                    <span key={g.id} className="chip backdrop-blur-md">{g.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-x py-6 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-8">
            <div>
              <p className="text-[var(--color-text-dim)] leading-relaxed text-base md:text-lg mb-6">{movie.overview}</p>

              {/* Player (ythd.org embedded) */}
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg mb-3">Watch</h3>
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[var(--color-border-strong)]">
                  <iframe
                    src={`https://ythd.org/embed/${id}`}
                    title={movie.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder={0}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="origin"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Trailer (YouTube) fallback */}
              {(() => {
                const videos = movie.videos?.results || [];
                const trailer = videos.find((v: any) => v.site === "YouTube" && v.type === "Trailer")
                  || videos.find((v: any) => v.site === "YouTube" && v.type === "Teaser")
                  || videos.find((v: any) => v.site === "YouTube");
                if (!trailer) return null;
                return (
                  <div className="mb-6">
                    <h3 className="font-display font-bold text-lg mb-3">Trailer</h3>
                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[var(--color-border-strong)]">
                      <iframe
                        src={`https://www.youtube.com/embed/${trailer.key}`}
                        title={`${movie.title} trailer`}
                        className="absolute inset-0 w-full h-full"
                        frameBorder={0}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Providers */}
              {providers.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display font-bold text-lg mb-3">Available on</h3>
                  <div className="flex flex-wrap gap-2">
                    {providers.map((p: any) => (
                      <div key={p.provider_id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                        {p.logo_path && (
                          <img src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} alt={p.provider_name} className="w-6 h-6 rounded" />
                        )}
                        <span className="text-sm">{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast */}
              {movie.credits?.cast?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display font-bold text-lg mb-3">Cast</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {movie.credits.cast.slice(0, 12).map((c: any) => (
                      <div key={c.id} className="shrink-0 w-20 text-center">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--color-bg-card)] mb-1.5">
                          {c.profile_path ? (
                            <Image src={imgUrl(c.profile_path, "w185")} alt={c.name} fill sizes="80px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-faint)] text-xs">?</div>
                          )}
                        </div>
                        <div className="text-xs font-medium line-clamp-1">{c.name}</div>
                        <div className="text-[10px] text-[var(--color-text-faint)] line-clamp-1">{c.character}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="card p-4 h-fit">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--color-text-faint)] mb-3">Details</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-dim)]">Status</dt>
                  <dd>{movie.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-dim)]">Language</dt>
                  <dd>{movie.original_language?.toUpperCase()}</dd>
                </div>
                {movie.budget > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-dim)]">Budget</dt>
                    <dd>${(movie.budget / 1e6).toFixed(0)}M</dd>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-dim)]">Revenue</dt>
                    <dd>${(movie.revenue / 1e6).toFixed(0)}M</dd>
                  </div>
                )}
              </dl>
              <Link href="/hollywood" className="btn btn-ghost w-full mt-4 text-sm">
                ← Back to Hollywood
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
