# 🌿 OSRS Farming Route Optimizer

A browser tool that builds the fastest **Old School RuneScape** farming run for *your* account. Tell it which quests, achievement diaries, teleports, and unlocks you have (plus your Farming level), pick your patch types and crops, and it generates an ordered route with the best teleport for each stop, per-stop item lists, and bank stops sized to your 28-slot inventory.

## Features

- **Account-aware routing** — every stop uses the fastest teleport *you can actually use*, with "faster option available" hints showing what to unlock next.
- **Patch types** — herb, allotment, flower, tree, fruit tree, bush, hops, cactus, calquat, seaweed, mushroom, belladonna.
- **Crop selection** with Farming-level awareness (crops above your level are disabled).
- **Bank stops** auto-inserted when the next leg won't fit in your inventory, with an aggregated shopping list.
- **Progress tracking** — check off stops as you go; route and progress survive a refresh.
- **Copy/export** the route and shopping list.
- Profile saved to your browser (`localStorage`); no account or server needed.

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

## Project structure

```
src/
  data/        OSRS game data (quests, diaries, teleports, patches, crops)
  engine/      pure route-generation logic (unit-tested, no React)
  components/  React UI
  App.jsx      top-level app/state
  main.jsx     entry + error boundary
```

## Accuracy

Game data is cross-checked against the [Old School RuneScape Wiki](https://oldschool.runescape.wiki). OSRS gets frequent updates (new Varlamore patches, etc.), so data may drift — corrections welcome.

## Disclaimer

This is unofficial fan content. *Old School RuneScape* and *RuneScape* are trademarks of Jagex Ltd. This project is not affiliated with or endorsed by Jagex.

## License

[MIT](./LICENSE)
