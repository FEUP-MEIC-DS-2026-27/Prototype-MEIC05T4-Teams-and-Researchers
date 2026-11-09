import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import TeamsNavigationLink from "../TeamsNavigationLink";
import TeamsPage from "../TeamsPage";

describe("Module Federation entry points", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the read-only Teams Overview using the VA1 mock data", async () => {
    vi.stubEnv("PUBLIC_USE_MOCK", "true");
    render(<TeamsPage />);

    expect(await screen.findByRole("heading", { name: "Teams Overview" })).toBeInTheDocument();
    expect(screen.getByText("Alpha Team")).toBeInTheDocument();
    expect(screen.getByText("Beta Team")).toBeInTheDocument();
    expect(screen.getByText("Members: 5")).toBeInTheDocument();
    expect(screen.getByText("Members: 3")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New team" })).not.toBeInTheDocument();
  });

  it("filters teams by name", async () => {
    vi.stubEnv("PUBLIC_USE_MOCK", "true");
    const user = userEvent.setup();
    render(<TeamsPage />);

    await user.type(screen.getByRole("searchbox", { name: "Search teams" }), "beta");

    expect(screen.getByText("Beta Team")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Team")).not.toBeInTheDocument();
  });

  it("builds an active Teams link under the existing VA1 base path", () => {
    render(
      <MemoryRouter initialEntries={["/va1/teams"]}>
        <TeamsNavigationLink basePath="/va1" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Teams" })).toHaveAttribute("href", "/va1/teams");
    expect(screen.getByRole("link", { name: "Teams" })).toHaveClass("active");
  });
});
