# Deep Review — OSRS Farming Route Optimizer

**Date:** 2026-06-13
**Scope:** Entire codebase (`src/App.jsx` ~1380 lines, `src/main.jsx`, config).
**Method:** 8 parallel auditors (route-engine logic, React/perf, build/security, UX/edge-cases, and 4 OSRS game-data auditors) cross-checked every patch, teleport, fairy-ring code, crop level and gardener payment against the live [oldschool.runescape.wiki](https://oldschool.runescape.wiki). **Every** finding was then independently re-verified by a skeptic agent (game-data claims re-checked against the wiki). 65 findings raised → **63 confirmed, 2 rejected**.

## Verdict

The app **builds and runs cleanly** (`npm run build` succeeds, 212 KB JS / 61 KB gzip) and the routing engine is **fundamentally sound** — `meetsReqs`/`getBestTp`/`getBestUpgrade` are correct, StrictMode-safe, no broken hooks, inventory slot math is broadly faithful to the 28-slot reality. The biggest risks are **not crashes — they're correctness of the game data and a few engine edge cases**, because a farming tool's whole value is telling players the *right* route. Several patch requirements and teleports are wrong or missing, and the tool never asks the player's Farming level (so it defaults everyone to lvl-85 crops). Grade: **solid B− foundation; the data errors are what hold it back from being trustworthy.**

---

## 1. Game-data accuracy — HIGH priority (these make routes wrong)

| # | Sev | Location | Problem | Fix |
|---|-----|----------|---------|-----|
| 1 | HIGH | `App.jsx:99,170-171` | **Weiss herb** gated on "Fire of **Eternal Light**" — that's a different, unrelated fire pit (a light source). The real unlock is the **Fire of Nourishment** (35 Con, 66 FM, Making Friends with My Arm). | Rename unlock → `fireOfNourishment`, update note. |
| 2 | HIGH | `App.jsx:172-179, 249-256` | **Harmony Island** herb + allotment are missing the mandatory quest **The Great Brain Robbery** (the island is part of that quest). The quest is already in `QUESTS` (line 23) but referenced by nothing. | Add `quests:["theGreatBrainRobbery"]` to both. |
| 3 | HIGH | `App.jsx:176,253` | **Harmony Island Teleport** is gated on `ancientSpellbook`, but it's an **Arceuus** spell (Magic 65, 60% favour, The Great Brain Robbery). There's no Arceuus spellbook entry at all. | Add `arceuusSpellbook` to `TELEPORTS`; gate on it + the quest. |
| 4 | HIGH | `App.jsx:320-326` | **Varlamore tree patch is misnamed "Auburnvale."** It's actually at **Nemus Retreat** (north side) in Auburn Valley. Auburnvale is a *different* settlement with no tree patch — players go to the wrong place. The single teleport given is also vague/wrong. | Rename → Nemus Retreat; replace teleports (Pendant of 'ates, Quetzal→Quetzacalli Gorge, fairy ring AIS). |
| 5 | HIGH | `App.jsx:388` | **Etceteria bush** gated on Royal Trouble. Access only needs **The Fremennik Trials** (boat to Miscellania). `fremennikTrials` isn't even in `QUESTS`. | Add the quest; re-gate. |
| 6 | HIGH | `App.jsx:362-367` | **Lletya fruit tree** gated on Regicide alone. Lletya requires **Mourning's End Part I (started)** — Regicide is necessary but not sufficient. | Add `mourningsEndI` quest; re-gate. |
| 7 | HIGH | `App.jsx:401` | **Seaweed fairy ring AKQ is the wrong destination** (that's Piscatoris, Kandarin — nowhere near Fossil Island). No fairy ring reaches the underwater patch. As the *only* method, anyone selecting seaweed gets an impossible route. | Use Digsite Pendant → Fossil Island → row & dive (the patch isn't fairy-ring accessible). |
| 8 | MED | `App.jsx:398` | **Al Kharid cactus fairy ring BIQ** = Kalphite Hive, not the cactus patch. | Remove BIQ; Glory→Al Kharid (already present) is correct. |
| 9 | MED | `App.jsx:400,504` | **Calquat "only patch in-game" is outdated** — 3 patches now exist (Tai Bwo Wannai, Summer Shore, Kastori). | Fix the note; optionally add the other two. |
| 10 | MED | `App.jsx:392-395` | **Missing 5th hops patch: Aldarin** (Varlamore). | Add `hops_aldarin` (gated on Varlamore). |
| 11 | MED | `App.jsx:403` | **Missing 2nd belladonna patch: Auburnvale** (Varlamore). | Add `belladonna_auburnvale`. |
| 12 | LOW | `App.jsx:394` | **Yanille hops "Watchtower TP"** gated as standard spellbook (= always available), but it needs the **Watchtower quest**. The "(Hard Ardy)" label is also misleading. | Gate on a watchtower quest unlock; relabel. |
| 13 | LOW | `App.jsx:251` | **Harmony allotment omits compost** — inconsistent with every other allotment. | Add `{name:"Compost", slots:1}`. |
| 14 | LOW | `App.jsx:52-53` | Spirit-tree base network desc under-lists nodes (omits Feldip + the GE tree itself). Otherwise accurate. | Cosmetic note update. |

