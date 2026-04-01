import * as ignav from "./ignav-client";
import { sourceAirports, destinationAirports } from "@/lib/geo";
import type { DestinationSlug, FlightOption, SourceCity } from "@/lib/types";

type IgnavSegment = {
  marketing_carrier_code: string;
  flight_number: string;
  operating_carrier_name: string;
  departure_airport: string;
  departure_time_local: string;
  arrival_airport: string;
  arrival_time_local: string;
  duration_minutes: number;
  aircraft: string;
};

type IgnavItinerary = {
  price: { amount: number; currency: string };
  outbound: {
    carrier: string;
    duration_minutes: number;
    segments: IgnavSegment[];
  };
  cabin_class: string;
  ignav_id: string;
};

type IgnavResponse = {
  origin: string;
  destination: string;
  departure_date: string;
  itineraries: IgnavItinerary[];
};

const INR_RATES: Record<string, number> = {
  INR: 1,
  USD: 84,
  EUR: 92,
  GBP: 106,
};

export type SearchFlightsParams = {
  sourceCity: SourceCity;
  destination: DestinationSlug;
  date: string;
  travelers: number;
  direction: "outbound" | "return";
};

export async function searchFlights(
  params: SearchFlightsParams,
): Promise<{ flights: FlightOption[]; source: "ignav" }> {
  const source = sourceAirports[params.sourceCity];
  const dest = destinationAirports[params.destination];
  if (!source || !dest) throw new Error("Unknown city or destination");

  const origin = params.direction === "outbound" ? source.iata : dest.iata;
  const arrival = params.direction === "outbound" ? dest.iata : source.iata;

  const data = await ignav.post<IgnavResponse>("/fares/one-way", {
    origin,
    destination: arrival,
    departure_date: params.date,
  });

  const raw = data.itineraries ?? [];
  const itineraries = raw.filter((i) => i.outbound.segments.length === 1);
  if (itineraries.length === 0) throw new Error("NO_FLIGHTS_FOUND");

  const flights: FlightOption[] = itineraries
    .slice(0, 6)
    .map((itin, idx) => mapItinerary(itin, idx, itineraries));

  return { flights, source: "ignav" };
}

function mapItinerary(
  itin: IgnavItinerary,
  idx: number,
  all: IgnavItinerary[],
): FlightOption {
  const ob = itin.outbound;
  const first = ob.segments[0];
  const last = ob.segments[ob.segments.length - 1];
  const stops = ob.segments.length - 1;

  const departTime = first.departure_time_local.slice(11, 16);
  const arriveTime = last.arrival_time_local.slice(11, 16);

  const rate = INR_RATES[itin.price.currency] ?? INR_RATES.USD;
  const price = Math.round(itin.price.amount * rate);

  const hour = parseInt(departTime.split(":")[0], 10);
  const timeOfDay =
    hour < 6
      ? "Red-eye"
      : hour < 12
        ? "Morning"
        : hour < 17
          ? "Afternoon"
          : hour < 21
            ? "Evening"
            : "Night";

  const stopLabel = stops === 0 ? "nonstop" : `${stops}-stop`;
  const label = `${ob.carrier} · ${timeOfDay} ${stopLabel}`;

  return {
    id: `fl-${itin.ignav_id.slice(0, 12)}`,
    label,
    departTime,
    arriveTime,
    duration: fmtMin(ob.duration_minutes),
    durationMinutes: ob.duration_minutes,
    price,
    tag: deriveTag(price, ob.duration_minutes, stops, idx, all),
    reason: deriveReason(timeOfDay, stops),
  };
}

function deriveTag(
  price: number,
  duration: number,
  stops: number,
  idx: number,
  all: IgnavItinerary[],
): string {
  const prices = all.map((i) => {
    const r = INR_RATES[i.price.currency] ?? INR_RATES.USD;
    return Math.round(i.price.amount * r);
  });
  const durations = all.map((i) => i.outbound.duration_minutes);

  if (price === Math.min(...prices)) return "Cheapest";
  if (duration === Math.min(...durations)) return "Fastest";
  if (stops === 0 && all.some((i) => i.outbound.segments.length > 1))
    return "Nonstop";
  if (idx === 0) return "Best value";
  return "Good option";
}

function deriveReason(timeOfDay: string, stops: number): string {
  if (stops === 0 && timeOfDay === "Morning")
    return "Direct morning flight — arrive early and enjoy the full day.";
  if (stops === 0) return "Direct flight with no layovers.";
  if (timeOfDay === "Morning")
    return "Early departure to make the most of your first day.";
  if (timeOfDay === "Evening")
    return "Relaxed evening departure after a full day.";
  return "Balanced option for timing and price.";
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
