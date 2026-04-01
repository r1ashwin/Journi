import { destinationAirports, areaCoordinates } from "@/lib/geo";
import type { DestinationSlug, TransferOption } from "@/lib/types";

type OsrmResponse = {
  code: string;
  routes?: Array<{ distance: number; duration: number }>;
};

export type EstimateTransferParams = {
  destination: DestinationSlug;
  area?: string;
  lat?: number;
  lng?: number;
};

export async function estimateTransfer(
  params: EstimateTransferParams,
): Promise<{ transfer: TransferOption; source: "osrm" }> {
  const airport = destinationAirports[params.destination];
  if (!airport) throw new Error("Unknown destination");

  let destLat: number;
  let destLng: number;
  let areaName: string;

  if (params.lat != null && params.lng != null) {
    destLat = params.lat;
    destLng = params.lng;
    areaName = params.area ?? "Hotel";
  } else if (params.area) {
    const areas = areaCoordinates[params.destination];
    const coords = areas?.[params.area];
    if (!coords) throw new Error(`Unknown area: ${params.area}`);
    destLat = coords.lat;
    destLng = coords.lng;
    areaName = params.area;
  } else {
    throw new Error("Provide area name or lat/lng");
  }

  const osrmUrl =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${airport.lng},${airport.lat};${destLng},${destLat}` +
    `?overview=false`;

  const res = await fetch(osrmUrl);
  const data: OsrmResponse = await res.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error(`OSRM: ${data.code}`);
  }

  const route = data.routes[0];
  const distanceKm = route.distance / 1000;
  const durationMinutes = Math.round(route.duration / 60);
  const cost = Math.round((200 + distanceKm * 18) / 50) * 50;

  const transfer: TransferOption = {
    id: `xfer-${params.destination}-${areaName.replace(/\s+/g, "-").toLowerCase()}`,
    label: `Airport to ${areaName} cab`,
    duration: fmtMin(durationMinutes),
    durationMinutes,
    cost,
    reason: `${Math.round(distanceKm)} km drive from the airport.`,
  };

  return { transfer, source: "osrm" };
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
