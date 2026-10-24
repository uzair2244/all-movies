import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import Sidebar from "@/components/Sidebar";
import { CATEGORIES } from "@/lib/types";
import { getMoviesByCategory } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return { title: "Not Found" };
  return { title: `${cat.name} — allmovies` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const page = Number(sp.page) || 1;
  const all = getMoviesByCategory(slug);
  const perPage = 24;
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = all.slice((safePage - 1) * perPage, safePage * perPage);

  const displayName = cat.name;

  return (
    <>
      <Header />
      <main className="container-x py-8">
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl md:text-5xl mb-2">{displayName}</h1>
          <p className="text-sm text-[var(--color-text-dim)]">
            {all.length.toLocaleString()} movie{all.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <MovieGrid movies={items} />
            <Pagination page={safePage} totalPages={totalPages} basePath={`/category/${slug}`} />
          </div>
          <Sidebar />
        </div>
      </main>
      <Footer />
    </>
  );
}
