// ═══════════════════════════════════════════════════════════════
// ROUTE ENGINE — pure logic, no React. Unit-tested in engine.test.js
// ═══════════════════════════════════════════════════════════════
import { DIARY_TIERS, TELEPORTS, QUESTS, DIARIES, OTHER_UNLOCKS, PATCHES, CROPS } from "./data.js";

export const MAX_INVENTORY = 28;
export const ALWAYS_EQUIPPED = 3; // spade, seed dibber, rake (take slots)

// Farming-level gates baked into the boolean Guild "unlock" tiers, so a player
// who ticks a tier they can't yet reach isn't routed to those patches.
export const UNLOCK_MIN_FARMING = { farmingGuild45: 45, farmingGuild: 65, farmingGuild85: 85 };

export function meetsReqs(patch, prof) {
  const r = patch.requirements;
  if (!r) return true;
  const lvl = prof.farmingLevel || 1;
  if (r.quests) for (const q of r.quests) if (!prof.quests[q]) return false;
  if (r.diaries) for (const [d, t] of Object.entries(r.diaries)) if (DIARY_TIERS.indexOf(prof.diaries[d]||"None") < DIARY_TIERS.indexOf(t)) return false;
  if (r.unlocks) for (const u of r.unlocks) {
    if (!prof.unlocks[u]) return false;
    if (UNLOCK_MIN_FARMING[u] && lvl < UNLOCK_MIN_FARMING[u]) return false;
  }
  if (r.minFarming && lvl < r.minFarming) return false;
  return true;
}

export function tpMeetsReqs(t, prof) {
  const r = t.requires;
  if (r.teleports) for (const tp of r.teleports) {
    if (tp === "standardSpellbook") continue; // always available
    if (!prof.teleports[tp]) return false;
  }
  if (r.quests) for (const q of r.quests) if (!prof.quests[q]) return false;
  if (r.unlocks) for (const u of r.unlocks) if (!prof.unlocks[u]) return false;
  if (r.diaries) for (const [d,t2] of Object.entries(r.diaries)) if (DIARY_TIERS.indexOf(prof.diaries[d]||"None") < DIARY_TIERS.indexOf(t2)) return false;
  return true;
}

export function getBestTp(patch, prof) {
  // charterFromCatherby is a conditional method (only valid if Catherby is visited
  // first); it is handled separately in generateRoute and must never drive the
  // default best-teleport selection or the route ordering.
  const avail = patch.teleports.filter(t => tpMeetsReqs(t, prof) && !t.charterFromCatherby).sort((a,b) => a.speed - b.speed);
  return avail[0] || null;
}

export function getBestUpgrade(patch, prof, curSpeed) {
  const unavail = patch.teleports.filter(t => !tpMeetsReqs(t, prof) && t.speed < curSpeed).sort((a,b) => a.speed - b.speed);
  if (!unavail.length) return null;
  const best = unavail[0];
  const missing = [];
  const r = best.requires;
  if (r.teleports) for (const tp of r.teleports) {
    if (tp === "standardSpellbook") continue; // always available
    if (!prof.teleports[tp]) { const d = TELEPORTS.find(t => t.id === tp); missing.push(d ? d.name : tp); }
  }
  if (r.quests) for (const q of r.quests) if (!prof.quests[q]) { const d = QUESTS.find(qu => qu.id === q); missing.push(d ? d.name : q); }
  if (r.unlocks) for (const u of r.unlocks) if (!prof.unlocks[u]) { const d = OTHER_UNLOCKS.find(o => o.id === u); missing.push(d ? d.name : u); }
  if (r.diaries) for (const [d,t] of Object.entries(r.diaries)) if (DIARY_TIERS.indexOf(prof.diaries[d]||"None") < DIARY_TIERS.indexOf(t)) { const dd = DIARIES.find(di => di.id === d); missing.push(`${t} ${dd ? dd.name : d}`); }
  return { method: best.method, speed: best.speed, missing };
}

// Normalize cropSelections to the {type: [cropId,...]} shape (legacy was {type: cropId}).
export function normalizeCropSelections(cs) {
  const out = {};
  for (const [type, v] of Object.entries(cs || {})) {
    out[type] = Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);
  }
  return out;
}

