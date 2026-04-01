import { destinationAirports, sourceAirports } from "./geo";
import { sourceCities } from "./travel-data";
import type { DestinationSlug, FlightOption, SourceCity } from "./types";

function routeSeed(
  sourceCity: SourceCity,
  destination: DestinationSlug,
  direction: "outbound" | "return",
): number {
  const src = sourceAirports[sourceCity].iata;
  const dst = destinationAirports[destination].iata;
  const leg = direction === "outbound" ? `${src}-${dst}` : `${dst}-${src}`;
  return leg.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function addMinutes(hhmm: string, add: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  let t = h * 60 + m + add;
  t = ((t % (24 * 60)) + 24 * 60) % (24 * 60);
  const nh = Math.floor(t / 60);
  const nm = t % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function formatDur(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Synthetic **nonstop** options for every source ↔ destination with distinct airports.
 * Used when live search has no direct fares or API is offline. Goa/Jaipur etc. can
 * still override per city in travel-data.
 */
export function curatedDirectFlightsForRoute(
  sourceCity: SourceCity,
  destination: DestinationSlug,
  direction: "outbound" | "return",
): FlightOption[] {
  const src = sourceAirports[sourceCity];
  const dst = destinationAirports[destination];
  if (!src || !dst) return [];
  if (src.iata === dst.iata) return [];

  const seed = routeSeed(sourceCity, destination, direction);
  const dm1 = 70 + (seed % 140);
  const dm2 = dm1 + 15 + (seed % 35);
  const dm3 = dm1 + 35 + (seed % 45);
  const p1 = 3400 + (seed % 6200);
  const p2 = Math.max(2200, p1 - 500 + (seed % 400));
  const p3 = p1 + 400 + (seed % 900);

  const d1 = `${String(6 + (seed % 11)).padStart(2, "0")}:${String(10 + (seed % 35)).padStart(2, "0")}`;
  const d2 = `${String(9 + (seed % 8)).padStart(2, "0")}:${String(20 + (seed % 25)).padStart(2, "0")}`;
  const d3 = `${String(15 + (seed % 5)).padStart(2, "0")}:${String(5 + (seed % 40)).padStart(2, "0")}`;

  const prefix =
    direction === "outbound"
      ? `cur-${src.iata.toLowerCase()}-${dst.iata.toLowerCase()}`
      : `cur-${dst.iata.toLowerCase()}-${src.iata.toLowerCase()}`;

  const mk = (
    idx: number,
    depart: string,
    dm: number,
    price: number,
    tag: string,
    label: string,
  ): FlightOption => ({
    id: `${prefix}-${idx}`,
    label,
    departTime: depart,
    arriveTime: addMinutes(depart, dm),
    duration: formatDur(dm),
    durationMinutes: dm,
    price,
    tag,
    reason: "Nonstop route — curated fallback when live search has no direct result.",
  });

  return [
    mk(1, d1, dm1, p1, "Best value", "Morning nonstop"),
    mk(2, d2, dm2, p2, "Cheapest", "Midday nonstop"),
    mk(3, d3, dm3, p3, "Fastest", "Evening nonstop"),
  ];
}

/** For tests / sanity: every source has options to every destination (distinct IATA). */
export function assertAllRoutesHaveDirectCurated(): void {
  for (const dest of Object.keys(destinationAirports) as DestinationSlug[]) {
    for (const city of sourceCities) {
      const o = curatedDirectFlightsForRoute(city, dest, "outbound");
      const r = curatedDirectFlightsForRoute(city, dest, "return");
      const same = sourceAirports[city].iata === destinationAirports[dest].iata;
      if (!same && (o.length === 0 || r.length === 0)) {
        throw new Error(`Missing curated direct flights: ${city} → ${dest}`);
      }
    }
  }
}
