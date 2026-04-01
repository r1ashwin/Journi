import type { DestinationSlug, SourceCity } from "@/lib/types";

type AirportInfo = { iata: string; lat: number; lng: number };

export const sourceAirports: Record<SourceCity, AirportInfo> = {
  Bengaluru: { iata: "BLR", lat: 13.1979, lng: 77.7063 },
  Mumbai: { iata: "BOM", lat: 19.0896, lng: 72.8656 },
  Delhi: { iata: "DEL", lat: 28.5562, lng: 77.1 },
  Chennai: { iata: "MAA", lat: 12.9941, lng: 80.1709 },
  Hyderabad: { iata: "HYD", lat: 17.2403, lng: 78.4294 },
  Kolkata: { iata: "CCU", lat: 22.6547, lng: 88.4467 },
  Pune: { iata: "PNQ", lat: 18.5822, lng: 73.9197 },
  Ahmedabad: { iata: "AMD", lat: 23.0772, lng: 72.6347 },
  Kochi: { iata: "COK", lat: 10.152, lng: 76.4019 },
  Lucknow: { iata: "LKO", lat: 26.7606, lng: 80.8893 },
  Chandigarh: { iata: "IXC", lat: 30.6735, lng: 76.7885 },
  Guwahati: { iata: "GAU", lat: 26.1061, lng: 91.5859 },
  Bhubaneswar: { iata: "BBI", lat: 20.2444, lng: 85.8178 },
  Indore: { iata: "IDR", lat: 22.7217, lng: 75.8011 },
  Coimbatore: { iata: "CJB", lat: 11.03, lng: 77.0434 },
};

export const destinationAirports: Record<
  DestinationSlug,
  AirportInfo & { cityLat: number; cityLng: number }
> = {
  goa: { iata: "GOI", lat: 15.3808, lng: 73.8314, cityLat: 15.2993, cityLng: 74.124 },
  jaipur: { iata: "JAI", lat: 26.8242, lng: 75.8122, cityLat: 26.9124, cityLng: 75.7873 },
  udaipur: { iata: "UDR", lat: 24.6177, lng: 73.8961, cityLat: 24.5854, cityLng: 73.7125 },
  rishikesh: { iata: "DED", lat: 30.1897, lng: 78.1803, cityLat: 30.0869, cityLng: 78.2676 },
  varanasi: { iata: "VNS", lat: 25.4524, lng: 82.8593, cityLat: 25.3176, cityLng: 83.0064 },
  andaman: { iata: "IXZ", lat: 11.641, lng: 92.7297, cityLat: 11.6234, cityLng: 92.7265 },
  darjeeling: { iata: "IXB", lat: 26.6812, lng: 88.3286, cityLat: 27.0361, cityLng: 88.2627 },
  leh: { iata: "IXL", lat: 34.1359, lng: 77.5465, cityLat: 34.1526, cityLng: 77.5771 },
  amritsar: { iata: "ATQ", lat: 31.7096, lng: 74.7973, cityLat: 31.634, cityLng: 74.8723 },
  kozhikode: { iata: "CCJ", lat: 11.1368, lng: 75.9553, cityLat: 11.2588, cityLng: 75.7804 },
  chennai: { iata: "MAA", lat: 12.9941, lng: 80.1709, cityLat: 13.0827, cityLng: 80.2707 },
  hyderabad: { iata: "HYD", lat: 17.2403, lng: 78.4294, cityLat: 17.385, cityLng: 78.4867 },
};

export const tripAdvisorKeys: Record<DestinationSlug, string> = {
  goa: "g303877",
  jaipur: "g304555",
  udaipur: "g297672",
  rishikesh: "g580106",
  varanasi: "g297685",
  andaman: "g297584",
  darjeeling: "g304557",
  leh: "g297625",
  amritsar: "g303884",
  kozhikode: "g297631",
  chennai: "g304556",
  hyderabad: "g297586",
};

export const areaCoordinates: Record<
  DestinationSlug,
  Record<string, { lat: number; lng: number }>
> = {
  goa: {
    Candolim: { lat: 15.5152, lng: 73.7622 },
    Anjuna: { lat: 15.5735, lng: 73.7422 },
    Colva: { lat: 15.2789, lng: 73.9119 },
  },
  jaipur: {
    "Bani Park": { lat: 26.935, lng: 75.785 },
    "Pink City": { lat: 26.926, lng: 75.8235 },
    "MI Road": { lat: 26.915, lng: 75.802 },
  },
  udaipur: {
    "Lal Ghat": { lat: 24.576, lng: 73.6825 },
    Ambamata: { lat: 24.59, lng: 73.705 },
  },
  rishikesh: {
    Tapovan: { lat: 30.1291, lng: 78.3127 },
    "Laxman Jhula": { lat: 30.1233, lng: 78.3251 },
    "Ram Jhula": { lat: 30.1055, lng: 78.3156 },
  },
  varanasi: {
    Assi: { lat: 25.2873, lng: 83.0066 },
    Dashashwamedh: { lat: 25.3109, lng: 83.0107 },
    Godowlia: { lat: 25.313, lng: 83.0087 },
  },
  andaman: {
    "Aberdeen Bazaar": { lat: 11.6652, lng: 92.7376 },
    Corbyn: { lat: 11.6437, lng: 92.7216 },
  },
  darjeeling: {
    "Mall Road": { lat: 27.0425, lng: 88.2627 },
    "Chowrasta": { lat: 27.0452, lng: 88.2674 },
  },
  leh: {
    "Main Bazaar": { lat: 34.163, lng: 77.585 },
    Changspa: { lat: 34.1685, lng: 77.5687 },
  },
  amritsar: {
    "Golden Temple": { lat: 31.62, lng: 74.8765 },
    "Lawrence Road": { lat: 31.6332, lng: 74.8651 },
  },
  kozhikode: {
    "Beach Road": { lat: 11.2588, lng: 75.7804 },
    "Mananchira": { lat: 11.25, lng: 75.78 },
    Beypore: { lat: 11.171, lng: 75.806 },
  },
  chennai: {
    "Marina & Mylapore": { lat: 13.0368, lng: 80.2676 },
    "T Nagar": { lat: 13.0418, lng: 80.2341 },
    ECR: { lat: 12.9147, lng: 80.251 },
  },
  hyderabad: {
    Banjara: { lat: 17.4065, lng: 78.4772 },
    "Old City": { lat: 17.3616, lng: 78.4747 },
    Hitech: { lat: 17.4474, lng: 78.3762 },
  },
};

export function findNearestArea(
  destination: DestinationSlug,
  lat: number,
  lng: number,
): string {
  const areas = areaCoordinates[destination];
  if (!areas) return "City center";

  let nearest = "City center";
  let minDist = Infinity;

  for (const [name, coords] of Object.entries(areas)) {
    const dist = Math.hypot(lat - coords.lat, lng - coords.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = name;
    }
  }

  return nearest;
}
