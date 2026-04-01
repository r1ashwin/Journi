import { expect, test } from "@playwright/test";
import { encodePlan } from "@/lib/planner";
import type { SummaryPlan } from "@/lib/types";

test("builds a Goa trip flow end-to-end", async ({ page }) => {
  await page.goto("/planner");

  // ---- Step 1: destination only ----
  await expect(page.getByText("Pick your destination")).toBeVisible();
  await expect(page.getByText("Planner setup · Step 1 of 2")).toBeVisible();
  await page.locator("button", { hasText: "Goa" }).click();

  // ---- Step 2: trip details (auto-advance on destination tap) ----
  await expect(page.getByText("Your trip details")).toBeVisible();
  await expect(page.getByText("Planner setup · Step 2 of 2")).toBeVisible();
  await page.getByLabel("Flying from").selectOption("Bengaluru");
  await page.getByLabel("Trip length (days)").fill("4");
  await page.getByLabel(/budget/i).fill("30000");
  await page.getByLabel("Travelers").fill("2");
  await page.getByRole("button", { name: /start planning/i }).click();

  // ---- Famous spots + two-column planner ----
  await expect(page.getByText("Notable spots")).toBeVisible();

  // ---- Step 1: Outbound flight ----
  await expect(page.getByText("Step 1 of 4")).toBeVisible();
  const firstFlight = page.locator(".space-y-3 > button:first-child");
  await expect(firstFlight).toBeVisible({ timeout: 15_000 });
  await firstFlight.click();

  // ---- Step 2: Stay (real hotel data from Xotelo) ----
  await expect(page.getByText("Step 2 of 4")).toBeVisible();
  const firstStay = page.locator(".space-y-3 > button:first-child");
  await expect(firstStay).toBeVisible({ timeout: 20_000 });
  await firstStay.click();

  // ---- Step 3: Activities (curated) ----
  await expect(page.getByText("Step 3 of 4")).toBeVisible();
  const activityCard = page.locator("button", { hasText: "Beach day" });
  await expect(activityCard.first()).toBeVisible({ timeout: 15_000 });
  await activityCard.first().click();
  await page.getByRole("button", { name: /continue/i }).click();

  // ---- Step 4: Return flight ----
  await expect(page.getByText("Step 4 of 4")).toBeVisible();
  const firstReturn = page.locator(".space-y-3 > button:first-child");
  await expect(firstReturn).toBeVisible({ timeout: 15_000 });
  await firstReturn.click();

  // ---- Trip complete ----
  await expect(page.getByText("Your trip is ready")).toBeVisible({
    timeout: 20_000,
  });

  // ---- Navigate to summary ----
  const summaryLink = page.getByRole("link", { name: /view summary/i });
  await expect(summaryLink).toBeVisible();
  await summaryLink.click();

  // ---- Summary page ----
  await expect(page.getByText("Your trip", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(
    page.getByRole("heading", { name: /Bengaluru.*Goa/i }),
  ).toBeVisible();
});

test("landing page loads with carousel and destination grid", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main h1")).toContainText(/get live/i);
  await expect(page.locator("main h1")).toContainText(/one place/i);
  await expect(page.locator("main h1")).not.toContainText(/—/);
  await expect(
    page.getByText(/turn trip research into a calm flow/i),
  ).toBeVisible();
  await expect(
    page.getByText(/step-by-step choices in one view/i),
  ).toBeVisible();
  await expect(page.getByText(/plan you can share/i)).toBeVisible();

  // Carousel with navigation
  await page.getByLabel("Next destination").click();
  await page.getByLabel("Previous destination").click();

  // Destination grid shows all 13
  await expect(page.getByText("12 destinations")).toBeVisible();

  // Navigate to planner
  await page.getByRole("link", { name: /start planning/i }).first().click();
  await expect(page.getByText("Planner setup · Step 1 of 2")).toBeVisible();
});

test("home destination card deep-links to trip details step", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('a[href="/planner?dest=jaipur"]').first().click();
  await expect(page.getByText("Your trip details")).toBeVisible();
  await expect(page.getByText("Planner setup · Step 2 of 2")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Jaipur", level: 2 }),
  ).toBeVisible();
});

