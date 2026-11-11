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

test("background pause persists after focus moves", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Pause background animation" })
    .click();
  await page.getByRole("link", { name: "Discuss a project" }).focus();
  await expect(
    page.getByRole("button", { name: "Resume background animation" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page
        .locator("#home-hero video")
        .evaluateAll((videos) =>
          videos.every((video) => (video as HTMLVideoElement).paused),
        ),
    )
    .toBe(true);
});

test("service and partner animation can stay paused", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pause service animation" }).click();
  await expect(page.getByRole("button", { name: "Resume service animation" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Pause partner logos" }).click();
  await expect(page.getByRole("button", { name: "Resume partner logos" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="logo-marquee"] .animate-marquee-horizontal')).toHaveCSS("animation-play-state", "paused");
});
