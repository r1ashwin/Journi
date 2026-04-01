import { PlannerApp } from "@/components/planner/planner-app";
import { decodePlan, firstSearchParam } from "@/lib/planner";

type PlannerPageProps = {
  searchParams?: Promise<{ dest?: string; plan?: string | string[] }>;
};

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const params = searchParams ? await searchParams : {};
  const rawDest = params.dest;
  const rawPlan = firstSearchParam(params.plan)?.trim() ?? "";
  const initialResumePlan = rawPlan ? decodePlan(rawPlan) : null;

  const destKey =
    typeof rawDest === "string" && rawDest.trim()
      ? rawDest.trim().toLowerCase()
      : "__none__";

  const mountKey = rawPlan ? `plan:${rawPlan}` : destKey;

  return (
    <PlannerApp
      key={mountKey}
      initialDest={rawDest}
      initialResumePlan={initialResumePlan}
    />
  );
}
