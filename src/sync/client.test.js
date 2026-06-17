import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchAccountData, fetchMembers } from "./client.js";

const realFetch = global.fetch;
afterEach(() => { global.fetch = realFetch; });

describe("fetchAccountData", () => {
  it("returns parsed data on a 200", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ farmingLevel: 80 }) }));
    await expect(fetchAccountData("https://w.test")).resolves.toEqual({ farmingLevel: 80 });
    expect(global.fetch).toHaveBeenCalledWith("https://w.test", { cache: "no-store" });
  });

  it("throws the worker's error message", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ error: "player not found" }) }));
    await expect(fetchAccountData("https://w.test")).rejects.toThrow(/player not found/);
  });

  it("throws on a non-OK status", async () => {
    global.fetch = vi.fn(async () => ({ ok: false, status: 502, json: async () => null }));
    await expect(fetchAccountData("https://w.test")).rejects.toThrow(/502/);
  });
});

describe("fetchMembers", () => {
  it("returns the members list + meta from the new Worker shape", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({
      updatedAt: "2026-06-17T00:00:00.000Z", defaultPlayer: "Fentf0ld",
      members: [{ name: "Fentf0ld", farmingLevel: 80 }, { name: "Alice", farmingLevel: 50 }],
    }) }));
    const r = await fetchMembers("https://w.test");
    expect(r.defaultPlayer).toBe("Fentf0ld");
    expect(r.members.map(m => m.name)).toEqual(["Fentf0ld", "Alice"]);
    expect(r.updatedAt).toBe("2026-06-17T00:00:00.000Z");
  });

  it("drops member entries without a name", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({
      members: [{ name: "Fentf0ld", farmingLevel: 80 }, { farmingLevel: 1 }, null],
    }) }));
    const r = await fetchMembers("https://w.test");
    expect(r.members.map(m => m.name)).toEqual(["Fentf0ld"]);
  });

  it("wraps a legacy single-AccountData response as one member", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ farmingLevel: 80, quests: { myArm: true } }) }));
    const r = await fetchMembers("https://w.test");
    expect(r.members).toHaveLength(1);
    expect(r.members[0].name).toBe("My account");
    expect(r.members[0].farmingLevel).toBe(80);
  });

  it("throws the worker's error message", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ error: "no members found" }) }));
    await expect(fetchMembers("https://w.test")).rejects.toThrow(/no members found/);
  });
});
