import { NextRequest, NextResponse } from "next/server";
import { searchActivities } from "@/lib/services";
import type { DestinationSlug } from "@/lib/types";

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const destination = p.get("destination") as DestinationSlug | null;

  if (!destination) {
    return NextResponse.json(
      { error: "Missing: destination" },
      { status: 400 },
    );
  }

  try {
    const result = searchActivities({ destination });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Activity search error:", error);
    return NextResponse.json(
      { error: "ACTIVITY_SEARCH_FAILED", detail: String(error) },
      { status: 500 },
    );
  }
}
