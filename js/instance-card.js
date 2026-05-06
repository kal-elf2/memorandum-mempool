// INSTANCE CARD — modal logic, mint status, evolution chains, sorting

function buildMintStatusInnerHtml(mem, inst, base, atMax) {
  const isMinted = inst?.is_nft || false;
  const dexId    = mem.id;
  const directMintCount = S.instances.filter(i =>
    i.dex_id === dexId && i.is_nft && i.nft_minted_at_stage === mem.stage
  ).length;
  const onChainAtDex = S.instances.filter(i => i.dex_id === dexId && i.is_nft).length;
  const maxMints = mem.max_mints;
  const canDirectMint = mem.mintable && inst && inst.origin_state === 'saved';

  let supplyParts = [];
  if (canDirectMint && maxMints !== null) {
    supplyParts.push(`${directMintCount} / ${maxMints.toLocaleString()} minted`);
  }
  if (onChainAtDex > 0 && onChainAtDex !== directMintCount) {
    supplyParts.push(`${onChainAtDex} on-chain total`);
  } else if (onChainAtDex > 0 && !canDirectMint) {
    supplyParts.push(`${onChainAtDex} on-chain`);
  }
  const supplyStr = supplyParts.join(' · ');

  if (!inst) {
    return `<span class="mint-badge mb-locked">No instance owned</span>`;
  }
  if (isMinted) {
    const pills = [];
    if (canDirectMint && maxMints !== null) pills.push(`<span class="mint-pill">${directMintCount} / ${maxMints.toLocaleString()} minted</span>`);
    if (onChainAtDex > 0 && onChainAtDex !== directMintCount) pills.push(`<span class="mint-pill">${onChainAtDex} on-chain</span>`);
    else if (onChainAtDex > 0 && !canDirectMint) pills.push(`<span class="mint-pill">${onChainAtDex} on-chain</span>`);
    return `<span class="mint-badge mb-minted">✓ Bonded · Essence: ${inst.nft_essence}</span>${pills.join('')}`;
  }
  if (!mem.mintable) {
    return `<span class="mint-badge mb-locked">Non-mintable</span><details class="mint-lore-dt"><summary aria-label="Why?">i</summary><div class="mint-lore-txt">Only the original captured form can be bonded on-chain. Once evolved, the soul runs too wild to anchor — that vow must be sworn before transformation.</div></details>`;
  }
  if (inst.origin_state === 'evolved') {
    return `<span class="mint-badge mb-locked" title="The bond oath must be sealed at the stage this Memory was first saved. Evolved forms have grown beyond the bonding threshold.">Soul too wild to bond — must seal at captured stage</span>
      ${onChainAtDex > 0 ? `<div class="mint-pills-row"><span class="mint-pill">${onChainAtDex} on-chain</span></div>` : ''}`;
  }
  if (!atMax) {
    const pills = [];
    if (canDirectMint && maxMints !== null) pills.push(`<span class="mint-pill">${directMintCount} / ${maxMints.toLocaleString()} minted</span>`);
    if (onChainAtDex > 0 && onChainAtDex !== directMintCount) pills.push(`<span class="mint-pill">${onChainAtDex} on-chain</span>`);
    else if (onChainAtDex > 0 && !canDirectMint) pills.push(`<span class="mint-pill">${onChainAtDex} on-chain</span>`);
    return `<span class="mint-badge mb-locked">Max level required to mint</span>
      ${pills.length ? `<div class="mint-pills-row">${pills.join('')}</div>` : ''}`;
  }
  const projectedEss = Math.max(1, Math.round(inst.revealed_essence * NFT_STATIC_MULTIPLIER));
  const pills = [];
  if (canDirectMint && maxMints !== null) pills.push(`<span class="mint-pill">${directMintCount} / ${maxMints.toLocaleString()} minted</span>`);
  if (onChainAtDex > 0 && onChainAtDex !== directMintCount) pills.push(`<span class="mint-pill">${onChainAtDex} on-chain</span>`);
  return `<span class="mint-badge mb-mintable">★ Ready to Mint · Bonded Essence: ${projectedEss}</span>
    ${pills.length ? `<div class="mint-pills-row">${pills.join('')}</div>` : ''}`;
}

