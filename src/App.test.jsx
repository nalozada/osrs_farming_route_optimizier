// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import App from "./App.jsx";

const realFetch = global.fetch;
afterEach(() => {
  cleanup();
  localStorage.clear();
  global.fetch = realFetch;
});

const setProfile = (over = {}) =>
  localStorage.setItem("osrs_fp_v5", JSON.stringify({ quests: {}, diaries: {}, teleports: { explorerRing: true }, unlocks: {}, farmingLevel: 50, ...over }));

describe("App (smoke)", () => {
  it("mounts and renders the shell without crashing", () => {
    render(<App />);
    expect(screen.getByText(/FARMING ROUTE OPTIMIZER/i)).toBeTruthy();
    expect(screen.getByText(/Select Patch Types/i)).toBeTruthy();
    expect(screen.getByText(/Set Up Your Account Profile/i)).toBeTruthy();
  });

  it("opens the profile editor with Account Sync + Farming Level", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /^Farming Level$/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Account Sync/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /sync from my gim account/i })).toBeTruthy();
  });

  it("recovers gracefully from a corrupt saved profile", () => {
    localStorage.setItem("osrs_fp_v5", "{ this is not valid json");
    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByText(/Select Patch Types/i)).toBeTruthy();
  });
});

describe("App bank-aware gating", () => {
  it("with no account data, shows no seed-blocking UI (graceful degradation)", () => {
    setProfile();
    render(<App />);
    expect(screen.queryByText(/no seeds in bank/i)).toBeNull();
  });

  it("greys patch types that have no plantable owned seed when account data is present", () => {
    setProfile({ farmingLevel: 50 });
    // Synced account that owns NO seeds -> herb/allotment/etc. become blocked.
    localStorage.setItem("osrs_acct_v1", JSON.stringify({
      updatedAt: "2026-06-17T00:00:00.000Z",
      farmingLevel: 50, quests: {}, diaries: {},
      seeds: {}, ownedSeedNames: [],
    }));
    render(<App />);
    // At least the herb tile (no pick-only crop) should read "no seeds in bank".
    expect(screen.getAllByText(/no seeds in bank/i).length).toBeGreaterThan(0);
  });
});

describe("App hourly auto-sync", () => {
  it("auto-syncs on open (when enabled + stale) and merges account facts into the profile", async () => {
    setProfile({ farmingLevel: 30 });
    localStorage.setItem("osrs_sync_v1", JSON.stringify({ workerUrl: "https://w.test", autoSync: true }));
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ updatedAt: "2026-06-17T00:00:00.000Z", farmingLevel: 80, quests: { myArm: true }, diaries: { falador: "Hard" }, seeds: { herb: true }, ownedSeedNames: ["Ranarr seed"] }),
    }));
    render(<App />);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(80));
    expect(global.fetch).toHaveBeenCalledWith("https://w.test", { cache: "no-store" });
    // bank data cached for gating
    expect(JSON.parse(localStorage.getItem("osrs_acct_v1")).ownedSeedNames).toContain("Ranarr seed");
  });

  it("does NOT auto-sync when the toggle is off", async () => {
    setProfile({ farmingLevel: 30 });
    localStorage.setItem("osrs_sync_v1", JSON.stringify({ workerUrl: "https://w.test", autoSync: false }));
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ farmingLevel: 80 }) }));
    render(<App />);
    await new Promise(r => setTimeout(r, 40));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(30);
  });
});

describe("App WiseOldMan level import", () => {
  it("fills Farming level from a username", async () => {
    setProfile({ farmingLevel: 30 });
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ latestSnapshot: { data: { skills: { farming: { level: 77 } } } } }),
    }));
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    fireEvent.change(screen.getByLabelText(/username for wiseoldman/i), { target: { value: "some rsn" } });
    fireEvent.click(screen.getByRole("button", { name: /fill level from username/i }));
    const numberInput = screen.getByRole("spinbutton", { name: /farming level/i });
    await waitFor(() => expect(numberInput.value).toBe("77"));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("api.wiseoldman.net"));
  });
});
