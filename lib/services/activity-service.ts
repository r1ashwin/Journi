import { destinations } from "@/lib/travel-data";
import type { ActivityOption, DestinationSlug } from "@/lib/types";

export type SearchActivitiesParams = {
  destination: DestinationSlug;
};

/**
 * Returns curated activities for a destination. These are real places and
 * experiences with fair-market pricing — no external API needed.
 */
export function searchActivities(
  params: SearchActivitiesParams,
): { activities: ActivityOption[]; source: "curated" } {
  const dest = destinations[params.destination];
  if (!dest) throw new Error("Unknown destination");

  return { activities: dest.activities, source: "curated" };
}
