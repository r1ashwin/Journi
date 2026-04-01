"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  BedDouble,
  Check,
  ExternalLink,
  Loader2,
  MapPin,
  Palmtree,
  Plane,
  PlaneLanding,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OptionCard } from "@/components/planner/option-card";
import { PlannerAtmosphere } from "@/components/planner/planner-atmosphere";
import { TripCanvas } from "@/components/planner/trip-canvas";
import { TripReadyShare } from "@/components/planner/trip-ready-share";
import {
  decodePlan,
  encodePlan,
  formatCurrency,
  getActivityOptions,
  getDestinationContent,
  getOutboundOptions,
  getReturnOptions,
  getStayOptions,
  seedActivityOptionsFromPlan,
  seedOutboundOptionsFromPlan,
  seedReturnOptionsFromPlan,
  seedStayOptionsFromPlan,
  selectionsFromSummaryPlan,
} from "@/lib/planner";
import { readPlannerDraft, writePlannerDraft } from "@/lib/planner-session";
import { ACTIVITY_LOADING_PHRASES } from "@/lib/activity-loading-phrases";
import {
  destinations,
  sourceCities,
  tripStyles,
} from "@/lib/travel-data";
import { enrichActivitiesWithExploreLinks } from "@/lib/services/activity-service";
import { useTimeOfDay, type TimeOfDayInfo } from "@/lib/use-time-of-day";
import type {
  ActivityOption,
  DestinationSlug,
  FlightOption,
  PlannerSelections,
  StayOption,
  SummaryPlan,
  TransferOption,
  TripBasics,
} from "@/lib/types";

type PlannerStep = "setup" | "outbound" | "stay" | "activities" | "return";

const allDestinations = Object.values(destinations);

const stepMeta: Record<
  Exclude<PlannerStep, "setup">,
  {
    number: number;
    label: string;
    short: string;
    Icon: typeof Plane;
  }
> = {
  outbound: {
    number: 1,
    label: "Pick your outbound flight",
    short: "Outbound flight",
    Icon: Plane,
  },
  stay: {
    number: 2,
    label: "Choose where to stay",
    short: "Hotel",
    Icon: BedDouble,
  },
  activities: {
    number: 3,
    label: "Add activity picks",
    short: "Activities",
    Icon: Palmtree,
  },
  return: {
    number: 4,
    label: "Choose your return flight",
    short: "Return flight",
    Icon: PlaneLanding,
  },
};

import { destinationAirports, sourceAirports } from "@/lib/geo";

const destinationRegions: Record<DestinationSlug, string> = {
  goa: "Goa, India",
  jaipur: "Jaipur, Rajasthan, India",
  udaipur: "Udaipur, Rajasthan, India",
  rishikesh: "Rishikesh, Uttarakhand, India",
  varanasi: "Varanasi, Uttar Pradesh, India",
  andaman: "Port Blair, Andaman, India",
  darjeeling: "Darjeeling, West Bengal, India",
  leh: "Leh, Ladakh, India",
  amritsar: "Amritsar, Punjab, India",
  kozhikode: "Kozhikode, Kerala, India",
  chennai: "Chennai, Tamil Nadu, India",
  hyderabad: "Hyderabad, Telangana, India",
};

function getDefaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

function getReturnDate(startDate: string, days: number) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + days - 1);
  return d.toISOString().slice(0, 10);
}

