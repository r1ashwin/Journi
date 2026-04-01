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
  return getDestinationContent(basics.destination).outboundFlights?.[basics.sourceCity] ?? [];
}

export function getReturnOptions(basics: TripBasics): FlightOption[] {
  return getDestinationContent(basics.destination).returnFlights?.[basics.sourceCity] ?? [];
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

/** Share links must work in the browser (no `base64url` in client Buffer). */
export function encodePlan(plan: SummaryPlan): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(plan))));
}

export function decodePlan(encoded: string): SummaryPlan | null {
  if (typeof Buffer !== "undefined") {
    for (const fmt of ["base64url", "base64"] as const) {
      try {
        const json = Buffer.from(encoded, fmt).toString("utf-8");
        return JSON.parse(json) as SummaryPlan;
      } catch {
        /* try next format (legacy btoa links vs encodePlan) */
      }
    }
    return null;
  }
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as SummaryPlan;
  } catch {
    return null;
  }
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
