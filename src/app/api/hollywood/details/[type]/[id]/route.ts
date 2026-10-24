import { NextResponse } from "next/server";
import { getMovieDetails, getTvDetails } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const numId = Number(id);
  try {
    const data = type === "tv" ? await getTvDetails(numId) : await getMovieDetails(numId);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
