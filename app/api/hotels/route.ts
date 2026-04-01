import { NextRequest, NextResponse } from "next/server";
import { searchHotels } from "@/lib/services";
import type { DestinationSlug } from "@/lib/types";

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const destination = p.get("destination") as DestinationSlug | null;
  const checkIn = p.get("checkIn");
  const checkOut = p.get("checkOut");
  const adults = p.get("adults") || "2";

  if (!destination || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Missing: destination, checkIn, checkOut" },
      { status: 400 },
    );
  }

  try {
    const result = await searchHotels({
      destination,
      checkIn,
      checkOut,
      adults: Number(adults),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Hotel search error:", error);
    return NextResponse.json(
      { error: "HOTEL_SEARCH_FAILED", detail: String(error) },
      { status: 500 },
    );
  }
}
