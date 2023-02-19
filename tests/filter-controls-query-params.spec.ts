import { test, expect } from "@playwright/test";

test.describe("Filter Controls and Query Parameters", () => {
  test("Default Filter Control Values and Query Parameters", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByLabel("BGG Username")).toHaveValue("");

    await expect(page.getByLabel("Minimum Player Count")).toHaveValue("1");

    await expect(page.getByLabel("Maximum Player Count")).toHaveValue("11");

    await expect(page.getByLabel("Maximum Player Count")).toHaveAttribute(
      "aria-valuetext",
      "10+"
    );

    await expect(page.getByLabel("Show expansions")).not.toBeChecked();

    await expect(
      page.getByRole("checkbox", { name: "Show ratings" })
    ).not.toBeChecked();

    await expect(page.getByLabel("User Ratings")).not.toBeChecked();

    await expect(page.getByLabel("Average Ratings")).not.toBeChecked();

    await expect(
      page.getByLabel("Show invalid player counts")
    ).not.toBeChecked();

    expect(new URL(page.url()).search).toBe("");
  });

  test("Query Parameters set Filter Control Values", async ({ page }) => {
    await page.goto(
      "/?username=davidhorm&playerCount=2-10&showInvalid=1&showExpansions=1&showUserRatings=1"
    );

    await expect(page.getByLabel("BGG Username")).toHaveValue("davidhorm");

    await expect(page.getByLabel("Minimum Player Count")).toHaveValue("2");

    await expect(page.getByLabel("Maximum Player Count")).toHaveValue("10");

    await expect(page.getByLabel("Show expansions")).toBeChecked();

    await expect(
      page.getByRole("checkbox", { name: "Show ratings" })
    ).toBeChecked();

    await expect(page.getByLabel("User Ratings")).toBeChecked();

    await expect(page.getByLabel("Average Ratings")).not.toBeChecked();

    await expect(page.getByLabel("Show invalid player counts")).toBeChecked();
  });
});
