import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import TeamsNavigationLink from "../TeamsNavigationLink";
import TeamsPage from "../TeamsPage";

describe("Module Federation entry points", () => {
  it("renders the embedded directory as an demonstration, hiding admin actions by default", async () => {
    render(<TeamsPage />);

    expect(await screen.findByText("Interaction Lab")).toBeInTheDocument();
    expect(screen.getByText(/Demonstration data only/)).toBeInTheDocument();
    expect(screen.getByText(/not loaded from or saved to the backend/)).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveClass("table", "table-striped");
    expect(screen.queryByRole("button", { name: "New team" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Edit /)).not.toBeInTheDocument();
    expect(screen.queryByText(/read-only/i)).not.toBeInTheDocument();
  });

  it("shows New team and Edit buttons when the host passes isAdmin", async () => {
    render(<TeamsPage isAdmin />);

    expect(await screen.findByRole("button", { name: "New team" })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Edit /).length).toBeGreaterThan(0);
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
