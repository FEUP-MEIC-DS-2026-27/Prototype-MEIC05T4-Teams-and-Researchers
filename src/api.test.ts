import { createHttpApi } from "./api";

const input = { name: "Data Crew", description: "", areaIds: [], leaderId: "" };

function respond(status: number, body: unknown = {}) {
  return vi.fn().mockImplementation(async () => new Response(JSON.stringify(body), { status }));
}

describe("createHttpApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends the current bearer token on every request", async () => {
    const fetchMock = respond(200, []);
    vi.stubGlobal("fetch", fetchMock);
    let token = "t1";
    const api = createHttpApi("https://gw.test/api/", () => token);

    await api.listTeams();
    token = "t2";
    await api.listTeams();

    expect(fetchMock.mock.calls[0][0]).toBe("https://gw.test/api/teams");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer t1");
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer t2");
  });

  it("omits Authorization when there is no token", async () => {
    const fetchMock = respond(200, []);
    vi.stubGlobal("fetch", fetchMock);
    await createHttpApi("https://gw.test").listTeams();
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("creates and updates teams with a JSON body", async () => {
    const fetchMock = respond(200, { id: "t9", ...input });
    vi.stubGlobal("fetch", fetchMock);
    const api = createHttpApi("https://gw.test");

    await api.createTeam(input);
    await api.updateTeam("t 9", input);

    const [create, update] = fetchMock.mock.calls;
    expect(create[0]).toBe("https://gw.test/teams");
    expect(create[1]).toMatchObject({ method: "POST", body: JSON.stringify(input) });
    expect(create[1].headers["Content-Type"]).toBe("application/json");
    expect(update[0]).toBe("https://gw.test/teams/t%209");
    expect(update[1].method).toBe("PUT");
  });

  it("explains a 403 as a missing permission", async () => {
    vi.stubGlobal("fetch", respond(403));
    await expect(createHttpApi("https://gw.test").createTeam(input)).rejects.toThrow(
      "You don't have permission to do this.",
    );
  });

  it("explains a 401 as an expired session", async () => {
    vi.stubGlobal("fetch", respond(401));
    await expect(createHttpApi("https://gw.test").listTeams()).rejects.toThrow("session has expired");
  });

  it("reports other failures with the status code", async () => {
    vi.stubGlobal("fetch", respond(500));
    await expect(createHttpApi("https://gw.test").listTeams()).rejects.toThrow("HTTP 500");
  });
});
