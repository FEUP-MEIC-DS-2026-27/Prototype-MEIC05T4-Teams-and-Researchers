import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryApi } from "./memoryApi";
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

  it("shows loading state while the teams are being fetched", () => {
    const api = createMemoryApi();
    api.listTeams = () => new Promise(() => {});
    render(<TeamsAdminApp api={api} isAdmin />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading teams…");
  });

  it("shows a load error and retries the request", async () => {
    const api = {
      ...createMemoryApi(),
      listTeams: vi.fn()
        .mockRejectedValueOnce(new Error("Service unavailable"))
        .mockResolvedValueOnce([]),
    };
    render(<TeamsAdminApp api={api} isAdmin />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("No teams found.")).toBeInTheDocument();
    expect(api.listTeams).toHaveBeenCalledTimes(2);
  });

  it.todo("validates required fields");
  it.todo("saves research areas and leader");
  it.todo("is read-only for non-admins");
});
