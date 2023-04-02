import { test, expect } from "@playwright/test";

test.describe("Mock User Responses", () => {
  test('WHEN navigating to `/?username=001`, THEN "Ticket to Ride" link is visible', async ({
    page,
  }) => {
    await page.goto("/?username=001");

    await expect(
      page.getByRole("link", { name: "Ticket to Ride" })
    ).toBeVisible();
  });

  test("WHEN navigating to `/?username=000`, THEN empty collection message is visible", async ({
    page,
  }) => {
    await page.goto("/?username=000");

    await expect(
      page.getByRole("heading", {
        name: "You have zero games in your collection?",
      })
    ).toBeVisible();
  });

  test("WHEN navigating to `/?username=202`, THEN large collection (and retry) message is visible", async ({
    page,
  }) => {
    await page.goto("/?username=202");

    await expect(
      page.getByRole("heading", { name: "My, what a big collection" })
    ).toBeVisible({ timeout: 10000 });
  });
});
