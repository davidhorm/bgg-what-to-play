import { test, expect } from "@playwright/test";

test.describe("Filter Controls and Query Parameters", () => {
  test("WHEN no query parameters defined, THEN set the filter controls to their default values", async ({
    page,
  }) => {
    await page.goto("./");

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

    expect(await page.getByRole("button", { name: "Add Sort" }));
    expect(
      await page.getByRole("button", {
        name: "Descending Player Count Recommendation",
      })
    );

    expect(new URL(page.url()).search).toBe("");
  });

  test("WHEN query parameters has filter values, THEN set the filter controls to their specified values", async ({
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

    await page.goto(`./?${queryParamUrl}`);

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

    await page.goto(`./?${queryParamUrl}`);

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

    await page.goto(`./?username=davidhorm&${queryParamUrl}`);

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

  /** Test Average vs Users Ratings */
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
        await page.goto(`./?username=davidhorm${queryParam}`);

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

  test("WHEN user manipulates controls in search form, THEN url reflects filter params", async ({
    page,
  }) => {
    await page.goto("./");

    // Fill out the searchbox, and tick the sliders in one
    for await (const { label, fill, press } of [
      { label: "BGG Username", fill: "davidhorm" },
      { label: "Minimum Player Count", press: "ArrowRight" },
      { label: "Maximum Player Count", press: "ArrowLeft" },
      { label: "Minimum Playtime", press: "ArrowRight" },
      { label: "Maximum Playtime", press: "ArrowLeft" },
      { label: "Minimum Complexity", press: "ArrowRight" },
      { label: "Maximum Complexity", press: "ArrowLeft" },
      { label: "Minimum Average Ratings", press: "ArrowRight" },
      { label: "Maximum Average Ratings", press: "ArrowLeft" },
    ]) {
      if (fill) {
        await page.getByLabel(label).fill(fill);
      }

      if (press) {
        await page.getByLabel(label).press(press);
      }
    }

    // Check all the boxes
    for await (const { name, role } of [
      { name: "Show expansions" },
      { name: "Show ratings" },
      { name: "User Ratings", role: "radio" },
      { name: "Show not recommended player counts" },
      { name: "Show invalid player counts" },
    ]) {
      await page.getByRole((role as any) || "checkbox", { name }).check();
    }

    await page.getByLabel("Search").click();

    const expectedUrl = [
      "?username=davidhorm",
      "playerCount=2-10",
      "playtime=15-240",
      "complexity=1.1-4.9",
      "ratings=1.1-9.9",
      "showExpansions=1",
      "showNotRec=1",
      "showInvalid=1",
      "showUserRatings=1",
    ].join("&");

    await expect(new URL(page.url()).search).toBe(expectedUrl);
  });

  test("WHEN navigating with all of the sort values in the query parameters, THEN all of the buttons are visible", async ({
    page,
  }) => {
    const sortConfigs = [
      { sortBy: "Name", qpKey: "name" },
      { sortBy: "Player Count Recommendation", qpKey: "rec" },
      { sortBy: "Average Playtime", qpKey: "time" },
      { sortBy: "Complexity", qpKey: "weight" },
      { sortBy: "Ratings", qpKey: "ratings" },
    ];

    const ascendingQueryParameters = sortConfigs
      .map(({ qpKey }) => `${qpKey}-asc`)
      .join("_");

    await page.goto(`/?username=davidhorm&sort=${ascendingQueryParameters}`);

    for await (const name of sortConfigs.map(
      ({ sortBy }) => `Ascending ${sortBy}`
    )) {
      expect(await page.getByRole("button", { name })).toBeDefined();
    }

    const descendingQueryParameters = sortConfigs
      .map(({ qpKey }) => `${qpKey}-desc`)
      .join("_");

    await page.goto(`/?username=davidhorm&sort=${descendingQueryParameters}`);

    for await (const name of sortConfigs.map(
      ({ sortBy }) => `Descending ${sortBy}`
    )) {
      expect(await page.getByRole("button", { name })).toBeDefined();
    }
  });
});
