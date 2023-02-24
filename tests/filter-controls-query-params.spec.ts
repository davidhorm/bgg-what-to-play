import { test, expect } from "@playwright/test";

test.describe("Filter Controls and Query Parameters", () => {
  test("WHEN no query parameters defined, THEN set the filter controls to their default values", async ({
    page,
  }) => {
    await page.goto("/");

    // Assert textboxes and sliders default values
    for await (const { label, defaultValue, valueText } of [
      { label: "BGG Username", defaultValue: "" },
      { label: "Minimum Player Count", defaultValue: "1" },
      { label: "Maximum Player Count", defaultValue: "11", valueText: "10+" },
      { label: "Minimum Playtime", defaultValue: "0" },
      { label: "Maximum Playtime", defaultValue: "255", valueText: "240+" },
      { label: "Minimum Complexity", defaultValue: "1" },
      { label: "Maximum Complexity", defaultValue: "5" },
      { label: "Minimum Average Ratings", defaultValue: "1" },
      { label: "Maximum Average Ratings", defaultValue: "10" },
    ]) {
      await expect(page.getByLabel(label)).toHaveValue(defaultValue);

      // Assert Sliders with a INFINITY value in the max end
      if (valueText) {
        await expect(page.getByLabel(label)).toHaveAttribute(
          "aria-valuetext",
          valueText
        );
      }
    }

    // Assert checkboxes/radio buttons not checked by default
    for await (const { name, role } of [
      { name: "Show expansions" },
      { name: "Show ratings" },
      { name: "User Ratings", role: "radio" },
      { name: "Average Ratings", role: "radio" },
      { name: "Show not recommended player counts" },
      { name: "Show invalid player counts" },
    ]) {
      await expect(
        page.getByRole((role as any) || "checkbox", { name })
      ).not.toBeChecked();
    }

    expect(new URL(page.url()).search).toBe("");
  });

  test("WHEN query parameters has values, THEN set the filter controls to their specified values", async ({
    page,
  }) => {
    const queryParams = [
      { queryParam: "username", value: "davidhorm", label: "BGG Username" },
      {
        queryParam: "playerCount",
        minValue: "2",
        maxValue: "10",
        label: "Player Count",
      },
      {
        queryParam: "playtime",
        minValue: "15",
        maxValue: "240",
        label: "Playtime",
      },
      {
        queryParam: "complexity",
        minValue: "1.1",
        maxValue: "4.9",
        label: "Complexity",
      },
      {
        queryParam: "ratings",
        minValue: "1.1",
        maxValue: "9.9",
        label: "User Ratings",
      },
      {
        queryParam: "showInvalid",
        value: "checked",
        label: "Show invalid player counts",
      },
      {
        queryParam: "showExpansions",
        value: "checked",
        label: "Show expansions",
      },
      {
        queryParam: "showUserRatings",
        value: "checked",
        label: "User Ratings",
        role: "radio",
      },
      {
        queryParam: "showNotRec",
        value: "checked",
        label: "Show not recommended player counts",
      },
    ];

    const queryParamUrl = queryParams
      .map(
        ({ queryParam, value, minValue, maxValue }) =>
          `${queryParam}=${
            !!minValue && !!maxValue
              ? `${minValue}-${maxValue}`
              : value === "checked"
              ? "1"
              : value
          }`
      )
      .join("&");

    await page.goto(`/?${queryParamUrl}`);

    for await (const {
      label,
      value,
      minValue,
      maxValue,
      role,
    } of queryParams) {
      if (!!minValue && !!maxValue) {
        await expect(page.getByLabel(`Minimum ${label}`)).toHaveValue(minValue);
        await expect(page.getByLabel(`Maximum ${label}`)).toHaveValue(maxValue);
      } else if (value === "checked") {
        await expect(
          page.getByRole((role as any) || "checkbox", { name: label })
        ).toBeChecked();
      } else if (value) {
        await expect(page.getByLabel(label)).toHaveValue(value);
      }
    }

    // Assert unique cases
    await expect(
      page.getByRole("checkbox", { name: "Show ratings" })
    ).toBeChecked();

    await expect(
      page.getByLabel("Average Ratings", { exact: true })
    ).not.toBeChecked();
  });

  test("WHEN range query parameters have a single value, THEN set the filter controls to their specified values", async ({
    page,
  }) => {
    const queryParams = [
      {
        queryParam: "playerCount",
        value: "9",
        label: "Player Count",
      },
      {
        queryParam: "playtime",
        value: "180",
        label: "Playtime",
      },
      {
        queryParam: "complexity",
        value: "2.5",
        label: "Complexity",
      },
      {
        queryParam: "ratings",
        value: "9.8",
        label: "Average Ratings",
      },
    ];

    const queryParamUrl = queryParams
      .map(({ queryParam, value }) => `${queryParam}=${value}`)
      .join("&");

    await page.goto(`/?${queryParamUrl}`);

    for await (const { label, value } of queryParams) {
      await expect(page.getByLabel(`Minimum ${label}`)).toHaveValue(value);
      await expect(page.getByLabel(`Maximum ${label}`)).toHaveValue(value);
    }
  });

  test("WHEN range query parameters have 'Infinity' as the value, THEN set the filter controls to their specified values", async ({
    page,
  }) => {
    const queryParams = [
      {
        queryParamKey: "playerCount",
        queryParamMinValue: "11",
        label: "Player Count",
        sliderValue: "11",
        sliderValueText: "10+",
      },
      {
        queryParamKey: "playtime",
        queryParamMinValue: "241",
        label: "Playtime",
        sliderValue: "255",
        sliderValueText: "240+",
      },
    ];

    const queryParamUrl = queryParams
      .map(
        ({ queryParamKey, queryParamMinValue }) =>
          `${queryParamKey}=${queryParamMinValue}-Infinity`
      )
      .join("&");

    await page.goto(`/?username=davidhorm&${queryParamUrl}`);

    for await (const { label, sliderValue, sliderValueText } of queryParams) {
      const minSlider = page.getByLabel(`Minimum ${label}`);
      await expect(minSlider).toHaveValue(sliderValue);
      await expect(minSlider).toHaveAttribute(
        "aria-valuetext",
        sliderValueText
      );

      const maxSlider = page.getByLabel(`Maximum ${label}`);
      await expect(maxSlider).toHaveValue(sliderValue);
      await expect(maxSlider).toHaveAttribute(
        "aria-valuetext",
        sliderValueText
      );
    }
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
      test(`WHEN navigating to '${queryParam}', THEN set filter controls to ${ratingType} Ratings`, async ({
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
