import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryApi } from "../memoryApi";
import { mount, unmount } from "../mount";
import { TeamsAdminApp } from "../TeamsAdminApp";

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
    await user.type(screen.getByLabelText("Description"), "A team for data research.");
    await user.selectOptions(screen.getByLabelText("Research areas"), ["ds", "se"]);
    await user.selectOptions(screen.getByLabelText("Leader"), "r3");
    await user.click(screen.getByRole("button", { name: "Save" }));
    const row = (await screen.findByRole("rowheader", { name: "Data Crew" })).closest("tr")!;
    expect(within(row).getByText("Data Science")).toBeInTheDocument();
    expect(within(row).getByText("Software Engineering")).toBeInTheDocument();
    expect(within(row).getByText("Carla Nogueira")).toBeInTheDocument();
  });

  it("edits a team", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByLabelText("Edit Interaction Lab"));
    const name = screen.getByLabelText("Name");
    await user.clear(name);
    await user.type(name, "Interaction Group");
    await user.selectOptions(screen.getByLabelText("Research areas"), ["se", "sec"]);
    await user.selectOptions(screen.getByLabelText("Leader"), "r4");
    await user.click(screen.getByRole("button", { name: "Save" }));
    const row = (await screen.findByRole("rowheader", { name: "Interaction Group" })).closest("tr")!;
    expect(within(row).getByText("Software Engineering")).toBeInTheDocument();
    expect(within(row).getByText("Cybersecurity")).toBeInTheDocument();
    expect(within(row).getByText("Diogo Faria")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Description is required.")).toBeInTheDocument();
    expect(screen.getByText("Select at least one research area.")).toBeInTheDocument();
    expect(screen.getByText("Leader is required.")).toBeInTheDocument();
  });
  it("is read-only for non-admins", async () => {
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin={false} />);
    expect(await screen.findByText("Interaction Lab")).toBeInTheDocument();
    expect(screen.queryByText("New team")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Edit /)).not.toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("read-only access");
  });

  it("does not show the read-only note to admins", async () => {
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await screen.findByText("Interaction Lab");
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("shows why the teams could not be loaded", async () => {
    const api = {
      ...createMemoryApi(),
      listTeams: () => Promise.reject(new Error("You don't have permission to do this.")),
    };
    render(<TeamsAdminApp api={api} isAdmin={false} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("You don't have permission to do this.");
  });

  it("leaves the editor when admin rights are lost", async () => {
    const user = userEvent.setup();
    const api = createMemoryApi();
    const { rerender } = render(<TeamsAdminApp api={api} isAdmin />);
    await user.click(await screen.findByLabelText("Edit Interaction Lab"));
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    rerender(<TeamsAdminApp api={api} isAdmin={false} />);
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByText("Interaction Lab")).toBeInTheDocument();
  });

  it("mounts read-only unless isAdmin is exactly true", async () => {
    const el = document.createElement("div");
    document.body.append(el);
    await act(async () => mount(el, { isAdmin: "false" as unknown as boolean, api: createMemoryApi() }));
    expect(await screen.findByText("Interaction Lab")).toBeInTheDocument();
    expect(screen.queryByText("New team")).not.toBeInTheDocument();
    await act(async () => unmount(el));
    el.remove();
  });

  it("saves research areas", async () => {
    const user = userEvent.setup();
    const api = createMemoryApi();
    const createSpy = vi.spyOn(api, 'createTeam');
    render(<TeamsAdminApp api={api} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await user.type(screen.getByLabelText("Name"), "Data & AI Team");
    const areasSelect = screen.getByLabelText("Research Areas");
    await user.selectOptions(areasSelect, ["Artificial Intelligence", "Data Science"]);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Data & AI Team")).toBeInTheDocument();
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Data & AI Team",
        areaIds: ["ai", "ds"] 
      })
    );
  });

  it.todo("handles API errors");
});