let _instCardKeydownHandler = null;

function closeImxConceptArt() {
  document.getElementById('imx-concept-overlay')?.classList.remove('show');
  const img = document.getElementById('imx-concept-img');
  if (img) {
    img.removeAttribute('src');
    img.removeAttribute('data-fallback-done');
  }
}

function openImxConceptArt() {
  const id = S.selectedId;
  const inst = currentInstance();
  const img = document.getElementById('imx-concept-img');
  const ov = document.getElementById('imx-concept-overlay');
  if (!img || !ov || !id) return;
  const pStandard = `assets/concept/${id}_concept.png`;
  const pShiny = `assets/concept/${id}s_concept.png`;
  img.removeAttribute('data-fallback-done');
  img.onerror = function() {
    if (this.dataset.fallbackDone) return;
    this.dataset.fallbackDone = '1';
    this.src = (this.src.indexOf('s_concept.png') >= 0) ? pStandard : pShiny;
  };
  img.src = inst?.is_shiny ? pShiny : pStandard;
  ov.classList.add('show');
}

function closeInstanceModal() {
  S.instanceCardOpen = false;
  closeImxConceptArt();
  document.getElementById('imx-overlay')?.classList.remove('show');
  document.getElementById('imx-panel')?.classList.remove('show');
  if (_instCardKeydownHandler) {
    document.removeEventListener('keydown', _instCardKeydownHandler);
    _instCardKeydownHandler = null;
  }
  const onDetail = document.getElementById('screen-detail')?.classList.contains('active');
  syncDevPanelVisibility(onDetail ? 'detail' : 'grid');
}

