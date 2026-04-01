import { NextRequest, NextResponse } from "next/server";
import { isIgnavConfigured, searchFlights } from "@/lib/services";
import type { DestinationSlug, SourceCity } from "@/lib/types";

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const sourceCity = p.get("sourceCity") as SourceCity | null;
  const destination = p.get("destination") as DestinationSlug | null;
  const date = p.get("date");
  const travelers = p.get("travelers") || "1";
  const direction =
    (p.get("direction") as "outbound" | "return") || "outbound";

  if (!sourceCity || !destination || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: sourceCity, destination, date" },
      { status: 400 },
    );
  }

  if (!isIgnavConfigured()) {
    return NextResponse.json({ error: "API_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const result = await searchFlights({
      sourceCity,
      destination,
      date,
      travelers: Number(travelers),
      direction,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "FLIGHT_SEARCH_FAILED", detail: String(error) },
      { status: 500 },
    );
  }
}
