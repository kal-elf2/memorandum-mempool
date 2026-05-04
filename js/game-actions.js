// GAME ACTIONS — level up, evolve, mint, debug helpers, reset

// ══════════════════════════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════════════════════════

function openNftArt() {
  // Placeholder — will eventually navigate to on-chain NFT art viewer
}

function doTearMaxLevel() {
  const mem = MEMORIES[S.selectedId]; if (!mem) return;
  const base = mem.base_memory;
  const inst = currentInstance(); if (!inst) return;
  const maxMC = mem.max_mc;
  const spent = instanceMcSpent(inst, base);
  if (spent >= maxMC) return;
  inst.mc_spent = maxMC;
  renderDetail();
}

function doLevelUp() {
  const mem = MEMORIES[S.selectedId]; if (!mem) return;
  const base  = mem.base_memory;
  const bank  = S.bank[base]     || 0;
  const inst  = currentInstance(); if (!inst) return;
  const maxMC = mem.max_mc;
  const spent = instanceMcSpent(inst, base);
  if (spent >= maxMC || bank < 1) return;

  S.bank[base] = bank - 1;
  inst.mc_spent = spent + 1;
  renderDetail();
}

function doEvolve() {
  const id  = S.selectedId;
  const mem = MEMORIES[id]; if (!mem || !mem.evolves_to) return;
  const inst = currentInstance(); if (!inst) return;
  const base  = mem.base_memory;
  const spent = instanceMcSpent(inst, base);
  if (spent < mem.max_mc) return; // must be max level

  const targetId = mem.evolves_to;
  const target   = MEMORIES[targetId]; if (!target) return;

  const newlyOwnsTarget = !S.instances.some(i => i.dex_id === targetId);
  const carryPersonality = inst.personality;
  const carryShiny       = inst.is_shiny;

  // Evolve the instance (personality + Akronite carry the same soul forward)
  inst.dex_id        = targetId;
  inst.name          = target.name;
  inst.rarity        = target.rarity;
  inst.current_stage = target.stage;
  inst.origin_state  = 'evolved';
  inst.personality   = carryPersonality;
  inst.is_shiny      = carryShiny;

  // Essence grows on evolution (1.25x per stage)
  inst.revealed_essence = Math.max(1, Math.round(inst.revealed_essence * 1.25));
  if (inst.is_nft) {
    inst.nft_essence = Math.max(1, Math.round(inst.revealed_essence * NFT_STATIC_MULTIPLIER));
  }

  // Carry forward previous stage max as starting progress for the new form
  S.progress[base] = 0;
  inst.mc_spent = mem.max_mc;

  // Mark both old and new dex as permanently owned
  S.owned[id]       = true;
  S.owned[targetId] = true;
  S.seen[targetId]  = true;

  // If NFT, log both stages in bonded history
  if (inst.is_nft) {
    S.bondedLog[id]       = true;
    S.bondedLog[targetId] = true;
  }
  S.selectedId      = targetId;
  S.selectedInstanceIdx = 0;

  renderGrid();
  renderDetail();

  if (newlyOwnsTarget) {
    showCongrats(inst, { dismissToDetail: true });
  }
}

function doMint() {
  const inst = currentInstance(); if (!inst) return;
  const mem  = MEMORIES[S.selectedId]; if (!mem) return;
  if (!mem.mintable || inst.is_nft || inst.origin_state !== 'saved') return;
  const base = mem.base_memory;
  if (instanceMcSpent(inst, base) < mem.max_mc) return;

  inst.is_nft              = true;
  inst.nft_minted_at_stage = inst.current_stage;
  inst.nft_essence         = Math.max(1, Math.round(inst.revealed_essence * NFT_STATIC_MULTIPLIER));
  S.bondedLog[S.selectedId] = true;
  renderDetail();
}