### Game data verified **correct** (no change needed)
- Ardougne cloak → **farm patch** (not Monastery) — the Medium diary genuinely grants direct-to-patch teleports. ✅
- Diary yield/XP notes (Falador Medium +10% XP, Kandarin 5/10/15%, Kourend disease-free/+5%). ✅
- Farming Guild tier gating logic (45 / 65 / 85), Troll Stronghold = My Arm's, Prifddinas has no herb patch. ✅
- Fairy ring codes CIQ, DJP, BJR, CIP, CKS, CKR; crop levels for mushroom 53 / calquat 72 / seaweed 23 / belladonna 63 / cactus 55 / potato cactus 64; calquat payment (8 poison ivy berries). ✅
- Ring of the Elements → Air Altar → south-Falador run is geographically sound. ✅

---

## 2. Engine / route-logic

| # | Sev | Location | Problem | Fix |
|---|-----|----------|---------|-----|
| 15 | HIGH | `App.jsx:587-612` | **Charter-from-Catherby can order Brimhaven *before* Catherby.** `catherbyInRoute` only checks presence, not precedence; the override lowers Brimhaven's sort-speed so it can jump ahead — then tells you to "charter from Catherby (if already there)" before you've been. | Only apply the override when Catherby actually precedes Brimhaven; pin the charter stop after the Catherby stop. |
| 16 | LOW | `App.jsx:793-805,730` | `computeBankWithdrawals` **ignores its `alreadyHave` parameter** — starts from an empty gear set. Harmless today (segments still match the re-sim) but a dead/misleading signal that will desync if carry-over logic changes. | Either use `alreadyHave` to seed `tpItems`, or delete the param. |
| 17 | LOW | `App.jsx:708-714` | **Dead code:** the initial-bank bookkeeping block is fully overwritten at 718-720 before any read. | Delete lines 708-714. |
| 18 | LOW | `App.jsx:729,805` | **Inventory can silently overflow:** if a single fresh-segment stop needs >25 slots, the `segmentStops.length>0` guard skips the bank and load exceeds 28; `computeBankWithdrawals` then emits a "next **0** stops" empty bank. Latent with current data. | Warn (or split) when one stop alone exceeds 25 slots; guard the `stopsCount===0` note. |
| 19 | LOW | `App.jsx:864,527-541` | **`loadProfile` can return a partial-shape object and crash the engine** — no validation after `JSON.parse`. A stale/hand-edited `osrs_fp_v5` missing `diaries`/`teleports`/`unlocks` throws "Cannot read properties of undefined" on first render, and the bad value stays in storage (reload re-crashes). *(Also flagged by the React auditor — same root cause.)* | Merge parsed value over `defaultProfile()` so sub-objects are never undefined. |
| 20 | INFO | every `PATCHES` entry | `patch.farmingItems` is **defined but never read** by the engine (slot math comes from `CROPS`). Stale/misleading duplicate data. | Remove, or make it the single source of truth. |
| 21 | INFO | `App.jsx:581-584,724-746` | **Optimization left on the table:** route is greedy by teleport speed only; never reorders same-speed stops that share gear (e.g. all fairy-ring / all skills-necklace) to reduce bank trips. | Add a secondary clustering pass within equal-speed tiers. |

