# 🌿 OSRS Farming Route Optimizer

A browser tool that builds the fastest **Old School RuneScape** farming run for *your* account. Tell it which quests, achievement diaries, teleports, and unlocks you have (plus your Farming level), pick your patch types and crops, and it generates an ordered route with the best teleport for each stop, per-stop item lists, and bank stops sized to your 28-slot inventory.

## Features

- **Account-aware routing** — every stop uses the fastest teleport *you can actually use*, with "faster option available" hints showing what to unlock next.
- **Patch types** — herb, allotment, flower, tree, fruit tree, bush, hops, cactus, calquat, seaweed, mushroom, belladonna.
- **Multi-select crop grid** — pick one or more crops per patch type from a grid (owned seeds badged with quantities, over-level crops locked). The route plants a **mix distributed across patches, limited by how many seeds you actually own**.
- **Bank stops** auto-inserted when the next leg won't fit in your inventory, with an aggregated shopping list.
- **Progress tracking** — check off stops as you go; route and progress survive a refresh.
- **Copy/export** the route and shopping list.
- **Account sync (optional)** — auto-fill Farming level, quests, achievement diaries, **and teleports/unlocks**, plus owned-seed data for the crop grid and bank gating, by reading your Group Ironman tracker. See [Account sync](#account-sync-optional).
- Profile saved to your browser (`localStorage`); the core app needs no account or server.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
npm test         # run the engine unit tests
```

Requires Node 18+ (developed on Node 22).

## Deploy

`vite.config.js` sets `base: './'`, so the build works from a domain root **or** a GitHub Pages project subpath. To publish on GitHub Pages, push the contents of `dist/` to a `gh-pages` branch (or use a GitHub Action).

## Account sync (optional)

By default you enter your profile by hand. You can instead pull it automatically:

- **Full sync (Farming level + quests + diaries + teleports + unlocks + owned seeds)** comes
  from your **Group Ironman tracker** ([groupiron.men](https://groupiron.men)). Because the
  tracker API can't be called from a browser (CORS) and this app is a static site, a tiny
  **Cloudflare Worker** acts as a private proxy: it holds your tracker token as a *secret*,
  fetches your data server-side, and returns only the farming-relevant bits. Your token
  never reaches the browser and nothing about your account is published. One-time setup is
  in [`worker/README.md`](./worker/README.md); then paste the Worker URL into
  **Edit Profile → Account Sync**.
  - Teleport/unlock detection is **additive** — sync only turns toggles *on*, never off — so
    teleports it can't see (e.g. an **Amulet of glory mounted in your POH**, items in a STASH
    unit) are never wiped; keep those on manually. Planted spirit trees, the Kastori quetzal
    site, Fire of Nourishment and Arceuus favour also stay manual (not derivable).
- **Farming level only, zero setup** — type any username under Account Sync to fetch the
  level from [WiseOldMan](https://wiseoldman.net) (no quests/diaries; no public API exposes
  those by username, which is why full sync needs the tracker).

Once a Worker URL is set, the app **auto-syncs on open (if your data is stale) and hourly
while it's open** — so your Farming level, quests, diaries and bank seeds stay current
without clicking. You can toggle this off in **Account Sync** and still sync manually.
(Teleports/unlocks are never auto-changed — they stay your manual settings.)

When bank data is loaded, patch types you can't plant (no owned seed at your Farming level)
are greyed out and skipped, with a note saying why. With no sync configured, the app behaves
exactly as the manual version.

## Project structure

```
src/
  data.js      OSRS game data (quests, diaries, teleports, patches, crops)
  engine.js    pure route-gen + profile + bank-seed + crop allocation (unit-tested, no React)
  sync/        pure decoders for Group Ironman tracker data:
                 skills.js quests.js diaries.js itemIds.js teleportItemIds.js
                 unlocks.js (derive teleports/unlocks) derive.js client.js
  App.jsx      React UI + app state
  main.jsx     entry + error boundary
scripts/       one-off generators (gen-teleport-ids.mjs builds teleportItemIds.js)
worker/        Cloudflare Worker that privately proxies the Group Ironman tracker API
```

## Accuracy

Game data is cross-checked against the [Old School RuneScape Wiki](https://oldschool.runescape.wiki). OSRS gets frequent updates (new Varlamore patches, etc.), so data may drift — corrections welcome.

## Disclaimer

This is unofficial fan content. *Old School RuneScape* and *RuneScape* are trademarks of Jagex Ltd. This project is not affiliated with or endorsed by Jagex.

## License

[MIT](./LICENSE)
