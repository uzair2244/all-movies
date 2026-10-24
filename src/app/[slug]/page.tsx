import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import ReportForm from "@/components/ReportForm";
import CommentSection from "@/components/CommentSection";
import Sidebar from "@/components/Sidebar";
import MovieCard from "@/components/MovieCard";
import MovieGrid from "@/components/MovieGrid";
import { getMovieBySlug, getMoviesByCategory } from "@/lib/data";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const movie = getMovieBySlug(slug);
  if (!movie) return { title: "Not Found" };
  return {
    title: `Watch ${movie.title} (${movie.year}) ${movie.language}`,
    description: `Watch ${movie.title} (${movie.year}) Full ${movie.language} Movie Free Online. ${movie.synopsis}`,
  };
}

export default async function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = getMovieBySlug(slug);
  if (!movie) notFound();

  const related = getMoviesByCategory(movie.categories[0] || "")
    .filter((m) => m.id !== movie.id)
    .slice(0, 8);

  return (
    <>
      <Header />
      <main>
        {/* Backdrop hero */}
        <div className="relative w-full h-[40vh] min-h-[280px] max-h-[420px] overflow-hidden">
          <Image
            src={movie.poster}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover scale-110 blur-sm opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)]/80 to-transparent" />
          <div className="relative container-x h-full flex items-end pb-6">
            <div className="flex items-end gap-5">
              <div className="hidden sm:block relative w-32 md:w-40 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-[var(--color-border-strong)] shrink-0">
                <Image src={movie.poster} alt={movie.title} fill sizes="160px" className="object-cover" />
              </div>
              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {movie.categories.map((c) => (
                    <Link key={c} href={`/category/${c}`} className="chip hover:opacity-80 backdrop-blur-md">
                      {c.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Link>
                  ))}
                </div>
                <h1 className="font-display font-extrabold text-3xl md:text-5xl leading-[1.05] tracking-tight drop-shadow-2xl">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--color-text-dim)]">
                  <span className="text-[var(--color-gold)] font-semibold">{movie.year}</span>
                  <span>•</span>
                  <span>{movie.language}</span>
                  {movie.actors.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="line-clamp-1">{movie.actors.join(", ")}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-x py-6">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            <div>
              <VideoPlayer embedUrl={movie.embedUrl} poster={movie.poster} title={movie.title} />

              <div className="mt-6 space-y-3">
                <p className="text-[var(--color-text-dim)] leading-relaxed text-base md:text-lg">{movie.synopsis}</p>
              </div>

              <ReportForm movieId={movie.id} title={movie.title} />
              <CommentSection movieId={movie.id} />
            </div>
            <Sidebar />
          </div>

          {related.length > 0 && (
            <section className="mt-12">
              <h3 className="font-display font-bold text-xl mb-4">You may also like</h3>
              <MovieGrid movies={related} />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
