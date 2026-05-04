// GRID TUNER — main mempool page layout tuner panel

// ══════════════════════════════════════════════════════════════
//  LAYOUT TUNER  (dev-only — remove before shipping)
// ══════════════════════════════════════════════════════════════
const GT = {
  /* Mirrors :root — _initGridTuner() → _applyGT() on load = refresh match */
  hdrMt:      22,
  logoSz:     40,
  pillsMt:    18,
  pillsGap:   6,
  searchMt:   16,
  filtersMt:  7,
  cellsMt:    -2,
  typeSectPt: 4,
  typeFirstMt: 0,
  gcPi:       20,
  gcGap:      8,
  trTop:      24,
  trSize:     472,
  trRight:    -100,
  trImgX:     32,
  trImgY:     0,
  trFadeTopA: 100,
  trFadeStart: 30,
  trFadeEnd:  38,
  trFadeOut:  47,
  modeTabOp:  100,
  hdrPi:      24,
  eyebrowSz:  11,
  titleSz:    26,
  playerSz:   13,
  pillSz:     11,
  typeIconSz: 29,
  typeBtnGap: 4,
  typeRowPi:  16,
  typeRowPt:  5,
  typeRowPb:  4,
  bgLogoSz:   324,
  bgLogoTop:  14,
  bgLogoX:    0,
  bgLogoOp:   18,
  fcGap:      0,
};

