// TYPE OVERVIEW — collection progress screen and background color changer

// ── TYPE OVERVIEW SCREEN ──
function showTypeOverview() {
  const rows = document.getElementById('tov-rows');
  if (!rows) return;
  let html = '';
  TYPE_ORDER.forEach(type => {
    const typeIds = Object.entries(CATALOG)
      .filter(([, cat]) => cat.primary === type)
      .map(([id]) => id);
    const total = typeIds.length;
    const saved = typeIds.filter(id => S.owned[id]).length;
    const pct = total > 0 ? Math.round((saved / total) * 100) : 0;
    const icon = TYPE_ICON_MAP[type];
    const cg = CONGRATS_GRADIENTS[type] || ['#888','#aaa'];
    const pColor = typePrimary(type);
    html += `<div class="tov-row">
      <img class="tov-icon" src="assets/icons/${icon}.png" alt="${type}" onerror="this.style.display='none'">
      <div class="tov-info">
        <div style="display:flex;align-items:baseline;gap:6px">
          <span class="tov-type-name" style="color:${pColor}">${type}</span>
          <span class="tov-count">${saved} / ${total} Saved</span>
        </div>
        <div class="tov-bar-wrap">
          <div class="tov-bar" style="width:${pct}%;background:linear-gradient(to right,${cg[0]},${cg[1]})"></div>
        </div>
      </div>
    </div>`;
  });
  rows.innerHTML = html;
  buildBgSwatches();
  showScreen('type-overview');
}

// ── BG COLOR SWATCHES ──
const BG_SWATCHES = ['#A2CDFF','#323339','#a4dcb7','#7882b5','#c77978','#b2aeff'];
let _gridBgColor = '#A2CDFF';

function applyGridBg(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  _gridBgColor = hex;
  const bg = `linear-gradient(180deg, ${hex} 0%, ${hex} 65%, ${hex}ee 100%)`;
  document.documentElement.style.setProperty('--grid-bg', bg);
  document.querySelectorAll('.bg-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === hex.toLowerCase());
  });
  _applyTOV();
}

function buildBgSwatches() {
  const row = document.getElementById('bg-swatch-row');
  if (!row) return;
  let html = '';
  BG_SWATCHES.forEach(c => {
    html += `<button class="bg-swatch${c === _gridBgColor ? ' active' : ''}"
      style="background:${c}" data-color="${c.toLowerCase()}"
      onclick="applyGridBg('${c}')"></button>`;
  });
  html += `<button class="bg-swatch bg-swatch-custom" data-color="custom" title="Custom color">
    ?<input type="color" class="bg-swatch-custom-input" value="${_gridBgColor}"
            oninput="applyGridBg(this.value)">
  </button>`;
  row.innerHTML = html;
}

// ── TYPE OVERVIEW TUNER ──
const TOV = {
  pad: 19, px: 24,
  backX: 3, backSz: 22, backGap: 8, hdrMb: 1,
  titleFs: 17,
  rowGap: 9, rowPy: 6, rowPx: 10, rowMb: 4, rowRad: 9, rowAlpha: 40,
  icoSz: 29, nameFs: 12, countFs: 10, infoGap: 4, barH: 6,
  swatchSz: 24, swatchGap: 7, swatchMt: 6, swatchPy: 5,
};
const TOV_SECTIONS = [
  { label: 'Screen', items: [
    { key:'pad',    label:'Pad Y',     unit:'px', step:1, min:0,  max:24 },
    { key:'px',     label:'Pad X',     unit:'px', step:1, min:4,  max:24 },
  ]},
  { label: 'Header', items: [
    { key:'backX',  label:'Back X',    unit:'px', step:1, min:-10, max:40 },
    { key:'backSz', label:'Icon sz',   unit:'px', step:1, min:14, max:36 },
    { key:'titleFs',label:'Title sz',  unit:'px', step:1, min:10, max:24 },
    { key:'backGap',label:'Gap',       unit:'px', step:1, min:0,  max:16 },
    { key:'hdrMb',  label:'Below',     unit:'px', step:1, min:0,  max:20 },
  ]},
  { label: 'Type Rows', items: [
    { key:'rowGap', label:'Inner gap',  unit:'px', step:1, min:2,  max:16 },
    { key:'rowPy',  label:'Pad Y',      unit:'px', step:1, min:2,  max:16 },
    { key:'rowPx',  label:'Pad X',      unit:'px', step:1, min:4,  max:20 },
    { key:'rowMb',  label:'Row gap',    unit:'px', step:1, min:0,  max:16 },
    { key:'rowRad', label:'Radius',     unit:'px', step:1, min:4,  max:20 },
    { key:'rowAlpha',label:'BG α',      unit:'%', step:1, min:0,  max:40 },
  ]},
  { label: 'Row Content', items: [
    { key:'icoSz',  label:'Icon sz',    unit:'px', step:1, min:16, max:48 },
    { key:'nameFs', label:'Name sz',    unit:'px', step:1, min:9,  max:18 },
    { key:'countFs',label:'Count sz',   unit:'px', step:1, min:8,  max:14 },
    { key:'infoGap',label:'Info gap',   unit:'px', step:1, min:0,  max:10 },
    { key:'barH',   label:'Bar H',      unit:'px', step:1, min:3,  max:14 },
  ]},
  { label: 'Swatches', items: [
    { key:'swatchSz', label:'Size',     unit:'px', step:1, min:16, max:36 },
    { key:'swatchGap',label:'Gap',      unit:'px', step:1, min:2,  max:14 },
    { key:'swatchMt', label:'Top gap',  unit:'px', step:1, min:0,  max:20 },
    { key:'swatchPy', label:'Pad Y',    unit:'px', step:1, min:0,  max:14 },
  ]},
];

