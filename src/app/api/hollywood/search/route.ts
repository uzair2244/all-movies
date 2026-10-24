import { NextResponse } from "next/server";
import { searchMulti, imgUrl } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Number(searchParams.get("page")) || 1;
  if (!q) {
    return NextResponse.json({ results: [], total_pages: 0, total_results: 0 });
  }
  try {
    // Fetch multiple pages for stronger results on short queries
    const pagesToFetch = q.length <= 3 ? [1, 2, 3] : [page];
    const fetches = pagesToFetch.map((p) => searchMulti(q, p));
    const responses = await Promise.all(fetches);
    const seen = new Set<number>();
    let allResults: any[] = [];
    for (const data of responses) {
      for (const r of data.results || []) {
        if (r.media_type !== "movie" && r.media_type !== "tv") continue;
        if (seen.has(r.id)) continue;
        seen.add(r.id);
        allResults.push(r);
      }
    }
    // Sort: exact prefix matches first, then by popularity (vote_count)
    const lower = q.toLowerCase();
    allResults.sort((a, b) => {
      const aTitle = (a.title || a.name || "").toLowerCase();
      const bTitle = (b.title || b.name || "").toLowerCase();
      const aPrefix = aTitle.startsWith(lower) ? 0 : 1;
      const bPrefix = bTitle.startsWith(lower) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
      // then by vote_count (popularity proxy)
      return (b.vote_count || 0) - (a.vote_count || 0);
    });

    return NextResponse.json({
      results: allResults.slice(0, 40),
      total_pages: responses[0]?.total_pages || 1,
      total_results: responses[0]?.total_results || allResults.length,
      page,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results: [], total_pages: 0 }, { status: 500 });
  }
}
