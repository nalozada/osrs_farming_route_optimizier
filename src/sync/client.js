// Browser-side fetch of the derived AccountData from the GIM Cloudflare Worker.
// Kept tiny and separate so both the manual sync button and the hourly auto-sync
// share one code path. Throws on any non-OK / error response.
export async function fetchAccountData(workerUrl) {
  const r = await fetch(workerUrl, { cache: "no-store" });
  const d = await r.json().catch(() => null);
  if (!r.ok || !d || d.error) throw new Error((d && d.error) || ("HTTP " + r.status));
  return d;
}
