import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { FilterAndSortProvider } from "../ServiceProvider/FilterAndSortProvider";
import { SearchFilterForm } from "./SearchFilterForm";

vi.mock("./magnifying-glass.svg", () => ({ default: () => <svg aria-hidden="true" /> }));
vi.mock("./CustomSortControls/plus.svg", () => ({ default: () => <svg aria-hidden="true" /> }));
vi.mock("./CustomSortControls/down-arrow.svg", () => ({ default: () => <svg aria-hidden="true" /> }));
afterEach(cleanup);

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams("other=keep"),
  useRouter: () => navigation,
}));
beforeEach(() => navigation.replace.mockClear());

test("submits the username while preserving unrelated URL parameters without scrolling", async () => {
  const user = userEvent.setup();
  render(<FilterAndSortProvider><SearchFilterForm /></FilterAndSortProvider>);
  const input = screen.getByRole("textbox", { name: "BGG Username", exact: true });
  await user.type(input, "davidhorm");
  expect(navigation.replace).not.toHaveBeenCalled();
  await user.keyboard("{Enter}");
  await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(
    "/?other=keep&username=davidhorm", { scroll: false },
  ));
});