function _applyTOV() {
  const root = document.documentElement;
  root.style.setProperty('--tov-pad', TOV.pad + 'px');
  root.style.setProperty('--tov-px', TOV.px + 'px');
  root.style.setProperty('--tov-back-x', TOV.backX + 'px');
  root.style.setProperty('--tov-back-sz', TOV.backSz + 'px');
  root.style.setProperty('--tov-back-gap', TOV.backGap + 'px');
  root.style.setProperty('--tov-hdr-mb', TOV.hdrMb + 'px');
  root.style.setProperty('--tov-title-fs', TOV.titleFs + 'px');
  root.style.setProperty('--tov-row-gap', TOV.rowGap + 'px');
  root.style.setProperty('--tov-row-py', TOV.rowPy + 'px');
  root.style.setProperty('--tov-row-px', TOV.rowPx + 'px');
  root.style.setProperty('--tov-row-mb', TOV.rowMb + 'px');
  root.style.setProperty('--tov-row-rad', TOV.rowRad + 'px');
  root.style.setProperty('--tov-row-alpha', String(TOV.rowAlpha / 100));
  root.style.setProperty('--tov-ico-sz', TOV.icoSz + 'px');
  root.style.setProperty('--tov-name-fs', TOV.nameFs + 'px');
  root.style.setProperty('--tov-count-fs', TOV.countFs + 'px');
  root.style.setProperty('--tov-info-gap', TOV.infoGap + 'px');
  root.style.setProperty('--tov-bar-h', TOV.barH + 'px');
  root.style.setProperty('--tov-swatch-sz', TOV.swatchSz + 'px');
  root.style.setProperty('--tov-swatch-gap', TOV.swatchGap + 'px');
  root.style.setProperty('--tov-swatch-mt', TOV.swatchMt + 'px');
  root.style.setProperty('--tov-swatch-py', TOV.swatchPy + 'px');

  const ro = document.getElementById('tov-readout');
  if (ro) {
    ro.textContent = [
      `pad ${TOV.pad}/${TOV.px}`,
      `hdr x${TOV.backX} ico${TOV.backSz} title${TOV.titleFs} gap${TOV.backGap} mb${TOV.hdrMb}`,
      `row gap${TOV.rowGap} py${TOV.rowPy} px${TOV.rowPx} mb${TOV.rowMb} r${TOV.rowRad} α${TOV.rowAlpha}%`,
      `ico${TOV.icoSz} name${TOV.nameFs} count${TOV.countFs} iGap${TOV.infoGap} bar${TOV.barH}`,
      `sw sz${TOV.swatchSz} gap${TOV.swatchGap} mt${TOV.swatchMt} py${TOV.swatchPy}`,
      `bg:${_gridBgColor}`,
      `logoAnim: exp${LA.expandScale}× ${LA.expandDur}ms con${LA.contractDur}ms ccw${LA.ccwDeg}°/${LA.ccwDur}ms spin${LA.spinDur}ms os${LA.overshootDeg}°/${LA.overshootDur}ms settle${LA.settleDur}ms pause${LA.pauseDur}ms`,
    ].join('\n');
  }
}

