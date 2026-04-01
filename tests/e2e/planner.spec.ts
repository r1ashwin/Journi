import { expect, test } from "@playwright/test";

test("builds a Goa trip flow end-to-end", async ({ page }) => {
  await page.goto("/planner");

  // ---- Setup: select Goa destination card ----
  await expect(page.getByText("Pick your destination")).toBeVisible();
  await page.locator("button", { hasText: "Goa" }).click();

  // ---- Fill trip details ----
  await page.getByLabel("Flying from").selectOption("Bengaluru");
  await page.getByLabel("Trip length (days)").fill("4");
  await page.getByLabel(/budget/i).fill("30000");
  await page.getByLabel("Travelers").fill("2");
  await page.getByRole("button", { name: /start planning/i }).click();

  // ---- Destination banner visible ----
  await expect(page.getByText("Goa at a glance")).toBeVisible();

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
  await expect(page.getByText("Your trip is ready")).toBeVisible();

  // ---- Navigate to summary ----
  const summaryLink = page.getByRole("link", { name: /view summary/i });
  await expect(summaryLink).toBeVisible();
  await summaryLink.click();

  // ---- Summary page ----
  await expect(page.getByText("Your trip", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Bengaluru.*Goa/)).toBeVisible();
});

test("landing page loads with carousel and destination grid", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /plan your trip/i }),
  ).toBeVisible();

  // Carousel with navigation
  await page.getByLabel("Next destination").click();
  await page.getByLabel("Previous destination").click();

  // Destination grid shows all 13
  await expect(page.getByText("13 destinations")).toBeVisible();

  // Navigate to planner
  await page.getByRole("link", { name: /start planning/i }).first().click();
  await expect(page.getByText("Planner setup")).toBeVisible();
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
    "/api/hotels?destination=manali&checkIn=2026-06-01&checkOut=2026-06-04&adults=2",
  );
  expect(res.status()).toBe(200);

  const data = await res.json();
  expect(data.source).toBe("xotelo");
  expect(data.stays.length).toBeGreaterThan(0);
});

test("activities API returns curated data for all destinations", async ({
  request,
}) => {
  for (const dest of ["goa", "manali", "varanasi", "leh"]) {
    const res = await request.get(`/api/activities?destination=${dest}`);
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("curated");
    expect(data.activities.length).toBeGreaterThan(0);
  }
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
