import { test, expect } from "@playwright/test";

test.describe("Filter Controls and Query Parameters", () => {
  test("Default Filter Control Values and Query Parameters", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByLabel("BGG Username")).toHaveValue("");

    await expect(page.getByLabel("Minimum Player Count")).toHaveValue("1");

    await expect(page.getByLabel("Maximum Player Count")).toHaveAttribute(
      "aria-valuetext",
      "10+"
    );

    await expect(
      page.getByLabel("Show invalid player counts")
    ).not.toBeChecked();

    expect(new URL(page.url()).search).toBe("");
  });
});