function refreshInstanceModal(mem, id, inst, bank, progress, maxMC, atMax) {
  if (!inst) { closeInstanceModal(); return; }
  const pType = mem.type[0] || 'WIND';
  const grad = heroGrad(pType);
  const hero = document.getElementById('imx-hero');
  if (hero) hero.style.background = grad;
  const lvlBtn = document.getElementById('ic-btn-lvl');
  if (lvlBtn) lvlBtn.style.background = 'linear-gradient(135deg, #b8dcff, #a2cdff 45%, #92bef0)';

  const hTypes = document.getElementById('imx-hero-types');
  if (hTypes) {
    hTypes.innerHTML = (mem.type || []).map(t => typeBadgeHtml(t)).join('') || '';
  }
  const nftRibbon = document.getElementById('imx-hero-nft-ribbon');
  if (nftRibbon) {
    if (inst.is_nft) {
      nftRibbon.hidden = false;
      nftRibbon.textContent = 'BONDED';
    } else {
      nftRibbon.hidden = true;
    }
  }

  const src = inst.is_shiny ? (SHINY_MAP[id] || IMAGE_MAP[id]) : IMAGE_MAP[id];
  const img = document.getElementById('imx-img');
  if (img) {
    if (src) { img.src = src; img.style.display = ''; }
    else { img.removeAttribute('src'); img.style.display = 'none'; }
  }
  const wm = document.getElementById('imx-wm');
  if (wm) wm.textContent = (mem.name || '?').charAt(0);

  document.getElementById('imx-id').textContent = `#${id}`;
  document.getElementById('imx-name').textContent = mem.name + (inst.is_shiny ? ' ★' : '');

  const capR = mem.rarity.charAt(0).toUpperCase() + mem.rarity.slice(1);
  const persCol = PERSONALITY_COLORS[inst.personality] || '#888';
  const persU = (inst.personality || '').toUpperCase();
  let tags = `<span class="imx-pill" style="background:#ECECEF;color:#5A5A62;border-color:#D0D0D8">${capR}</span>`;
  tags += `<span class="imx-pill" style="background:${persCol};color:#fff;border-color:${persCol}">${persU}</span>`;
  if (inst.is_shiny) tags += `<span class="shiny-badge" style="font-size:8px;padding:3px 8px">★ Akronite</span>`;
  if (inst.is_nft) {
    tags += `<span class="imx-pill" style="background:linear-gradient(135deg,rgba(56,210,196,0.35),rgba(32,160,144,0.2));color:#106A5A;border-color:rgba(32,160,144,0.55)">⬡ BONDED</span>`;
  }
  document.getElementById('imx-tags').innerHTML = tags;

  const displayEss = inst.is_nft ? inst.nft_essence : inst.revealed_essence;
  document.getElementById('imx-ess').textContent = displayEss;
  document.getElementById('imx-mc-bank').textContent = bank;

  const stageFloor = maxMC - mem.mc_needed;
  const stageProg  = Math.max(0, progress - stageFloor);
  const pct = Math.min(100, (stageProg / mem.mc_needed) * 100);
  document.getElementById('imx-mc-frac').textContent =
    `${progress} / ${maxMC} ◆ · stage ${inst.current_stage ?? mem.stage}`;
  const fill = document.getElementById('imx-fill');
  fill.style.width = pct + '%';
  fill.classList.toggle('maxed', atMax);
  const cap = document.getElementById('imx-cap');
  if (atMax) {
    cap.textContent = mem.evolves_to ? 'Max ◆ — ready to evolve!' : 'Max ◆ reached — fully evolved!';
  } else if (bank < 1) {
    cap.textContent = 'Collect more ◆ to level up';
  } else {
    cap.textContent = `${maxMC - progress} ◆ until max for this form`;
  }

  const base = mem.base_memory;
  document.getElementById('imx-mint').innerHTML = buildMintStatusInnerHtml(mem, inst, base, atMax);

  const nftArtBtn = document.getElementById('imx-nftart-btn');
  if (nftArtBtn) {
    nftArtBtn.style.display = inst.is_nft ? 'flex' : 'none';
  }

  const tearBtn = document.getElementById('imx-tear-btn');
  if (tearBtn) {
    tearBtn.disabled = atMax;
  }
}

function evoChainFrom(baseId) {
  const chain = []; let cur = baseId;
  while (cur && chain.length < 10) {
    chain.push(cur);
    const m = MEMORIES[cur];
    if (!m || !m.evolves_to) break;
    cur = m.evolves_to;
  }
  return chain;
}

/** True if this dex is reached only by evolving another form (wild Akronite disallowed). */
function isEvolutionOnlyForm(dexId) {
  if (!dexId || !MEMORIES) return false;
  return Object.values(MEMORIES).some(m => m && m.evolves_to === dexId);
}

// ══════════════════════════════════════════════════════════════
//  INSTANCE HELPERS
// ══════════════════════════════════════════════════════════════
function instancesFor(id) {
  return S.instances.filter(i => i.dex_id === id);
}

function currentInstance() {
  const insts = instancesFor(S.selectedId);
  return insts[Math.min(S.selectedInstanceIdx, insts.length - 1)] || null;
}

function normalizeFamilyMcToInstances(base, insts) {
  const p = S.progress[base] || 0;
  if (p <= 0 || !insts.length) return;
  if (!insts.every(i => i.mc_spent === undefined)) return;
  insts.forEach((inst, idx) => { inst.mc_spent = idx === 0 ? p : 0; });
  S.progress[base] = 0;
}

function instanceMcSpent(inst, base) {
  if (!inst) return 0;
  if (inst.mc_spent !== undefined) return inst.mc_spent;
  return S.progress[base] || 0;
}