const GT_SECTIONS = [
  { label: 'Header Text', items: [
    { key:'hdrMt',   label:'Header Y',    unit:'px', step:2, min:-20, max:120, cssVar:'--hdr-mt',     sf:'px' },
    { key:'logoSz',  label:'Logo size',   unit:'px', step:1, min:12,  max:40,  cssVar:'--logo-sz',    sf:'px' },
  ]},
  { label: 'Pills', items: [
    { key:'pillsMt',  label:'Pills Y',     unit:'px', step:2, min:-10, max:80,  cssVar:'--pills-mt',  sf:'px' },
    { key:'pillsGap', label:'Pill gap',    unit:'px', step:1, min:2,   max:20,  cssVar:'--pills-gap', sf:'px' },
  ]},
  { label: 'Search Bar', items: [
    { key:'searchMt', label:'Search Y',   unit:'px', step:2, min:-10, max:80,  cssVar:'--search-mt',  sf:'px' },
  ]},
  { label: 'Filter Tabs', items: [
    { key:'filtersMt', label:'Filters Y', unit:'px', step:2, min:-10, max:80,  cssVar:'--filters-mt', sf:'px' },
    { key:'fcGap',     label:'Tabs→cards', unit:'px', step:2, min:-40, max:80,  cssVar:'--fc-gap',     sf:'px' },
    { key:'modeTabOp', label:'Mode α',    unit:'%', step:5, min:0,   max:100, cssVar:'--mode-tab-op', sf:'', mode:'opPct' },
  ]},
  { label: 'Card Grid', items: [
    { key:'cellsMt',    label:'Cards Y',    unit:'px', step:2, min:-10, max:80,  cssVar:'--cells-mt',    sf:'px' },
    { key:'typeSectPt', label:'Type sec Y', unit:'px', step:2, min:0,   max:40,  cssVar:'--type-sect-pt',sf:'px' },
    { key:'typeFirstMt',label:'Type lead',  unit:'px', step:1, min:-12, max:32,  cssVar:'--type-first-mt',sf:'px' },
    { key:'gcPi',       label:'Side pad',   unit:'px', step:2, min:8,   max:40,  cssVar:'--gc-pi',       sf:'px' },
    { key:'gcGap',      label:'Card gap',   unit:'px', step:1, min:4,   max:24,  cssVar:'--gc-gap',      sf:'px' },
  ]},
  { label: 'Trainer', items: [
    { key:'trTop',   label:'Top',    unit:'px', step:2, min:-200, max:200, cssVar:'--tr-top',   sf:'px' },
    { key:'trSize',  label:'Width',  unit:'px', step:4, min:60,   max:600, cssVar:'--tr-size',  sf:'px' },
    { key:'trRight', label:'Right',  unit:'px', step:2, min:-100, max:120, cssVar:'--tr-right', sf:'px' },
    { key:'trImgX',  label:'Img X',  unit:'px', step:2, min:-200, max:200, cssVar:'--tr-img-x', sf:'px' },
    { key:'trImgY',  label:'Img Y',  unit:'px', step:2, min:-400, max:200, cssVar:'--tr-img-y', sf:'px' },
  ]},
  { label: 'Trainer Fade', items: [
    { key:'trFadeTopA',  label:'Top α',     unit:'%', step:5,  min:0,  max:100, cssVar:'--tr-fade-top-a', sf:'', mode:'opPct' },
    { key:'trFadeStart', label:'Opaque at', unit:'%', step:2,  min:0,  max:100, cssVar:'--tr-fade-start', sf:'%' },
    { key:'trFadeEnd',   label:'Fade at',   unit:'%', step:2,  min:0,  max:100, cssVar:'--tr-fade-end',   sf:'%' },
    { key:'trFadeOut',   label:'Gone at',   unit:'%', step:2,  min:0,  max:100, cssVar:'--tr-fade-out',   sf:'%' },
  ]},
  { label: 'BG Logo', items: [
    { key:'bgLogoSz',    label:'Size',    unit:'px', step:4, min:80,  max:560, cssVar:'--bg-logo-sz',    sf:'px' },
    { key:'bgLogoTop',   label:'Top',     unit:'px', step:2, min:-220,max:220, cssVar:'--bg-logo-top',   sf:'px' },
    { key:'bgLogoX',     label:'X nudge', unit:'px', step:2, min:-120,max:120, cssVar:'--bg-logo-x',     sf:'px' },
    { key:'bgLogoOp',    label:'Opacity', unit:'%', step:1, min:0,   max:45,  cssVar:'--bg-logo-op',     sf:'', mode:'opPct' },
  ]},
  { label: 'Text & Spacing', items: [
    { key:'hdrPi',    label:'Screen pad', unit:'px', step:1, min:6,  max:40, cssVar:'--hdr-pi',    sf:'px' },
    { key:'eyebrowSz',label:'Eyebrow',    unit:'px', step:1, min:7,  max:18, cssVar:'--eyebrow-sz',sf:'px' },
    { key:'titleSz',  label:'Title',      unit:'px', step:1, min:14, max:48, cssVar:'--title-sz',  sf:'px' },
    { key:'playerSz', label:'Player name',unit:'px', step:1, min:9,  max:24, cssVar:'--player-sz', sf:'px' },
    { key:'pillSz',   label:'Pill text',  unit:'px', step:1, min:8,  max:16, cssVar:'--pill-sz',   sf:'px' },
  ]},
  { label: 'Type Buttons', items: [
    { key:'typeIconSz', label:'Icon size', unit:'px', step:1, min:14, max:40, cssVar:'--type-icon-sz', sf:'px' },
    { key:'typeBtnGap', label:'Spacing',   unit:'px', step:1, min:0,  max:20, cssVar:'--type-btn-gap', sf:'px' },
    { key:'typeRowPi',  label:'Side pad',  unit:'px', step:1, min:4,  max:36, cssVar:'--type-row-pi',  sf:'px' },
    { key:'typeRowPt',  label:'Row pad T', unit:'px', step:1, min:0,  max:20, cssVar:'--type-row-pt',  sf:'px' },
    { key:'typeRowPb',  label:'Row pad B', unit:'px', step:1, min:0,  max:20, cssVar:'--type-row-pb',  sf:'px' },
  ]},
];

