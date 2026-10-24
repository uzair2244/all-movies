import { NextResponse } from "next/server";
import { discoverTv } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "popularity.desc";
  const genre = searchParams.get("genre") || undefined;
  try {
    const params: any = { provider, page, sort };
    if (genre) params.genre = genre;
    const data = await discoverTv(params);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results: [], total_pages: 0 }, { status: 500 });
  }
}