// How many seeds one patch of this crop consumes (parsed from the ×N in the seed
// name: herbs 1, allotment ×3, hops ×4, saplings 1). pick_only / no-seed => 0.
export function seedsPerPatch(crop) {
  if (!crop || !crop.seed) return 0;
  const m = crop.seed.match(/[×x]\s*(\d+)\s*$/i);
  return m ? Number(m[1]) : 1;
}

// Distribute the selected crops across each patch type's plant-slots (allotment = 2
// slots/location, else 1), in route order, limited by how many seeds the player owns.
// ownedSeedCounts null/undefined => unlimited (no bank data => fill freely). Returns an
// array parallel to `stops`: each entry is { [type]: { assigned:{cropId:count}, leftover } }.
export function allocateCrops(stops, cropSelections, ownedSeedCounts) {
  const sel = cropSelections || {};
  const rem = {}; // rem[type][cropId] = patches still affordable
  for (const [type, ids] of Object.entries(sel)) {
    rem[type] = {};
    for (const cropId of ids) {
      const crop = (CROPS[type] || []).find(c => c.id === cropId);
      if (!crop) { rem[type][cropId] = 0; continue; }
      if (cropId === "pick_only" || !crop.seed || !ownedSeedCounts) { rem[type][cropId] = Infinity; continue; }
      const owned = ownedSeedCounts[baseSeedName(crop.seed)] || 0;
      rem[type][cropId] = Math.floor(owned / (seedsPerPatch(crop) || 1));
    }
  }
  const cursor = {}; // round-robin position per type (spreads a mix across patches)
  return stops.map(s => {
    const byType = {};
    for (const p of s.patches) {
      const type = p.type;
      const ids = sel[type] || [];
      const slots = type === "allotment" ? 2 : 1;
      const bt = byType[type] || (byType[type] = { assigned: {}, leftover: 0 });
      if (!ids.length) { bt.leftover += slots; continue; }
      for (let k = 0; k < slots; k++) {
        let chosen = null;
        for (let t = 0; t < ids.length; t++) {
          const cid = ids[(cursor[type] = (cursor[type] || 0), cursor[type]++) % ids.length];
          if ((rem[type][cid] ?? 0) > 0) { chosen = cid; break; }
        }
        if (chosen) {
          if (rem[type][chosen] !== Infinity) rem[type][chosen] -= 1;
          bt.assigned[chosen] = (bt.assigned[chosen] || 0) + 1;
        } else {
          bt.leftover += 1;
        }
      }
    }
    return byType;
  });
}

