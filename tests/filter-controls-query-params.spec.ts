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

    await expect(page.getByLabel("Minimum Complexity")).toHaveValue("1");

    await expect(page.getByLabel("Maximum Complexity")).toHaveValue("5");

    await expect(page.getByLabel("Minimum Average Ratings")).toHaveValue("1");

    await expect(page.getByLabel("Maximum Average Ratings")).toHaveValue("10");

    await expect(page.getByLabel("Show expansions")).not.toBeChecked();

    await expect(
      page.getByRole("checkbox", { name: "Show ratings" })
    ).not.toBeChecked();

    await expect(page.getByLabel("User Ratings")).not.toBeChecked();

    await expect(
      page.getByLabel("Average Ratings", { exact: true })
    ).not.toBeChecked();

    await expect(
      page.getByLabel("Show invalid player counts")
    ).not.toBeChecked();

    expect(new URL(page.url()).search).toBe("");
  });

  test("Query Parameters set Filter Control Values", async ({ page }) => {
    await page.goto(
      "/?username=davidhorm&playerCount=2-10&playtime=15-240&complexity=1.1-4.9&ratings=1.1-9.9&showInvalid=1&showExpansions=1&showUserRatings=1"
    );

    await expect(page.getByLabel("BGG Username")).toHaveValue("davidhorm");

    await expect(page.getByLabel("Minimum Player Count")).toHaveValue("2");

    await expect(page.getByLabel("Maximum Player Count")).toHaveValue("10");

    await expect(page.getByLabel("Minimum Playtime")).toHaveValue("15");

    await expect(page.getByLabel("Maximum Playtime")).toHaveValue("240");

    await expect(page.getByLabel("Minimum Complexity")).toHaveValue("1.1");

    await expect(page.getByLabel("Maximum Complexity")).toHaveValue("4.9");

    await expect(page.getByLabel("Minimum User Ratings")).toHaveValue("1.1");

    await expect(page.getByLabel("Maximum User Ratings")).toHaveValue("9.9");

    await expect(page.getByLabel("Show expansions")).toBeChecked();

    await expect(
      page.getByRole("checkbox", { name: "Show ratings" })
    ).toBeChecked();

    await expect(
      page.getByLabel("User Ratings", { exact: true })
    ).toBeChecked();

    await expect(
      page.getByLabel("Average Ratings", { exact: true })
    ).not.toBeChecked();

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

  [
    {
      queryParam: "&ratings=1.1-9.9",
      ratingType: "Average",
      minValue: "1.1",
      maxValue: "9.9",
      showRatingsChecked: false,
    },
    {
      queryParam: "&ratings=1.2-9.8&showRatings=1",
      ratingType: "Average",
      minValue: "1.2",
      maxValue: "9.8",
      showRatingsChecked: true,
    },
    {
      queryParam: "&showUserRatings=1",
      ratingType: "User",
      minValue: "1",
      maxValue: "10",
      showRatingsChecked: true,
    },
    {
      queryParam: "&ratings=1.3-9.7&showUserRatings=1",
      ratingType: "User",
      minValue: "1.3",
      maxValue: "9.7",
      showRatingsChecked: true,
    },
  ].forEach(
    ({ queryParam, ratingType, minValue, maxValue, showRatingsChecked }) =>
      test(`Query Parameters '${queryParam}' will set Filter Control Values to ${ratingType} Ratings`, async ({
        page,
      }) => {
        await page.goto(`/?username=davidhorm${queryParam}`);

        await expect(
          page.getByLabel(`Minimum ${ratingType} Ratings`)
        ).toHaveValue(minValue);

        await expect(
          page.getByLabel(`Maximum ${ratingType} Ratings`)
        ).toHaveValue(maxValue);

        if (showRatingsChecked) {
          await expect(
            page.getByRole("checkbox", { name: "Show ratings" })
          ).toBeChecked();

          await expect(
            page.getByLabel(`${ratingType} Ratings`, { exact: true })
          ).toBeChecked();
        } else {
          await expect(
            page.getByRole("checkbox", { name: "Show ratings" })
          ).not.toBeChecked();
        }
      })
  );
});
