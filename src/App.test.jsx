// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import App from "./App.jsx";

const realFetch = global.fetch;
// The Worker URL is baked in + auto-sync defaults on, so a render can fire a sync.
// Default every test to a hermetic empty-members response; tests override as needed.
beforeEach(() => {
  global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ members: [] }) }));
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  global.fetch = realFetch;
});

const setProfile = (over = {}) =>
  localStorage.setItem("osrs_fp_v5", JSON.stringify({ quests: {}, diaries: {}, teleports: { explorerRing: true }, unlocks: {}, farmingLevel: 50, ...over }));
const member = (name, over = {}) => ({ name, farmingLevel: 70, quests: {}, diaries: {}, teleports: {}, unlocks: {}, seeds: {}, ownedSeedNames: [], ownedSeedCounts: {}, ...over });

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
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(within(dialog).getByRole("heading", { name: /^Farming Level$/i })).toBeTruthy();
    expect(within(dialog).getByRole("heading", { name: /Account Sync/i })).toBeTruthy();
    // Member picker / sync control lives in the dialog's Account Sync section.
    expect(within(dialog).getByRole("button", { name: /sync/i })).toBeTruthy();
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

describe("App account sync (all members + baked-in URL)", () => {
  it("auto-syncs using the baked-in Worker URL with no saved sync settings", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({
      updatedAt: "2026-06-17T00:00:00.000Z", defaultPlayer: "Fentf0ld",
      members: [member("Fentf0ld", { farmingLevel: 88, ownedSeedNames: ["Ranarr seed"] })],
    }) }));
    render(<App />);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(88));
    expect(global.fetch.mock.calls[0][0]).toContain("workers.dev"); // the baked-in default
  });

  it("auto-selects the default player and lets you switch members", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({
      updatedAt: "2026-06-17T00:00:00.000Z", defaultPlayer: "Fentf0ld",
      members: [member("Fentf0ld", { farmingLevel: 80 }), member("Alice", { farmingLevel: 40 })],
    }) }));
    render(<App />);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(80));
    const select = screen.getByLabelText(/which gim member are you/i);
    expect(select.value).toBe("Fentf0ld");
    fireEvent.change(select, { target: { value: "Alice" } });
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(40));
    expect(JSON.parse(localStorage.getItem("osrs_sync_v1")).selectedMember).toBe("Alice");
    // Switching back re-applies Fentf0ld's synced level (isolation proven in the next test).
    fireEvent.change(select, { target: { value: "Fentf0ld" } });
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(80));
  });

  it("isolates MANUAL (user-only) toggles per member and survives a round trip", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({
      updatedAt: "2026-06-17T00:00:00.000Z", defaultPlayer: "Fentf0ld",
      members: [member("Fentf0ld", { farmingLevel: 80 }), member("Alice", { farmingLevel: 40 })],
    }) }));
    render(<App />);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(80));

    // Toggle an undetectable teleport ON while Fentf0ld is active (verify panel chip).
    fireEvent.click(await screen.findByRole("button", { name: /Spirit Tree: Prifddinas/i }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_profiles_v1")).Fentf0ld.teleports.spiritTreePrif).toBe(true));

    // Switch to Alice: her profile must NOT have the manual toggle, and the chip reads OFF.
    const select = screen.getByLabelText(/which gim member are you/i);
    fireEvent.change(select, { target: { value: "Alice" } });
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(40));
    expect(JSON.parse(localStorage.getItem("osrs_profiles_v1")).Alice.teleports.spiritTreePrif).toBeFalsy();
    expect(screen.getByRole("button", { name: /Spirit Tree: Prifddinas/i }).getAttribute("aria-pressed")).toBe("false");

    // Back to Fentf0ld: the manual toggle survives (additive merge over his own base).
    fireEvent.change(select, { target: { value: "Fentf0ld" } });
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(80));
    expect(JSON.parse(localStorage.getItem("osrs_profiles_v1")).Fentf0ld.teleports.spiritTreePrif).toBe(true);
    expect(screen.getByRole("button", { name: /Spirit Tree: Prifddinas/i }).getAttribute("aria-pressed")).toBe("true");
  });

  it("does not leak the migrated manual profile into non-owner members (defaultPlayer null)", async () => {
    // Pre-existing manual profile with a POH-mounted glory; server names no default player.
    localStorage.setItem("osrs_fp_v5", JSON.stringify({ quests: {}, diaries: {}, teleports: { amuletOfGlory: true }, unlocks: {}, farmingLevel: 50 }));
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({
      updatedAt: "2026-06-17T00:00:00.000Z", defaultPlayer: null,
      members: [member("Alice", { farmingLevel: 70 }), member("Bob", { farmingLevel: 60 })],
    }) }));
    render(<App />);
    // First member (Alice) is the implicit owner -> inherits the manual glory.
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_profiles_v1")).Alice).toBeTruthy());
    const select = screen.getByLabelText(/which gim member are you/i);
    fireEvent.change(select, { target: { value: "Bob" } });
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_profiles_v1")).Bob).toBeTruthy());
    // Bob is NOT the owner, so he must NOT inherit Alice/owner's manual glory.
    expect(JSON.parse(localStorage.getItem("osrs_profiles_v1")).Bob.teleports.amuletOfGlory).toBeFalsy();
  });

  it("does NOT auto-sync when the toggle is off", async () => {
    setProfile({ farmingLevel: 30 });
    localStorage.setItem("osrs_sync_v1", JSON.stringify({ autoSync: false }));
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ members: [member("Fentf0ld", { farmingLevel: 80 })] }) }));
    render(<App />);
    await new Promise(r => setTimeout(r, 40));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).farmingLevel).toBe(30);
  });

  it("merges teleports/unlocks ADDITIVELY (manual POH glory is preserved)", async () => {
    // Profile has a manually-enabled glory (mounted in POH) -> migrates to the owner.
    localStorage.setItem("osrs_fp_v5", JSON.stringify({ quests: {}, diaries: {}, teleports: { amuletOfGlory: true }, unlocks: {}, farmingLevel: 50 }));
    localStorage.setItem("osrs_sync_v1", JSON.stringify({ autoSync: true }));
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({
      updatedAt: "2026-06-17T00:00:00.000Z", defaultPlayer: null,
      members: [member("My account", { farmingLevel: 80, teleports: { ringOfDueling: true, fairyRing: true }, unlocks: { prifAccess: true } })],
    }) }));
    render(<App />);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).teleports.ringOfDueling).toBe(true));
    const prof = JSON.parse(localStorage.getItem("osrs_fp_v5"));
    expect(prof.teleports.amuletOfGlory).toBe(true); // NOT wiped — additive
    expect(prof.teleports.fairyRing).toBe(true);
    expect(prof.unlocks.prifAccess).toBe(true);
  });

  it("the quick-verify panel toggles an undetectable teleport on the active profile", async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({
      updatedAt: "2026-06-17T00:00:00.000Z", defaultPlayer: "Fentf0ld",
      members: [member("Fentf0ld", { farmingLevel: 80 })],
    }) }));
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Can't auto-detect these/i)).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /Spirit Tree: Prifddinas/i }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("osrs_fp_v5")).teleports.spiritTreePrif).toBe(true));
  });
});

