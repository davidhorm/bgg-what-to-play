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

    await expect(page.getByLabel("Minimum Playtime")).toHaveValue("0");

    await expect(page.getByLabel("Maximum Playtime")).toHaveValue("255");

    await expect(page.getByLabel("Maximum Playtime")).toHaveAttribute(
      "aria-valuetext",
      "240+"
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
      "/?username=davidhorm&playerCount=2-10&playtime=15-240&showInvalid=1&showExpansions=1&showUserRatings=1"
    );

    await expect(page.getByLabel("BGG Username")).toHaveValue("davidhorm");

    await expect(page.getByLabel("Minimum Player Count")).toHaveValue("2");

    await expect(page.getByLabel("Maximum Player Count")).toHaveValue("10");

    await expect(page.getByLabel("Minimum Playtime")).toHaveValue("15");

    await expect(page.getByLabel("Maximum Playtime")).toHaveValue("240");

    await expect(page.getByLabel("Show expansions")).toBeChecked();

    await expect(
      page.getByRole("checkbox", { name: "Show ratings" })
    ).toBeChecked();

    await expect(page.getByLabel("User Ratings")).toBeChecked();

    await expect(page.getByLabel("Average Ratings")).not.toBeChecked();

    await expect(page.getByLabel("Show invalid player counts")).toBeChecked();
  });

  test("Query Parameters with max ranges set Filter Control Values", async ({
    page,
  }) => {
    await page.goto(
      "/?username=davidhorm&playerCount=11-Infinity&playtime=241-Infinity"
    );

    const minPlayerCount = page.getByLabel("Minimum Player Count");
    await expect(minPlayerCount).toHaveValue("11");
    await expect(minPlayerCount).toHaveAttribute("aria-valuetext", "10+");

    const maxPlayerCount = page.getByLabel("Maximum Player Count");
    await expect(maxPlayerCount).toHaveValue("11");
    await expect(maxPlayerCount).toHaveAttribute("aria-valuetext", "10+");

    const minPlaytime = page.getByLabel("Minimum Playtime");
    await expect(minPlaytime).toHaveValue("255");
    await expect(minPlaytime).toHaveAttribute("aria-valuetext", "240+");

    const maxPlaytime = page.getByLabel("Maximum Playtime");
    await expect(maxPlaytime).toHaveValue("255");
    await expect(maxPlaytime).toHaveAttribute("aria-valuetext", "240+");
  });
});
