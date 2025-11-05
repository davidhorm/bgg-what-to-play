import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { MockServiceProvider } from "../ServiceProvider";
import { SearchFilterForm } from "./SearchFilterForm";

const ORIGINAL_LOCATION = location.href;

describe(SearchFilterForm.name, () => {
  beforeEach(() => {
    // clear out the query parameters between each test
    history.replaceState({}, "", ORIGINAL_LOCATION);

    // clear body between each render
    document.body.innerHTML = "";
  });

  test("WHEN submit `davidhorm` as username, THEN query params is `?username=davidhorm`", async () => {
    const user = userEvent.setup();
    render(
      <MockServiceProvider>
        <SearchFilterForm />
      </MockServiceProvider>
    );
    const input: HTMLInputElement = screen.getByLabelText("BGG Username");

    expect(location.search).toBe("");
    expect(input.value).toBe("");

    await user.type(input, "davidhorm{enter}");

    expect(input.value).toBe("davidhorm");
    expect(location.search).toBe("?username=davidhorm");
  });
});
