import { curatedDirectFlightsForRoute } from "@/lib/curated-direct-flights";
import { getActivitiesForDestination } from "@/lib/services/activity-service";
import { destinations } from "@/lib/travel-data";
import type {
  ActivityOption,
  DestinationContent,
  DestinationSlug,
  FlightOption,
  PlannerSelections,
  StayOption,
  SummaryPlan,
  TransferOption,
  TripBasics,
} from "@/lib/types";

export function getDestinationContent(destination: DestinationSlug): DestinationContent {
  return destinations[destination];
}

export function getOutboundOptions(basics: TripBasics): FlightOption[] {
  const dest = getDestinationContent(basics.destination);
  const specific = dest.outboundFlights?.[basics.sourceCity];
  if (specific && specific.length > 0) return specific;
  return curatedDirectFlightsForRoute(
    basics.sourceCity,
    basics.destination,
    "outbound",
  );
}

export function getReturnOptions(basics: TripBasics): FlightOption[] {
  const dest = getDestinationContent(basics.destination);
  const specific = dest.returnFlights?.[basics.sourceCity];
  if (specific && specific.length > 0) return specific;
  return curatedDirectFlightsForRoute(
    basics.sourceCity,
    basics.destination,
    "return",
  );
}

export function getStayOptions(basics: TripBasics): StayOption[] {
  return getDestinationContent(basics.destination).stays ?? [];
}

export function getActivityOptions(basics: TripBasics): ActivityOption[] {
  return getActivitiesForDestination(basics.destination);
}

export function findFlightById(
  basics: TripBasics,
  flightId?: string,
  direction: "outbound" | "return" = "outbound",
) {
  if (!flightId) return undefined;
  const options =
    direction === "outbound" ? getOutboundOptions(basics) : getReturnOptions(basics);

  return options.find((flight) => flight.id === flightId);
}

export function findStayById(basics: TripBasics, stayId?: string) {
  if (!stayId) return undefined;
  return getStayOptions(basics).find((stay) => stay.id === stayId);
}

export function findTransferForStay(basics: TripBasics, stayId?: string): TransferOption | undefined {
  const stay = findStayById(basics, stayId);
  if (!stay) return undefined;
  return getDestinationContent(basics.destination).transfers?.[stay.area];
}

export function getActivitySelections(
  basics: TripBasics,
  activityIds: string[],
): ActivityOption[] {
  const options = getActivityOptions(basics);
  return activityIds
    .map((activityId) => options.find((activity) => activity.id === activityId))
    .filter(Boolean) as ActivityOption[];
}

export function calculateStayCost(nightlyPrice: number, days: number) {
  const nights = Math.max(days - 1, 1);
  return nightlyPrice * nights;
}

export function calculatePlanTotals(basics: TripBasics, selections: PlannerSelections) {
  const outbound = findFlightById(basics, selections.outboundFlightId, "outbound");
  const stay = findStayById(basics, selections.stayId);
  const transfer = findTransferForStay(basics, selections.stayId);
  const selectedTransfer =
    selections.transferId && transfer?.id === selections.transferId ? transfer : transfer;
  const returnFlight = findFlightById(basics, selections.returnFlightId, "return");
  const activities = getActivitySelections(basics, selections.activityIds);

  const stayTotal = stay ? calculateStayCost(stay.nightlyPrice, basics.days) : 0;
  const activityTotal = activities.reduce((total, activity) => total + activity.cost, 0);
  const total =
    (outbound?.price ?? 0) +
    stayTotal +
    (selectedTransfer?.cost ?? 0) +
    activityTotal +
    (returnFlight?.price ?? 0);

  const totalDurationMinutes =
    (outbound?.durationMinutes ?? 0) +
    (selectedTransfer?.durationMinutes ?? 0) +
    activities.reduce((sum, activity) => sum + activity.durationMinutes, 0) +
    (returnFlight?.durationMinutes ?? 0);

  return {
    outbound,
    stay,
    transfer: selectedTransfer,
    returnFlight,
    activities,
    stayTotal,
    activityTotal,
    total,
    totalDurationMinutes,
    perPerson: Math.round(total / basics.travelers),
  };
}

/** Rebuild planner selection IDs from a saved summary (resume / back from summary). */
export function selectionsFromSummaryPlan(plan: SummaryPlan): PlannerSelections {
  return {
    outboundFlightId: plan.outbound?.id,
    stayId: plan.stay?.id,
    transferId: plan.transfer?.id,
    returnFlightId: plan.returnFlight?.id,
    activityIds: plan.activities.map((a) => a.id),
  };
}

function mergeOptionById<T extends { id: string }>(extra: T | undefined, base: T[]): T[] {
  if (!extra) return base;
  if (base.some((x) => x.id === extra.id)) return base;
  return [extra, ...base];
}

/** Curated list + chosen row from summary so totals work before API refresh. */
export function seedOutboundOptionsFromPlan(
  basics: TripBasics,
  fromPlan?: FlightOption,
): FlightOption[] {
  return mergeOptionById(fromPlan, getOutboundOptions(basics));
}

export function seedReturnOptionsFromPlan(
  basics: TripBasics,
  fromPlan?: FlightOption,
): FlightOption[] {
  return mergeOptionById(fromPlan, getReturnOptions(basics));
}

