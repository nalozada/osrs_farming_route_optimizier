// Cloudflare Worker: private proxy for the Group Ironman tracker.
//
// The browser app (static GitHub Pages) can't call groupiron.men directly (no usable
// CORS). This Worker holds the GIM token as a SECRET, fetches the group server-side,
// derives the minimal AccountData for EVERY member (no raw bank / item ids / coords),
// and returns it with CORS allowed only for the app's origins. The token never reaches
// the browser. The app lets you pick which member you are; switching is instant because
// every member's derived data is in one response.
//
// Env (set via wrangler):
//   GIM_GROUP   (var)    e.g. "BD GIM"
//   GIM_PLAYER  (var)    e.g. "Fentf0ld"  — the DEFAULT member the app pre-selects.
//   GIM_TOKEN   (secret) the Group Ironman tracker plugin token
import { deriveAccountData } from "../../src/sync/derive.js";

// The tracker exposes a shared-storage pseudo-player ("@SHARED" / "@DELETED") that
// isn't a real account — never surface it as a pickable member.
function isRealMember(name) {
  return typeof name === "string" && name.trim() !== "" && !name.trim().startsWith("@");
}

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

function normName(s) {
  return typeof s === "string" ? s.toLowerCase().replace(/^gim\s+/, "").trim() : "";
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
    if (!env.GIM_GROUP || !env.GIM_TOKEN) {
      return json({ error: "worker not configured (missing GIM_GROUP / GIM_TOKEN)" }, 500, origin);
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

    const updatedAt = new Date().toISOString();
    const members = (Array.isArray(players) ? players : [])
      .filter(p => p && isRealMember(p.name))
      .map(p => ({ name: p.name, ...deriveAccountData(p, updatedAt) }));

    if (!members.length) {
      return json({ error: `no members found in group "${env.GIM_GROUP}"` }, 404, origin);
    }

    // Pre-select the configured player (GIM_PLAYER) if present; the app falls back to
    // the first member otherwise. Matched case-insensitively, "GIM " prefix tolerated.
    const target = normName(env.GIM_PLAYER);
    const def = target && members.find(m => normName(m.name) === target);
    const defaultPlayer = def ? def.name : members[0].name;

    const body = { updatedAt, defaultPlayer, members };
    // A configured-but-unmatched GIM_PLAYER (e.g. a typo) silently falls back to the first
    // member; surface it so the misconfiguration is diagnosable rather than invisible.
    if (target && !def) body.warning = `configured GIM_PLAYER "${env.GIM_PLAYER}" not found in group "${env.GIM_GROUP}"`;

    return json(body, 200, origin);
  },
};