function sortInstances(insts, mem) {
  const base = mem.base_memory;
  const arr = [...insts];
  const cmpAkro = (a, b) => (!!b.is_shiny ? 1 : 0) - (!!a.is_shiny ? 1 : 0);
  const cmpLvl = (a, b) => instanceMcSpent(b, base) - instanceMcSpent(a, base);
  const cmpEss = (a, b) => ((b.is_nft ? b.nft_essence : b.revealed_essence) || 0) - ((a.is_nft ? a.nft_essence : a.revealed_essence) || 0);
  arr.sort((a, b) => {
    let x = 0;
    if (S.collSort === 'akronite') {
      x = cmpAkro(a, b); if (x) return x;
      x = cmpLvl(a, b); if (x) return x;
      return cmpEss(a, b);
    }
    if (S.collSort === 'level') {
      x = cmpLvl(a, b); if (x) return x;
      x = cmpAkro(a, b); if (x) return x;
      return cmpEss(a, b);
    }
    if (S.collSort === 'essence') {
      x = cmpEss(a, b); if (x) return x;
      x = cmpAkro(a, b); if (x) return x;
      return cmpLvl(a, b);
    }
    if (S.collSort === 'recent') {
      return (b.acquired_at || 0) - (a.acquired_at || 0);
    }
    if (S.collSort === 'nft') {
      x = (!!b.is_nft ? 1 : 0) - (!!a.is_nft ? 1 : 0); if (x) return x;
      x = cmpAkro(a, b); if (x) return x;
      x = cmpLvl(a, b); if (x) return x;
      return cmpEss(a, b);
    }
    return 0;
  });
  return arr;
}

/** Index in raw `insts` for the instance that sorts first under current collSort. */
function selectedIdxForSortedTop(insts, mem) {
  if (!mem || !insts.length) return 0;
  const sorted = sortInstances(insts, mem);
  const top = sorted[0];
  const i = insts.findIndex(x => x.instanceId === top.instanceId);
  return i >= 0 ? i : 0;
}

function setCollSort(k) {
  S.collSort = k;
  const row = document.getElementById('coll-sort-row');
  if (row) {
    row.querySelectorAll('.coll-sort').forEach(b => b.classList.toggle('active', b.dataset.sort === k));
  }
  const mem = MEMORIES[S.selectedId];
  if (mem) {
    const base = mem.base_memory;
    let insts = instancesFor(S.selectedId);
    normalizeFamilyMcToInstances(base, insts);
    insts = instancesFor(S.selectedId);
    S.selectedInstanceIdx = selectedIdxForSortedTop(insts, mem);
  }
  renderDetail();
}

function syncDevPanelVisibility(screenName) {
  if (typeof _DEV_MODE !== 'undefined' && !_DEV_MODE) return;
  const icOpen = S.instanceCardOpen;
  const det = screenName === 'detail';
  const isGrid = screenName === 'grid';
  const isTov = screenName === 'type-overview';
  const gt = document.getElementById('grid-tuner');
  const ct = document.getElementById('card-tuner');
  const dtt = document.getElementById('detail-tuner');
  const it = document.getElementById('instance-card-tuner');
  const g3d = document.getElementById('grid3d-tuner');
  const mb = document.getElementById('dev-memcore-bar');
  const tovT = document.getElementById('tov-tuner');
  if (icOpen) {
    if (gt) gt.style.display = 'none';
    if (ct) ct.style.display = 'none';
    if (dtt) dtt.style.display = 'none';
    if (it) it.style.display = 'block';
    if (g3d) g3d.style.display = 'block';
    if (tovT) tovT.style.display = 'none';
  } else {
    if (gt) gt.style.display = isGrid ? '' : 'none';
    if (ct) ct.style.display = isGrid ? '' : 'none';
    if (dtt) dtt.style.display = det ? 'block' : 'none';
    if (it) it.style.display = 'none';
    if (g3d) g3d.style.display = 'none';
    if (tovT) tovT.style.display = isTov ? 'block' : 'none';
  }
  if (mb) mb.style.display = det ? 'flex' : 'none';
}

function isAtMaxLevel(base) {
  const prog = S.progress[base] || 0;
  const famMem = Object.values(MEMORIES).find(m => m.base_memory === base);
  if (!famMem) return false;
  return prog >= famMem.max_mc;
}