---

## 3. UX & edge cases

| # | Sev | Location | Problem | Fix |
|---|-----|----------|---------|-----|
| 22 | HIGH | `App.jsx:1090-1104,855` | **No Farming-level input.** The profile never stores Farming level, so `go()` defaults every patch to the **highest-level crop** (Torstol 85, Magic 75, Dragonfruit 81). A lvl-40 player is told to plant Torstol. Level also gates patch access in-game (the Guild 45/65/85 "unlocks"). The single most impactful gap. | Add a `farmingLevel` field; default crops to the highest the player can grow; disable above-level crops in the dropdown. |
| 23 | MED | `App.jsx:694-706,749,1354` | **"No patches available" empty state is unreachable** (a route always has the initial bank stop), and a zero-stop selection renders a lone "Starting Bank — Withdraw everything for all **0 stops**." Generate doesn't check that selected types have reachable patches. | Count real stops; show the empty state (or block Generate) when zero. |
| 24 | MED | `App.jsx:1081-1085,865` | **Route + check-off progress aren't persisted.** Only the profile is saved. A refresh mid-run (farming is a long real-world task) wipes all tick-offs and the route. | Persist `route`/`checked`/`selTypes`/`cropSelections`. |
| 25 | MED | `App.jsx:967,1155,941` | **a11y:** core interactions (check off a stop, open profile banner, expand upgrade hint) are click-only `<div>`s — no `role`, `tabIndex`, keyboard handler, or ARIA. Keyboard/screen-reader users can't use the app. | Convert to `<button>` or add roles + `onKeyDown`. |
| 26 | MED | `App.jsx:1197,1208,1366,906,1042` | **a11y contrast:** lots of meaningful text at `#555`/`#666` on `#111` (~2.0–2.6:1, fails WCAG AA 4.5:1) — incl. the speed-legend explanations. | Raise muted text to ≥ `#8a8a8a`. |
| 27 | MED | `App.jsx:1008-1014` | **Profile modal:** no `role="dialog"`, focus trap, Escape-to-close, or backdrop dismiss. | Add dialog semantics + focus management. |
| 28 | MED | `App.jsx:1316-1333` | **No export/copy/print** of the route or the "Total Items Needed" shopping list — the exact artifacts a player wants in-game. | Add "Copy shopping list" / "Copy route" (and optionally a share URL). |
| 29 | LOW | `App.jsx:1202,1191` | Generate is allowed for patch types with **0 reachable patches** (cards already show the count). | Block/warn when the total is 0. |
| 30 | LOW | `App.jsx:1236,1269,629` | **Crop-select preview undercounts allotment seeds** — preview uses patch count, but the engine treats each allotment as 2 sub-patches, so the bank list shows ~double. Player may under-withdraw. | Make the preview multiplier match the engine. |
| 31 | LOW | `App.jsx:1086,1088,1376` | **Dead state `first`/`setFirst`** — written, never read; the implied first-run UX was never wired up. | Remove (or implement: auto-open ProfileEditor on first run). |
| 32 | LOW | `App.jsx:1010,1029` | Modal mostly responsive, but the diary grid `minmax(280px)` cramps on the smallest phones. | Lower to ~240px or add a `<400px` media query. |

---

## 4. React & performance

| # | Sev | Location | Problem | Fix |
|---|-----|----------|---------|-----|
| 33 | LOW | `App.jsx:1350,965,877` | Whole route list re-renders on every checkbox toggle; `RouteStep`/`BankStop` aren't memoized and the inline `onToggle` closure changes each render. | `React.memo` + stable callback. |
| 34 | LOW | `App.jsx:872-935,1127-1373` | Hundreds of inline style-object literals rebuilt every render. | Hoist static styles to module constants / CSS. |
| 35 | LOW | `App.jsx:1-1380` | One 1380-line file, no module split, no TS/prop-types; `categorizeItems` classifies items by fragile substring matching (`"×"`, `"(5)"`, fruit names). | Split into `data/`, `engine.js`, `components/`; tag item categories at the engine instead of substring-sniffing. |
| 36 | INFO | `App.jsx:917,923,955,980` | Index-as-key in derived lists — safe today (lists replace atomically); keying by value is more future-proof. | Optional. |