export function generateRoute(selectedTypes, prof, cropSelections, ownedSeedCounts = null) {
  const cropSel = normalizeCropSelections(cropSelections);
  const groups = {};
  const avail = PATCHES.filter(p => selectedTypes.includes(p.type) && meetsReqs(p, prof));

  for (const patch of avail) {
    const key = patch.proximityGroup;
    if (!groups[key]) groups[key] = { patches: [], name: patch.name, region: patch.region, key, bestSpeed: Infinity, bestTp: null, routePriority: patch.routePriority, notes: [] };
    const g = groups[key];
    g.patches.push(patch);
    const tp = getBestTp(patch, prof);
    if (tp && tp.speed < g.bestSpeed) { g.bestSpeed = tp.speed; g.bestTp = tp; }
    if (patch.routePriority < g.routePriority) g.routePriority = patch.routePriority;
    if (patch.notes) g.notes.push(patch.notes);
  }

  // Order by teleport speed first; within a speed tier, cluster stops that share
  // the same primary teleport item so a single inventory load covers more of them
  // (fewer duplicate teleport-item slots per segment => fewer bank trips). Because
  // every stop is an independent teleport, this clustering costs no extra travel.
  const gearKey = g => (g.bestTp.items && g.bestTp.items[0]) || g.bestTp.method;
  const stops = Object.values(groups).filter(g => g.bestTp).sort((a,b) => {
    if (a.bestSpeed !== b.bestSpeed) return a.bestSpeed - b.bestSpeed;
    const ak = gearKey(a), bk = gearKey(b);
    if (ak !== bk) return ak < bk ? -1 : 1;
    return a.routePriority - b.routePriority;
  });

  // Charter-from-Catherby only makes sense if Catherby is actually visited BEFORE
  // Brimhaven in the (speed-sorted) route — otherwise we'd tell the player to
  // charter "from Catherby" before they've been there.
  const catherbyIdx = stops.findIndex(s => s.key === "catherby_area");
  const brimhavenIdx = stops.findIndex(s => s.key === "brimhaven");
  const charterFromCatherbyOk = catherbyIdx !== -1 && brimhavenIdx !== -1 && catherbyIdx < brimhavenIdx;

  // Allocate the selected crops to each stop's patches (count-limited crop mix).
  const alloc = allocateCrops(stops, cropSel, ownedSeedCounts);

  // Build stops with inventory data using actual crop selections
  const rawSteps = stops.map((s, i) => {
    let bestUpgrade = null;
    for (const p of s.patches) {
      const u = getBestUpgrade(p, prof, s.bestSpeed);
      if (u && (!bestUpgrade || u.speed < bestUpgrade.speed)) bestUpgrade = u;
    }

    // If Catherby is visited before Brimhaven, the free charter ship from Catherby
    // is worth surfacing when it's at least as fast as your best usable option.
    // This only changes the displayed method/speed; Brimhaven keeps its sorted
    // position (which is already after Catherby), so the "if already there" hint holds.
    let usedTp = s.bestTp;
    let usedSpeed = s.bestSpeed;
    if (s.key === "brimhaven" && charterFromCatherbyOk) {
      const charterTp = s.patches[0]?.teleports.find(t => t.charterFromCatherby);
      if (charterTp && (!usedTp || charterTp.speed <= usedSpeed)) {
        usedTp = charterTp;
        usedSpeed = charterTp.speed;
      }
    }

    // Compute farming items from the per-stop crop allocation — track quantities,
    // a human "plant X here" list, and any patches left unplanted (out of seeds).
    const seedQty = {}; // { "Maple sapling": 3 }
    const paymentQty = {}; // { "Oranges(5) ×1": 3 }
    let farmingSlots = 0;
    let needsTreeRemovalCoins = false;
    const plantDisplay = []; // e.g. ["Ranarr ×3", "Snapdragon ×2"]
    let leftover = 0;

    const stopAlloc = alloc[i] || {};
    for (const [type, at] of Object.entries(stopAlloc)) {
      const cropList = CROPS[type] || [];
      leftover += at.leftover || 0;
      for (const [cropId, count] of Object.entries(at.assigned)) {
        const crop = cropList.find(c => c.id === cropId);
        if (!crop) continue;
        if (crop.id === "pick_only" || !crop.seed) { plantDisplay.push(crop.name); continue; }
        seedQty[crop.seed] = (seedQty[crop.seed] || 0) + count;
        if (crop.payment) paymentQty[crop.payment] = (paymentQty[crop.payment] || 0) + count;
        if (type === "tree" || type === "fruitTree") needsTreeRemovalCoins = true;
        plantDisplay.push(count > 1 ? `${crop.name} ×${count}` : crop.name);
      }
    }

    // Convert qty maps to labeled items with counts (for display at each stop)
    const seedItems = Object.entries(seedQty).map(([name, qty]) => qty > 1 ? `${name} ×${qty}` : name);
    const paymentItems = Object.entries(paymentQty).map(([name, qty]) => qty > 1 ? `${name} ×${qty} patches` : name);

    // Seeds stack (1 slot), each unique payment type is 1 noted slot
    farmingSlots += Object.keys(seedQty).length + Object.keys(paymentQty).length;

    // Add coins for tree removal if needed
    if (needsTreeRemovalCoins) {
      seedItems.push("Coins (200gp for tree removal)");
    }

    // Determine fairy ring access method prefix
    let teleportMethod = usedTp.method;
    const tpItemsRaw = [...(usedTp.items || [])];
    if (teleportMethod.startsWith("Fairy Ring") || teleportMethod.startsWith("Fairy ring")) {
      if (prof.teleports["questPointCape"]) {
        teleportMethod = `Quest Cape → ${teleportMethod}`;
        // Replace Dramen/Lunar staff with Quest Point Cape in items
        const idx = tpItemsRaw.indexOf("Dramen/Lunar staff");
        if (idx !== -1) tpItemsRaw[idx] = "Quest Point Cape";
      } else if (prof.teleports["ardougneCloak"]) {
        teleportMethod = `Ardougne Cloak → ${teleportMethod}`;
        const idx = tpItemsRaw.indexOf("Dramen/Lunar staff");
        if (idx !== -1) tpItemsRaw[idx] = "Ardougne Cloak 1+";
      }
    }

    const teleportItems = [...new Set(tpItemsRaw)];
    const allFarmingItems = [...seedItems, ...paymentItems];

    return {
      location: s.name, region: s.region, key: s.key,
      patchTypes: [...new Set(s.patches.map(p => p.type))],
      teleport: teleportMethod, teleportSpeed: usedSpeed,
      teleportItems, farmingItems: allFarmingItems,
      seedItems, paymentItems,
      // Raw qty maps for bank aggregation
      seedQty: { ...seedQty }, paymentQty: { ...paymentQty },
      needsTreeRemovalCoins,
      farmingSlots,
      plantDisplay, leftover,
      notes: [...new Set(s.notes)], upgrade: bestUpgrade,
    };
  });

  // Insert bank stops based on inventory capacity. The model is: at each bank,
  // deposit everything except the always-carried tools, then withdraw fresh for
  // the next segment — so each segment is computed from a clean inventory.
  const initialBank = computeBankWithdrawals(rawSteps, 0);
  const withBanks = [{
    isBank: true,
    bankCategories: initialBank.categories,
    bankNote: initialBank.note,
    isInitial: true,
  }];

  // Walk the stops, inserting a mid-route bank whenever the next stop won't fit.
  let currentLoad = ALWAYS_EQUIPPED; // spade, dibber, rake occupy inventory slots
  let currentSegmentItems = ["Spade", "Seed dibber", "Rake"];
  let segmentStops = [];
  const stopsOnly = [];
  const MAX_SEGMENT_SLOTS = MAX_INVENTORY - ALWAYS_EQUIPPED;

  for (let i = 0; i < rawSteps.length; i++) {
    const step = rawSteps[i];
    const newTpItems = step.teleportItems.filter(it => !currentSegmentItems.includes(it));
    const stopSlots = newTpItems.length + step.farmingSlots;
    // Slots this stop needs on its own (fresh inventory) — used to detect a stop
    // that can't fit in a single trip even after banking.
    const standaloneSlots = step.teleportItems.length + step.farmingSlots;
    const overflow = standaloneSlots > MAX_SEGMENT_SLOTS;

    if (currentLoad + stopSlots > MAX_INVENTORY && segmentStops.length > 0) {
      const nextBank = computeBankWithdrawals(rawSteps, i);
      stopsOnly.push({
        isBank: true,
        bankCategories: nextBank.categories,
        bankNote: nextBank.note,
        isInitial: false,
      });
      currentLoad = ALWAYS_EQUIPPED;
      currentSegmentItems = ["Spade", "Seed dibber", "Rake"];
      segmentStops = [];
    }

    currentLoad += stopSlots;
    currentSegmentItems.push(...newTpItems, ...step.farmingItems);
    segmentStops.push(step);
    stopsOnly.push({ ...step, isBank: false, overflow });
  }

  // If nothing is actually reachable, return an empty route so the UI can show
  // its "no patches available" state instead of a lone, contradictory bank stop.
  if (stopsOnly.every(s => s.isBank)) return [];

  // Combine: initial bank + all stops with mid-route banks
  const finalRoute = [withBanks[0], ...stopsOnly];

  // Number all steps
  let stepNum = 0;
  return finalRoute.map(s => {
    stepNum++;
    return { ...s, step: stepNum };
  });
}