function googleMapsUrl(place: string, slug: DestinationSlug) {
  const { cityLat, cityLng } = destinationAirports[slug];
  const region = destinationRegions[slug];
  const query = `${place}, ${region}`;
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${cityLat},${cityLng},13z`;
}

function destinationFromQueryParam(raw: string | undefined): DestinationSlug | null {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  return slug in destinations ? (slug as DestinationSlug) : null;
}

export function PlannerApp({
  initialDest,
  initialResumePlan = null,
}: {
  initialDest?: string;
  initialResumePlan?: SummaryPlan | null;
}) {
  const preset = destinationFromQueryParam(initialDest);
  const resume = initialResumePlan ?? null;
  const fromUrlResume = initialResumePlan != null;
  const [sessionBoot, setSessionBoot] = useState(fromUrlResume);

  const [basics, setBasics] = useState<TripBasics>(() =>
    resume
      ? resume.basics
      : {
          sourceCity: "Bengaluru",
          destination: preset ?? "goa",
          startDate: getDefaultDate(),
          days: 4,
          budget: 30000,
          travelers: 2,
          style: "Relaxed",
        },
  );
  const [started, setStarted] = useState(() => !!resume);
  const [setupPhase, setSetupPhase] = useState<"destination" | "details">(() =>
    resume || preset ? "details" : "destination",
  );
  /** Grid checkmarks only when non-null (not the implicit TripBasics default). */
  const [setupDestinationSelection, setSetupDestinationSelection] =
    useState<DestinationSlug | null>(() =>
      resume ? resume.basics.destination : null,
    );
  const [currentStep, setCurrentStep] = useState<PlannerStep>(() =>
    resume ? "return" : "setup",
  );
  const [copied, setCopied] = useState(false);
  const [selections, setSelections] = useState<PlannerSelections>(() =>
    resume ? selectionsFromSummaryPlan(resume) : { activityIds: [] },
  );

  // Dynamic options from APIs (seed from summary when resuming)
  const [outboundOptions, setOutboundOptions] = useState<FlightOption[]>(() =>
    resume ? seedOutboundOptionsFromPlan(resume.basics, resume.outbound) : [],
  );
  const [stayOptions, setStayOptions] = useState<StayOption[]>(() =>
    resume ? seedStayOptionsFromPlan(resume.basics, resume.stay) : [],
  );
  const [activityOptions, setActivityOptions] = useState<ActivityOption[]>(() =>
    resume
      ? enrichActivitiesWithExploreLinks(
          resume.basics.destination,
          seedActivityOptionsFromPlan(resume.basics, resume.activities),
        )
      : [],
  );
  const [returnOptions, setReturnOptions] = useState<FlightOption[]>(() =>
    resume ? seedReturnOptionsFromPlan(resume.basics, resume.returnFlight) : [],
  );
  const [currentTransfer, setCurrentTransfer] = useState<
    TransferOption | undefined
  >(() => resume?.transfer);

  // Loading
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [activityLoadPhraseIdx, setActivityLoadPhraseIdx] = useState(0);

  const timeOfDay = useTimeOfDay();
  const maxActivitySelections = useMemo(
    () => Math.min(12, Math.max(4, basics.days)),
    [basics.days],
  );
  const hotelNights = Math.max(basics.days - 1, 0);

  const destination = getDestinationContent(basics.destination);

  /** No flying to the same airport you depart from (e.g. Chennai → Chennai). */
  const plannerDestinationChoices = useMemo(
    () =>
      allDestinations.filter(
        (d) =>
          sourceAirports[basics.sourceCity].iata !==
          destinationAirports[d.slug].iata,
      ),
    [basics.sourceCity],
  );

  function shell(node: ReactNode) {
    return <PlannerAtmosphere>{node}</PlannerAtmosphere>;
  }

  useEffect(() => {
    if (!started && setupPhase === "details") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [started, setupPhase]);

  /** Browser Back/Forward restores planner step (setup + flight flow). */
  type PlannerHistoryState = {
    journi: 1;
    started: boolean;
    setupPhase: "destination" | "details";
    currentStep: PlannerStep;
  };

  const isPopNavigation = useRef(false);
  const historySeeded = useRef(false);

  useLayoutEffect(() => {
    if (fromUrlResume) return;
    // Home / marketing `?dest=` is an explicit pick — do not overwrite with session draft.
    if (preset) {
      setSessionBoot(true);
      return;
    }
    try {
      const draft = readPlannerDraft();
      if (draft?.token) {
        const plan = decodePlan(draft.token);
        if (plan?.basics?.destination) {
          setBasics(plan.basics);
          setStarted(draft.started);
          setSetupPhase(draft.setupPhase);
          setSetupDestinationSelection(
            draft.setupPhase === "destination" ? null : plan.basics.destination,
          );
          setCurrentStep(draft.currentStep);
          setSelections(selectionsFromSummaryPlan(plan));
          setOutboundOptions(
            seedOutboundOptionsFromPlan(plan.basics, plan.outbound),
          );
          setStayOptions(seedStayOptionsFromPlan(plan.basics, plan.stay));
          setActivityOptions(
            enrichActivitiesWithExploreLinks(
              plan.basics.destination,
              seedActivityOptionsFromPlan(plan.basics, plan.activities),
            ),
          );
          setReturnOptions(
            seedReturnOptionsFromPlan(plan.basics, plan.returnFlight),
          );
          setCurrentTransfer(plan.transfer);
          historySeeded.current = false;
        }
      }
    } finally {
      setSessionBoot(true);
    }
  }, [fromUrlResume, preset]);

  /** Destination grid: never show a checkmark until the user taps (incl. session restore + Back). */
  useLayoutEffect(() => {
    if (setupPhase !== "destination") return;
    setSetupDestinationSelection(null);
  }, [setupPhase]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const s = e.state as PlannerHistoryState | null;
      if (!s || s.journi !== 1) return;
      isPopNavigation.current = true;
      setStarted(s.started);
      setSetupPhase(s.setupPhase);
      setCurrentStep(s.currentStep);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionBoot) return;
    if (isPopNavigation.current) {
      isPopNavigation.current = false;
      return;
    }
    const snap: PlannerHistoryState = {
      journi: 1,
      started,
      setupPhase,
      currentStep,
    };
    const url = window.location.pathname + window.location.search;
    if (!historySeeded.current) {
      historySeeded.current = true;
      window.history.replaceState(snap, "", url);
      return;
    }
    window.history.pushState(snap, "", url);
  }, [sessionBoot, started, setupPhase, currentStep]);

  // --- Data fetching ---

  const fetchFlights = useCallback(
    async (direction: "outbound" | "return") => {
      setLoading(true);
      setLoadingMsg(
        direction === "outbound"
          ? "Searching flights…"
          : "Finding return flights…",
      );
      try {
        const date =
          direction === "outbound"
            ? basics.startDate
            : getReturnDate(basics.startDate, basics.days);
        const qs = new URLSearchParams({
          sourceCity: basics.sourceCity,
          destination: basics.destination,
          date,
          travelers: String(basics.travelers),
          direction,
        });
        const res = await fetch(`/api/flights?${qs}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.flights?.length) {
          if (direction === "outbound") setOutboundOptions(data.flights);
          else setReturnOptions(data.flights);
          return;
        }
        throw new Error("empty");
      } catch {
        // Fallback to curated
        if (direction === "outbound")
          setOutboundOptions(getOutboundOptions(basics));
        else setReturnOptions(getReturnOptions(basics));
      } finally {
        setLoading(false);
      }
    },
    [basics],
  );

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setLoadingMsg("Searching hotels and prices…");
    try {
      const checkOut = getReturnDate(basics.startDate, basics.days);
      const qs = new URLSearchParams({
        destination: basics.destination,
        checkIn: basics.startDate,
        checkOut,
        adults: String(basics.travelers),
      });
      const res = await fetch(`/api/hotels?${qs}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.stays?.length) {
        setStayOptions(data.stays);
        return;
      }
      throw new Error("empty");
    } catch {
      setStayOptions(getStayOptions(basics));
    } finally {
      setLoading(false);
    }
  }, [basics]);

  const fetchTransfer = useCallback(
    async (area: string) => {
      try {
        const qs = new URLSearchParams({
          destination: basics.destination,
          area,
        });
        const res = await fetch(`/api/transfers?${qs}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.transfer) {
          setCurrentTransfer(data.transfer);
          return;
        }
        throw new Error("empty");
      } catch {
        const dest = getDestinationContent(basics.destination);
        setCurrentTransfer(dest.transfers?.[area] ?? undefined);
      }
    },
    [basics.destination],
  );

  useEffect(() => {
    const stay = stayOptions.find((s) => s.id === selections.stayId);
    const area = stay?.area ?? resume?.stay?.area;
    if (!area) return;
    void fetchTransfer(area);
  }, [selections.stayId, stayOptions, resume?.stay?.area, fetchTransfer]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setLoadingMsg("Finding things to do…");
    try {
      const qs = new URLSearchParams({
        destination: basics.destination,
      });
      const res = await fetch(`/api/activities?${qs}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.activities?.length) {
        setActivityOptions(data.activities);
        return;
      }
      throw new Error("empty");
    } catch {
      setActivityOptions(
        enrichActivitiesWithExploreLinks(
          basics.destination,
          getActivityOptions(basics),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [basics]);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;

    async function load() {
      if (cancelled) return;
      if (currentStep === "outbound") {
        await fetchFlights("outbound");
      } else if (currentStep === "stay") {
        await fetchHotels();
      } else if (currentStep === "activities") {
        await fetchActivities();
      } else if (currentStep === "return") {
        await fetchFlights("return");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentStep, started, fetchFlights, fetchHotels, fetchActivities, basics]);

  useEffect(() => {
    if (!loading || currentStep !== "activities") return;
    setActivityLoadPhraseIdx(0);
    const id = setInterval(() => {
      setActivityLoadPhraseIdx(
        (i) => (i + 1) % ACTIVITY_LOADING_PHRASES.length,
      );
    }, 2200);
    return () => clearInterval(id);
  }, [loading, currentStep]);

  // --- Totals from dynamic data ---

  const totals = useMemo(() => {
    const outbound = outboundOptions.find(
      (f) => f.id === selections.outboundFlightId,
    );
    const stay = stayOptions.find((s) => s.id === selections.stayId);
    const returnFlight = returnOptions.find(
      (f) => f.id === selections.returnFlightId,
    );
    const selectedActivities = activityOptions.filter((a) =>
      selections.activityIds.includes(a.id),
    );

    const stayTotal = stay
      ? stay.nightlyPrice * Math.max(basics.days - 1, 1)
      : 0;
    const activityTotal = selectedActivities.reduce(
      (sum, a) => sum + a.cost,
      0,
    );
    const total =
      (outbound?.price ?? 0) +
      stayTotal +
      (currentTransfer?.cost ?? 0) +
      activityTotal +
      (returnFlight?.price ?? 0);
    const totalDurationMinutes =
      (outbound?.durationMinutes ?? 0) +
      (currentTransfer?.durationMinutes ?? 0) +
      selectedActivities.reduce((sum, a) => sum + a.durationMinutes, 0) +
      (returnFlight?.durationMinutes ?? 0);

    return {
      outbound,
      stay,
      transfer: currentTransfer,
      returnFlight,
      activities: selectedActivities,
      stayTotal,
      activityTotal,
      total,
      totalDurationMinutes,
      perPerson: Math.round(total / basics.travelers),
    };
  }, [
    outboundOptions,
    stayOptions,
    returnOptions,
    activityOptions,
    selections,
    basics,
    currentTransfer,
  ]);

  const currentSummaryPlan = useMemo(
    (): SummaryPlan => ({
      basics,
      outbound: totals.outbound,
      stay: totals.stay,
      stayTotal: totals.stayTotal,
      transfer: totals.transfer,
      activities: totals.activities,
      returnFlight: totals.returnFlight,
      total: totals.total,
      perPerson: totals.perPerson,
      totalDurationMinutes: totals.totalDurationMinutes,
    }),
    [basics, totals],
  );

  const persistPlannerDraftToStorage = useCallback(() => {
    writePlannerDraft({
      token: encodePlan(currentSummaryPlan),
      started,
      setupPhase,
      currentStep,
    });
  }, [currentSummaryPlan, started, setupPhase, currentStep]);

  useEffect(() => {
    if (!sessionBoot) return;
    persistPlannerDraftToStorage();
  }, [sessionBoot, persistPlannerDraftToStorage]);

  // --- Handlers ---

  function startPlanner() {
    setStarted(true);
    setCurrentStep("outbound");
  }

  function updateSelection(patch: Partial<PlannerSelections>) {
    setSelections((c) => ({ ...c, ...patch }));
  }

  async function handleStaySelection(stayId: string) {
    const stay = stayOptions.find((s) => s.id === stayId);
    updateSelection({ stayId });
    setCurrentStep("activities");
    if (stay?.area) {
      fetchTransfer(stay.area);
    }
  }

  function toggleActivity(activityId: string) {
    setSelections((c) => {
      if (c.activityIds.includes(activityId)) {
        return {
          ...c,
          activityIds: c.activityIds.filter((id) => id !== activityId),
        };
      }
      if (c.activityIds.length >= maxActivitySelections) return c;
      return { ...c, activityIds: [...c.activityIds, activityId] };
    });
  }

  function getShareUrl() {
    return `/summary?plan=${encodeURIComponent(encodePlan(currentSummaryPlan))}`;
  }

  async function copyShareLink() {
    persistPlannerDraftToStorage();
    const url = `${window.location.origin}${getShareUrl()}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // ============================
  // SETUP VIEW
  // ============================

  if (!started) {
    if (setupPhase === "destination") {
      return shell(
        <div className="min-h-screen px-5 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/"
                className="text-xl font-semibold tracking-tight md:text-2xl"
              >
                Journi
              </Link>
              <TimeOfDayChip info={timeOfDay} />
            </header>

            <div className="mt-6 md:mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Planner setup · Step 1 of 2
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Pick your destination
              </h1>
              <p className="mt-2 max-w-xl text-[15px] text-[var(--muted)]">
                Tap a place to continue — the next screen is your trip details
                and a live preview of your itinerary.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {plannerDestinationChoices.map((dest) => (
                  <button
                    key={dest.slug}
                    type="button"
                    onClick={() => {
                      setBasics((c) => ({ ...c, destination: dest.slug }));
                      setSetupDestinationSelection(dest.slug);
                      setSetupPhase("details");
                    }}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border transition-all duration-200",
                      setupDestinationSelection === dest.slug
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 shadow-md"
                        : "border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-sm",
                    )}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      {setupDestinationSelection === dest.slug && (
                        <div className="absolute top-2 right-2 rounded-full bg-[var(--accent)] p-1">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 p-2.5">
                        <h3 className="text-sm font-semibold text-white drop-shadow-sm">
                          {dest.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-white/80 line-clamp-1">
                          {dest.bestFor.split(",")[0]}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return shell(
      <div className="min-h-screen px-5 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight md:text-2xl"
            >
              Journi
            </Link>
            <TimeOfDayChip info={timeOfDay} />
          </header>

          <section className="mt-6 md:mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Planner setup · Step 2 of 2
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Your trip details
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-[var(--muted)]">
              Set how you&apos;re traveling on the left — your itinerary preview
              updates on the right.
            </p>
          </section>

          {/* Full-width: about the destination */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="relative min-h-[200px] w-full md:min-h-[240px]">
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1152px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
              <div className="absolute right-3 top-3 md:right-4 md:top-4">
                <button
                  type="button"
                  onClick={() => {
                    setSetupDestinationSelection(basics.destination);
                    setSetupPhase("destination");
                  }}
                  className="rounded-full border border-white/40 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/40 md:px-4 md:py-2 md:text-sm"
                >
                  Change destination
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 md:pr-44">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <Sparkles className="size-3" />
                  {destination.bestFor.split(",")[0]}
                </span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  {destination.name}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/90 md:text-[15px]">
                  {destination.summary}
                </p>
              </div>
            </div>
            <div className="border-t border-[var(--border)] p-4 md:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Notable spots · open in Maps
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {destination.famousPlaces.map((place) => (
                  <a
                    key={place}
                    href={googleMapsUrl(place, basics.destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/place inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-3 py-1.5 text-sm font-medium transition-all hover:border-[var(--accent)]/35 hover:bg-white hover:shadow-sm"
                  >
                    <MapPin className="size-3.5 shrink-0 text-[var(--accent)]" />
                    {place}
                    <ExternalLink className="size-3 text-[var(--muted)] opacity-60 transition-opacity group-hover/place:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Form (left) + trip preview (right) */}
          <section className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1fr_min(340px,100%)] lg:items-start lg:gap-8">
            <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-5 md:p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  Flying from, dates & budget
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSetupDestinationSelection(basics.destination);
                    setSetupPhase("destination");
                  }}
                  className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/30 hover:bg-white sm:hidden"
                >
                  Change destination
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Flying from">
                  <>
                    <select
                      value={basics.sourceCity}
                      onChange={(e) =>
                        setBasics((c) => ({
                          ...c,
                          sourceCity: e.target.value as TripBasics["sourceCity"],
                        }))
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
                    >
                      {sourceCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                      More departure cities coming soon.
                    </p>
                  </>
                </Field>

                <Field label="Start date">
                  <input
                    type="date"
                    value={basics.startDate}
                    onChange={(e) =>
                      setBasics((c) => ({ ...c, startDate: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
                  />
                </Field>

                <Field label="Trip length (days)">
                  <input
                    type="number"
                    min={2}
                    max={14}
                    value={basics.days}
                    onChange={(e) =>
                      setBasics((c) => ({
                        ...c,
                        days: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
                  />
                </Field>

                <Field label="Budget (₹)">
                  <input
                    type="number"
                    min={5000}
                    step={1000}
                    value={basics.budget}
                    onChange={(e) =>
                      setBasics((c) => ({
                        ...c,
                        budget: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
                  />
                </Field>

                <Field label="Travelers">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={basics.travelers}
                    onChange={(e) =>
                      setBasics((c) => ({
                        ...c,
                        travelers: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
                  />
                </Field>

                <Field label="Trip style">
                  <select
                    value={basics.style}
                    onChange={(e) =>
                      setBasics((c) => ({
                        ...c,
                        style: e.target.value as TripBasics["style"],
                      }))
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm transition-colors focus:border-[var(--accent)] focus:outline-none"
                  >
                    {tripStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <button
                type="button"
                onClick={startPlanner}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                Start planning
                <ArrowRight className="size-4" />
              </button>
            </div>

            <TripCanvas
              previewMode
              previewBasics={{
                budget: basics.budget,
                days: basics.days,
                travelers: basics.travelers,
                routeLabel: `${basics.sourceCity} → ${destination.name}`,
              }}
              tripNights={hotelNights}
              total={0}
              perPerson={0}
              totalMinutes={0}
              activities={[]}
              currentStep="outbound"
              onEdit={() => {}}
            />
          </section>
        </div>
      </div>
    );
  }

  // ============================
  // PLANNER VIEW
  // ============================

  const step = stepMeta[currentStep as Exclude<PlannerStep, "setup">];
  const StepIcon = step.Icon;

  return shell(
    <div className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Journi
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <TimeOfDayChip info={timeOfDay} />
            <div className="rounded-full bg-[var(--surface)] px-4 py-1.5 text-sm font-medium">
              {basics.sourceCity} → {destination.name}
            </div>
          </div>
        </header>

        {/* Famous spots — full width above the planner */}
        <section className="mt-5 rounded-2xl border border-[var(--border)] bg-white p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Notable spots · open in Maps
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {destination.famousPlaces.map((place) => (
              <a
                key={place}
                href={googleMapsUrl(place, basics.destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="group/place inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-3 py-1.5 text-sm font-medium transition-all hover:border-[var(--accent)]/35 hover:bg-white hover:shadow-sm"
              >
                <MapPin className="size-3.5 shrink-0 text-[var(--accent)]" />
                {place}
                <ExternalLink className="size-3 text-[var(--muted)] opacity-60 transition-opacity group-hover/place:opacity-100" />
              </a>
            ))}
          </div>
        </section>

        {/* Trip context: destination + your parameters */}
        <section className="mt-4 flex flex-col gap-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center sm:gap-4 md:p-5">
          <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl sm:h-16 sm:w-28">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 112px"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                <Sparkles className="size-3" />
                {destination.name}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {basics.sourceCity} → {destination.name}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] line-clamp-2 md:line-clamp-none">
              {destination.summary}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium">
              {basics.days} days
            </span>
            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium">
              {formatCurrency(basics.budget)}
            </span>
            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium">
              {basics.style}
            </span>
          </div>
        </section>

        {/* Two columns */}
        <section className="mt-5 grid gap-6 xl:grid-cols-[1fr_min(360px,100%)] xl:items-start">
          {/* Left — step options */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="border-b border-[var(--border)] bg-[var(--surface)]/45 px-4 py-4 sm:px-5 sm:py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[var(--border)]">
                      <StepIcon
                        className="size-5 text-[var(--accent)]"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        Step {step.number} of 4 · {step.short}
                      </p>
                      <h2 className="mt-0.5 text-lg font-semibold tracking-tight sm:text-xl">
                        {step.label}
                      </h2>
                    </div>
                  </div>
                  <p className="max-w-[14rem] text-right text-[11px] leading-snug text-[var(--muted)] sm:text-xs">
                    Tap one row. Your trip panel updates on the right.
                  </p>
                </div>
              </div>

              <div className="px-4 py-4 sm:px-5 sm:py-5">
                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-14">
                    <Loader2 className="size-7 animate-spin text-[var(--accent)]" />
                    <p className="mt-3 min-h-[3rem] max-w-sm text-center text-sm font-medium leading-relaxed text-[var(--muted)]">
                      {currentStep === "activities"
                        ? ACTIVITY_LOADING_PHRASES[activityLoadPhraseIdx]
                        : loadingMsg}
                    </p>
                  </div>
                )}

                {/* Options */}
                {!loading && (
                  <div
                    className={cn(
                      "flex flex-col",
                      currentStep === "stay"
                        ? "gap-4 lg:grid lg:grid-cols-2 lg:gap-4"
                        : "gap-3 sm:gap-4",
                    )}
                  >
                    {currentStep === "outbound" &&
                      outboundOptions.map((opt) => (
                        <OptionCard
                          key={opt.id}
                          title={opt.label}
                          subtitle={`${opt.departTime} → ${opt.arriveTime} · ${opt.duration}`}
                          price={opt.price}
                          tag={opt.tag}
                          reason={opt.reason}
                          selected={selections.outboundFlightId === opt.id}
                          onClick={() => {
                            updateSelection({ outboundFlightId: opt.id });
                            setCurrentStep("stay");
                          }}
                        />
                      ))}

                    {currentStep === "stay" &&
                      stayOptions.map((stay) => (
                        <OptionCard
                          key={stay.id}
                          title={stay.name}
                          subtitle={`${stay.area} · ${formatCurrency(stay.nightlyPrice)}/night`}
                          price={
                            stay.nightlyPrice * Math.max(basics.days - 1, 1)
                          }
                          tag={stay.tag}
                          reason={stay.reason}
                          selected={selections.stayId === stay.id}
                          onClick={() => handleStaySelection(stay.id)}
                          image={stay.image}
                          rating={stay.rating}
                        />
                      ))}

                    {currentStep === "activities" && (
                      <>
                        <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)]/25 px-3 py-2.5 text-xs leading-relaxed text-[var(--muted)] sm:text-[13px]">
                          Tour-style ideas. Tap a card to add; use the link under
                          a card to check live prices elsewhere.
                        </p>
                        <div className="flex flex-col gap-3 sm:gap-3.5">
                          {activityOptions.map((act) => (
                            <OptionCard
                              key={act.id}
                              title={act.name}
                              subtitle={`${act.duration} · ${formatCurrency(act.cost)}`}
                              price={act.cost}
                              tag={act.tag}
                              reason={act.description}
                              selected={selections.activityIds.includes(act.id)}
                              onClick={() => toggleActivity(act.id)}
                              footerLink={
                                act.exploreUrl
                                  ? {
                                      href: act.exploreUrl,
                                      label: "Find tours to book",
                                    }
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                        <div className="mt-1 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm leading-snug text-[var(--muted)]">
                            Up to {maxActivitySelections} picks for{" "}
                            {basics.days} days, or skip.
                          </p>
                          <button
                            type="button"
                            onClick={() => setCurrentStep("return")}
                            className="shrink-0 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                          >
                            Continue
                          </button>
                        </div>
                      </>
                    )}

                    {currentStep === "return" &&
                      returnOptions.map((opt) => (
                        <OptionCard
                          key={opt.id}
                          title={opt.label}
                          subtitle={`${opt.departTime} → ${opt.arriveTime} · ${opt.duration}`}
                          price={opt.price}
                          tag={opt.tag}
                          reason={opt.reason}
                          selected={selections.returnFlightId === opt.id}
                          onClick={() =>
                            updateSelection({ returnFlightId: opt.id })
                          }
                        />
                      ))}
                  </div>
                )}
                {!loading && selections.returnFlightId && (
                  <div className="mt-5 border-t border-[var(--border)] pt-5">
                    <TripReadyShare
                      summaryHref={getShareUrl()}
                      onBeforeViewSummary={persistPlannerDraftToStorage}
                      onCopyLink={() => void copyShareLink()}
                      copied={copied}
                      density="comfortable"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — canvas */}
          <div className="xl:sticky xl:top-5 xl:self-start">
            <TripCanvas
              total={totals.total}
              perPerson={totals.perPerson}
              totalMinutes={totals.totalDurationMinutes}
              outbound={totals.outbound}
              stay={totals.stay}
              transfer={totals.transfer}
              activities={totals.activities}
              returnFlight={totals.returnFlight}
              currentStep={currentStep as Exclude<PlannerStep, "setup">}
              onEdit={setCurrentStep}
              tripNights={hotelNights}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function TimeOfDayChip({ info }: { info: TimeOfDayInfo }) {
  const Icon = info.Icon;
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/95 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] shadow-sm backdrop-blur-sm"
      title="Local time at a glance."
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          info.phase === "morning" && "text-amber-500",
          info.phase === "afternoon" && "text-sky-500",
          info.phase === "evening" && "text-orange-500",
          info.phase === "night" && "text-indigo-500",
        )}
      />
      <span className="hidden sm:inline">{info.label}</span>
      <span className="tabular-nums font-medium text-[var(--muted)]">
        {info.clock}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
