import { destinationAirports, sourceAirports } from "@/lib/geo";
import type { TripBasics } from "@/lib/types";

/** Skyscanner India expects YYMMDD. */
function toSkyscannerDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return "010101";
  const yy = String(y).slice(-2);
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function returnDateIso(startDate: string, days: number): string {
  const d = new Date(startDate + "T12:00:00");
  d.setDate(d.getDate() + days - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Round-trip flight search on Skyscanner India (reliable deep link).
 */
export function skyscannerRoundTripFlightsUrl(basics: TripBasics): string {
  const src = sourceAirports[basics.sourceCity];
  const dst = destinationAirports[basics.destination];
  const o = src.iata.toLowerCase();
  const dest = dst.iata.toLowerCase();
  const out = toSkyscannerDate(basics.startDate);
  const ret = toSkyscannerDate(returnDateIso(basics.startDate, basics.days));
  const base = `https://www.skyscanner.co.in/transport/flights/${o}/${dest}/${out}/${ret}/`;
  const q = new URLSearchParams();
  q.set("adultsv", String(Math.max(1, basics.travelers)));
  return `${base}?${q.toString()}`;
}

/**
 * Google Flights search query (opens in browser; format may change over time).
 */
export function googleFlightsRoundTripSearchUrl(basics: TripBasics): string {
  const src = sourceAirports[basics.sourceCity];
  const dst = destinationAirports[basics.destination];
  const ret = returnDateIso(basics.startDate, basics.days);
  const q = `Flights from ${src.iata} to ${dst.iata} ${basics.startDate} to ${ret}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

export function isLikelyBookableHotelUrl(url: string | undefined): boolean {
  if (!url || !url.startsWith("http")) return false;
  try {
    const h = new URL(url).hostname;
    return (
      h.includes("tripadvisor") ||
      h.includes("booking.com") ||
      h.includes("agoda") ||
      h.includes("expedia")
    );
  } catch {
    return false;
  }
}