function _gtFind(key) {
  for (const s of GT_SECTIONS) {
    const r = s.items.find(x => x.key === key);
    if (r) return r;
  }
  return null;
}
function _applyGT() {
  const root = document.documentElement;
  GT_SECTIONS.forEach(s => s.items.forEach(r => {
    const v = GT[r.key];
    if (r.mode === 'opPct') {
      root.style.setProperty(r.cssVar, String(v / 100));
    } else {
      root.style.setProperty(r.cssVar, v + r.sf);
    }
    const el = document.getElementById('gt-' + r.key);
    if (el) el.value = GT[r.key];
  }));
  const ro = document.getElementById('gt-readout');
  if (ro) ro.textContent = [
    `hdr:${GT.hdrMt}px logo:${GT.logoSz}px pad:${GT.hdrPi}px`,
    `pills:${GT.pillsMt}px gap:${GT.pillsGap}px pill:${GT.pillSz}px`,
    `search:${GT.searchMt}px filters:${GT.filtersMt}px fc:${GT.fcGap}px`,
    `cards:${GT.cellsMt}px typePt:${GT.typeSectPt}px typeFirst:${GT.typeFirstMt}px`,
    `tr:${GT.trTop}px/${GT.trSize}px r:${GT.trRight}px img:${GT.trImgX},${GT.trImgY} gcPi:${GT.gcPi}px gap:${GT.gcGap}px`,
    `fade:topA${GT.trFadeTopA}% opq${GT.trFadeStart}% fade${GT.trFadeEnd}% gone${GT.trFadeOut}%`,
    `modeOp:${GT.modeTabOp}%`,
    `eye:${GT.eyebrowSz}px title:${GT.titleSz}px player:${GT.playerSz}px`,
    `typBtn:${GT.typeIconSz}px gap:${GT.typeBtnGap}px pi:${GT.typeRowPi}px pt:${GT.typeRowPt} pb:${GT.typeRowPb}`,
    `bg:${GT.bgLogoSz}px y:${GT.bgLogoTop} x:${GT.bgLogoX} ${GT.bgLogoOp}%`,
    `logoAnim: exp${LA.expandScale}× ${LA.expandDur}ms con${LA.contractDur}ms ccw${LA.ccwDeg}°/${LA.ccwDur}ms spin${LA.spinDur}ms os${LA.overshootDeg}°/${LA.overshootDur}ms settle${LA.settleDur}ms pause${LA.pauseDur}ms`,
  ].join('  ·  ');
}
function _gtAdj(key, delta) {
  const r = _gtFind(key); if (!r) return;
  let v = GT[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  GT[key] = v; _applyGT();
}
function _gtSet(key, val) {
  const r = _gtFind(key); if (!r) return;
  let v = parseFloat(val); if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  GT[key] = v; _applyGT();
}
function copyGridTuner() {
  const ro = document.getElementById('gt-readout');
  if (ro) navigator.clipboard?.writeText(ro.textContent).catch(()=>{});
}
function _initGridTuner() {
  const wrap = document.getElementById('gt-rows'); if (!wrap) return;
  wrap.innerHTML = '';
  const ROW = 'display:flex;align-items:center;gap:3px;margin-bottom:2px';
  const BTN = 'padding:1px 5px;border-radius:4px;border:none;background:rgba(255,255,255,0.12);color:white;cursor:pointer;font-size:11px;line-height:1.4';
  const INP = 'width:40px;text-align:center;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.18);border-radius:4px;color:white;font-size:10px;padding:1px 3px;font-family:monospace';
  GT_SECTIONS.forEach(sec => {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,0.38);letter-spacing:0.8px;margin-top:8px;margin-bottom:3px';
    hdr.textContent = sec.label;
    wrap.appendChild(hdr);
    sec.items.forEach(r => {
      const d = document.createElement('div');
      d.style.cssText = ROW;
      d.innerHTML =
        `<span style="width:76px;font-size:9px;color:rgba(255,255,255,0.45)">${r.label}</span>` +
        `<button onclick="_gtAdj('${r.key}',-${r.step})" style="${BTN}">−</button>` +
        `<input id="gt-${r.key}" type="number" value="${GT[r.key]}" step="${r.step}" onchange="_gtSet('${r.key}',this.value)" style="${INP}">` +
        `<button onclick="_gtAdj('${r.key}',${r.step})" style="${BTN}">+</button>` +
        `<span style="font-size:9px;color:rgba(255,255,255,0.28);width:14px">${r.unit}</span>`;
      wrap.appendChild(d);
    });
  });
  // Logo Anim knobs (visible on grid screen where logo animates)
  const laHdr = document.createElement('div');
  laHdr.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,0.38);letter-spacing:0.8px;margin-top:8px;margin-bottom:3px';
  laHdr.textContent = 'Logo Anim';
  wrap.appendChild(laHdr);
  LA_KNOBS.forEach(r => {
    const d = document.createElement('div');
    d.style.cssText = ROW;
    d.innerHTML =
      `<span style="width:76px;font-size:9px;color:rgba(255,255,255,0.45)">${r.label}</span>` +
      `<button onclick="_laAdj('${r.key}',-${r.step})" style="${BTN}">−</button>` +
      `<input id="gt-la-${r.key}" type="number" value="${LA[r.key]}" step="${r.step}" onchange="_laSet('${r.key}',this.value)" style="${INP}">` +
      `<button onclick="_laAdj('${r.key}',${r.step})" style="${BTN}">+</button>` +
      `<span style="font-size:9px;color:rgba(255,255,255,0.28);width:14px">${r.unit}</span>`;
    wrap.appendChild(d);
  });
  _applyGT();
}