test("transfer API returns real OSRM data", async ({ request }) => {
  const res = await request.get(
    "/api/transfers?destination=goa&area=Candolim",
  );
  expect(res.status()).toBe(200);

  const data = await res.json();
  expect(data.source).toBe("osrm");
  expect(data.transfer).toBeDefined();
  expect(data.transfer.durationMinutes).toBeGreaterThan(0);
  expect(data.transfer.cost).toBeGreaterThan(0);
  expect(data.transfer.label).toContain("Candolim");
});

test("hotel API returns real Xotelo data (no key needed)", async ({
  request,
}) => {
  const res = await request.get(
    "/api/hotels?destination=goa&checkIn=2026-06-01&checkOut=2026-06-04&adults=2",
  );
  expect(res.status()).toBe(200);

  const data = await res.json();
  expect(data.source).toBe("xotelo");
  expect(data.stays).toBeDefined();
  expect(data.stays.length).toBeGreaterThan(0);
  expect(data.stays[0].name).toBeTruthy();
  expect(data.stays[0].nightlyPrice).toBeGreaterThan(0);
});

test("hotel API works for new destinations", async ({ request }) => {
  const res = await request.get(
    "/api/hotels?destination=hyderabad&checkIn=2026-06-01&checkOut=2026-06-04&adults=2",
  );
  expect(res.status()).toBe(200);

  const data = await res.json();
  expect(data.source).toBe("xotelo");
  expect(data.stays.length).toBeGreaterThan(0);
});

test("activities API returns curated data for all destinations", async ({
  request,
}) => {
  for (const dest of ["goa", "hyderabad", "varanasi", "leh"]) {
    const res = await request.get(`/api/activities?destination=${dest}`);
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("curated");
    expect(data.activities.length).toBeGreaterThan(0);
  }
});

test("summary page shows Skyscanner and Google Flights links", async ({
  page,
}) => {
  const plan = {
    basics: {
      sourceCity: "Bengaluru",
      destination: "goa",
      startDate: "2026-06-01",
      days: 4,
      budget: 30000,
      travelers: 2,
      style: "Relaxed",
    },
    outbound: {
      id: "t-out",
      label: "Morning",
      departTime: "07:00",
      arriveTime: "08:30",
      duration: "1h 30m",
      durationMinutes: 90,
      price: 4000,
      tag: "Test",
      reason: "Test",
    },
    stayTotal: 0,
    activities: [],
    total: 4000,
    perPerson: 2000,
    totalDurationMinutes: 90,
  };
  const encoded = encodePlan(plan as SummaryPlan);
  await page.goto(`/summary?plan=${encodeURIComponent(encoded)}`);

  const sky = page.locator('a[href*="skyscanner.co.in/transport/flights"]');
  await expect(sky.first()).toBeVisible({ timeout: 10_000 });
  await expect(sky.first()).toHaveAttribute("href", /\/flights\/blr\/goi\//);

  const google = page.locator('a[href*="google.com/travel/flights"]');
  await expect(google.first()).toBeVisible();
});

test("flights API returns 503 without Ignav key or 200 with", async ({
  request,
}) => {
  const res = await request.get(
    "/api/flights?sourceCity=Bengaluru&destination=goa&date=2026-06-01&travelers=2&direction=outbound",
  );
  const data = await res.json();
  expect([200, 503]).toContain(res.status());
  if (res.status() === 200) {
    expect(data.flights.length).toBeGreaterThan(0);
    expect(data.source).toBe("ignav");
  } else {
    expect(data.error).toBe("API_NOT_CONFIGURED");
  }
});