// Item categorization for bank stops
// Display helper: collapse "Law rune" / "Law rune ×2" into a single pluralized
// "Law runes" (drop amounts, dedupe). Leaves spellbook bundles like "Runes (Lunar)"
// and non-rune items untouched.
export function consolidateRunes(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const m = typeof item === "string" ? item.match(/^(.*\brune)s?(?:\s*[×x]\s*\d+)?$/i) : null;
    const name = m ? `${m[1]}s` : item;
    if (!seen.has(name)) { seen.add(name); out.push(name); }
  }
  return out;
}

export function categorizeItems(items) {
  const categories = {
    teleport: { label: "🧭 Teleport Equipment", color: "#c9a84c", bg: "#2a2510", border: "#4a3f20", items: [] },
    seeds: { label: "🌱 Seeds & Saplings", color: "#88cc88", bg: "#1a2a1a", border: "#2a442a", items: [] },
    payments: { label: "💰 Gardener Payments (noted)", color: "#ddaa55", bg: "#2a2210", border: "#443820", items: [] },
    runes: { label: "✨ Runes", color: "#9090cc", bg: "#1a1a2a", border: "#333366", items: [] },
    compost: { label: "🪣 Compost", color: "#8B6914", bg: "#2a2010", border: "#443010", items: [] },
  };

  for (const item of items) {
    const lower = item.toLowerCase();
    if (lower.includes("rune")) {
      categories.runes.items.push(item);
    } else if (lower.includes("seed") || lower.includes("sapling") || lower.includes("spore")) {
      categories.seeds.items.push(item);
    } else if (lower.includes("compost") || lower.includes("ultracompost") || lower.includes("bottomless")) {
      categories.compost.items.push(item);
    } else if (lower.includes("(10)") || lower.includes("(5)") || lower.includes("×") ||
               lower.includes("berry") || lower.includes("fruit") || lower.includes("coconut") ||
               lower.includes("spine") || lower.includes("leaf") || lower.includes("fibre") ||
               lower.includes("malt") || lower.includes("poison ivy") || lower.includes("mushroom") ||
               lower.includes("payment") || lower.includes("sweetcorn") || lower.includes("watermelon") ||
               lower.includes("pineapple") || lower.includes("papaya") || lower.includes("snape grass") ||
               lower.includes("coins")) {
      categories.payments.items.push(item);
    } else {
      categories.teleport.items.push(item);
    }
  }

  categories.runes.items = consolidateRunes(categories.runes.items);
  return Object.values(categories).filter(c => c.items.length > 0);
}

