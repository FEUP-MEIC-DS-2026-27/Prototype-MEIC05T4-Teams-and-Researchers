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

  it("renders the Teams Overview with demo data and create/edit controls", async () => {
    vi.stubEnv("PUBLIC_USE_MOCK", "true");
    render(<TeamsPage />);

    expect(await screen.findByRole("heading", { name: "Teams Overview" })).toBeInTheDocument();
    expect(screen.getByText("Interaction Lab")).toBeInTheDocument();
    expect(screen.getByText("Trustworthy Software")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New team" })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Edit /)).toHaveLength(2);
  });

  it("opens the team form when the host enables admin controls", async () => {
    vi.stubEnv("PUBLIC_USE_MOCK", "true");
    const user = userEvent.setup();
    render(<TeamsPage />);

    await user.click(await screen.findByRole("button", { name: "New team" }));

    expect(screen.getByRole("heading", { name: "Create team" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Leader")).toBeInTheDocument();
    expect(screen.getByText("Research areas")).toBeInTheDocument();
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
