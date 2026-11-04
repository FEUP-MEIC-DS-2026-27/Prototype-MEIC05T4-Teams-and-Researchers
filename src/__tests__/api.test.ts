import { ApiError, createHttpApi } from "../api";

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

  it("trims trailing slashes from the base URL", async () => {
    const fetchMock = respond(200, []);
    vi.stubGlobal("fetch", fetchMock);
    await createHttpApi("https://gw.test/api///").listTeams();
    expect(fetchMock.mock.calls[0][0]).toBe("https://gw.test/api/teams");
  });

  it("loads research areas and researchers from their endpoints", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "hci", name: "HCI" }])))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "r1", name: "Ana Ribeiro" }])));
    vi.stubGlobal("fetch", fetchMock);
    const api = createHttpApi("/gateway");

    await expect(api.listAreas()).resolves.toEqual([{ id: "hci", name: "HCI" }]);
    await expect(api.listResearchers()).resolves.toEqual([{ id: "r1", name: "Ana Ribeiro" }]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/gateway/research-areas",
      "/gateway/researchers",
    ]);
  });

  it("rejects an empty API Gateway URL", () => {
    expect(() => createHttpApi(" /// ")).toThrow("API Gateway base URL is required.");
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

  it("surfaces the message from a JSON error body, naming the status once", async () => {
    vi.stubGlobal("fetch", respond(503, { code: "UNAVAILABLE", message: "Unavailable" }));
    await expect(createHttpApi("https://gw.test").listTeams()).rejects.toMatchObject({
      message: "API request failed (503): Unavailable",
      status: 503,
    });
  });

  it("reports other failures with the status code", async () => {
    vi.stubGlobal("fetch", respond(500));
    await expect(createHttpApi("https://gw.test").listTeams()).rejects.toThrow("HTTP 500");
  });

  it("never puts a non-JSON error body (such as a gateway HTML page) in the message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html><body>502 Bad Gateway</body></html>", { status: 502 })),
    );
    const error = await createHttpApi("https://gw.test").listTeams().catch((e: Error) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as Error).message).toBe("The request failed (HTTP 502).");
  });

  it("explains a network failure instead of showing the raw fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await createHttpApi("https://gw.test").listTeams().catch((e: Error) => e);

    expect((error as Error).message).toMatch(/could not reach the server/i);
    expect((error as Error).cause).toBeInstanceOf(TypeError);
  });

  describe("field errors", () => {
    it("exposes fieldErrors from a 400, keeping only TeamInput fields with text", async () => {
      vi.stubGlobal(
        "fetch",
        respond(400, {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          fieldErrors: { name: "Name is required.", leaderId: 7, color: "red", description: "  " },
        }),
      );
      const error = await createHttpApi("https://gw.test").createTeam(input).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ status: 400, fieldErrors: { name: "Name is required." } });
      expect((error as ApiError).fieldErrors).toEqual({ name: "Name is required." });
    });

    it("has no fieldErrors when none are usable", async () => {
      vi.stubGlobal("fetch", respond(400, { message: "Bad.", fieldErrors: { color: "red" } }));
      const error = await createHttpApi("https://gw.test").createTeam(input).catch((e: unknown) => e);

      expect((error as ApiError).fieldErrors).toBeUndefined();
    });

    it("treats a 409 as a name conflict, using the service's message", async () => {
      vi.stubGlobal(
        "fetch",
        respond(409, { code: "TEAM_NAME_CONFLICT", message: "A team with this name already exists." }),
      );
      const error = await createHttpApi("https://gw.test").updateTeam("t1", input).catch((e: unknown) => e);

      expect((error as ApiError).fieldErrors).toEqual({ name: "A team with this name already exists." });
    });

    it("still reports a name conflict when the 409 has no body", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 409 })));
      const error = await createHttpApi("https://gw.test").createTeam(input).catch((e: unknown) => e);

      expect((error as ApiError).fieldErrors).toEqual({ name: "A team with this name already exists." });
      expect((error as ApiError).message).toBe("The request failed (HTTP 409).");
    });

    it("does not attach fieldErrors to 401 and 403", async () => {
      vi.stubGlobal("fetch", respond(403, { fieldErrors: { name: "nope" } }));
      const error = await createHttpApi("https://gw.test").createTeam(input).catch((e: unknown) => e);

      expect(error).toMatchObject({ status: 403 });
      expect((error as ApiError).fieldErrors).toBeUndefined();
    });
  });

  describe("response shape", () => {
    const team = { id: "t1", name: "Lab", description: "Desc", areaIds: ["a"], leaderId: "r1" };

    function answer(body: unknown) {
      vi.stubGlobal("fetch", respond(200, body));
      return createHttpApi("https://gw.test");
    }

    it("rejects a teams response that is not an array", async () => {
      await expect(answer({ items: [] }).listTeams()).rejects.toThrow(
        "The API returned an unexpected response for /teams.",
      );
    });

    it.each([
      ["areaIds", { ...team, areaIds: undefined }],
      ["areaIds entries", { ...team, areaIds: [1] }],
      ["name", { ...team, name: null }],
      ["id", { ...team, id: 1 }],
      ["leaderId", { ...team, leaderId: null }],
      ["description", { ...team, description: undefined }],
    ])("rejects a team with a missing or malformed %s", async (_field, bad) => {
      await expect(answer([team, bad]).listTeams()).rejects.toThrow("unexpected response for /teams");
    });

    it("accepts teams without updatedAt, which the UI never reads", async () => {
      await expect(answer([team]).listTeams()).resolves.toEqual([team]);
    });

    it("rejects lookups that are not arrays of {id, name}", async () => {
      await expect(answer({ id: "a", name: "A" }).listAreas()).rejects.toThrow("unexpected response for /research-areas");
      await expect(answer([{ id: "r1" }]).listResearchers()).rejects.toThrow("unexpected response for /researchers");
    });

    it("rejects a created or updated team that is not a team", async () => {
      await expect(answer([team]).createTeam(input)).rejects.toThrow("unexpected response for /teams");
      await expect(answer({ ok: true }).updateTeam("t1", input)).rejects.toThrow("unexpected response for /teams/t1");
    });
  });
});
