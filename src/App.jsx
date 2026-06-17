import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { QUESTS, DIARIES, DIARY_TIERS, TELEPORTS, OTHER_UNLOCKS, PATCHES, PATCH_TYPES, CROPS } from "./data.js";
import { meetsReqs, generateRoute, getAllRouteItems, isProfileEmpty, loadProfile, saveProfile, normalizeProfile, loadSession, saveSession, plantableSeedTypes, loadSync, saveSync, loadAcct, saveAcct } from "./engine.js";

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════
const SPD = { 1: { l: "Instant", c: "#4CAF50", d: "Direct TP to patch" }, 2: { l: "Fast", c: "#8BC34A", d: "TP + short run" }, 3: { l: "Medium", c: "#FFC107", d: "TP + moderate run" }, 4: { l: "Slow", c: "#FF9800", d: "TP + long run / multi-step" }, 5: { l: "Very Slow", c: "#f44336", d: "City TP + significant run" } };

function SpeedBadge({ speed }) {
  const s = SPD[speed] || SPD[3];
  return <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", backgroundColor: s.c + "22", color: s.c, border: `1px solid ${s.c}44` }}>{s.l}</span>;
}

const BankStop = memo(function BankStop({ step }) {
  const isInitial = step.isInitial;
  return (
    <div style={{
      display: "flex", gap: 16, padding: 16, borderRadius: 10,
      background: isInitial ? "#1a2018" : "#1a1a28",
      border: `2px dashed ${isInitial ? "#4a8844" : "#4444aa"}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: isInitial
          ? "linear-gradient(135deg, #4a8844, #2a5528)"
          : "linear-gradient(135deg, #4a4aee, #2a2a88)",
        color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0,
      }}>🏦</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 700, fontSize: 15, fontFamily: "'Cinzel', serif", marginBottom: 2,
          color: isInitial ? "#88cc88" : "#8888ee",
        }}>
          {isInitial ? "Starting Bank" : "Bank Stop"}
        </div>
        <div style={{ fontSize: 12, color: isInitial ? "#80a880" : "#9090c8", marginBottom: 10 }}>
          {isInitial ? "Gear up before starting your run" : step.bankNote}
        </div>

        {/* Always-equipped tools */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#8a8a8a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
            🔧 Always Equipped
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {["Spade", "Seed dibber", "Rake"].map(t => (
              <span key={t} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: "#222", color: "#aaa", border: "1px solid #444" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Categorized items */}
        {(step.bankCategories || []).map((cat, ci) => (
          <div key={ci} style={{ marginBottom: ci < (step.bankCategories||[]).length - 1 ? 8 : 0 }}>
            <div style={{ fontSize: 10, color: "#8a8a8a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
              {cat.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {cat.items.map((item, i) => (
                <span key={i} style={{
                  display: "inline-block", padding: "3px 8px", borderRadius: 4,
                  fontSize: 11, fontWeight: 600,
                  background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
                }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

function UpgradeHint({ upgrade }) {
  const [open, setOpen] = useState(false);
  const toggle = e => { e.stopPropagation(); setOpen(o => !o); };
  return (
    <div role="button" tabIndex={0} aria-expanded={open} aria-label="Faster teleport option available — show what to unlock" onClick={toggle} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(e); } }} style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "#1a1a2a", border: "1px solid #2a2a44", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontSize: 11, color: "#9a9aee", fontWeight: 600 }}>Faster option available</span>
          <SpeedBadge speed={upgrade.speed} />
        </div>
        <span style={{ color: "#8a8a8a", fontSize: 12, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </div>
      {open && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #2a2a44" }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 6 }}>{upgrade.method}</div>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>You need to unlock:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {upgrade.missing.map((r, i) => (
              <span key={i} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: "#2a1a1a", color: "#ee8a7a", border: "1px solid #442a2a" }}>✗ {r}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const RouteStep = memo(function RouteStep({ step, checked, onToggle }) {
  const toggle = () => onToggle(step.step);
  return (
    <div role="button" tabIndex={0} aria-pressed={checked} aria-label={`${step.location} — ${step.teleport}. ${checked ? "Done" : "Not done"}.`} onClick={toggle} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }} style={{ display: "flex", gap: 16, padding: 16, borderRadius: 10, cursor: "pointer", background: checked ? "#1a2a1a" : "#1e1e1e", border: `1px solid ${checked ? "#2e5a2e" : "#2a2a2a"}`, opacity: checked ? 0.5 : 1, transition: "all 0.2s" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: checked ? "#2e5a2e" : "linear-gradient(135deg, #c9a84c, #8b7028)", color: checked ? "#4CAF50" : "#1a1a1a", fontWeight: 800, fontSize: 14, flexShrink: 0, fontFamily: "'Cinzel', serif" }}>{checked ? "✓" : step.step}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: checked ? "#4a8a4a" : "#e8dcc0", textDecoration: checked ? "line-through" : "none", fontFamily: "'Cinzel', serif" }}>{step.location}</span>
          <span style={{ fontSize: 11, color: "#9a9a9a", padding: "1px 6px", borderRadius: 3, border: "1px solid #333", background: "#111" }}>{step.region}</span>
          {step.patchTypes.map(t => { const pt = PATCH_TYPES.find(p => p.id === t); return pt ? <span key={t} style={{ fontSize: 11, padding: "1px 6px", borderRadius: 3, background: pt.color + "22", color: pt.color, border: `1px solid ${pt.color}44` }}>{pt.icon} {pt.label}</span> : null; })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#999", fontSize: 12 }}>→</span>
          <span style={{ color: checked ? "#5a8a5a" : "#bbb", fontSize: 13, textDecoration: checked ? "line-through" : "none" }}>{step.teleport}</span>
          <SpeedBadge speed={step.teleportSpeed} />
        </div>
        {step.overflow && <div style={{ marginTop: 6, fontSize: 11, color: "#e0a050", background: "#2a2110", border: "1px solid #4a3a18", borderRadius: 6, padding: "4px 8px" }}>⚠ This stop needs more than one inventory of items — split it into two trips.</div>}
        {step.notes.length > 0 && <div style={{ marginTop: 4 }}>{step.notes.map((n,i) => <div key={i} style={{ fontSize: 11, color: "#a8975a", fontStyle: "italic" }}>💡 {n}</div>)}</div>}
        {!checked && step.upgrade && <UpgradeHint upgrade={step.upgrade} />}
      </div>
    </div>
  );
});

function ProfileEditor({ profile, setProfile, onClose, workerUrl, onWorkerUrlChange, acct, onAccountData }) {
  const [l, setL] = useState(() => normalizeProfile(JSON.parse(JSON.stringify(profile))));
  const cardRef = useRef(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [rsn, setRsn] = useState("");
  const tQ = id => setL(p => ({ ...p, quests: { ...p.quests, [id]: !p.quests[id] } }));
  const sD = (id, t) => setL(p => ({ ...p, diaries: { ...p.diaries, [id]: t } }));
  const tT = id => setL(p => ({ ...p, teleports: { ...p.teleports, [id]: !p.teleports[id] } }));
  const tU = id => setL(p => ({ ...p, unlocks: { ...p.unlocks, [id]: !p.unlocks[id] } }));
  const sLvl = v => setL(p => ({ ...p, farmingLevel: Math.min(99, Math.max(1, Math.round(Number(v) || 1))) }));
  const save = () => { const ok = saveProfile(l); setProfile(l); if (!ok) alert("Couldn't save to browser storage (private mode or full). Your changes apply for this session only."); onClose(); };

  // Pull Farming level + quests + diaries + bank-seed data from the GIM Worker.
  const doGimSync = async () => {
    if (!workerUrl) { setSyncMsg("Enter your Worker URL first (see worker/README.md)."); return; }
    setSyncBusy(true); setSyncMsg("Syncing…");
    try {
      const r = await fetch(workerUrl, { cache: "no-store" });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d || d.error) throw new Error((d && d.error) || ("HTTP " + r.status));
      setL(p => normalizeProfile({
        ...p,
        farmingLevel: Number.isFinite(d.farmingLevel) ? d.farmingLevel : p.farmingLevel,
        quests: { ...p.quests, ...(d.quests || {}) },
        diaries: { ...p.diaries, ...(d.diaries || {}) },
      }));
      onAccountData?.(d);
      const nq = Object.values(d.quests || {}).filter(Boolean).length;
      const nd = Object.values(d.diaries || {}).filter(t => t && t !== "None").length;
      const ns = Object.values(d.seeds || {}).filter(Boolean).length;
      setSyncMsg(`✓ Synced — Farming ${d.farmingLevel}, ${nq} quests, ${nd} diaries, seeds for ${ns} patch types. (Teleports/unlocks stay manual.)`);
    } catch (e) {
      setSyncMsg("Sync failed: " + e.message + ". Check the Worker URL and that it's deployed.");
    } finally { setSyncBusy(false); }
  };

  // Fallback: set just Farming level from a username via WiseOldMan (no setup, CORS-ok).
  const doWomLevel = async () => {
    const name = rsn.trim();
    if (!name) { setSyncMsg("Enter a username for the level lookup."); return; }
    setSyncBusy(true); setSyncMsg("Looking up…");
    try {
      const r = await fetch("https://api.wiseoldman.net/v2/players/" + encodeURIComponent(name));
      if (!r.ok) throw new Error(r.status === 404 ? "player not found / not tracked" : "HTTP " + r.status);
      const d = await r.json();
      const lvl = d?.latestSnapshot?.data?.skills?.farming?.level;
      if (!Number.isFinite(lvl)) throw new Error("no Farming level in response");
      setL(p => normalizeProfile({ ...p, farmingLevel: lvl }));
      setSyncMsg(`✓ Set Farming level to ${lvl} from WiseOldMan.`);
    } catch (e) {
      setSyncMsg("Lookup failed: " + e.message);
    } finally { setSyncBusy(false); }
  };

  // Close on Escape; move focus into the dialog on open.
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    cardRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const allQ = () => { const on = QUESTS.every(q => l.quests[q.id]); const u = {}; QUESTS.forEach(q => u[q.id] = !on); setL(p => ({ ...p, quests: { ...p.quests, ...u } })); };
  const allT = () => { const on = TELEPORTS.every(t => l.teleports[t.id]); const u = {}; TELEPORTS.forEach(t => u[t.id] = !on); setL(p => ({ ...p, teleports: { ...p.teleports, ...u } })); };

  // Group teleports
  const tpGroups = [
    { label: "Transport Networks", ids: TELEPORTS.filter(t => t.cat === "transport").map(t => t.id) },
    { label: "Planted Spirit Trees", desc: "Only enable trees you've actually planted (requires 83 Farming)", ids: TELEPORTS.filter(t => t.cat === "planted").map(t => t.id) },
    { label: "Teleport Items", ids: TELEPORTS.filter(t => t.cat === "item").map(t => t.id) },
    { label: "Jewellery", ids: TELEPORTS.filter(t => t.cat === "jewellery").map(t => t.id) },
    { label: "Spellbooks", ids: TELEPORTS.filter(t => t.cat === "spellbook").map(t => t.id) },
    { label: "Diary Rewards", ids: TELEPORTS.filter(t => t.cat === "diary").map(t => t.id) },
    { label: "Quest Rewards", ids: TELEPORTS.filter(t => t.cat === "quest").map(t => t.id) },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div ref={cardRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title" onClick={e => e.stopPropagation()} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, width: "min(95vw, 740px)", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", outline: "none" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 2, background: "linear-gradient(to bottom, #1a1a1a 80%, transparent)", padding: "20px 24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><h2 id="profile-dialog-title" style={{ margin: 0, color: "#e0c97f", fontFamily: "'Cinzel', serif", fontSize: 20 }}>Account Profile</h2><p style={{ margin: "4px 0 0", color: "#999", fontSize: 12 }}>Configure your unlocks. Saved to browser storage. Press Esc to close.</p></div>
          <button onClick={onClose} aria-label="Close profile editor" style={{ background: "none", border: "none", color: "#999", fontSize: 24, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          {/* Account Sync */}
          <div style={{ marginBottom: 24, padding: 14, borderRadius: 8, background: "#15201a", border: "1px solid #234a2a" }}>
            <h3 style={{ margin: "0 0 4px", color: "#7bd88f", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Account Sync</h3>
            <p style={{ margin: "0 0 10px", color: "#8a8a8a", fontSize: 11 }}>
              Auto-fill Farming level, quests &amp; diaries — and tell the optimizer which seeds you own — from your Group Ironman tracker. Needs the Cloudflare Worker from <code style={{ color: "#9a9a9a" }}>worker/README.md</code> (your token stays private).
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="url" value={workerUrl || ""} placeholder="https://…workers.dev"
                onChange={e => onWorkerUrlChange?.(e.target.value)}
                aria-label="GIM Worker URL"
                style={{ flex: "1 1 240px", minWidth: 0, background: "#111", color: "#cde", border: "1px solid #2a4a32", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
              />
              <button onClick={doGimSync} disabled={syncBusy} style={{ background: syncBusy ? "#2a3a2a" : "linear-gradient(135deg, #4a8844, #2a5528)", border: "none", color: "#eafae6", padding: "8px 16px", borderRadius: 6, cursor: syncBusy ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
                {syncBusy ? "Working…" : "Sync from my GIM account"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
              <input
                type="text" value={rsn} placeholder="OSRS username (Farming level only)"
                onChange={e => setRsn(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") doWomLevel(); }}
                aria-label="OSRS username for WiseOldMan level lookup"
                style={{ flex: "1 1 240px", minWidth: 0, background: "#111", color: "#cde", border: "1px solid #333", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
              />
              <button onClick={doWomLevel} disabled={syncBusy} style={{ background: "#222", border: "1px solid #444", color: "#bbb", padding: "8px 16px", borderRadius: 6, cursor: syncBusy ? "wait" : "pointer", fontSize: 13 }}>
                Fill level from username
              </button>
            </div>
            {syncMsg && <div style={{ marginTop: 8, fontSize: 12, color: syncMsg.startsWith("✓") ? "#7bd88f" : syncMsg.includes("fail") || syncMsg.includes("Enter") ? "#e0a050" : "#8a8a8a" }}>{syncMsg}</div>}
            {acct?.updatedAt && <div style={{ marginTop: 6, fontSize: 11, color: "#667" }}>Bank/account data last synced: {new Date(acct.updatedAt).toLocaleString()}</div>}
          </div>
          {/* Farming level */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 10px", color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Farming Level</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 8, background: "#222", border: "1px solid #333" }}>
              <input type="range" min={1} max={99} value={l.farmingLevel} onChange={e => sLvl(e.target.value)} aria-label="Farming level" style={{ flex: 1, accentColor: "#c9a84c" }} />
              <input type="number" min={1} max={99} value={l.farmingLevel} onChange={e => sLvl(e.target.value)} aria-label="Farming level" style={{ width: 60, background: "#1a1a1a", color: "#e0c97f", border: "1px solid #444", borderRadius: 4, padding: "6px 8px", fontSize: 14, textAlign: "center" }} />
            </div>
            <div style={{ fontSize: 11, color: "#8a8a8a", marginTop: 6, fontStyle: "italic" }}>Used to default crops you can actually plant and to gate Farming Guild tiers (45 / 65 / 85).</div>
          </div>
          {/* Quests */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Quests</h3>
              <button onClick={allQ} style={{ background: "none", border: "1px solid #444", borderRadius: 4, color: "#aaa", fontSize: 11, padding: "3px 10px", cursor: "pointer" }}>{QUESTS.every(q => l.quests[q.id]) ? "Deselect All" : "Select All"}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6 }}>
              {QUESTS.map(q => <label key={q.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: l.quests[q.id] ? "#2a2a1a" : "#222", border: `1px solid ${l.quests[q.id] ? "#5a5020" : "#333"}` }}><input type="checkbox" checked={!!l.quests[q.id]} onChange={() => tQ(q.id)} style={{ accentColor: "#c9a84c" }} /><span style={{ color: l.quests[q.id] ? "#e0c97f" : "#888", fontSize: 13 }}>{q.name}</span></label>)}
            </div>
          </div>
          {/* Diaries */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 10px", color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Achievement Diaries</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
              {DIARIES.map(d => <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 6, background: "#222", border: "1px solid #333" }}><span style={{ color: "#ccc", fontSize: 13 }}>{d.name}</span><select value={l.diaries[d.id]||"None"} onChange={e => sD(d.id, e.target.value)} style={{ background: "#1a1a1a", color: "#e0c97f", border: "1px solid #444", borderRadius: 4, padding: "3px 6px", fontSize: 12 }}>{DIARY_TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>)}
            </div>
          </div>
          {/* Teleports — grouped */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Teleports & Transportation</h3>
              <button onClick={allT} style={{ background: "none", border: "1px solid #444", borderRadius: 4, color: "#aaa", fontSize: 11, padding: "3px 10px", cursor: "pointer" }}>{TELEPORTS.every(t => l.teleports[t.id]) ? "Deselect All" : "Select All"}</button>
            </div>
            {tpGroups.filter(g => g.ids.length > 0).map(grp => (
              <div key={grp.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#777", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{grp.label}</div>
                {grp.desc && <div style={{ fontSize: 10, color: "#8a8a8a", marginBottom: 6, fontStyle: "italic" }}>{grp.desc}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 5 }}>
                  {grp.ids.map(id => { const t = TELEPORTS.find(tp => tp.id === id); return t ? (
                    <label key={id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 10px", borderRadius: 6, cursor: "pointer", background: l.teleports[id] ? "#1a2a1a" : "#222", border: `1px solid ${l.teleports[id] ? "#205a20" : "#333"}` }}>
                      <input type="checkbox" checked={!!l.teleports[id]} onChange={() => tT(id)} style={{ accentColor: "#4CAF50", marginTop: 2 }} />
                      <div>
                        <div style={{ color: l.teleports[id] ? "#a5d6a7" : "#888", fontSize: 13 }}>{t.name}</div>
                        {t.desc && <div style={{ color: "#8a8a8a", fontSize: 10, marginTop: 1 }}>{t.desc}</div>}
                      </div>
                    </label>
                  ) : null; })}
                </div>
              </div>
            ))}
          </div>
          {/* Other */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 10px", color: "#c9a84c", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Other Unlocks</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 6 }}>
              {OTHER_UNLOCKS.map(u => <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: l.unlocks[u.id] ? "#2a1a2a" : "#222", border: `1px solid ${l.unlocks[u.id] ? "#5a2050" : "#333"}` }}><input type="checkbox" checked={!!l.unlocks[u.id]} onChange={() => tU(u.id)} style={{ accentColor: "#9C27B0" }} /><span style={{ color: l.unlocks[u.id] ? "#ce93d8" : "#888", fontSize: 13 }}>{u.name}</span></label>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid #333" }}>
            <button onClick={onClose} style={{ background: "#333", border: "none", color: "#aaa", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>Cancel</button>
            <button onClick={save} style={{ background: "linear-gradient(135deg, #c9a84c, #8b7028)", border: "none", color: "#1a1a1a", padding: "10px 32px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  // Read any persisted session once.
  const restoredRef = useRef(null);
  if (restoredRef.current === null) restoredRef.current = loadSession();
  const restored = restoredRef.current;

  const [prof, setProf] = useState(loadProfile);
  const [showProf, setShowProf] = useState(false);
  const [selTypes, setSelTypes] = useState(() => restored.selTypes || ["herb"]);
  const [route, setRoute] = useState(() => restored.route || null);
  const [checked, setChecked] = useState(() => restored.checked || {});
  const [showRoute, setShowRoute] = useState(() => !!restored.showRoute);
  const [showCropSelect, setShowCropSelect] = useState(() => !!restored.showCropSelect);
  const [cropSelections, setCropSelections] = useState(() => restored.cropSelections || {});

  // Persist the working session whenever it changes.
  useEffect(() => {
    saveSession({ selTypes, cropSelections, route, checked, showRoute, showCropSelect });
  }, [selTypes, cropSelections, route, checked, showRoute, showCropSelect]);

  // Account sync (GIM Worker URL + last synced AccountData for bank-aware gating).
  const [workerUrl, setWorkerUrl] = useState(() => loadSync().workerUrl || "");
  const [acct, setAcct] = useState(loadAcct);
  const onWorkerUrlChange = u => { setWorkerUrl(u); saveSync({ workerUrl: u }); };
  const onAccountData = d => { setAcct(d); saveAcct(d); };
  // Owned seed names from the last sync (null => no bank data => no seed restriction).
  const ownedSeeds = acct && Array.isArray(acct.ownedSeedNames) ? acct.ownedSeedNames : null;
  // { type: bool } — can plant something of this type (farming level + owned seeds).
  const plantableByType = useMemo(() => plantableSeedTypes(prof, ownedSeeds), [prof, acct]); // eslint-disable-line react-hooks/exhaustive-deps
  // Selected types we have to skip because the bank has no plantable seed for them.
  const blockedTypes = acct ? selTypes.filter(t => plantableByType[t] === false) : [];
  const genTypes = selTypes.filter(t => !blockedTypes.includes(t));

  const handleSave = p => setProf(p);
  const toggleType = id => setSelTypes(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);
  // Patches reachable (profile/teleport-wise) among the seed-plantable selected types.
  const reachableCount = genTypes.reduce((n, t) => n + PATCHES.filter(p => p.type === t && meetsReqs(p, prof)).length, 0);
  const canGo = !!genTypes.length && !isProfileEmpty(prof) && reachableCount > 0;
  const go = () => {
    if (!canGo) return; // nothing plantable + reachable to plan
    const defaults = {};
    const lvl = prof.farmingLevel || 1;
    for (const t of genTypes) {
      if (!cropSelections[t] && CROPS[t] && CROPS[t].length > 0) {
        // Bush and cactus default to "pick only" since they usually don't need replanting
        if (t === "bush" || t === "cactus") {
          defaults[t] = "pick_only";
        } else {
          // Default to the highest-level crop the player can actually plant.
          const plantable = CROPS[t].filter(c => c.id !== "pick_only" && (c.lvl || 1) <= lvl);
          defaults[t] = (plantable.length ? plantable[plantable.length - 1] : CROPS[t][0]).id;
        }
      }
    }
    setCropSelections(prev => ({ ...prev, ...defaults }));
    setShowCropSelect(true);
  };
  const goGenerate = () => {
    // Generate only for types we can actually plant (skip seed-blocked ones).
    setRoute(generateRoute(genTypes, prof, cropSelections));
    setChecked({});
    setShowCropSelect(false);
    setShowRoute(true);
  };
  const toggleChk = useCallback(n => setChecked(p => ({ ...p, [n]: !p[n] })), []);

  const [copied, setCopied] = useState("");
  const copyText = async (text, label) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1800); }
    catch (e) { setCopied("Copy failed"); setTimeout(() => setCopied(""), 1800); }
  };
  const routeToText = () => {
    if (!route) return "";
    const lines = ["OSRS Farming Route", ""];
    route.forEach(s => {
      if (s.isBank) {
        lines.push(`[Bank] ${s.isInitial ? "Starting Bank" : "Bank stop"} — ${s.bankNote || ""}`);
        (s.bankCategories || []).forEach(c => lines.push(`   ${c.label}: ${c.items.join(", ")}`));
      } else {
        lines.push(`${s.step}. ${s.location} (${s.region}) — ${s.teleport}`);
        if (s.farmingItems && s.farmingItems.length) lines.push(`   Items: ${s.farmingItems.join(", ")}`);
      }
    });
    return lines.join("\n");
  };
  const shoppingToText = () => {
    if (!route) return "";
    const { equipment, farming } = getAllRouteItems(route);
    return [
      "OSRS Farming — shopping list",
      "Tools (equip/carry): Spade, Seed dibber, Rake",
      equipment.length ? `Teleport gear: ${equipment.join(", ")}` : "",
      farming.length ? `Seeds & payments: ${farming.join(", ")}` : "",
    ].filter(Boolean).join("\n");
  };

  const progress = route ? route.filter(s => !s.isBank && checked[s.step]).length : 0;
  const total = route ? route.filter(s => !s.isBank).length : 0;
  const bankCount = route ? route.filter(s => s.isBank).length : 0;
  const upgradeCount = route ? route.filter(s => !s.isBank && s.upgrade).length : 0;

  const presets = [
    { name: "Herb Run", types: ["herb"] },
    { name: "Herbs + Allotments", types: ["herb", "allotment", "flower"] },
    { name: "Tree Run", types: ["tree"] },
    { name: "Fruit Trees", types: ["fruitTree"] },
    { name: "All Trees", types: ["tree", "fruitTree", "calquat"] },
    { name: "Everything", types: PATCH_TYPES.map(p => p.id) },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#ccc", fontFamily: "'Crimson Text', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:8px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
        body{margin:0;background:#111}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <header style={{ background: "linear-gradient(to bottom, #1a1608, #111)", borderBottom: "1px solid #2a2210", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 800, color: "#e0c97f", letterSpacing: 1, margin: 0, lineHeight: 1.2 }}>FARMING ROUTE OPTIMIZER</h1>
            <span style={{ fontSize: 10, color: "#5a5030", letterSpacing: 2, textTransform: "uppercase" }}>Old School RuneScape</span>
          </div>
        </div>
        <button onClick={() => setShowProf(true)} style={{ background: "linear-gradient(135deg, #2a2210, #1a1608)", border: "1px solid #3a3020", color: "#c9a84c", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>⚙</span> Edit Profile
        </button>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        {!showRoute && !showCropSelect ? (
          <>
            {/* Profile setup banner */}
            {isProfileEmpty(prof) && (
              <div role="button" tabIndex={0} onClick={() => setShowProf(true)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowProf(true); } }} style={{
                marginBottom: 24, padding: 20, borderRadius: 12, cursor: "pointer",
                background: "linear-gradient(135deg, #2a1a08, #1a1208)",
                border: "2px solid #c9a84c88",
                boxShadow: "0 0 20px rgba(201,168,76,0.15)",
                animation: "fadeIn 0.4s ease-out",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, #c9a84c, #8b7028)",
                    fontSize: 22,
                  }}>⚙</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: "#e0c97f", marginBottom: 2 }}>
                      Set Up Your Account Profile
                    </div>
                    <div style={{ fontSize: 12, color: "#998860" }}>
                      Tell us your quests, diaries, teleports, and unlocks so we can calculate the fastest routes for your account.
                    </div>
                  </div>
                  <div style={{ color: "#c9a84c", fontSize: 20, flexShrink: 0 }}>→</div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#c9a84c", marginBottom: 6 }}>Select Patch Types</h2>
              <p style={{ color: "#8a8a8a", fontSize: 13, marginBottom: 16 }}>Choose which patches to include in your farming run</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {presets.map(p => {
                  const act = p.types.length === selTypes.length && p.types.every(t => selTypes.includes(t));
                  return <button key={p.name} onClick={() => setSelTypes(p.types)} style={{ background: act ? "#2a2210" : "#1a1a1a", border: `1px solid ${act ? "#5a4520" : "#333"}`, color: act ? "#e0c97f" : "#888", padding: "5px 12px", borderRadius: 16, cursor: "pointer", fontSize: 12, fontFamily: "'Crimson Text', serif" }}>{p.name}</button>;
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                {PATCH_TYPES.map(pt => {
                  const sel = selTypes.includes(pt.id);
                  const cnt = PATCHES.filter(p => p.type === pt.id && meetsReqs(p, prof)).length;
                  const noSeed = !!acct && plantableByType[pt.id] === false;
                  return <button key={pt.id} onClick={() => toggleType(pt.id)} title={noSeed ? "No seed for this patch type that you can plant at your Farming level is in your bank" : undefined} style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, cursor: "pointer", background: sel ? pt.color + "15" : "#1a1a1a", border: `2px solid ${sel ? pt.color + "66" : "#2a2a2a"}`, color: sel ? pt.color : "#666", fontFamily: "'Crimson Text', serif", fontSize: 14, fontWeight: 600, textAlign: "left", opacity: noSeed ? 0.5 : 1 }}>
                    <span style={{ fontSize: 20 }}>{pt.icon}</span>
                    <div><div>{pt.label}</div><div style={{ fontSize: 11, color: noSeed ? "#cc8a55" : sel ? pt.color : "#8a8a8a", fontWeight: 400 }}>{noSeed ? "no seeds in bank" : `${cnt} patch${cnt !== 1 ? "es" : ""}`}</div></div>
                  </button>;
                })}
              </div>
            </div>
            {blockedTypes.length > 0 && (
              <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "#2a2110", border: "1px solid #4a3a18", fontSize: 12, color: "#e0a050" }}>
                🌱 Skipping {blockedTypes.map(t => PATCH_TYPES.find(p => p.id === t)?.label || t).join(", ")} — no seeds you can plant at Farming {prof.farmingLevel} are in your bank. Buy seeds, raise your level, or re-sync after banking.
              </div>
            )}
            <button onClick={go} disabled={!canGo} style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", background: canGo ? "linear-gradient(135deg, #c9a84c, #8b7028)" : "#333", color: canGo ? "#1a1a1a" : "#888", fontSize: 16, fontWeight: 800, fontFamily: "'Cinzel', serif", letterSpacing: 1, cursor: canGo ? "pointer" : "not-allowed", boxShadow: canGo ? "0 4px 20px rgba(201,168,76,0.3)" : "none" }}>
              {isProfileEmpty(prof) ? "⚙ Set Up Profile First" : !selTypes.length ? "Select at Least One Patch Type" : !genTypes.length ? "No plantable seeds for this selection" : reachableCount === 0 ? "No reachable patches for this selection" : "Generate Optimal Route →"}
            </button>
            {!isProfileEmpty(prof) && genTypes.length > 0 && reachableCount === 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#cc8a55", textAlign: "center" }}>None of the selected patch types are reachable with your current profile. Try enabling more teleports/unlocks, raising your Farming level, or picking other patch types.</div>
            )}
            <div style={{ marginTop: 28, padding: 16, background: "#1a1a1a", borderRadius: 10, border: `1px solid ${isProfileEmpty(prof) ? "#44220088" : "#2a2a2a"}` }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Profile Summary</h3>
              {isProfileEmpty(prof) ? (
                <div style={{ fontSize: 12, color: "#a08a5a", fontStyle: "italic" }}>
                  No profile configured yet. Click "Edit Profile" or the banner above to get started.
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "#8a8a8a" }}>
                  <span><strong style={{ color: "#e0c97f" }}>{prof.farmingLevel || 1}</strong> Farming</span>
                  <span><strong style={{ color: "#e0c97f" }}>{Object.values(prof.quests).filter(Boolean).length}</strong> quests</span>
                  <span><strong style={{ color: "#e0c97f" }}>{Object.values(prof.diaries).filter(v => v && v !== "None").length}</strong> diaries</span>
                  <span><strong style={{ color: "#e0c97f" }}>{Object.values(prof.teleports).filter(Boolean).length}</strong> teleports</span>
                  <span><strong style={{ color: "#e0c97f" }}>{Object.values(prof.unlocks).filter(Boolean).length}</strong> unlocks</span>
                </div>
              )}
            </div>
          </>
        ) : showCropSelect && !showRoute ? (
          <>
            {/* CROP SELECTION STEP */}
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setShowCropSelect(false)} style={{ background: "#1e1e1e", border: "1px solid #333", color: "#c9a84c", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>← Back</button>
              <div>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#e0c97f", margin: 0 }}>Select Your Crops</h2>
                <p style={{ color: "#8a8a8a", fontSize: 12, margin: "2px 0 0" }}>Choose what to plant at each patch type (crops above your Farming level are locked)</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {genTypes.filter(t => CROPS[t] && CROPS[t].length > 0).map(typeId => {
                const pt = PATCH_TYPES.find(p => p.id === typeId);
                const crops = CROPS[typeId];
                const patchCount = PATCHES.filter(p => p.type === typeId && meetsReqs(p, prof)).length;
                // The engine treats each allotment location as 2 plantable patches.
                const effCount = patchCount * (typeId === "allotment" ? 2 : 1);
                const selected = cropSelections[typeId];
                const selectedCrop = crops.find(c => c.id === selected);
                const lvl = prof.farmingLevel || 1;

                return (
                  <div key={typeId} style={{
                    padding: 16, borderRadius: 10, background: "#1e1e1e",
                    border: `1px solid ${pt?.color || "#333"}33`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>{pt?.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: pt?.color || "#ccc", fontFamily: "'Cinzel', serif" }}>{pt?.label}</span>
                      <span style={{ fontSize: 11, color: "#8a8a8a" }}>({patchCount} patch{patchCount !== 1 ? "es" : ""})</span>
                    </div>
                    <select
                      value={selected || ""}
                      onChange={e => setCropSelections(prev => ({ ...prev, [typeId]: e.target.value }))}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        background: "#111", color: "#e0c97f", border: `1px solid ${pt?.color || "#444"}44`,
                        fontSize: 14, fontFamily: "'Crimson Text', serif",
                      }}
                    >
                      {crops.map(c => {
                        const tooHigh = c.id !== "pick_only" && (c.lvl || 1) > lvl;
                        return (
                          <option key={c.id} value={c.id} disabled={tooHigh}>
                            {c.id === "pick_only" ? c.name : `${c.name} (Lvl ${c.lvl})${tooHigh ? " 🔒" : ""} — ${c.seed}${c.payment ? ` | Pay: ${c.payment}` : " | No protection"}`}
                          </option>
                        );
                      })}
                    </select>
                    {selectedCrop && selectedCrop.id !== "pick_only" && (
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {selectedCrop.seed && (
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#1a2a1a", color: "#88cc88", border: "1px solid #2a442a" }}>
                            Bring: {selectedCrop.seed} × {effCount}
                          </span>
                        )}
                        {selectedCrop.payment && (
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#2a2210", color: "#ddaa55", border: "1px solid #443820" }}>
                            Pay: {selectedCrop.payment} × {effCount}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedCrop && selectedCrop.id === "pick_only" && (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#1a1a2a", color: "#9090cc", border: "1px solid #333366" }}>
                          Just picking — no seeds needed
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={goGenerate} style={{
              width: "100%", padding: 16, borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #c9a84c, #8b7028)",
              color: "#1a1a1a", fontSize: 16, fontWeight: 800, fontFamily: "'Cinzel', serif",
              letterSpacing: 1, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(201,168,76,0.3)",
            }}>
              Generate Optimal Route →
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => { setShowRoute(false); setShowCropSelect(true); }} style={{ background: "#1e1e1e", border: "1px solid #333", color: "#c9a84c", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>← Back</button>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#e0c97f", margin: 0 }}>Your Farming Route</h2>
                <p style={{ color: "#8a8a8a", fontSize: 12, margin: "2px 0 0" }}>
                  {total} stop{total !== 1 ? "s" : ""}
                  {bankCount > 0 && <span style={{ color: "#9a9aee" }}> • {bankCount} bank stop{bankCount !== 1 ? "s" : ""}</span>}
                  {upgradeCount > 0 && <span style={{ color: "#9a9aee" }}> • {upgradeCount} upgrade{upgradeCount !== 1 ? "s" : ""}</span>}
                </p>
              </div>
              {total > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {copied && <span style={{ fontSize: 11, color: "#88cc88" }}>{copied === "Copy failed" ? "✗ " + copied : "✓ Copied " + copied}</span>}
                  <button onClick={() => copyText(shoppingToText(), "list")} title="Copy shopping list" style={{ background: "none", border: "1px solid #333", color: "#aaa", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>📋 List</button>
                  <button onClick={() => copyText(routeToText(), "route")} title="Copy full route" style={{ background: "none", border: "1px solid #333", color: "#aaa", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>📋 Route</button>
                  <button onClick={() => setChecked({})} style={{ background: "none", border: "1px solid #333", color: "#aaa", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Reset</button>
                </div>
              )}
            </div>

            {/* Total items overview */}
            {route && route.length > 0 && (() => {
              const { equipment, farming } = getAllRouteItems(route);
              return (equipment.length > 0 || farming.length > 0) ? (
                <div style={{ marginBottom: 16, padding: "14px 16px", background: "#1a1a12", borderRadius: 10, border: "1px solid #33301a" }}>
                  <div style={{ fontSize: 11, color: "#8a7a50", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🎒</span> Total Items Needed (full route overview)
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#1a2a1a", color: "#88bb88", border: "1px solid #2a442a" }}>Spade</span>
                    <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#1a2a1a", color: "#88bb88", border: "1px solid #2a442a" }}>Seed dibber</span>
                    <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#1a2a1a", color: "#88bb88", border: "1px solid #2a442a" }}>Rake</span>
                    {equipment.map(it => <span key={it} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: "#2a2510", color: "#e0c97f", border: "1px solid #4a3f20" }}>{it}</span>)}
                    {farming.map(it => <span key={it} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, background: "#1a1a2a", color: "#9090cc", border: "1px solid #333366" }}>{it}</span>)}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Progress */}
            {total > 0 && (
              <div style={{ marginBottom: 16, background: "#1a1a1a", borderRadius: 8, padding: "12px 16px", border: "1px solid #2a2a2a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#888" }}>Progress</span>
                  <span style={{ fontSize: 12, color: progress === total ? "#4CAF50" : "#c9a84c", fontWeight: 700 }}>{progress}/{total}{progress === total && " ✓ Run complete!"}</span>
                </div>
                <div style={{ height: 6, background: "#2a2a2a", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${total ? (progress / total) * 100 : 0}%`, background: progress === total ? "linear-gradient(90deg, #4CAF50, #8BC34A)" : "linear-gradient(90deg, #c9a84c, #e0c97f)", borderRadius: 3, transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {route && route.length > 0 ? route.map(s => (
                <div key={s.step} style={{ animation: `fadeIn 0.3s ease ${s.step * 0.04}s both` }}>
                  {s.isBank ? <BankStop step={s} /> : <RouteStep step={s} checked={!!checked[s.step]} onToggle={toggleChk} />}
                </div>
              )) : (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#8a8a8a", fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div>
                  No reachable patches for your current profile and selection.<br />
                  <span style={{ fontSize: 12 }}>Try enabling more teleports/unlocks, raising your Farming level, or selecting different patch types.</span>
                </div>
              )}
            </div>

            {/* Legend */}
            {route && route.length > 0 && (
              <div style={{ marginTop: 24, padding: 14, background: "#1a1a1a", borderRadius: 10, border: "1px solid #222" }}>
                <div style={{ fontSize: 11, color: "#8a8a8a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Teleport Speed Legend</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[1,2,3,4,5].map(s => <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}><SpeedBadge speed={s} /><span style={{ fontSize: 11, color: "#9a9a9a" }}>{SPD[s].d}</span></div>)}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showProf && <ProfileEditor profile={prof} setProfile={handleSave} onClose={() => setShowProf(false)} workerUrl={workerUrl} onWorkerUrlChange={onWorkerUrlChange} acct={acct} onAccountData={onAccountData} />}
    </div>
  );
}
