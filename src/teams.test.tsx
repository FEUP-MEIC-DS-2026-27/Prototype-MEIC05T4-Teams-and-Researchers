import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryApi } from "./memoryApi";
import { TeamsAdminApp } from "./TeamsAdminApp";
import { validateTeam } from "./validation";

const valid = { name: "New", description: "d", areaIds: ["hci"], leaderId: "r1" };

describe("validateTeam", () => {
  it("accepts a valid team", () => {
    expect(validateTeam(valid, [])).toEqual({});
  });

  it("requires all fields", () => {
    const errors = validateTeam({ name: " ", description: "", areaIds: [], leaderId: "" }, []);
    expect(Object.keys(errors).sort()).toEqual(["areaIds", "description", "leaderId", "name"]);
  });

  it("rejects duplicate names except for the team being edited", () => {
    const existing = [{ ...valid, id: "t1", updatedAt: "" }];
    expect(validateTeam(valid, existing).name).toMatch(/already exists/);
    expect(validateTeam(valid, existing, "t1").name).toBeUndefined();
  });
});

describe("TeamsAdminApp", () => {
  it("lets an admin create a team", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await user.type(screen.getByLabelText("Name"), "Data Crew");
    await user.type(screen.getByLabelText("Description"), "All about data");
    await user.click(screen.getByLabelText("Data Science"));
    await user.selectOptions(screen.getByLabelText("Leader"), "Carla Nogueira");
    await user.click(screen.getByRole("button", { name: "Create team" }));
    expect(await screen.findByText("Data Crew")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent('Team "Data Crew" created.');
  });

  it("shows validation errors and does not save", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByText("New team"));
    await user.click(screen.getByRole("button", { name: "Create team" }));
    expect(screen.getAllByRole("alert")).toHaveLength(4);
  });

  it("lets an admin edit a team", async () => {
    const user = userEvent.setup();
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin />);
    await user.click(await screen.findByLabelText("Edit Interaction Lab"));
    const name = screen.getByLabelText("Name");
    await user.clear(name);
    await user.type(name, "Interaction Group");
    await user.click(screen.getByText("Save changes"));
    expect(await screen.findByText("Interaction Group")).toBeInTheDocument();
    expect(screen.queryByText("Interaction Lab")).not.toBeInTheDocument();
  });

  it("is read-only for non-admins", async () => {
    render(<TeamsAdminApp api={createMemoryApi()} isAdmin={false} />);
    expect(await screen.findByText("Interaction Lab")).toBeInTheDocument();
    expect(screen.queryByText("New team")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });
});
