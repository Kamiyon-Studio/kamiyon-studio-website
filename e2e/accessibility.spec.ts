import { expect, test } from "@playwright/test";

test("navigation contains keyboard focus and restores the trigger", async ({
  page,
}) => {
  await page.goto("/contact");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Site navigation" });
  await dialog.getByRole("link", { name: "Get in touch" }).focus();
  await page.keyboard.press("Tab");
  await expect
    .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
    .toBe(true);
  await page.keyboard.press("Shift+Tab");
  await expect
    .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("reduced motion does not request hero video and keeps inquiry links usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const videoRequests: string[] = [];
  page.on("request", (request) => {
    if (/\.(mp4|webm)(\?|$)/.test(request.url()))
      videoRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator("#home-hero video")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "View our work", exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Discuss a project" }),
  ).toBeVisible();
  expect(videoRequests).toEqual([]);
});

test("hero artwork stays static when scrolling", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("#home-hero");
  const artwork = hero.getByTestId("hero-artwork");
  await expect(artwork).toBeVisible();
  await expect(hero.locator("video")).toHaveCount(0);
  await expect(artwork).toHaveCSS("transform", "none");
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(artwork).toHaveCSS("transform", "none");
  await expect(artwork.locator("img")).toHaveCSS("transform", "none");
  await expect(hero.getByRole("button", { name: /background animation/ })).toHaveCount(0);
});

test("service and partner animation can stay paused", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pause service animation" }).click();
  await expect(page.getByRole("button", { name: "Resume service animation" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Pause partner logos" }).click();
  await expect(page.getByRole("button", { name: "Resume partner logos" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="logo-marquee"] .animate-marquee-horizontal')).toHaveCSS("animation-play-state", "paused");
});
