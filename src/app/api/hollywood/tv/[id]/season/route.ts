import { NextResponse } from "next/server";
import { getTvDetails, getTvSeason } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const season = Number(searchParams.get("season")) || 1;
  try {
    const [show, seasonData] = await Promise.all([
      getTvDetails(Number(id)),
      getTvSeason(Number(id), season),
    ]);
    return NextResponse.json({ show, season: seasonData });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
