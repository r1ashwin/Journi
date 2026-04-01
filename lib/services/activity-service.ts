import { supplementalActivitiesForDestination } from "@/lib/activity-supplements";
import { destinations } from "@/lib/travel-data";
import type { ActivityOption, DestinationSlug } from "@/lib/types";

export type SearchActivitiesParams = {
  destination: DestinationSlug;
};

/** Base catalog + supplemental ideas for longer, realistic trip planning. */
export function mergeDestinationActivities(
  slug: DestinationSlug,
  base: ActivityOption[],
): ActivityOption[] {
  const extra = supplementalActivitiesForDestination(slug);
  const seen = new Set<string>();
  const out: ActivityOption[] = [];
  for (const a of [...base, ...extra]) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    out.push(a);
  }
  return out;
}

export function getActivitiesForDestination(slug: DestinationSlug): ActivityOption[] {
  const dest = destinations[slug];
  if (!dest) return [];
  return mergeDestinationActivities(slug, dest.activities);
}

/**
 * Deep link to find bookable tours (Thrillophilia and similar) — we do not
 * scrape these sites; listings stay curated locally with fair-market hints.
 */
export function activityExploreSearchUrl(
  destinationName: string,
  activityName: string,
): string {
  const q = `${activityName} ${destinationName} tour packages thrillophilia`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export function enrichActivitiesWithExploreLinks(
  slug: DestinationSlug,
  activities: ActivityOption[],
): ActivityOption[] {
  const dest = destinations[slug];
  if (!dest) return activities;
  const name = dest.name;
  return activities.map((a) => ({
    ...a,
    exploreUrl: activityExploreSearchUrl(name, a.name),
  }));
}

/**
 * Returns curated activities for a destination. These are real places and
 * experiences with fair-market pricing — enriched with outbound “find tours”
 * links; no live scrape of marketplaces.
 */
export function searchActivities(
  params: SearchActivitiesParams,
): { activities: ActivityOption[]; source: "curated" } {
  const dest = destinations[params.destination];
  if (!dest) throw new Error("Unknown destination");

  const merged = mergeDestinationActivities(params.destination, dest.activities);
  const activities = enrichActivitiesWithExploreLinks(
    params.destination,
    merged,
  );

  return { activities, source: "curated" };
}