function _tovAdj(key, delta) {
  const r = TOV_SECTIONS.flatMap(s => s.items).find(x => x.key === key);
  if (!r) return;
  let v = TOV[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  TOV[key] = v; _applyTOV();
  const el = document.getElementById('tov-' + key);
  if (el) el.value = v;
}
function _tovSet(key, val) {
  const r = TOV_SECTIONS.flatMap(s => s.items).find(x => x.key === key);
  if (!r) return;
  let v = parseFloat(val); if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  TOV[key] = v; _applyTOV();
}

function _initTovTuner() {
  const wrap = document.getElementById('tov-tuner-rows'); if (!wrap) return;
  wrap.innerHTML = '';
  const ROW = 'display:flex;align-items:center;gap:3px;margin-bottom:2px';
  const BTN = 'padding:1px 5px;border-radius:4px;border:none;background:rgba(255,255,255,0.12);color:white;cursor:pointer;font-size:11px;line-height:1.4';
  const INP = 'width:40px;text-align:center;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.18);border-radius:4px;color:white;font-size:10px;padding:1px 3px;font-family:monospace';

  TOV_SECTIONS.forEach(sec => {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,0.38);letter-spacing:0.8px;margin-top:8px;margin-bottom:3px';
    hdr.textContent = sec.label;
    wrap.appendChild(hdr);
    sec.items.forEach(r => {
      const d = document.createElement('div');
      d.style.cssText = ROW;
      d.innerHTML =
        `<span style="width:68px;font-size:9px;color:rgba(255,255,255,0.45)">${r.label}</span>` +
        `<button onclick="_tovAdj('${r.key}',-${r.step})" style="${BTN}">−</button>` +
        `<input id="tov-${r.key}" type="number" value="${TOV[r.key]}" step="${r.step}" onchange="_tovSet('${r.key}',this.value)" style="${INP}">` +
        `<button onclick="_tovAdj('${r.key}',${r.step})" style="${BTN}">+</button>` +
        `<span style="font-size:9px;color:rgba(255,255,255,0.28);width:14px">${r.unit}</span>`;
      wrap.appendChild(d);
    });
  });

  // Logo anim section
  const laHdr = document.createElement('div');
  laHdr.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,0.38);letter-spacing:0.8px;margin-top:8px;margin-bottom:3px';
  laHdr.textContent = 'Logo Anim';
  wrap.appendChild(laHdr);
  LA_KNOBS.forEach(r => {
    const d = document.createElement('div');
    d.style.cssText = ROW;
    d.innerHTML =
      `<span style="width:68px;font-size:9px;color:rgba(255,255,255,0.45)">${r.label}</span>` +
      `<button onclick="_laAdj('${r.key}',-${r.step})" style="${BTN}">−</button>` +
      `<input id="tov-la-${r.key}" type="number" value="${LA[r.key]}" step="${r.step}" onchange="_laSet('${r.key}',this.value)" style="${INP}">` +
      `<button onclick="_laAdj('${r.key}',${r.step})" style="${BTN}">+</button>` +
      `<span style="font-size:9px;color:rgba(255,255,255,0.28);width:14px">${r.unit}</span>`;
    wrap.appendChild(d);
  });

  _applyTOV();
}

function _syncLaInputs(key, v) {
  ['tov-la-','gt-la-'].forEach(pfx => {
    const el = document.getElementById(pfx + key);
    if (el) el.value = v;
  });
}
function _laAdj(key, delta) {
  const r = LA_KNOBS.find(x => x.key === key); if (!r) return;
  let v = LA[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  LA[key] = v; stopLogoAnim(); startLogoAnim();
  _syncLaInputs(key, v);
  _applyTOV();
}
function _laSet(key, val) {
  const r = LA_KNOBS.find(x => x.key === key); if (!r) return;
  let v = parseFloat(val); if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  LA[key] = v; stopLogoAnim(); startLogoAnim();
  _syncLaInputs(key, v);
  _applyTOV();
}
