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
});
