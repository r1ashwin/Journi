import { findNearestArea } from "@/lib/geo";
import { tripAdvisorKeys } from "@/lib/geo";
import type { DestinationSlug, StayOption } from "@/lib/types";

const XOTELO_BASE = "https://data.xotelo.com/api";
const USD_TO_INR = 84;

type XoteloHotel = {
  name: string;
  key: string;
  accommodation_type: string;
  url: string;
  review_summary: { rating: number; count: number };
  price_ranges: { minimum: number; maximum: number };
  geo: { latitude: number; longitude: number };
  image: string;
  mentions: string[];
  merchandising_labels: string[];
};

type XoteloListResponse = {
  error: string | null;
  result: { total_count: number; list: XoteloHotel[] };
};

type XoteloRate = { code: string; name: string; rate: number; tax?: number };

type XoteloRatesResponse = {
  error: string | null;
  result: { rates: XoteloRate[] };
};

export type SearchHotelsParams = {
  destination: DestinationSlug;
  checkIn: string;
  checkOut: string;
  adults: number;
};

export async function searchHotels(
  params: SearchHotelsParams,
): Promise<{ stays: StayOption[]; source: "xotelo" }> {
  const locationKey = tripAdvisorKeys[params.destination];
  if (!locationKey) throw new Error("Unknown destination");

  const listUrl =
    `${XOTELO_BASE}/list?location_key=${locationKey}&limit=10&sort=best_value`;
  const listRes = await fetch(listUrl);
  const listData: XoteloListResponse = await listRes.json();

  if (listData.error || !listData.result?.list?.length) {
    throw new Error("NO_HOTELS_FOUND");
  }

  const hotels = listData.result.list.slice(0, 5);
  const nights = daysBetween(params.checkIn, params.checkOut);

  const rateResults = await Promise.allSettled(
    hotels.map((hotel) => fetchRates(hotel.key, params.checkIn, params.checkOut)),
  );

  const stays: StayOption[] = hotels.map((hotel, idx) => {
    const rateResult = rateResults[idx];
    let nightlyPrice: number;

    if (rateResult.status === "fulfilled" && rateResult.value > 0) {
      nightlyPrice = rateResult.value;
    } else {
      nightlyPrice = Math.round(hotel.price_ranges.minimum * USD_TO_INR);
    }

    const area = findNearestArea(
      params.destination,
      hotel.geo.latitude,
      hotel.geo.longitude,
    );

    return {
      id: `htl-${hotel.key}`,
      name: hotel.name,
      area,
      nightlyPrice,
      tag: deriveTag(hotel, idx, hotels),
      reason: buildReason(hotel, area),
      image: hotel.image || undefined,
      bookingUrl: hotel.url || undefined,
      rating: hotel.review_summary.rating,
    };
  });

  return { stays, source: "xotelo" };
}

async function fetchRates(
  hotelKey: string,
  checkIn: string,
  checkOut: string,
): Promise<number> {
  const url =
    `${XOTELO_BASE}/rates?hotel_key=${hotelKey}&chk_in=${checkIn}&chk_out=${checkOut}&currency=INR`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const data: XoteloRatesResponse = await res.json();
    clearTimeout(timeout);

    if (data.error || !data.result?.rates?.length) return 0;

    const cheapest = Math.min(...data.result.rates.map((r) => r.rate));
    return Math.round(cheapest);
  } catch {
    clearTimeout(timeout);
    return 0;
  }
}

function deriveTag(
  hotel: XoteloHotel,
  idx: number,
  all: XoteloHotel[],
): string {
  const rating = hotel.review_summary.rating;
  const prices = all.map((h) => h.price_ranges.minimum);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (rating >= 4.7) return "Top rated";
  if (hotel.price_ranges.minimum === minPrice) return "Budget friendly";
  if (hotel.price_ranges.minimum === maxPrice) return "Premium";
  if (idx === 0) return "Best value";
  return "Good option";
}

function buildReason(hotel: XoteloHotel, area: string): string {
  const rating = hotel.review_summary.rating;
  const reviews = hotel.review_summary.count;
  const parts: string[] = [];

  if (rating >= 4.5) parts.push(`Rated ${rating}★ by ${reviews.toLocaleString()} travelers`);
  else if (rating >= 4.0) parts.push(`${rating}★ from ${reviews.toLocaleString()} reviews`);
  else parts.push(`Located in ${area}`);

  if (hotel.merchandising_labels.length > 0) {
    parts.push(hotel.merchandising_labels[0].toLowerCase());
  }

  return parts.join(" · ") + ".";
}

function daysBetween(d1: string, d2: string): number {
  const ms = new Date(d2).getTime() - new Date(d1).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}
