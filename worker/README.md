# GIM proxy (Cloudflare Worker)

A tiny Cloudflare Worker that lets the farming optimizer read your Group Ironman
tracker data without exposing your token. It fetches `groupiron.men` server-side and
returns the farming-relevant bits for **every member of the group** — Farming level,
completed quests, diary tiers, detected teleports & unlocks, and owned seed names +
counts — so the app can let you pick which member you are. The response shape is:

```json
{ "updatedAt": "…", "defaultPlayer": "Fentf0ld",
  "members": [ { "name": "Fentf0ld", "farmingLevel": 80, "quests": {…}, … }, … ] }
```

**Your tracker token stays a Worker secret — it never reaches the browser.** No raw bank,
item IDs, coordinates, or non-farming data ever leave the Worker.

> **Privacy:** the app bakes this Worker's URL into a public static site and the Worker
> returns derived data for the whole group, so anyone who finds the URL can read the
> group's *derived* farming data (CORS only blocks other browser origins, not `curl`).
> The token and all raw account data stay private. This is an accepted trade-off for a
> tool built for one group; don't reuse this Worker for data you wouldn't share.

> **Re-deploy after updates:** the Worker bundles the shared decoders in `../src/sync/`,
> so after pulling changes that touch the derive logic, run `wrangler deploy` again or the
> app won't see the new fields.

## One-time setup (~5 minutes)

You need a free [Cloudflare account](https://dash.cloudflare.com/sign-up).

```bash
npm install -g wrangler        # Cloudflare's CLI
cd worker
wrangler login                 # opens a browser to authorize

# (Optional) edit wrangler.toml if your group differs from BD GIM
#   GIM_GROUP  = your group name
#   GIM_PLAYER = the member the app pre-selects by default (optional; falls back to the
#                first member). Players still pick themselves in the app.

wrangler secret put GIM_TOKEN  # paste your Group Ironman Tracker plugin token when prompted
wrangler deploy                # prints your worker URL, e.g.
                               #   https://osrs-farm-gim-proxy.<your-subdomain>.workers.dev
```

This build already points at `osrs-farm-gim-proxy.nalozada.workers.dev`, so for the
default group there's nothing to paste. If you self-host your own Worker, copy that
`*.workers.dev` URL into the app → **Edit Profile → Account Sync → Advanced**.

## Notes
- `GIM_GROUP` and `GIM_PLAYER` are plain config (not secret); `GIM_PLAYER` is now just the
  default pre-selection. `GIM_TOKEN` is the only secret and is set via
  `wrangler secret put` — keep it out of `wrangler.toml` and git.
- CORS is restricted to `https://nalozada.github.io` and `localhost` (see
  `ALLOWED_ORIGINS` in `src/index.js`). Add your origin there if you host elsewhere.
- The Worker imports the shared decoders from `../src/sync/`, so the data it returns is
  byte-for-byte what the app expects. Wrangler bundles them automatically.
- To rotate your token: `wrangler secret put GIM_TOKEN` again. To tear down:
  `wrangler delete`.
