# 🌿 OSRS Farming Route Optimizer

A browser tool that builds the fastest **Old School RuneScape** farming run for *your* account. Tell it which quests, achievement diaries, teleports, and unlocks you have (plus your Farming level), pick your patch types and crops, and it generates an ordered route with the best teleport for each stop, per-stop item lists, and bank stops sized to your 28-slot inventory.

## Features

- **Account-aware routing** — every stop uses the fastest teleport *you can actually use*, with "faster option available" hints showing what to unlock next.
- **Patch types** — herb, allotment, flower, tree, fruit tree, bush, hops, cactus, calquat, seaweed, mushroom, belladonna.
- **Multi-select crop grid** — pick one or more crops per patch type from a grid (owned seeds badged with quantities, over-level crops locked). The route plants a **mix distributed across patches, limited by how many seeds you actually own**.
- **Bank stops** auto-inserted when the next leg won't fit in your inventory, with an aggregated shopping list.
- **Progress tracking** — check off stops as you go; route and progress survive a refresh.
- **Copy/export** the route and shopping list.
- **Always-on account sync** — the app ships pre-wired to our Group Ironman proxy, so on open it auto-fills Farming level, quests, achievement diaries, **teleports/unlocks** and owned-seed data for **whichever group member you pick**. See [Account sync](#account-sync).
- **Pick who you are** — a member selector on the main menu chooses which GIM member's data to load; switching is instant and each member keeps their own saved profile.
- **"Can't auto-detect" quick panel** — the handful of toggles sync can't see (POH-mounted/STASHed teleports, planted spirit trees, etc.) are surfaced as one-tap chips so you don't scroll the full list.
- Per-member profiles saved to your browser (`localStorage`); the core app still works fully offline with no account.

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

## Account sync

This build is wired to **one specific Group Ironman**, so account sync is on out of the box —
no URL to paste. On open it reads the group's **Group Ironman tracker** data
([groupiron.men](https://groupiron.men)) through a small **Cloudflare Worker** proxy that
holds the tracker token as a *secret* and returns only **derived farming data** for every
member (Farming level, completed quests, diary tiers, detected teleports/unlocks, owned-seed
names + counts). No raw bank, item ids, or coordinates ever leave the Worker.

- **Pick which member you are** — a selector on the main menu (and in *Edit Profile →
  Account Sync*) lists every group member. Choosing one loads their data instantly (the whole
  group comes in one response) and the choice persists. Each member has their **own saved
  profile**, so switching never wipes anyone's manual settings.
- **Additive teleport/unlock detection** — sync only turns toggles *on*, never off, so things
  it can't see (an **Amulet of glory mounted in your POH**, items in a STASH unit) are never
  wiped. The **"Can't auto-detect these"** panel surfaces exactly those — planted spirit
  trees, the Arceuus spellbook, jewellery teleports, the Kastori site, Fire of Nourishment —
  as one-tap chips so you can confirm them without scrolling.
- **Auto-sync** runs on open (if your data is stale) and hourly while the tab is open. Toggle
  it off under *Account Sync → Auto-sync* and sync manually with the **↻ Sync** button.
- **Farming level only, zero setup** — under *Account Sync → Advanced* you can type any
  username to fetch just the level from [WiseOldMan](https://wiseoldman.net).

> **Privacy note:** because the Worker URL is baked into this public site and it returns every
> member's derived data, anyone who finds the URL can read the group's *derived* farming data
> (never raw bank/items/coords, and never the tracker token). That's an accepted trade-off for
> a tool built for one group. Self-hosting your own Worker? Paste its URL under *Account Sync →
> Advanced* to override the default. One-time Worker setup is in
> [`worker/README.md`](./worker/README.md).

When bank data is loaded, patch types you can't plant (no owned seed at your Farming level)
are greyed out and skipped, with a note saying why. If the Worker is unreachable, the app
degrades gracefully to manual entry.

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
