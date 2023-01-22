import { test, expect } from "@playwright/test";

test.describe("Filter Controls and Query Parameters", () => {
  test("Default Filter Control Values", async ({ page }) => {
    await page.goto("/");

    // TODO: await https://github.com/microsoft/playwright/issues/19284 to be released
    // const x = await page.getByLabel("Minimum Player Count");
    const minPlayerCount = await page.locator(
      "[aria-label='Minimum Player Count']"
    );
    await expect(minPlayerCount).toHaveValue("1");
  });
});
