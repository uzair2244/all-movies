import { NextResponse } from "next/server";
import { MOVIES } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(Number(searchParams.get("limit")) || 12, 50);

  if (!q) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const results = MOVIES.filter((m) => {
    const titleMatch = m.title.toLowerCase().includes(q);
    const actorMatch = m.actors.some((a) => a.toLowerCase().includes(q));
    const catMatch = m.categories.some((c) => c.toLowerCase().includes(q.replace(/\s+/g, "-")));
    const yearMatch = String(m.year).includes(q);
    const langMatch = m.language.toLowerCase().includes(q);
    return titleMatch || actorMatch || catMatch || yearMatch || langMatch;
  })
    .sort((a, b) => {
      // prioritize title starts-with
      const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return b.id - a.id;
    })
    .slice(0, limit)
    .map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      year: m.year,
      language: m.language,
      poster: m.poster,
      actors: m.actors.slice(0, 3),
    }));

  return NextResponse.json({ results, total: results.length });
}
