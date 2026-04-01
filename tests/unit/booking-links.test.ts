import {
  googleFlightsRoundTripSearchUrl,
  isLikelyBookableHotelUrl,
  skyscannerRoundTripFlightsUrl,
} from "@/lib/booking-links";
import type { TripBasics } from "@/lib/types";

const basics: TripBasics = {
  sourceCity: "Bengaluru",
  destination: "goa",
  startDate: "2026-06-01",
  days: 4,
  budget: 30000,
  travelers: 2,
  style: "Relaxed",
};

describe("booking-links", () => {
  it("builds Skyscanner round-trip URL with correct path and dates", () => {
    const u = skyscannerRoundTripFlightsUrl(basics);
    expect(u).toMatch(
      /^https:\/\/www\.skyscanner\.co\.in\/transport\/flights\/blr\/goi\/260601\/260604\/?/,
    );
    expect(u).toContain("adultsv=2");
  });

  it("builds Google Flights search URL with encoded query", () => {
    const u = new URL(googleFlightsRoundTripSearchUrl(basics));
    expect(u.hostname).toBe("www.google.com");
    expect(u.pathname).toContain("flights");
    const q = u.searchParams.get("q");
    expect(q).toBeTruthy();
    expect(q).toContain("BLR");
    expect(q).toContain("GOI");
  });

  it("detects bookable hotel URLs", () => {
    expect(
      isLikelyBookableHotelUrl("https://www.tripadvisor.com/Hotel_Review-g303877-d1.html"),
    ).toBe(true);
    expect(isLikelyBookableHotelUrl("https://example.com/hotel")).toBe(false);
    expect(isLikelyBookableHotelUrl(undefined)).toBe(false);
  });

  it("uses correct airports for Jaipur from Delhi", () => {
    const b: TripBasics = {
      ...basics,
      sourceCity: "Delhi",
      destination: "jaipur",
      startDate: "2026-08-01",
      days: 3,
    };
    const u = skyscannerRoundTripFlightsUrl(b);
    expect(u).toMatch(/\/flights\/del\/jai\/\d{6}\/\d{6}\//);
  });

  it("uses correct airports for Kozhikode from Delhi", () => {
    const b: TripBasics = {
      ...basics,
      sourceCity: "Delhi",
      destination: "kozhikode",
      startDate: "2026-09-01",
      days: 5,
    };
    const u = skyscannerRoundTripFlightsUrl(b);
    expect(u).toMatch(/\/flights\/del\/ccj\/\d{6}\/\d{6}\//);
  });
});
