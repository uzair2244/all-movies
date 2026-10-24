import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import MovieGrid from "@/components/MovieGrid";
import { MOVIES, FEATURED_IDS } from "@/lib/data";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const featured = MOVIES.filter((m) => FEATURED_IDS.includes(m.id));
  const heroMovie = featured[0] ?? MOVIES[0];
  const rest = featured.slice(1);
  const recent = [...MOVIES]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 20);
  const bollywood = MOVIES.filter((m) => m.categories.includes("bollywood-movies")).slice(0, 10);
  const punjabi = MOVIES.filter((m) => m.categories.includes("punjabi-movies")).slice(0, 10);

  return (
    <>
      <Header />
      <main>
        <Hero movie={heroMovie} />

        <div className="container-x py-10 space-y-14">
          {rest.length > 0 && (
            <section className="fade-in">
              <div className="flex items-center justify-between mb-4">
                <SectionHeading title="Featured" />
                <Link
                  href="/category/bollywood-movies"
                  className="text-sm text-[var(--color-text-dim)] hover:text-[var(--color-accent)] flex items-center gap-1"
                >
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <MovieGrid movies={rest} />
            </section>
          )}

          <section className="fade-in">
            <div className="flex items-center justify-between mb-4">
              <SectionHeading title="Recently Added" />
            </div>
            <MovieGrid movies={recent} />
          </section>

          {bollywood.length > 0 && (
            <section className="fade-in">
              <div className="flex items-center justify-between mb-4">
                <SectionHeading title="Bollywood" />
                <Link href="/category/bollywood-movies" className="text-sm text-[var(--color-text-dim)] hover:text-[var(--color-accent)] flex items-center gap-1">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <MovieGrid movies={bollywood} />
            </section>
          )}

          {punjabi.length > 0 && (
            <section className="fade-in">
              <div className="flex items-center justify-between mb-4">
                <SectionHeading title="Punjabi" />
                <Link href="/category/punjabi-movies" className="text-sm text-[var(--color-text-dim)] hover:text-[var(--color-accent)] flex items-center gap-1">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <MovieGrid movies={punjabi} />
            </section>
          )}

          {/* Category pills */}
          <section className="fade-in">
            <SectionHeading title="Browse by Category" />
            <div className="flex flex-wrap gap-2">
              {[
                "bollywood-movies",
                "bollywood-movies-2026",
                "hindi-dubbed-movies",
                "punjabi-movies",
                "punjabi-movies-2026",
                "seasons-webseries",
              ].map((slug) => (
                <Link
                  key={slug}
                  href={`/category/${slug}`}
                  className="px-4 py-2 rounded-full border border-[var(--color-border-strong)] text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
                >
                  {slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
