import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError, createHttpApi } from "../api";
import { createMemoryApi } from "../memoryApi";
import { mount, unmount } from "../mount";
import { TeamsAdminApp } from "../TeamsAdminApp";

/** Fills name, description and leader; the caller picks the research areas. */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.type(screen.getByLabelText("Name"), name);
  await user.type(screen.getByLabelText("Description"), "A team for data research.");
  await user.selectOptions(screen.getByLabelText("Leader"), "r3");
}

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
    await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
    await user.click(screen.getByRole("checkbox", { name: "Software Engineering" }));
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
    // The team's current area is pre-checked; swap it for two others.
    expect(screen.getByRole("checkbox", { name: "Human-Computer Interaction" })).toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: "Human-Computer Interaction" }));
    await user.click(screen.getByRole("checkbox", { name: "Software Engineering" }));
    await user.click(screen.getByRole("checkbox", { name: "Cybersecurity" }));
    await user.selectOptions(screen.getByLabelText("Leader"), "r4");
    await user.click(screen.getByRole("button", { name: "Save" }));
    const row = (await screen.findByRole("rowheader", { name: "Interaction Group" })).closest("tr")!;
    expect(within(row).getByText("Software Engineering")).toBeInTheDocument();
    expect(within(row).getByText("Cybersecurity")).toBeInTheDocument();
    expect(within(row).queryByText("Human-Computer Interaction")).not.toBeInTheDocument();
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

  it("explains a missing research area next to the area checkboxes", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await fillValidForm(user, "Data Crew");
    await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
    await user.click(screen.getByRole("checkbox", { name: "Data Science" })); // untick again
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Select at least one research area.");
    expect(screen.getByRole("group", { name: "Research areas" })).toHaveAccessibleDescription(
      "Select at least one research area.",
    );
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

  it("saves research areas", async () => {
    const user = userEvent.setup();
    const api = createMemoryApi();
    const createSpy = vi.spyOn(api, 'createTeam');
    render(<TeamsAdminApp api={api} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await fillValidForm(user, "Data & AI Team");
    await user.click(screen.getByRole("checkbox", { name: "Artificial Intelligence" }));
    await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Data & AI Team")).toBeInTheDocument();
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Data & AI Team",
        description: "A team for data research.",
        areaIds: ["ai", "ds"],
        leaderId: "r3",
      }),
    );
  });

  it("does not submit unchecked areas", async () => {
    const user = userEvent.setup();
    const api = createMemoryApi();
    const createSpy = vi.spyOn(api, "createTeam");
    render(<TeamsAdminApp api={api} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await fillValidForm(user, "Data Crew");
    await user.click(screen.getByRole("checkbox", { name: "Artificial Intelligence" }));
    await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
    await user.click(screen.getByRole("checkbox", { name: "Artificial Intelligence" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText('Team "Data Crew" created.');
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ areaIds: ["ds"] }));
  });

  it("shows a save error and keeps the form open", async () => {
    const user = userEvent.setup();
    const api = createMemoryApi();
    api.createTeam = () => Promise.reject(new Error("Service unavailable"));
    render(<TeamsAdminApp api={api} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await fillValidForm(user, "Data Crew");
    await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable");
    expect(screen.getByLabelText("Name")).toHaveValue("Data Crew");
  });

  it("does not carry a failed save's error into the next form", async () => {
    const user = userEvent.setup();
    const api = createMemoryApi();
    api.createTeam = () => Promise.reject(new Error("Service unavailable"));
    render(<TeamsAdminApp api={api} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await fillValidForm(user, "Data Crew");
    await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Service unavailable");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByText("New team"));
    expect(screen.queryByText("Service unavailable")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByLabelText("Edit Interaction Lab"));
    expect(screen.queryByText("Service unavailable")).not.toBeInTheDocument();
  });

  describe("service errors", () => {
    const nameTaken = "A team with this name already exists.";

    afterEach(() => vi.unstubAllGlobals());

    it("shows a name conflict next to the name field and lets the user fix it", async () => {
      const user = userEvent.setup();
      const memoryApi = createMemoryApi();
      const createTeam = vi.fn()
        .mockRejectedValueOnce(
          new ApiError(`API request failed (409): ${nameTaken}`, 409, { name: nameTaken }),
        )
        .mockImplementation((input) => memoryApi.createTeam(input));
      render(<TeamsAdminApp api={{ ...memoryApi, createTeam }} isAdmin />);
      await user.click(await screen.findByText("New team"));
      await fillValidForm(user, "Data Crew");
      await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      // One alert, beside the field, instead of a general banner.
      expect(await screen.findByRole("alert")).toHaveTextContent(nameTaken);
      expect(screen.getAllByRole("alert")).toHaveLength(1);
      expect(screen.getByDisplayValue("Data Crew")).toHaveAttribute("aria-invalid", "true");

      await user.type(screen.getByDisplayValue("Data Crew"), " 2");
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(await screen.findByText('Team "Data Crew 2" created.')).toBeInTheDocument();
    });

    it("shows service validation errors on the matching fields", async () => {
      const user = userEvent.setup();
      const api = createMemoryApi();
      api.createTeam = () =>
        Promise.reject(
          new ApiError("API request failed (400): Request validation failed.", 400, {
            leaderId: "Unknown researcher.",
            areaIds: "Unknown research area.",
          }),
        );
      render(<TeamsAdminApp api={api} isAdmin />);
      await user.click(await screen.findByText("New team"));
      await fillValidForm(user, "Data Crew");
      await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(await screen.findByText("Unknown researcher.")).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Research areas" })).toHaveAccessibleDescription(
        "Unknown research area.",
      );
    });

    it("does not carry service field errors into the next form", async () => {
      const user = userEvent.setup();
      const api = createMemoryApi();
      api.createTeam = () => Promise.reject(new ApiError(nameTaken, 409, { name: nameTaken }));
      render(<TeamsAdminApp api={api} isAdmin />);
      await user.click(await screen.findByText("New team"));
      await fillValidForm(user, "Data Crew");
      await user.click(screen.getByRole("checkbox", { name: "Data Science" }));
      await user.click(screen.getByRole("button", { name: "Save" }));
      await screen.findByText(nameTaken);

      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await user.click(screen.getByText("New team"));
      expect(screen.queryByText(nameTaken)).not.toBeInTheDocument();
    });

    it("shows an error with Retry when the gateway answers with an unexpected shape", async () => {
      const user = userEvent.setup();
      const teams = [{ id: "t1", name: "Interaction Lab", description: "d", areaIds: ["hci"], leaderId: "r1" }];
      let teamsRequests = 0;
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(async (url: string) => {
          if (!url.endsWith("/teams")) return new Response("[]");
          // An object instead of an array the first time, a proper list after Retry.
          teamsRequests += 1;
          return new Response(JSON.stringify(teamsRequests === 1 ? { items: teams } : teams));
        }),
      );
      render(<TeamsAdminApp api={createHttpApi("https://gw.test")} isAdmin={false} />);

      expect(await screen.findByRole("alert")).toHaveTextContent("unexpected response for /teams");
      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(await screen.findByText("Interaction Lab")).toBeInTheDocument();
    });
  });

  describe("lookups (research areas and researchers)", () => {
    it("loads each lookup once", async () => {
      const api = createMemoryApi();
      const listAreas = vi.spyOn(api, "listAreas");
      const listResearchers = vi.spyOn(api, "listResearchers");
      render(<TeamsAdminApp api={api} isAdmin />);
      await screen.findByText("Interaction Lab");

      expect(listAreas).toHaveBeenCalledTimes(1);
      expect(listResearchers).toHaveBeenCalledTimes(1);
    });

    it("tells the user when they fail to load and retries them", async () => {
      const user = userEvent.setup();
      const memoryApi = createMemoryApi();
      const listResearchers = vi.fn()
        .mockRejectedValueOnce(new Error("Researchers unavailable"))
        .mockImplementation(() => memoryApi.listResearchers());
      const api = { ...memoryApi, listResearchers };
      render(<TeamsAdminApp api={api} isAdmin />);

      // Teams still show, with the failed lookup reported above them.
      expect(await screen.findByText("Interaction Lab")).toBeInTheDocument();
      expect(await screen.findByRole("alert")).toHaveTextContent("Researchers unavailable");

      await user.click(screen.getByRole("button", { name: "Retry" }));
      await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
      expect(await screen.findByText("Ana Ribeiro")).toBeInTheDocument();
      expect(listResearchers).toHaveBeenCalledTimes(2);
    });

    it("keeps the areas that did load when the researchers fail", async () => {
      const user = userEvent.setup();
      const api = createMemoryApi();
      api.listResearchers = () => Promise.reject(new Error("Researchers unavailable"));
      render(<TeamsAdminApp api={api} isAdmin />);
      await user.click(await screen.findByText("New team"));

      expect(screen.getByRole("checkbox", { name: "Data Science" })).toBeInTheDocument();
    });

    it("explains an empty leader list in the form and retries without losing input", async () => {
      const user = userEvent.setup();
      const memoryApi = createMemoryApi();
      const listResearchers = vi.fn()
        .mockRejectedValueOnce(new Error("Researchers unavailable"))
        .mockImplementation(() => memoryApi.listResearchers());
      const api = { ...memoryApi, listResearchers };
      render(<TeamsAdminApp api={api} isAdmin />);
      await user.click(await screen.findByText("New team"));
      await user.type(screen.getByLabelText("Name"), "Data Crew");

      expect(await screen.findByRole("alert")).toHaveTextContent("Researchers unavailable");
      expect(screen.queryByRole("option", { name: "Carla Nogueira" })).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(await screen.findByRole("option", { name: "Carla Nogueira" })).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toHaveValue("Data Crew");
    });

    it("shows a single Retry when everything fails to load", async () => {
      const api = createMemoryApi();
      api.listTeams = () => Promise.reject(new Error("Gateway down"));
      api.listAreas = () => Promise.reject(new Error("Gateway down"));
      api.listResearchers = () => Promise.reject(new Error("Gateway down"));
      render(<TeamsAdminApp api={api} isAdmin />);

      expect(await screen.findByRole("alert")).toHaveTextContent("Gateway down");
      expect(screen.getAllByRole("button", { name: "Retry" })).toHaveLength(1);
    });
  });
});
