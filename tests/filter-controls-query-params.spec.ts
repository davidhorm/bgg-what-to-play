import { test, expect } from "@playwright/test";

test.describe("Filter Controls and Query Parameters", () => {
  test("Default Filter Control Values and Query Parameters", async ({
    page,
  }) => {
    await page.goto("/");

    /**
     * Placeholder fix for `getByLabel` to query by `aria-label`.
     * TODO: replace with `page.getByLabel()` when released.
     * @see https://github.com/microsoft/playwright/issues/19284
     */
    const getByLabel = (label: string) =>
      page.locator(`[aria-label='${label}']`);

    await expect(page.getByLabel("BGG Username")).toHaveValue("");

    await expect(getByLabel("Minimum Player Count")).toHaveValue("1");

    await expect(getByLabel("Maximum Player Count")).toHaveAttribute(
      "aria-valuetext",
      "10+"
    );

    await expect(
      page.getByLabel("Show invalid player counts")
    ).not.toBeChecked();

    expect(new URL(page.url()).search).toBe("");
  });
});