export function computeBankWithdrawals(allSteps, fromIdx) {
  const tpItems = new Set();
  const aggSeeds = {}; // seed name → total qty
  const aggPayments = {}; // payment name → total qty
  let needsCoins = false;
  let slots = ALWAYS_EQUIPPED;

  let stopsCount = 0;
  for (let i = fromIdx; i < allSteps.length; i++) {
    const s = allSteps[i];
    const newTp = (s.teleportItems||[]).filter(it => !tpItems.has(it));
    const newSlots = newTp.length + s.farmingSlots;
    if (slots + newSlots > MAX_INVENTORY) break;
    newTp.forEach(it => tpItems.add(it));
    // Aggregate seed and payment quantities
    if (s.seedQty) for (const [name, qty] of Object.entries(s.seedQty)) {
      aggSeeds[name] = (aggSeeds[name] || 0) + qty;
    }
    if (s.paymentQty) for (const [name, qty] of Object.entries(s.paymentQty)) {
      aggPayments[name] = (aggPayments[name] || 0) + qty;
    }
    if (s.needsTreeRemovalCoins) needsCoins = true;
    slots += newSlots;
    stopsCount++;
  }

  // Format aggregated items with total quantities
  const allItems = [...tpItems];
  for (const [name, qty] of Object.entries(aggSeeds)) {
    allItems.push(qty > 1 ? `${name} ×${qty}` : name);
  }
  if (needsCoins) allItems.push("Coins (200gp per tree removal)");
  for (const [name, qty] of Object.entries(aggPayments)) {
    allItems.push(qty > 1 ? `${name} ×${qty} patches` : name);
  }

  const categories = categorizeItems(allItems);

  let note;
  if (stopsCount === 0) {
    note = "Nothing to withdraw — no reachable stops";
  } else if (stopsCount >= allSteps.length - fromIdx) {
    note = `Withdraw everything for all ${stopsCount} stop${stopsCount !== 1 ? "s" : ""}`;
  } else {
    note = `Withdraw items for the next ${stopsCount} stop${stopsCount !== 1 ? "s" : ""}`;
  }

  return { categories, totalSlots: slots, note };
}

export function getAllRouteItems(route) {
  const equip = new Set();
  const farming = new Set();
  for (const s of route) {
    if (s.isBank) continue;
    (s.teleportItems||[]).forEach(it => equip.add(it));
    (s.farmingItems||[]).forEach(it => farming.add(it));
  }
  // Consolidate runes ("Law rune", "Law rune ×2" -> "Law runes") in the overview too.
  return { equipment: consolidateRunes([...equip]).sort(), farming: [...farming].sort() };
}

// ═══════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════
export const PROFILE_KEY = "osrs_fp_v5";

