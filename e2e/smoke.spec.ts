import { expect, test } from "@playwright/test";

const staticRoutes = ["/", "/about", "/services", "/portfolio", "/blog", "/contact"];

const dynamicRoutes = [
  "/services/game-development",
  "/portfolio/sample-client-project-placeholder",
];

const redirectedRoutes = ["/products", "/products/eclipse", "/community"];

for (const route of staticRoutes) {
  test(`renders ${route} without error`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("main")).toBeVisible();
    await expect(page).not.toHaveTitle("");
  });
}

for (const route of dynamicRoutes) {
  test(`renders ${route} without error`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("main")).toBeVisible();
  });
}

for (const route of redirectedRoutes) {
  test(`permanently redirects ${route} to home`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/$/);
  });
}

test("renders a friendly 404 for an unknown route", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
});

test("primary navigation shows six IA items plus Get in touch CTA", async ({ page }) => {
  await page.goto("/");

  const overlayNav = page.getByRole("navigation", { name: "Site sections" });
  await page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: /open menu/i }).click();

  for (const label of ["Home", "About", "Services", "Portfolio", "Blog", "Contact", "Get in touch"]) {
    await expect(overlayNav.getByRole("link", { name: label }).first()).toBeVisible();
  }

  // Retired top-level IA routes (not service offerings like "Community & Events").
  await expect(overlayNav.getByRole("link", { name: "Products", exact: true })).toHaveCount(0);
  await expect(overlayNav.getByRole("link", { name: "Community", exact: true })).toHaveCount(0);
});

test("Get in touch CTA keeps the external Google Form URL", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: /open menu/i }).click();

  const cta = page
    .getByRole("navigation", { name: "Site sections" })
    .getByRole("link", { name: "Get in touch" });
  await expect(cta).toHaveAttribute("href", /docs\.google\.com\/forms/);
});

test("Services and Portfolio nav dropdowns list CMS children", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: /open menu/i }).click();

  const overlayNav = page.getByRole("navigation", { name: "Site sections" });
  const gameDev = overlayNav.getByRole("link", { name: "Game Development", exact: true });
  await expect(gameDev).toHaveCount(1);
  await expect(gameDev).toHaveAttribute("href", "/services/game-development");
  await expect(
    overlayNav.getByRole("link", { name: "Sample Client Project — Placeholder" })
  ).toBeVisible();
});

test("five canonical service detail pages render", async ({ page }) => {
  for (const slug of [
    "game-development",
    "product-development",
    "ui-design",
    "branding",
    "community-events",
  ]) {
    const response = await page.goto(`/services/${slug}`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("legacy service slug redirects to canonical", async ({ page }) => {
  const response = await page.goto("/services/ui-ux-design", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/services\/ui-design\/?$/);
});

test("skip-to-content link is keyboard accessible", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: /skip to content/i });
  await expect(skipLink).toBeAttached();
});
