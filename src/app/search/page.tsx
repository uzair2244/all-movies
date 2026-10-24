import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import { searchMovies } from "@/lib/data";
import { Search as SearchIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const page = Number(sp.page) || 1;
  const results = searchMovies(q);
  const perPage = 24;
  const totalPages = Math.max(1, Math.ceil(results.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = results.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <>
      <Header />
      <main className="container-x py-8">
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-2">
            {q ? `Results for “${q}”` : "Search"}
          </h1>
          <p className="text-sm text-[var(--color-text-dim)] mb-5">
            {q
              ? `${results.length.toLocaleString()} result${results.length !== 1 ? "s" : ""} found`
              : "Type to search across the catalog"}
          </p>
          <SearchBar variant="hero" />
        </div>

        {q && results.length === 0 && (
          <div className="py-20 text-center">
            <SearchIcon size={48} className="mx-auto text-[var(--color-text-faint)] mb-4" />
            <h3 className="font-display font-bold text-xl mb-2">No results found</h3>
            <p className="text-sm text-[var(--color-text-dim)]">
              Try a different keyword, actor name, or genre
            </p>
          </div>
        )}

        {items.length > 0 && (
          <>
            <MovieGrid movies={items} />
            <Pagination page={safePage} totalPages={totalPages} basePath="/search" query={q} />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
