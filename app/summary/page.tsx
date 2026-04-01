import Link from "next/link";
import { SummaryView } from "@/components/planner/summary-view";
import { decodePlan, parseShareQuery, calculatePlanTotals } from "@/lib/planner";
import type { SummaryPlan } from "@/lib/types";

type SummaryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SummaryPage({ searchParams }: SummaryPageProps) {
  const params = await searchParams;

  let plan: SummaryPlan | null = null;

  // New format: base64-encoded full plan
  if (typeof params.plan === "string") {
    plan = decodePlan(params.plan);
  }

  // Legacy format: URL params with selection IDs → compute from static data
  if (!plan) {
    const parsed = parseShareQuery(params);
    if (parsed) {
      const totals = calculatePlanTotals(parsed.basics, parsed.selections);
      plan = {
        basics: parsed.basics,
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
    }
  }

  if (!plan) {
    return (
      <main className="min-h-screen px-6 py-12 md:px-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Plan not found
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            This summary link is incomplete. Start a new trip and generate a
            fresh share link.
          </p>
          <Link
            href="/planner"
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to planner
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/planner"
          className="text-sm font-semibold text-[var(--accent)]"
        >
          ← Back to planner
        </Link>
        <SummaryView plan={plan} />
      </div>
    </main>
  );
}
