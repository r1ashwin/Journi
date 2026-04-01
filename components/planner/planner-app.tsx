"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OptionCard } from "@/components/planner/option-card";
import { TripCanvas } from "@/components/planner/trip-canvas";
import {
  formatCurrency,
  getActivityOptions,
  getDestinationContent,
  getOutboundOptions,
  getReturnOptions,
  getStayOptions,
} from "@/lib/planner";
import { sourceCities, tripStyles } from "@/lib/travel-data";
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

import { destinations } from "@/lib/travel-data";
const allDestinations = Object.values(destinations);

const stepMeta: Record<
  Exclude<PlannerStep, "setup">,
  { number: number; label: string }
> = {
  outbound: { number: 1, label: "Pick your outbound flight" },
  stay: { number: 2, label: "Choose where to stay" },
  activities: { number: 3, label: "Add activity picks" },
  return: { number: 4, label: "Choose your return flight" },
};

import { destinationAirports } from "@/lib/geo";

const destinationRegions: Record<DestinationSlug, string> = {
  goa: "Goa, India",
  jaipur: "Jaipur, Rajasthan, India",
  udaipur: "Udaipur, Rajasthan, India",
  manali: "Manali, Himachal Pradesh, India",
  rishikesh: "Rishikesh, Uttarakhand, India",
  varanasi: "Varanasi, Uttar Pradesh, India",
  andaman: "Port Blair, Andaman, India",
  shimla: "Shimla, Himachal Pradesh, India",
  darjeeling: "Darjeeling, West Bengal, India",
  pondicherry: "Pondicherry, India",
  leh: "Leh, Ladakh, India",
  amritsar: "Amritsar, Punjab, India",
  munnar: "Munnar, Kerala, India",
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

export function PlannerApp() {
  const [basics, setBasics] = useState<TripBasics>({
    sourceCity: "Bengaluru",
    destination: "goa",
    startDate: getDefaultDate(),
    days: 4,
    budget: 30000,
    travelers: 2,
    style: "Relaxed",
  });
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<PlannerStep>("setup");
  const [copied, setCopied] = useState(false);
  const [selections, setSelections] = useState<PlannerSelections>({
    activityIds: [],
  });

  // Dynamic options from APIs
  const [outboundOptions, setOutboundOptions] = useState<FlightOption[]>([]);
  const [stayOptions, setStayOptions] = useState<StayOption[]>([]);
  const [activityOptions, setActivityOptions] = useState<ActivityOption[]>([]);
  const [returnOptions, setReturnOptions] = useState<FlightOption[]>([]);
  const [currentTransfer, setCurrentTransfer] = useState<
    TransferOption | undefined
  >();

  // Loading
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const destination = getDestinationContent(basics.destination);

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
      setActivityOptions(getActivityOptions(basics));
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
      if (c.activityIds.length >= 2) return c;
      return { ...c, activityIds: [...c.activityIds, activityId] };
    });
  }

  function getShareUrl() {
    const plan: SummaryPlan = {
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
    };
    const encoded = btoa(
      unescape(encodeURIComponent(JSON.stringify(plan))),
    );
    return `/summary?plan=${encoded}`;
  }

  async function copyShareLink() {
    const url = `${window.location.origin}${getShareUrl()}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // ============================
  // SETUP VIEW
  // ============================

  if (!started) {
    return (
      <div className="min-h-screen px-5 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Journi
            </Link>
          </header>

          <section className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Planner setup
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Pick your destination
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-[var(--muted)]">
              Choose where you want to go — we&apos;ll find real flights, stays,
              and local experiences.
            </p>

            {/* Destination grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {allDestinations.map((dest) => (
                <button
                  key={dest.slug}
                  type="button"
                  onClick={() =>
                    setBasics((c) => ({ ...c, destination: dest.slug }))
                  }
                  className={cn(
                    "group relative overflow-hidden rounded-xl border transition-all duration-200",
                    basics.destination === dest.slug
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
                    {basics.destination === dest.slug && (
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
          </section>

          {/* Trip details row */}
          <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-5">
              <h2 className="text-lg font-semibold tracking-tight">
                Trip details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Flying from">
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

            {/* Destination preview card */}
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 400px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)] backdrop-blur-sm">
                    <Sparkles className="size-3" />
                    {destination.bestFor.split(",")[0]}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {destination.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {destination.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {destination.famousPlaces.slice(0, 4).map((place) => (
                    <a
                      key={place}
                      href={googleMapsUrl(place, basics.destination)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface)]/50 px-3 py-1.5 text-sm font-medium transition-all hover:bg-white hover:shadow-sm"
                    >
                      <MapPin className="size-3 text-[var(--accent)]" />
                      {place}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ============================
  // PLANNER VIEW
  // ============================

  const step = stepMeta[currentStep as Exclude<PlannerStep, "setup">];

  return (
    <div className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Journi
          </Link>
          <div className="rounded-full bg-[var(--surface)] px-4 py-1.5 text-sm font-medium">
            {basics.sourceCity} → {destination.name}
          </div>
        </header>

        {/* Destination banner */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative aspect-[16/9] w-full md:aspect-auto md:w-56 lg:w-64">
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 260px"
                priority
              />
            </div>
            {/* Content */}
            <div className="min-w-0 flex-1 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                    <Sparkles className="size-3" />
                    {destination.name}
                  </span>
                  <h1 className="mt-2 text-lg font-semibold tracking-tight">
                    {destination.name} at a glance
                  </h1>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {destination.summary}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 font-medium">
                    {basics.days} days
                  </span>
                  <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 font-medium">
                    {formatCurrency(basics.budget)}
                  </span>
                  <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 font-medium">
                    {basics.style}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {destination.famousPlaces.map((place) => (
                  <a
                    key={place}
                    href={googleMapsUrl(place, basics.destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/place inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/40 px-2.5 py-1 text-xs font-medium transition-all hover:border-[var(--accent)]/30 hover:bg-white hover:shadow-sm"
                  >
                    <MapPin className="size-3 text-[var(--accent)]" />
                    {place}
                    <ExternalLink className="size-2.5 text-[var(--muted)] opacity-0 transition-opacity group-hover/place:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Two columns */}
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
          {/* Left — step options */}
          <div className="min-w-0">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                    Step {step.number} of 4
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    {step.label}
                  </h2>
                </div>
                <p className="hidden text-right text-xs text-[var(--muted)] md:block">
                  Select an option. Your trip updates live →
                </p>
              </div>

              {/* Loading */}
              {loading && (
                <div className="mt-8 flex flex-col items-center justify-center py-10">
                  <Loader2 className="size-7 animate-spin text-[var(--accent)]" />
                  <p className="mt-3 text-sm font-medium text-[var(--muted)]">
                    {loadingMsg}
                  </p>
                </div>
              )}

              {/* Options */}
              {!loading && (
                <div className="mt-5 space-y-3">
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
                        />
                      ))}
                      <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface)]/50 p-4">
                        <p className="text-sm text-[var(--muted)]">
                          Pick up to 2 activities, or skip ahead.
                        </p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep("return")}
                          className="shrink-0 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
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
            </div>

            {/* Share bar */}
            {selections.returnFlightId && (
              <div className="mt-5 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-soft)]/30 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      Your trip is ready
                    </h2>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      Share it or view the full summary.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface)]"
                    >
                      <Copy className="size-3.5" />
                      {copied ? "Copied!" : "Copy link"}
                    </button>
                    <Link
                      href={getShareUrl()}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                    >
                      View summary
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
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
            />
          </div>
        </section>
      </div>
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
