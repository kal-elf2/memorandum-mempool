// STATE — player state object (all mutable game state lives here)

// ══════════════════════════════════════════════════════════════
//  PLAYER STATE
// ══════════════════════════════════════════════════════════════
const S = {
  selectedId:          "001",
  selectedInstanceIdx: 0,       // index in instancesFor(selectedId)
  seen:                {},       // dex_id → true
  owned:               {},       // dex_id → true (permanent — once owned, always shown as known)
  bondedLog:           {},       // dex_id → true (permanent — this dex was bonded/NFT at some point)
  bank:                {},       // base_memory → unspent memcore available
  progress:            {},       // base_memory → memcore spent on current stage progress
  instances:           [],       // all Memory instances (each encounter creates one)
  mode:                "memories", // "memories" | "bonded"
  filter:              "all",
  collSort:            "akronite",
  instanceCardOpen:    false,
};
