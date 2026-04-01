import {
  buildShareQuery,
  calculatePlanTotals,
  calculateStayCost,
  decodePlan,
  encodePlan,
  parseShareQuery,
} from "@/lib/planner";
import type { PlannerSelections, SummaryPlan, TripBasics } from "@/lib/types";

describe("planner utilities", () => {
  const basics: TripBasics = {
    sourceCity: "Bengaluru",
    destination: "goa",
    startDate: "2026-05-12",
    days: 4,
    budget: 30000,
    travelers: 2,
    style: "Relaxed",
  };

  const selections: PlannerSelections = {
    outboundFlightId: "blr-goi-1",
    stayId: "goa-stay-1",
    transferId: "goa-transfer-candolim",
    activityIds: ["goa-act-1", "goa-act-2"],
    returnFlightId: "goi-blr-1",
  };

  it("calculates stay cost from nights", () => {
    expect(calculateStayCost(4200, 4)).toBe(12600);
  });

  it("calculates totals for a full plan", () => {
    const totals = calculatePlanTotals(basics, selections);

    expect(totals.total).toBe(4700 + 12600 + 1400 + 1800 + 2200 + 4500);
    expect(totals.perPerson).toBe(13600);
    expect(totals.activities).toHaveLength(2);
    expect(totals.transfer?.label).toContain("Candolim");
  });

  it("builds and parses a share query (legacy format)", () => {
    const query = buildShareQuery(basics, selections);
    const searchParams = Object.fromEntries(
      new URLSearchParams(query).entries(),
    );
    const parsed = parseShareQuery(searchParams);

    expect(parsed).not.toBeNull();
    expect(parsed?.basics.destination).toBe("goa");
    expect(parsed?.selections.activityIds).toEqual([
      "goa-act-1",
      "goa-act-2",
    ]);
  });

  it("returns null for incomplete share data", () => {
    expect(parseShareQuery({ destination: "goa" })).toBeNull();
  });

  it("encodes and decodes a SummaryPlan", () => {
    const plan: SummaryPlan = {
      basics,
      outbound: {
        id: "blr-goi-1",
        label: "Morning nonstop",
        departTime: "07:10",
        arriveTime: "08:35",
        duration: "1h 25m",
        durationMinutes: 85,
        price: 4700,
        tag: "Best value",
        reason: "Saves most of day one.",
      },
      stay: {
        id: "goa-stay-1",
        name: "Candolim Coast Stay",
        area: "Candolim",
        nightlyPrice: 4200,
        tag: "Best value",
        reason: "Balanced location.",
      },
      stayTotal: 12600,
      transfer: {
        id: "xfer-goa-candolim",
        label: "Airport to Candolim cab",
        duration: "47m",
        durationMinutes: 47,
        cost: 950,
        reason: "40 km drive from the airport.",
      },
      activities: [],
      returnFlight: {
        id: "goi-blr-1",
        label: "Late afternoon return",
        departTime: "16:30",
        arriveTime: "17:55",
        duration: "1h 25m",
        durationMinutes: 85,
        price: 4500,
        tag: "Best value",
        reason: "Good timing.",
      },
      total: 22750,
      perPerson: 11375,
      totalDurationMinutes: 217,
    };

    const encoded = encodePlan(plan);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodePlan(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.basics.destination).toBe("goa");
    expect(decoded!.total).toBe(22750);
    expect(decoded!.outbound?.label).toBe("Morning nonstop");
    expect(decoded!.stay?.name).toBe("Candolim Coast Stay");
    expect(decoded!.transfer?.durationMinutes).toBe(47);
  });

  it("decodePlan returns null for garbage input", () => {
    expect(decodePlan("not-valid-base64!!!")).toBeNull();
    expect(decodePlan("")).toBeNull();
  });
});
