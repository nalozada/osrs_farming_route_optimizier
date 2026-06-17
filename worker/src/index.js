// Cloudflare Worker: private proxy for the Group Ironman tracker.
//
// The browser app (static GitHub Pages) can't call groupiron.men directly (no usable
// CORS). This Worker holds the GIM token as a SECRET, fetches the group server-side,
// derives the minimal AccountData (no raw bank / item ids / coords), and returns it
// with CORS allowed only for the app's origins. The token never reaches the browser.
//
// Env (set via wrangler):
//   GIM_GROUP   (var)    e.g. "BD GIM"
//   GIM_PLAYER  (var)    e.g. "Fentf0ld"  (matched case-insensitively, "GIM " prefix ok)
//   GIM_TOKEN   (secret) the Group Ironman tracker plugin token
import { deriveAccountData } from "../../src/sync/derive.js";

const ALLOWED_ORIGINS = new Set([
  "https://nalozada.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
]);

function corsHeaders(origin) {
  const h = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

function matchesPlayer(name, target) {
  if (!name || !target) return false;
  const norm = s => s.toLowerCase().replace(/^gim\s+/, "").replace(/ /g, " ").trim();
  return norm(name) === norm(target);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "GET") {
      return json({ error: "method not allowed" }, 405, origin);
    }
    if (!env.GIM_GROUP || !env.GIM_TOKEN || !env.GIM_PLAYER) {
      return json({ error: "worker not configured (missing GIM_GROUP / GIM_PLAYER / GIM_TOKEN)" }, 500, origin);
    }

    const url = `https://groupiron.men/api/group/${encodeURIComponent(env.GIM_GROUP)}/get-group-data?from_time=1970-01-01T00:00:00.000Z`;
    let players;
    try {
      const res = await fetch(url, { headers: { Authorization: env.GIM_TOKEN } });
      if (!res.ok) return json({ error: `GIM API ${res.status}` }, 502, origin);
      players = await res.json();
    } catch (e) {
      return json({ error: "could not reach the GIM API" }, 502, origin);
    }

    const player = Array.isArray(players) ? players.find(p => matchesPlayer(p && p.name, env.GIM_PLAYER)) : null;
    if (!player) {
      return json({ error: `player "${env.GIM_PLAYER}" not found in group` }, 404, origin);
    }

    const data = deriveAccountData(player, new Date().toISOString());
    return json(data, 200, origin);
  },
};