// ── CARD TUNER (grid memory tiles)
const CT = {
  dexX: 9, dexY: 8,
  nameSz: 9, nameY: -1,
  imgSz: 84, imgX: 0, imgY: -6,
  cntT: 7, cntR: 9,
  discSz: 82, seenX: 0, seenY: -13,
  seenSilInv: 46, seenSilA: 40,
  seenPlaceholderY: -19,
  unkBw: 3, unkBa: 30,
  rowPct: 96,
};
const CT_SECTIONS = [
  { label: 'Dex ID', items: [
    { key:'dexX', label:'X', unit:'px', step:1, min:0, max:36, cssVar:'--gc-dex-x', sf:'px' },
    { key:'dexY', label:'Y', unit:'px', step:1, min:0, max:36, cssVar:'--gc-dex-y', sf:'px' },
  ]},
  { label: 'Name', items: [
    { key:'nameSz', label:'Size', unit:'px', step:1, min:8, max:16, cssVar:'--gc-name-sz', sf:'px' },
    { key:'nameY',  label:'Y gap',unit:'px', step:1, min:-32, max:24, cssVar:'--gc-name-mt', sf:'px' },
  ]},
  { label: 'Saved sprite', items: [
    { key:'imgSz',  label:'Size', unit:'px', step:1, min:40, max:100, cssVar:'--gc-img-sz',  sf:'px' },
    { key:'imgX',   label:'X',    unit:'px', step:1, min:-40, max:40, cssVar:'--gc-img-x',   sf:'px' },
    { key:'imgY',   label:'Y',    unit:'px', step:1, min:-40, max:40, cssVar:'--gc-img-y',   sf:'px' },
  ]},
  { label: 'Qty badge', items: [
    { key:'cntT', label:'Top',  unit:'px', step:1, min:-8, max:36, cssVar:'--gc-cnt-t', sf:'px' },
    { key:'cntR', label:'Right',unit:'px', step:1, min:-8, max:36, cssVar:'--gc-cnt-r', sf:'px' },
  ]},
  { label: 'Seen sprite', items: [
    { key:'discSz', label:'Size', unit:'px', step:1, min:40, max:100, cssVar:'--gc-disc-sz', sf:'px' },
    { key:'seenX',  label:'X',    unit:'px', step:1, min:-40, max:40, cssVar:'--gc-seen-x',  sf:'px' },
    { key:'seenY',  label:'Y',    unit:'px', step:1, min:-40, max:40, cssVar:'--gc-seen-y',  sf:'px' },
    { key:'seenSilInv', label:'Gray', unit:'%', step:2, min:0, max:100, cssVar:'--gc-seen-sil-inv', sf:'%' },
    { key:'seenSilA',   label:'α %',  unit:'%', step:2, min:8, max:100, cssVar:'--gc-seen-sil-a', sf:'', mode:'alphaPct' },
  ]},
  { label: 'Seen ???', items: [
    { key:'seenPlaceholderY', label:'Y gap', unit:'px', step:1, min:-48, max:12, cssVar:'--gc-seen-name-mt', sf:'px' },
  ]},
  { label: 'Tile row', items: [
    { key:'rowPct', label:'H vs W', unit:'%', step:2, min:55, max:115, cssVar:'__skip', sf:'%' },
  ]},
  { label: 'Empty card', items: [
    { key:'unkBw', label:'Stroke', unit:'px', step:1, min:1, max:8, cssVar:'--gc-unk-bw', sf:'px' },
    { key:'unkBa', label:'α %',    unit:'%',  step:2, min:8, max:90, cssVar:'--gc-unk-br-a', sf:'', mode:'alphaPct' },
  ]},
];
function _ctFind(key) {
  for (const s of CT_SECTIONS) {
    const r = s.items.find(x => x.key === key);
    if (r) return r;
  }
  return null;
}
function _applyCT() {
  const root = document.documentElement;
  CT_SECTIONS.forEach(s => s.items.forEach(r => {
    if (r.cssVar === '__skip') {
      const elSk = document.getElementById('ct-' + r.key);
      if (elSk) elSk.value = CT[r.key];
      return;
    }
    const v = CT[r.key];
    if (r.mode === 'alphaPct') {
      root.style.setProperty(r.cssVar, String(v / 100));
    } else {
      root.style.setProperty(r.cssVar, v + r.sf);
    }
    const el = document.getElementById('ct-' + r.key);
    if (el) el.value = CT[r.key];
  }));
  const ro = document.getElementById('ct-readout');
  if (ro) ro.textContent = [
    `dex ${CT.dexX}/${CT.dexY}`,
    `name ${CT.nameSz}px Y${CT.nameY}`,
    `img ${CT.imgSz} @${CT.imgX},${CT.imgY}`,
    `cnt ${CT.cntT}/${CT.cntR}`,
    `seen ${CT.discSz} @${CT.seenX},${CT.seenY} sil ${CT.seenSilInv}/${CT.seenSilA}%`,
    `??? Y${CT.seenPlaceholderY}`,
    `row ${CT.rowPct}%`,
    `empty ${CT.unkBw}px α${CT.unkBa}%`,
  ].join(' · ');
  syncCardRows();
}
function _ctAdj(key, delta) {
  const r = _ctFind(key); if (!r) return;
  let v = CT[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  CT[key] = v; _applyCT();
}
function _ctSet(key, val) {
  const r = _ctFind(key); if (!r) return;
  let v = parseFloat(val); if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  CT[key] = v; _applyCT();
}
function copyCardTuner() {
  const ro = document.getElementById('ct-readout');
  if (ro) navigator.clipboard?.writeText(ro.textContent).catch(()=>{});
}
function _initCardTuner() {
  const wrap = document.getElementById('ct-rows'); if (!wrap) return;
  wrap.innerHTML = '';
  const ROW = 'display:flex;align-items:center;gap:3px;margin-bottom:2px';
  const BTN = 'padding:1px 5px;border-radius:4px;border:none;background:rgba(255,255,255,0.12);color:white;cursor:pointer;font-size:11px;line-height:1.4';
  const INP = 'width:40px;text-align:center;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.18);border-radius:4px;color:white;font-size:10px;padding:1px 3px;font-family:monospace';
  CT_SECTIONS.forEach(sec => {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,0.38);letter-spacing:0.8px;margin-top:8px;margin-bottom:3px';
    hdr.textContent = sec.label;
    wrap.appendChild(hdr);
    sec.items.forEach(r => {
      const d = document.createElement('div');
      d.style.cssText = ROW;
      d.innerHTML =
        `<span style="width:64px;font-size:9px;color:rgba(255,255,255,0.45)">${r.label}</span>` +
        `<button onclick="_ctAdj('${r.key}',-${r.step})" style="${BTN}">−</button>` +
        `<input id="ct-${r.key}" type="number" value="${CT[r.key]}" onchange="_ctSet('${r.key}',this.value)" style="${INP}">` +
        `<button onclick="_ctAdj('${r.key}',${r.step})" style="${BTN}">+</button>` +
        `<span style="font-size:9px;color:rgba(255,255,255,0.28);width:14px">${r.unit}</span>`;
      wrap.appendChild(d);
    });
  });
  _applyCT();
}