describe("App WiseOldMan level import", () => {
  it("fills Farming level from a username", async () => {
    setProfile({ farmingLevel: 30 });
    localStorage.setItem("osrs_sync_v1", JSON.stringify({ autoSync: false })); // no incidental auto-sync
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ latestSnapshot: { data: { skills: { farming: { level: 77 } } } } }),
    }));
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    // The WOM fallback ships inside a collapsed <details>Advanced</details>; the user
    // must expand it first (jsdom doesn't toggle <details> on summary click).
    const womInput = screen.getByLabelText(/username for wiseoldman/i);
    const details = womInput.closest("details");
    expect(details.open).toBe(false);
    details.open = true;
    fireEvent.change(womInput, { target: { value: "some rsn" } });
    fireEvent.click(screen.getByRole("button", { name: /fill level from username/i }));
    const numberInput = screen.getByRole("spinbutton", { name: /farming level/i });
    await waitFor(() => expect(numberInput.value).toBe("77"));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("api.wiseoldman.net"));
  });
});

describe("App crop grid (multi-select + counts)", () => {
  it("shows a multi-select chip grid with owned counts and a plan preview", () => {
    setProfile({ farmingLevel: 99 });
    localStorage.setItem("osrs_acct_v1", JSON.stringify({
      updatedAt: "2026-06-17T00:00:00.000Z", farmingLevel: 99, quests: {}, diaries: {},
      teleports: {}, unlocks: {}, seeds: { herb: true },
      ownedSeedNames: ["Ranarr seed", "Snapdragon seed"],
      ownedSeedCounts: { "Ranarr seed": 5, "Snapdragon seed": 3 },
    }));
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /generate optimal route/i }));
    expect(screen.getByText(/Select Your Crops/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Ranarr.*own 5/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Snapdragon.*own 3/i })).toBeTruthy();
    expect(screen.getAllByText(/^Plan:/i).length).toBeGreaterThan(0);
  });

  it("disables crop chips above the player's Farming level", () => {
    setProfile({ farmingLevel: 50 }); // no account data; herb still reachable
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /generate optimal route/i }));
    expect(screen.getByText(/Select Your Crops/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Torstol/i }).disabled).toBe(true);   // lvl 85
    expect(screen.getByRole("button", { name: /Ranarr/i }).disabled).toBe(false);    // lvl 32
  });
});
