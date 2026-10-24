import { NextResponse } from "next/server";
import { getProviders, getTvProviders } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "movie";
  try {
    const providers = type === "tv" ? await getTvProviders() : await getProviders();
    return NextResponse.json({ providers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, providers: [] }, { status: 500 });
  }
}
