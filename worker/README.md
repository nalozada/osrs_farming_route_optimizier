# GIM proxy (Cloudflare Worker)

A tiny Cloudflare Worker that lets the farming optimizer read **your** Group Ironman
tracker data without exposing your token. It fetches `groupiron.men` server-side,
derives only the farming-relevant bits (Farming level, completed quests, diary tiers,
detected teleports & unlocks, and owned seed names + counts), and returns that to the
app with CORS locked to your site's origin. **Your token stays a Worker secret — it never
reaches the browser, and nothing about your account is published publicly.** No raw bank,
item IDs, coordinates, or non-farming data ever leave the Worker.

> **Re-deploy after updates:** the Worker bundles the shared decoders in `../src/sync/`,
> so after pulling changes that touch the derive logic, run `wrangler deploy` again or the
> app won't see the new fields.

## One-time setup (~5 minutes)

You need a free [Cloudflare account](https://dash.cloudflare.com/sign-up).

```bash
npm install -g wrangler        # Cloudflare's CLI
cd worker
wrangler login                 # opens a browser to authorize

# (Optional) edit wrangler.toml if your group/player differ from BD GIM / Fentf0ld
#   GIM_GROUP  = your group name
#   GIM_PLAYER = your character name

wrangler secret put GIM_TOKEN  # paste your Group Ironman Tracker plugin token when prompted
wrangler deploy                # prints your worker URL, e.g.
                               #   https://osrs-farm-gim-proxy.<your-subdomain>.workers.dev
```

Copy that `*.workers.dev` URL, open the farming optimizer → **Edit Profile → Account
Sync**, paste it in, and click **Sync from my GIM account**.

## Notes
- `GIM_GROUP` and `GIM_PLAYER` are plain config (not secret). `GIM_TOKEN` is the only
  secret and is set via `wrangler secret put` — keep it out of `wrangler.toml` and git.
- CORS is restricted to `https://nalozada.github.io` and `localhost` (see
  `ALLOWED_ORIGINS` in `src/index.js`). Add your origin there if you host elsewhere.
- The Worker imports the shared decoders from `../src/sync/`, so the data it returns is
  byte-for-byte what the app expects. Wrangler bundles them automatically.
- To rotate your token: `wrangler secret put GIM_TOKEN` again. To tear down:
  `wrangler delete`.
