import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryApi, DEMO_RESEARCHERS } from "./memoryApi";
import { TeamsAdminApp } from "./TeamsAdminApp";

describe("TeamsAdminApp", () => {
  it("lists teams", async () => {
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    expect(await screen.findByText("Interaction Lab")).toBeInTheDocument();
  });

  it("creates a team", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await user.type(screen.getByLabelText("Name"), "Data Crew");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Data Crew")).toBeInTheDocument();
  });

  it("edits a team", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByLabelText("Edit Interaction Lab"));
    const name = screen.getByLabelText("Name");
    await user.clear(name);
    await user.type(name, "Interaction Group");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Interaction Group")).toBeInTheDocument();
  });

  it.todo("validates required fields");
  it.todo("saves research areas");
  it.todo("is read-only for non-admins");
  it.todo("handles API errors");
});

describe("Team leader selector", () => {
  it("lists all researchers as leader options", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByText("New team"));
    const leader = screen.getByLabelText("Leader");
    for (const r of DEMO_RESEARCHERS) {
      expect(within(leader).getByRole("option", { name: r.name })).toBeInTheDocument();
    }
    expect(leader).toHaveValue("");
  });

  it("saves the selected leader when creating a team", async () => {
    const user = userEvent.setup();
    const api = createMemoryApi();
    render(<TeamsAdminApp api={api} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await user.type(screen.getByLabelText("Name"), "Data Crew");
    await user.selectOptions(screen.getByLabelText("Leader"), "Carla Nogueira");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Data Crew");
    const created = (await api.listTeams()).find((t) => t.name === "Data Crew");
    expect(created?.leaderId).toBe("r3");
  });

  it("preselects the current leader and saves a new one when editing", async () => {
    const user = userEvent.setup();
    const api = createMemoryApi();
    render(<TeamsAdminApp api={api} isAdmin />);
    await user.click(await screen.findByLabelText("Edit Interaction Lab"));
    const leader = screen.getByLabelText("Leader");
    expect(leader).toHaveValue("r1");
    await user.selectOptions(leader, "Diogo Faria");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("New team");
    const team = (await api.listTeams()).find((t) => t.id === "t1");
    expect(team?.leaderId).toBe("r4");
  });
});
