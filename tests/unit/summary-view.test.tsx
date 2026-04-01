import { render, screen } from "@testing-library/react";
import { SummaryView } from "@/components/planner/summary-view";
import type { SummaryPlan } from "@/lib/types";

describe("SummaryView", () => {
  const plan: SummaryPlan = {
    basics: {
      sourceCity: "Bengaluru",
      destination: "goa",
      startDate: "2026-05-12",
      days: 4,
      budget: 30000,
      travelers: 2,
      style: "Relaxed",
    },
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
      id: "xfer",
      label: "Airport to Candolim cab",
      duration: "47m",
      durationMinutes: 47,
      cost: 950,
      reason: "40 km drive.",
    },
    activities: [
      {
        id: "goa-act-1",
        name: "Beach day",
        description: "A light day.",
        duration: "5h",
        durationMinutes: 300,
        cost: 1800,
        tag: "Popular",
      },
    ],
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
    total: 24550,
    perPerson: 12275,
    totalDurationMinutes: 517,
  };

  it("renders the plan header", () => {
    render(<SummaryView plan={plan} />);
    expect(screen.getByText("Your trip")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Bengaluru.*Goa/i }),
    ).toBeInTheDocument();
  });

  it("shows metrics", () => {
    render(<SummaryView plan={plan} />);
    expect(screen.getByText("Total cost")).toBeInTheDocument();
    expect(screen.getByText("Per person")).toBeInTheDocument();
  });

  it("lists outbound, return, stay, and transfer", () => {
    render(<SummaryView plan={plan} />);
    expect(screen.getByText("Outbound flight")).toBeInTheDocument();
    expect(screen.getByText("Return flight")).toBeInTheDocument();
    expect(screen.getByText("Accommodation")).toBeInTheDocument();
    expect(screen.getByText("Transfer")).toBeInTheDocument();
  });

  it("renders activities section", () => {
    render(<SummaryView plan={plan} />);
    expect(screen.getByText("Activities")).toBeInTheDocument();
    expect(screen.getByText("Beach day")).toBeInTheDocument();
  });
});
