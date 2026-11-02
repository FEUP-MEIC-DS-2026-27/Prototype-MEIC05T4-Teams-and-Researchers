import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "../ErrorBoundary";
import { createMemoryApi } from "../memoryApi";
import { mount, unmount } from "../mount";
import type { Team } from "../types";

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React and the boundary both log the caught error; keep the test output clean.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("shows a message instead of a blank page and recovers on Try again", async () => {
    const user = userEvent.setup();
    let broken = true;
    function Fragile() {
      if (broken) throw new Error("boom");
      return <p>All good</p>;
    }
    render(
      <ErrorBoundary>
        <Fragile />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong while showing the teams.");
    expect(screen.queryByText("All good")).not.toBeInTheDocument();

    broken = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("keeps a mounted microfrontend from blanking its slot when the data is malformed", async () => {
    // A custom API that skips the HTTP client's shape check and returns garbage.
    const api = {
      ...createMemoryApi(),
      listTeams: async () => ({ items: [] }) as unknown as Team[],
    };
    const el = document.createElement("div");
    document.body.append(el);

    await act(async () => mount(el, { isAdmin: true, api }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    expect(el).not.toBeEmptyDOMElement();

    await act(async () => unmount(el));
    el.remove();
  });
});
