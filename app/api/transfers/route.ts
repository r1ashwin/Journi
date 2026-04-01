import { NextRequest, NextResponse } from "next/server";
import { estimateTransfer } from "@/lib/services";
import type { DestinationSlug } from "@/lib/types";

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const destination = p.get("destination") as DestinationSlug | null;
  const area = p.get("area");
  const lat = p.get("lat");
  const lng = p.get("lng");

  if (!destination) {
    return NextResponse.json(
      { error: "Missing: destination" },
      { status: 400 },
    );
  }

  try {
    const result = await estimateTransfer({
      destination,
      area: area ?? undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Transfer estimate error:", error);
    return NextResponse.json(
      { error: "TRANSFER_FAILED", detail: String(error) },
      { status: 500 },
    );
  }
}
