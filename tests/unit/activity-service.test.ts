import { describe, expect, it } from "vitest";
import {
  activityExploreSearchUrl,
  enrichActivitiesWithExploreLinks,
  searchActivities,
} from "@/lib/services/activity-service";
import type { ActivityOption } from "@/lib/types";

describe("activity-service", () => {
  it("searchActivities enriches with explore URLs", () => {
    const { activities, source } = searchActivities({ destination: "goa" });
    expect(source).toBe("curated");
    expect(activities.length).toBeGreaterThanOrEqual(7);
    for (const a of activities) {
      expect(a.exploreUrl).toBeDefined();
      expect(a.exploreUrl).toMatch(/^https:\/\/www\.google\.com\/search\?q=/);
    }
  });

  it("activityExploreSearchUrl encodes destination and activity", () => {
    const url = activityExploreSearchUrl("Goa", "Beach day");
    expect(url).toContain(encodeURIComponent("Beach day"));
    expect(url).toContain(encodeURIComponent("Goa"));
    expect(url).toContain("thrillophilia");
  });

  it("enrichActivitiesWithExploreLinks preserves ids", () => {
    const raw: ActivityOption[] = [
      {
        id: "x",
        name: "Test act",
        description: "d",
        duration: "1h",
        durationMinutes: 60,
        cost: 100,
        tag: "t",
      },
    ];
    const out = enrichActivitiesWithExploreLinks("goa", raw);
    expect(out[0].id).toBe("x");
    expect(out[0].exploreUrl).toBeDefined();
  });
});
