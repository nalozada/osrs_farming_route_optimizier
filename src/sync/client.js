// Browser-side fetch of derived AccountData from the GIM Cloudflare Worker.
// Kept tiny and separate so both the manual sync button and the hourly auto-sync
// share one code path. Throws on any non-OK / error response.
export async function fetchAccountData(workerUrl) {
  const r = await fetch(workerUrl, { cache: "no-store" });
  const d = await r.json().catch(() => null);
  if (!r.ok || !d || d.error) throw new Error((d && d.error) || ("HTTP " + r.status));
  return d;
}

// Fetch ALL group members' derived data in one response so the member picker can
// switch instantly. Returns { updatedAt, defaultPlayer, members: [{ name, ...AccountData }] }.
// Tolerates the legacy single-AccountData shape (an old Worker that hasn't been
// redeployed yet) by wrapping it as a one-member list.
export async function fetchMembers(workerUrl) {
  const d = await fetchAccountData(workerUrl);
  if (Array.isArray(d.members)) {
    return {
      updatedAt: d.updatedAt || null,
      defaultPlayer: d.defaultPlayer || null,
      // Require a non-empty name — an empty name would collide with the manual-profile
      // key ("") in the app and render a blank option in the picker.
      members: d.members.filter(m => m && typeof m.name === "string" && m.name.trim() !== ""),
    };
  }
  // Legacy shape: a flat AccountData object with no member list. Put the name AFTER the
  // spread so a stray name:"" in the payload can't clobber the fallback.
  return {
    updatedAt: d.updatedAt || null,
    defaultPlayer: null,
    members: [{ ...d, name: (typeof d.name === "string" && d.name.trim()) ? d.name : "My account" }],
  };
}