// Blank default — user must configure before first run. farmingLevel gates which
// crops can be planted and which Farming Guild tiers are reachable.
export function defaultProfile() {
  return { quests: {}, diaries: {}, teleports: {}, unlocks: {}, farmingLevel: 1 };
}
// Merge a parsed/partial profile over the default so no sub-object is ever
// undefined. Older or hand-edited localStorage values could omit keys, which
// previously crashed the engine on first render (e.g. prof.teleports[tp]).
export function normalizeProfile(p) {
  const d = defaultProfile();
  if (!p || typeof p !== "object") return d;
  const lvl = Number(p.farmingLevel);
  return {
    quests: { ...d.quests, ...(p.quests || {}) },
    diaries: { ...d.diaries, ...(p.diaries || {}) },
    teleports: { ...d.teleports, ...(p.teleports || {}) },
    unlocks: { ...d.unlocks, ...(p.unlocks || {}) },
    farmingLevel: Number.isFinite(lvl) ? Math.min(99, Math.max(1, Math.round(lvl))) : d.farmingLevel,
  };
}
export function isProfileEmpty(p) {
  return !Object.values(p.quests).some(Boolean) &&
    !Object.values(p.teleports).some(Boolean) &&
    !Object.values(p.unlocks).some(Boolean) &&
    !Object.values(p.diaries).some(v => v && v !== "None");
}
export function loadProfile() {
  try { const s = localStorage.getItem(PROFILE_KEY); if (s) return normalizeProfile(JSON.parse(s)); } catch (e) { /* corrupt — fall back */ }
  return defaultProfile();
}
export function saveProfile(p) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); return true; } catch (e) { return false; }
}

// Session state (selected types, crops, generated route, check-off progress) is
// persisted so an accidental refresh mid-run doesn't wipe everything.
export const SESSION_KEY = "osrs_session_v1";
export function loadSession() {
  try { const s = localStorage.getItem(SESSION_KEY); if (s) return JSON.parse(s); } catch (e) { /* ignore */ }
  return {};
}
export function saveSession(s) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
}

// Account-sync settings (the Cloudflare Worker URL) and the last synced AccountData.
export const SYNC_KEY = "osrs_sync_v1";
export const ACCT_KEY = "osrs_acct_v1";
export function loadSync() {
  try { const s = localStorage.getItem(SYNC_KEY); if (s) return JSON.parse(s); } catch (e) { /* ignore */ }
  return {};
}
export function saveSync(s) {
  try { localStorage.setItem(SYNC_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
}
export function loadAcct() {
  try { const s = localStorage.getItem(ACCT_KEY); if (s) return JSON.parse(s); } catch (e) { /* ignore */ }
  return null;
}
export function saveAcct(a) {
  try { localStorage.setItem(ACCT_KEY, JSON.stringify(a)); } catch (e) { /* ignore */ }
}

// ═══════════════════════════════════════════════════════════════
// BANK-MATERIAL AWARENESS
// ═══════════════════════════════════════════════════════════════
// Strip a trailing quantity suffix so a CROPS seed string ("Potato seed ×3")
// matches the bank's plain item name ("Potato seed").
export function baseSeedName(seed) {
  return typeof seed === "string" ? seed.replace(/\s*[×x]\s*\d+\s*$/i, "").trim() : seed;
}

// Pure. `ownedSeeds` is a Set/array of seed NAMES the player owns, or null/undefined
// when no bank data is available. Returns { [patchType]: boolean } — true if at least
// one crop of that type is plantable at the profile's Farming level AND its seed is
// owned. A crop with no seed (pick-only) counts as available. When ownedSeeds is
// null, EVERY type is true (feature disabled / graceful degradation).
export function plantableSeedTypes(prof, ownedSeeds) {
  const lvl = (prof && prof.farmingLevel) || 1;
  const owned = ownedSeeds == null ? null : new Set([...ownedSeeds].map(baseSeedName));
  const out = {};
  for (const type of Object.keys(CROPS)) {
    out[type] = CROPS[type].some(c => {
      if ((c.lvl || 1) > lvl) return false;     // gated by farming level
      if (!c.seed) return true;                 // pick-only / no-seed crop
      if (owned == null) return true;           // no bank data => don't restrict
      return owned.has(baseSeedName(c.seed));
    });
  }
  return out;
}

export function hasPlantableSeed(type, prof, ownedSeeds) {
  const r = plantableSeedTypes(prof, ownedSeeds)[type];
  return r === undefined ? true : r;
}