### React behaviors verified **safe**
- `go()`→`goGenerate()` crop flow: **no** stale-closure bug (two separate clicks; functional updater commits first). ✅
- StrictMode: no side effects in render; localStorage writes only in event handlers. ✅
- ProfileEditor deep-clone via `JSON.parse(JSON.stringify())` — correct for this plain-data shape. ✅

---

## 5. Build, tooling, security, hygiene

| # | Sev | Location | Problem | Fix |
|---|-----|----------|---------|-----|
| 37 | MED | `vite.config.js` | **No Vite `base`** → deployed to a GitHub Pages *project* subpath, assets 404 (blank page). Build succeeds but the deployed site is dead. | `base: './'` (or `'/osrs_farming_route_optimizier/'`) + a deploy workflow. |
| 38 | MED | project root | **No `.gitignore`** — `node_modules/` and `dist/` are untracked only by luck; one `git add -A` commits 64 packages. | Add `.gitignore`. |
| 39 | MED | deps | **`npm audit`: 3 advisories** (1 high esbuild, 2 moderate vite/postcss) — **all dev/build-time only**, not in the shipped bundle, so end-user risk ≈ nil. Real fix needs a Vite major bump. | Plan Vite 5→8 upgrade; `npm audit fix` clears postcss. |
| 40 | LOW | `package.json:9-16` | Deps a full major behind (React 18→19, Vite 5→8, plugin-react 4→6). No `engines`/`.nvmrc`. | Scheduled upgrade pass; pin Node. |
| 41 | LOW | project root | **No tests, ESLint, Prettier, or CI** — data-entry regressions ship silently in a tool that's mostly a giant lookup table. | Add ESLint + a few vitest unit tests over the engine + minimal CI. |
| 42 | LOW | `main.jsx:5-19` | ErrorBoundary dumps a **raw stack trace** to end users. | Friendly message + a "reset profile & reload" recovery button (a corrupt profile is the likely cause). |
| 43 | LOW | `App.jsx:865` | **`saveProfile` has no try/catch** (unlike `loadProfile`) — a private-mode/quota failure throws out of the save handler and hits the ErrorBoundary. | Wrap `setItem`. |
| 44 | LOW | `App.jsx:864,865,1086` | Storage key `'osrs_fp_v5'` duplicated as a literal in 3 places; no migration path. | Extract a `PROFILE_KEY` constant. |
| 45 | INFO | `package.json:2` vs repo | Repo/dir name has a typo: **"optimiz*ier*"** (package name is spelled right). | Rename repo if still early (GitHub auto-redirects). |
| 46 | INFO | project root | **No README, no LICENSE.** Public repo with no run/deploy docs and ambiguous legal status. | Add both (+ a fan-content disclaimer for OSRS/Jagex IP). |

---

## Rejected by verification (kept honest — these were *not* real)
- ~~"Ardougne fairy ring BLR is wrong, should be DJP"~~ — the wiki lists BLR as a valid/standard option.
- ~~"Missing fruit tree patches: Prifddinas & Herblore Habitat"~~ — those aren't fruit-tree patches.

---

## Recommended fix order

1. **Game-data corrections #1-7** (HIGH) — make routes actually correct. Pure data edits, low risk.
2. **Engine bug #15** (charter ordering) + **#19** (profile crash guard) + **#18** (overflow guard).
3. **Farming-level input #22** — fixes the wrong-default-crop problem and unifies the Guild-tier gating.
4. **Dead-code cleanup #17, #20, #31** + **`.gitignore` #38** + **Vite `base` #37** (needed before any deploy).
5. **Persistence #24** + **export #28** + **empty-state #23** — biggest UX wins.
6. **a11y pass #25-27** + **error-boundary #42** + **saveProfile guard #43**.
7. **Add missing patches #10, #11, #9** + remaining MED/LOW data nits.
8. **Tooling: ESLint + tests + CI #41**, dep upgrades #40, module split #35.
