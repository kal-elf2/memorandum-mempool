// GAME ACTIONS — level up, evolve, mint, debug helpers, reset

// ══════════════════════════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════════════════════════

function openNftArt() {
  // Placeholder — will eventually navigate to on-chain NFT art viewer
}

let _imxConfirmCb = null;
function showImxConfirm(msg, onConfirm, _pType) {
  document.getElementById('imx-confirm-msg').innerHTML = msg;
  _imxConfirmCb = onConfirm;
  const yesBtn = document.getElementById('imx-confirm-yes');
  yesBtn.style.background = 'linear-gradient(135deg, #b8dcff, #a2cdff 45%, #92bef0)';
  yesBtn.style.border = '1px solid rgba(140,180,220,0.45)';
  yesBtn.onclick = () => {
    const cb = _imxConfirmCb;
    _imxConfirmCb = null;
    document.getElementById('imx-confirm-overlay').classList.remove('show');
    if (cb) cb();
  };
  document.getElementById('imx-confirm-overlay').classList.add('show');
}
function closeImxConfirm() {
  document.getElementById('imx-confirm-overlay').classList.remove('show');
  _imxConfirmCb = null;
}

function doTearMaxLevel() {
  const mem = MEMORIES[S.selectedId]; if (!mem) return;
  const base = mem.base_memory;
  const inst = currentInstance(); if (!inst) return;
  const maxMC = mem.max_mc;
  const spent = instanceMcSpent(inst, base);
  if (spent >= maxMC) return;
  const pType = mem.type[0] || 'WIND';
  showImxConfirm(
    `Use <strong>Tear of the Goddess</strong> on <strong>${mem.name}</strong> to bring it to max level?`,
    () => { inst.mc_spent = maxMC; renderDetail(); },
    pType
  );
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
  if (spent < mem.max_mc) return;
  const target = MEMORIES[mem.evolves_to]; if (!target) return;

  if (!inst.is_nft) {
    const pType = mem.type[0] || 'WIND';
    showImxConfirm(
      `Evolve <strong>${mem.name}</strong> into <strong>${target.name}</strong>?<br><span style="font-size:11px;color:#888;font-weight:400">This cannot be undone.</span>`,
      () => _launchEvolveAnimation(id, mem, inst, target),
      pType
    );
  } else {
    _launchEvolveAnimation(id, mem, inst, target);
  }
}

function _launchEvolveAnimation(id, mem, inst, target) {
  const primaryType   = mem.type[0] || 'WIND';
  const secondaryType = mem.type[1] || null;
  const spiritReq     = mem.spirit_req || null;
  const spiritAsset   = spiritReq ? (SPIRIT_MAP[spiritReq] || null) : null;

  // Close instance modal so the animation is unobstructed
  closeInstanceModal();

  playEvolutionAnimation({
    currentMemory: mem,
    nextMemory: target,
    instance: inst,
    spiritRequired: spiritReq,
    spiritAsset: spiritAsset,
    primaryType: primaryType,
    secondaryType: secondaryType,
    onMidpointApplyEvolution: () => _executeEvolve(id, mem, inst),
    onComplete: () => {
      if (S._evoCongratsShown) {
        S._evoCongratsShown = false;
        showCongrats(inst, { dismissToDetail: true });
      }
    }
  });
}

function _executeEvolve(id, mem, inst) {
  const base  = mem.base_memory;
  const targetId = mem.evolves_to;
  const target   = MEMORIES[targetId]; if (!target) return;

  const newlyOwnsTarget = !S.instances.some(i => i.dex_id === targetId);
  const carryPersonality = inst.personality;
  const carryShiny       = inst.is_shiny;

  inst.dex_id        = targetId;
  inst.name          = target.name;
  inst.rarity        = target.rarity;
  inst.current_stage = target.stage;
  inst.origin_state  = 'evolved';
  inst.personality   = carryPersonality;
  inst.is_shiny      = carryShiny;

  inst.revealed_essence = Math.max(1, Math.round(inst.revealed_essence * 1.25));
  if (inst.is_nft) {
    inst.nft_essence = Math.max(1, Math.round(inst.revealed_essence * NFT_STATIC_MULTIPLIER));
  }

  S.progress[base] = 0;
  inst.mc_spent = mem.max_mc;

  S.owned[id]       = true;
  S.owned[targetId] = true;
  S.seen[targetId]  = true;

  if (inst.is_nft) {
    S.bondedLog[id]       = true;
    S.bondedLog[targetId] = true;
  }
  S.selectedId      = targetId;
  S.selectedInstanceIdx = 0;

  renderGrid();
  renderDetail();

  // Flag for onComplete callback — congrats will be shown after animation closes
  S._evoCongratsShown = newlyOwnsTarget;
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
