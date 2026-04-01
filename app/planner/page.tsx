import { PlannerApp } from "@/components/planner/planner-app";

type PlannerPageProps = {
  searchParams?: Promise<{ dest?: string }>;
};

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const params = searchParams ? await searchParams : {};
  const rawDest = params.dest;
  const destKey =
    typeof rawDest === "string" && rawDest.trim()
      ? rawDest.trim().toLowerCase()
      : "__none__";

  return <PlannerApp key={destKey} initialDest={rawDest} />;
}
