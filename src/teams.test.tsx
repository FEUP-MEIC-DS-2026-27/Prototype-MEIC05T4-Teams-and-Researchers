import { render, screen } from "@testing-library/react";
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

  // TODO [Pessoa 3]: testes de validação (campos obrigatórios, nome duplicado).
  it.todo("validates required fields");
  // TODO [Pessoa 1/2]: testes de áreas e líder.
  it.todo("saves research areas and leader");
  // TODO [Pessoa 5]: teste de modo só de leitura.
  it.todo("is read-only for non-admins");
  // TODO [Pessoa 4]: testes do cliente HTTP (mock de fetch).
  it.todo("handles API errors");
});