// ══════════════════════════════════════════════════════════════
//  DEBUG
// ══════════════════════════════════════════════════════════════
function addDebugInstances(ids) {
  ids.forEach(id => {
    const mem = MEMORIES[id]; if (!mem) return;
    const inst = {
      instanceId:      `${id}_debug`,
      dex_id:          id,
      name:            mem.name,
      rarity:          mem.rarity,
      personality:     PERSONALITIES[Math.floor(Math.random()*4)],
      is_shiny:        false,
      base_essence:    mem.essence,
      wow_multiplier:  1.05,
      wow_label:       '',
      revealed_essence: Math.max(1, Math.round(mem.essence * 1.05)),
      saved_stage:     mem.stage,
      current_stage:   mem.stage,
      origin_state:    'saved',
      is_nft:          false,
      nft_minted_at_stage: null,
      nft_essence:     null,
      mc_spent:        mem.stage > 1 ? (mem.max_mc - mem.mc_needed) : 0,
      acquired_at:     Date.now(),
    };
    S.seen[id] = true;
    S.owned[id] = true;
    S.instances.push(inst);
    const base = mem.base_memory;
    if (S.bank[base] === undefined) S.bank[base] = 0;
    if (S.progress[base] === undefined) S.progress[base] = 0;
  });
}

function debugOwn() {
  addDebugInstances(['001','002','003']);
  renderGrid();
  if (document.getElementById('screen-detail').classList.contains('active')) renderDetail();
  else showScreen('grid');
}

// Mark a random unseen dex_id as "discovered" (seen but not captured)
function randomDiscovery() {
  const all = Array.from({length:144}, (_,i) => String(i+1).padStart(3,'0'));
  const unseen = all.filter(id => !S.seen[id] && !S.instances.some(inst => inst.dex_id === id));
  if (!unseen.length) { return; }
  const id = unseen[Math.floor(Math.random() * unseen.length)];
  S.seen[id] = true;
  renderGrid();
  if (document.getElementById('screen-detail').classList.contains('active') && S.selectedId === id) renderDetail();
}

function debugSee(n) {
  for (let i = 4; i <= Math.min(3+n, 144); i++) S.seen[String(i).padStart(3,'0')] = true;
  renderGrid();
}

function debugAddMC(amount) {
  const detailScreen = document.getElementById('screen-detail');
  if (!detailScreen?.classList.contains('active')) return;
  const id  = S.selectedId;
  if (!id) return;
  const mem = MEMORIES[id]; if (!mem) return;
  const base = mem.base_memory;
  S.bank[base] = (S.bank[base] || 0) + amount;
  renderDetail();
}

function debugMC(amount) {
  debugAddMC(amount);
}

function resetAll() {
  S.seen = {}; S.owned = {}; S.bondedLog = {}; S.bank = {}; S.progress = {}; S.instances = []; S.mode = 'memories'; S.filter = 'all';
  S.collSort = 'akronite';
  S.instanceCardOpen = false;
  document.getElementById('imx-overlay')?.classList.remove('show');
  document.getElementById('imx-panel')?.classList.remove('show');
  closeImxConceptArt();
  if (_instCardKeydownHandler) {
    document.removeEventListener('keydown', _instCardKeydownHandler);
    _instCardKeydownHandler = null;
  }
  DEV_SHOW_REPEAT_ENCOUNTER_POPUP = false;
  const devRep = document.getElementById('dev-repeat-enc');
  if (devRep) devRep.checked = false;
  _congratsInstance = null;
  _congratsDismissToDetail = false;
  document.getElementById('congrats-overlay').classList.remove('show');
  document.getElementById('enc-popup').classList.remove('show');
  document.getElementById('enc-popup-overlay').classList.remove('show');
  if (_encPopupKeydownHandler) {
    document.removeEventListener('keydown', _encPopupKeydownHandler);
    _encPopupKeydownHandler = null;
  }
  if (_congratsKeydownHandler) {
    document.removeEventListener('keydown', _congratsKeydownHandler);
    _congratsKeydownHandler = null;
  }
  document.querySelectorAll('.ftab').forEach(t => t.classList.toggle('active', t.dataset.f === 'all'));
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === 'memories'));
  document.getElementById('type-icon-row')?.classList.remove('visible');
  document.getElementById('grid-q').value = '';
  const csr = document.getElementById('coll-sort-row');
  if (csr) csr.innerHTML = '';
  const sg = document.getElementById('screen-grid');
  if (sg) {
    clearTimeout(sg._hdrCollapseT);
    sg.classList.remove('grid-header-hiding', 'grid-expanded');
  }
  window._gridTypeScrollSuppressUntil = 0;
  const _gc = document.getElementById('grid-cells');
  if (_gc) _gc.scrollTop = 0;
  renderGrid();
  showScreen('grid');
}