export function seedStayOptionsFromPlan(basics: TripBasics, fromPlan?: StayOption): StayOption[] {
  return mergeOptionById(fromPlan, getStayOptions(basics));
}

export function seedActivityOptionsFromPlan(
  basics: TripBasics,
  fromPlanActivities: ActivityOption[],
): ActivityOption[] {
  const base = getActivityOptions(basics);
  const ids = new Set(base.map((a) => a.id));
  const extras = fromPlanActivities.filter((a) => !ids.has(a.id));
  return [...extras, ...base];
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) {
    return `${remaining}m`;
  }

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
}

export function buildShareQuery(basics: TripBasics, selections: PlannerSelections) {
  const params = new URLSearchParams({
    sourceCity: basics.sourceCity,
    destination: basics.destination,
    startDate: basics.startDate,
    days: String(basics.days),
    budget: String(basics.budget),
    travelers: String(basics.travelers),
    style: basics.style,
    outboundFlightId: selections.outboundFlightId ?? "",
    stayId: selections.stayId ?? "",
    transferId: selections.transferId ?? "",
    returnFlightId: selections.returnFlightId ?? "",
    activityIds: selections.activityIds.join(","),
  });

  return params.toString();
}

/**
 * URL-safe plan token (base64url: no + / = in the payload).
 * Standard base64 in query strings breaks when `+` is read as a space.
 */
export function encodePlan(plan: SummaryPlan): string {
  const json = JSON.stringify(plan);
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(json, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function padBase64(b64: string): string {
  const pad = b64.length % 4;
  return pad ? b64 + "=".repeat(4 - pad) : b64;
}

/** Next.js / Express sometimes pass duplicate keys as string[]. */
export function firstSearchParam(
  v: string | string[] | undefined,
): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export function decodePlan(encoded: string): SummaryPlan | null {
  if (!encoded?.trim()) return null;

  // Query parsers often turn base64 "+" into a literal space
  let s = encoded.trim().replace(/ /g, "+").replace(/[\n\r\t]/g, "");
  try {
    s = decodeURIComponent(s);
  } catch {
    /* already decoded or invalid % — try raw */
  }

  const tryParse = (b64: string): SummaryPlan | null => {
    try {
      let json: string;
      if (typeof Buffer !== "undefined") {
        json = Buffer.from(b64, "base64").toString("utf-8");
      } else {
        json = decodeURIComponent(escape(atob(b64)));
      }
      const plan = JSON.parse(json) as SummaryPlan;
      if (plan?.basics && typeof plan.basics.destination === "string") {
        return plan;
      }
    } catch {
      /* next */
    }
    return null;
  };

  const normalized = padBase64(s.replace(/-/g, "+").replace(/_/g, "/"));
  const fromUrl = tryParse(normalized);
  if (fromUrl) return fromUrl;

  if (typeof Buffer !== "undefined") {
    for (const fmt of ["base64url", "base64"] as const) {
      try {
        const json = Buffer.from(s, fmt).toString("utf-8");
        const plan = JSON.parse(json) as SummaryPlan;
        if (plan?.basics && typeof plan.basics.destination === "string") {
          return plan;
        }
      } catch {
        /* continue */
      }
    }
  }

  return tryParse(padBase64(s));
}

export function parseShareQuery(searchParams: Record<string, string | string[] | undefined>) {
  const destination = searchParams.destination;
  const sourceCity = searchParams.sourceCity;
  const startDate = searchParams.startDate;
  const days = searchParams.days;
  const budget = searchParams.budget;
  const travelers = searchParams.travelers;
  const style = searchParams.style;

  if (
    typeof destination !== "string" ||
    typeof sourceCity !== "string" ||
    typeof startDate !== "string" ||
    typeof days !== "string" ||
    typeof budget !== "string" ||
    typeof travelers !== "string" ||
    typeof style !== "string"
  ) {
    return null;
  }

  if (!(destination in destinations)) {
    return null;
  }

  const basics: TripBasics = {
    destination: destination as DestinationSlug,
    sourceCity: sourceCity as TripBasics["sourceCity"],
    startDate,
    days: Number(days),
    budget: Number(budget),
    travelers: Number(travelers),
    style: style as TripBasics["style"],
  };

  const activityIds =
    typeof searchParams.activityIds === "string" && searchParams.activityIds.length > 0
      ? searchParams.activityIds.split(",")
      : [];

  const selections: PlannerSelections = {
    outboundFlightId:
      typeof searchParams.outboundFlightId === "string" && searchParams.outboundFlightId.length > 0
        ? searchParams.outboundFlightId
        : undefined,
    stayId: typeof searchParams.stayId === "string" && searchParams.stayId.length > 0
      ? searchParams.stayId
      : undefined,
    transferId:
      typeof searchParams.transferId === "string" && searchParams.transferId.length > 0
        ? searchParams.transferId
        : undefined,
    returnFlightId:
      typeof searchParams.returnFlightId === "string" && searchParams.returnFlightId.length > 0
        ? searchParams.returnFlightId
        : undefined,
    activityIds,
  };

  return { basics, selections };
}
