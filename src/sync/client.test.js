import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchAccountData } from "./client.js";

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
