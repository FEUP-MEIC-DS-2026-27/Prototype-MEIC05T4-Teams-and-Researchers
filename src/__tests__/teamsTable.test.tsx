import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryApi } from "../memoryApi";
import { TeamsAdminApp } from "../TeamsAdminApp";

describe("Teams table", () => {
  it("shows research areas and leader names", async () => {
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    const row = (await screen.findByRole("rowheader", { name: "Trustworthy Software" })).closest("tr")!;
    expect(within(row).getByText("Software Engineering")).toBeInTheDocument();
    expect(within(row).getByText("Cybersecurity")).toBeInTheDocument();
    expect(within(row).getByText("Bruno Matos")).toBeInTheDocument();
  });

  it("filters by name", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await screen.findByText("Interaction Lab");
    await user.type(screen.getByLabelText("Search by name"), "trust");
    expect(screen.queryByText("Interaction Lab")).not.toBeInTheDocument();
    expect(screen.getByText("Trustworthy Software")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 teams")).toBeInTheDocument();
  });

  it("filters by research area and clears filters", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await screen.findByText("Interaction Lab");
    await user.selectOptions(screen.getByLabelText("Research area"), "Cybersecurity");
    expect(screen.queryByText("Interaction Lab")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Interaction Lab")).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await screen.findByText("Interaction Lab");
    await user.type(screen.getByLabelText("Search by name"), "zzz");
    expect(screen.getByText("No teams match the current filters.")).toBeInTheDocument();
  });

  it("confirms after saving", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await user.type(screen.getByLabelText("Name"), "Data Crew");
    await user.type(screen.getByLabelText("Description"), "A team for data research.");
    await user.selectOptions(screen.getByLabelText("Research areas"), "ds");
    await user.selectOptions(screen.getByLabelText("Leader"), "r3");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText('Team "Data Crew" created.')).toBeInTheDocument();
  });
});
