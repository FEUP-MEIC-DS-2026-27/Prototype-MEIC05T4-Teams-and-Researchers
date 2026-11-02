import { act, render, screen } from "@testing-library/react";
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
  it.todo("saves research areas and leader");
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

  it("shows a loading state while teams are being fetched", () => {
    const api = createMemoryApi();
    api.listTeams = () => new Promise(() => {});
    api.listAreas = () => new Promise(() => {});
    api.listResearchers = () => new Promise(() => {});
    render(<TeamsAdminApp api={api} isAdmin />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading teams…");
  });

  it("retries after a teams load error", async () => {
    const user = userEvent.setup();
    const memoryApi = createMemoryApi();
    const listTeams = vi.fn()
      .mockRejectedValueOnce(new Error("Service unavailable"))
      .mockImplementation(() => memoryApi.listTeams());
    const api = { ...memoryApi, listTeams };
    render(<TeamsAdminApp api={api} isAdmin />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Interaction Lab")).toBeInTheDocument();
    expect(listTeams).toHaveBeenCalledTimes(2);
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

  it.todo("handles API errors");
});
