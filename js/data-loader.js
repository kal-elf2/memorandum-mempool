// DATA LOADER — fetches mempool.json and memory_spawn_ranges.json, initializes game

// ══════════════════════════════════════════════════════════════
//  DATA LOADING
// ══════════════════════════════════════════════════════════════
function mapMemory(id, m) {
  const evo    = (m.evolution && m.evolution.length > 0) ? m.evolution[0] : null;
  return {
    id,
    name:        m.name,
    type:        Array.isArray(m.type) ? m.type : [m.type].filter(Boolean),
    description: m.description,
    stage:       m.stage,
    evolves_to:  evo ? evo.to     : null,
    spirit_req:  evo ? evo.spirit : null,
    base_memory: m.base_memory || id,
    mc_needed:   m.memcore_needed_from_current_stage || 30,
    mc_for_evo:  m.memcore_required_for_next_evo     || null,
    max_mc:      m.max_memcore || 30,
    yield:       m.sanctuary_yield || 0,
    rarity:      (m.rarity || 'common').toLowerCase(),
    mintable:    !!m.mintable,
    max_mints:   m.max_supply_mintable || null,
    supply:      m.source_supply       || null,
    essence:     m.memorandum_essence_points || 0,
    height:      m.height  || 0,
    weight:      m.weight  || 0,
    source:      m.source  || 'save',
    image:       IMAGE_MAP[id] || null,
  };
}

async function loadData() {
  try {
    const [mpRes, spRes] = await Promise.all([
      fetch('mempool.json'),
      fetch('memory_spawn_ranges.json'),
    ]);
    if (!mpRes.ok)  throw new Error(`mempool.json HTTP ${mpRes.status}`);
    if (!spRes.ok)  throw new Error(`spawn_ranges HTTP ${spRes.status}`);
    const mpData = await mpRes.json();
    const spData = await spRes.json();

    Object.entries(mpData).forEach(([id, m]) => {
      const types = Array.isArray(m.type) ? m.type : [m.type].filter(Boolean);
      CATALOG[id] = { name:m.name, primary:types[0]||null, secondary:types[1]||null, rarity:(m.rarity||'common').toLowerCase(), stage:m.stage };
      MEMORIES[id] = mapMemory(id, m);
    });
    SPAWN_RANGES = spData;

    document.getElementById('loading-overlay').classList.add('hidden');
    setTimeout(() => { document.getElementById('loading-overlay').style.display='none'; }, 450);

    buildEncounterButtons();
    renderGrid();
    syncDevPanelVisibility('grid');
    startLogoAnim();
  } catch(e) {
    document.getElementById('error-msg').textContent = 'Error: ' + e.message + '\n\nRun via: npx serve .';
    document.querySelector('.spinner').style.display = 'none';
  }
}
