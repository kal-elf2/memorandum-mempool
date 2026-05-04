// DETAIL TUNER — detail/collection page layout tuner panel

// ── MEMORY DETAIL / COLLECTION TUNER (CSS vars on #screen-detail only)
const DT = {
  topH: 57, topPadX: 10, backX: 23, backY: 15, backSz: 28,
  heroPadT: 5, heroPadX: 24, heroPadB: 0, heroMinH: 80,
  spriteSz: 152, spriteX: 1, spriteY: 0,
  dexX: 0, dexY: -2, nameX: -6, nameY: -9,
  wmFs: 66, wmX: -30, wmY: -35, wmOp: 9,
  badgeGap: 7, badgeSc: 100,
  tabH: 41, tabFs: 14, tabPadX: 24, tabInnerPx: 12, mcFs: 10, mcY: 0,
  bodyPad: 24, bodyTopPad: 9,
  secMt: 9, secMb: 6,
  chipPx: 12, chipPy: 9, chipGap: 6, chipRad: 9,
  descFs: 13,
  evoY: 0, evoSc: 100, evoGap: 5, evoPadB: 5, evoImgSz: 44,
  instRowMinH: 1, instImgSz: 58, instImgX: -1, instImgY: -1,
  instTx: 0, instTy: 0, instGap: 10, instMb: 6,
  actPy: 10, actPx: 18, actGap: 6, actMinH: 0,
};
const DT_SECTIONS = [
  { label: 'Top inset', items: [
    { key:'topH', label:'Inset H', unit:'px', step:1, min:0, max:88, cssVar:'--dt-top-h', mode:'px' },
    { key:'topPadX', label:'Pad X', unit:'px', step:1, min:0, max:24, cssVar:'--dt-top-pad-x', mode:'px' },
    { key:'backX', label:'Back X', unit:'px', step:1, min:-8, max:48, cssVar:'--dt-back-x', mode:'px' },
    { key:'backY', label:'Back Y', unit:'px', step:1, min:0, max:48, cssVar:'--dt-back-y', mode:'px' },
    { key:'backSz', label:'Back Sz', unit:'px', step:2, min:16, max:56, cssVar:'--dt-back-sz', mode:'px' },
  ]},
  { label: 'Hero', items: [
    { key:'heroPadT', label:'Pad T', unit:'px', step:1, min:0, max:32, cssVar:'--dt-hero-pad-t', mode:'px' },
    { key:'heroPadX', label:'Pad X', unit:'px', step:1, min:4, max:32, cssVar:'--dt-hero-pad-x', mode:'px' },
    { key:'heroPadB', label:'Pad B', unit:'px', step:1, min:0, max:24, cssVar:'--dt-hero-pad-b', mode:'px' },
    { key:'heroMinH', label:'Min H', unit:'px', step:2, min:52, max:160, cssVar:'--dt-hero-min-h', mode:'px' },
  ]},
  { label: 'Sprite', items: [
    { key:'spriteSz', label:'Size', unit:'px', step:2, min:48, max:180, cssVar:'--dt-sprite-sz', mode:'px' },
    { key:'spriteX', label:'X', unit:'px', step:1, min:-40, max:40, cssVar:'--dt-sprite-x', mode:'px' },
    { key:'spriteY', label:'Y', unit:'px', step:1, min:-40, max:40, cssVar:'--dt-sprite-y', mode:'px' },
  ]},
  { label: 'Dex / name', items: [
    { key:'dexX', label:'Dex X', unit:'px', step:1, min:-24, max:24, cssVar:'--dt-dex-x', mode:'px' },
    { key:'dexY', label:'Dex Y', unit:'px', step:1, min:-24, max:24, cssVar:'--dt-dex-y', mode:'px' },
    { key:'nameX', label:'Name X', unit:'px', step:1, min:-24, max:24, cssVar:'--dt-name-x', mode:'px' },
    { key:'nameY', label:'Name Y', unit:'px', step:1, min:-24, max:24, cssVar:'--dt-name-y', mode:'px' },
  ]},
  { label: 'Watermark', items: [
    { key:'wmFs', label:'Size', unit:'px', step:2, min:28, max:120, cssVar:'--dt-wm-fs', mode:'px' },
    { key:'wmX', label:'X', unit:'px', step:1, min:-80, max:80, cssVar:'--dt-wm-x', mode:'px' },
    { key:'wmY', label:'Y', unit:'px', step:1, min:-80, max:80, cssVar:'--dt-wm-y', mode:'px' },
    { key:'wmOp', label:'α %', unit:'%', step:1, min:2, max:40, cssVar:'--dt-wm-op', mode:'alphaPct' },
  ]},
  { label: 'Badges', items: [
    { key:'badgeGap', label:'Gap', unit:'px', step:1, min:0, max:16, cssVar:'--dt-badge-gap', mode:'px' },
    { key:'badgeSc', label:'Scale%', unit:'%', step:5, min:70, max:130, cssVar:'__badgeSc', mode:'skip' },
  ]},
  { label: 'Tabs', items: [
    { key:'tabH', label:'Height', unit:'px', step:1, min:32, max:64, cssVar:'--dt-tab-h', mode:'px' },
    { key:'tabFs', label:'Text', unit:'px', step:1, min:10, max:17, cssVar:'--dt-tab-fs', mode:'px' },
    { key:'tabPadX', label:'Pad X', unit:'px', step:1, min:4, max:32, cssVar:'--dt-tab-pad-x', mode:'px' },
    { key:'tabInnerPx', label:'Tab W', unit:'px', step:1, min:6, max:32, cssVar:'--dt-tab-inner-px', mode:'px' },
    { key:'mcFs', label:'MC sz', unit:'px', step:1, min:8, max:14, cssVar:'--dt-mc-fs', mode:'px' },
    { key:'mcY', label:'MC Y', unit:'px', step:1, min:-12, max:12, cssVar:'--dt-mc-y', mode:'px' },
  ]},
  { label: 'Body', items: [
    { key:'bodyTopPad', label:'Pad T', unit:'px', step:1, min:4, max:32, cssVar:'--dt-body-top-pad', mode:'px' },
    { key:'bodyPad', label:'Pad X', unit:'px', step:1, min:4, max:32, cssVar:'--dt-body-pad', mode:'px' },
    { key:'secMt', label:'Sec Y', unit:'px', step:1, min:4, max:20, cssVar:'--dt-sec-mt', mode:'px' },
    { key:'secMb', label:'Sec gap', unit:'px', step:1, min:2, max:16, cssVar:'--dt-sec-mb', mode:'px' },
    { key:'descFs', label:'Desc px', unit:'px', step:1, min:10, max:16, cssVar:'--dt-desc-fs', mode:'px' },
  ]},
  { label: 'Chips', items: [
    { key:'chipPx', label:'Pad X', unit:'px', step:1, min:4, max:16, cssVar:'--dt-chip-pad-x', mode:'px' },
    { key:'chipPy', label:'Pad Y', unit:'px', step:1, min:4, max:16, cssVar:'--dt-chip-pad-y', mode:'px' },
    { key:'chipGap', label:'Gap', unit:'px', step:1, min:2, max:14, cssVar:'--dt-chip-gap', mode:'px' },
    { key:'chipRad', label:'Radius', unit:'px', step:1, min:4, max:18, cssVar:'--dt-chip-radius', mode:'px' },
  ]},
  { label: 'Evo row', items: [
    { key:'evoY', label:'Y', unit:'px', step:1, min:-24, max:24, cssVar:'--dt-evo-y', mode:'px' },
    { key:'evoSc', label:'Scale%', unit:'%', step:5, min:70, max:130, cssVar:'__evoSc', mode:'skip' },
    { key:'evoImgSz', label:'Img sz', unit:'px', step:1, min:28, max:56, cssVar:'--dt-evo-img-sz', mode:'px' },
    { key:'evoGap', label:'Gap', unit:'px', step:1, min:0, max:16, cssVar:'--dt-evo-gap', mode:'px' },
    { key:'evoPadB', label:'Pad B', unit:'px', step:1, min:0, max:16, cssVar:'--dt-evo-pad-b', mode:'px' },
  ]},
  { label: 'Instance row', items: [
    { key:'instRowMinH', label:'Min H', unit:'px', step:1, min:0, max:80, cssVar:'--dt-inst-row-minh', mode:'px' },
    { key:'instImgSz', label:'Spr sz', unit:'px', step:1, min:28, max:80, cssVar:'--dt-inst-img-sz', mode:'px' },
    { key:'instImgX', label:'Spr X', unit:'px', step:1, min:-20, max:20, cssVar:'--dt-inst-img-x', mode:'px' },
    { key:'instImgY', label:'Spr Y', unit:'px', step:1, min:-20, max:20, cssVar:'--dt-inst-img-y', mode:'px' },
    { key:'instTx', label:'Text X', unit:'px', step:1, min:-12, max:12, cssVar:'--dt-inst-text-x', mode:'px' },
    { key:'instTy', label:'Text Y', unit:'px', step:1, min:-12, max:12, cssVar:'--dt-inst-text-y', mode:'px' },
    { key:'instGap', label:'Gap', unit:'px', step:1, min:2, max:20, cssVar:'--dt-inst-gap', mode:'px' },
    { key:'instMb', label:'Row gap', unit:'px', step:1, min:0, max:16, cssVar:'--dt-inst-mb', mode:'px' },
  ]},
  { label: 'Action bar', items: [
    { key:'actPy', label:'Pad Y', unit:'px', step:1, min:2, max:24, cssVar:'--dt-action-pad-y', mode:'px' },
    { key:'actPx', label:'Pad X', unit:'px', step:1, min:2, max:24, cssVar:'--dt-action-pad-x', mode:'px' },
    { key:'actGap', label:'Btn gap', unit:'px', step:1, min:0, max:16, cssVar:'--dt-action-gap', mode:'px' },
    { key:'actMinH', label:'Min H', unit:'px', step:1, min:0, max:56, cssVar:'--dt-action-min-h', mode:'px' },
  ]},
];

function _dtFind(key) {
  for (const s of DT_SECTIONS) {
    const r = s.items.find(x => x.key === key);
    if (r) return r;
  }
  return null;
}

function _applyDT() {
  const panel = document.getElementById('screen-detail');
  if (!panel) return;
  DT_SECTIONS.forEach(s => s.items.forEach(r => {
    if (r.mode === 'skip') {
      const elSk = document.getElementById('dt-' + r.key);
      if (elSk) elSk.value = DT[r.key];
      return;
    }
    const v = DT[r.key];
    const val = r.mode === 'alphaPct' ? String(v / 100) : (v + 'px');
    panel.style.setProperty(r.cssVar, val);
    const el = document.getElementById('dt-' + r.key);
    if (el) el.value = DT[r.key];
  }));
  panel.style.setProperty('--dt-badge-scale', String(DT.badgeSc / 100));
  panel.style.setProperty('--dt-evo-scale', String(DT.evoSc / 100));
  const ro = document.getElementById('dt-readout');
  if (ro) {
    ro.style.whiteSpace = 'pre-line';
    ro.textContent = [
      `top ${DT.topH}/${DT.topPadX} · back ${DT.backX},${DT.backY} sz${DT.backSz}`,
      `hero ${DT.heroPadT}/${DT.heroPadX}/${DT.heroPadB} · minH ${DT.heroMinH} · spr ${DT.spriteSz}@${DT.spriteX},${DT.spriteY}`,
      `dex ${DT.dexX},${DT.dexY} · name ${DT.nameX},${DT.nameY} · wm ${DT.wmFs}@${DT.wmX},${DT.wmY} α${DT.wmOp} · badges gap${DT.badgeGap} sc${DT.badgeSc}%`,
      `tabs ${DT.tabH}/${DT.tabFs}/${DT.tabPadX} innerPx${DT.tabInnerPx} · mc sz${DT.mcFs} y${DT.mcY}`,
      `body T/side ${DT.bodyTopPad}/${DT.bodyPad} · sec ${DT.secMt}/${DT.secMb} · desc ${DT.descFs}`,
      `chip ${DT.chipPx}/${DT.chipPy}/${DT.chipGap}/r${DT.chipRad} · evo y${DT.evoY} sc${DT.evoSc}% img${DT.evoImgSz} gap${DT.evoGap} pb${DT.evoPadB}`,
      `inst minH${DT.instRowMinH} img${DT.instImgSz}@${DT.instImgX},${DT.instImgY} txt${DT.instTx},${DT.instTy} gap${DT.instGap}/${DT.instMb}`,
      `act py${DT.actPy} px${DT.actPx} gap${DT.actGap} minH${DT.actMinH}`,
    ].join('\n');
  }
  try { localStorage.setItem('mempool-detail-dt-v5', JSON.stringify(DT)); } catch (e) {}
}

function _dtAdj(key, delta) {
  const r = _dtFind(key); if (!r || r.mode === 'skip') return;
  let v = DT[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  DT[key] = v;
  _applyDT();
}
function _dtSet(key, val) {
  const r = _dtFind(key); if (!r || r.mode === 'skip') return;
  let v = parseFloat(val); if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  DT[key] = v;
  _applyDT();
}
function copyDetailTuner() {
  const ro = document.getElementById('dt-readout');
  if (ro) navigator.clipboard?.writeText(ro.textContent).catch(()=>{});
}

function _initDetailTuner() {
  try {
    const raw = localStorage.getItem('mempool-detail-dt-v5');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        for (const k of Object.keys(DT)) {
          if (saved[k] !== undefined && typeof saved[k] === typeof DT[k]) {
            const n = saved[k];
            if (typeof n === 'number' && !Number.isNaN(n)) DT[k] = n;
          }
        }
      }
    }
  } catch (e) {}
  const wrap = document.getElementById('dt-rows');
  if (!wrap) return;
  wrap.innerHTML = '';
  DT_SECTIONS.forEach(sec => {
    const h = document.createElement('div');
    h.className = 'dt-sec';
    h.textContent = sec.label;
    wrap.appendChild(h);
    sec.items.forEach(r => {
      const d = document.createElement('div');
      d.className = 'dt-row';
      const step = r.step ?? 1;
      d.innerHTML =
        `<span class="dt-lbl">${r.label}</span>` +
        `<button type="button" class="dt-btn" onclick="_dtAdj('${r.key}',-${step})">−</button>` +
        `<input id="dt-${r.key}" class="dt-inp" type="number" value="${DT[r.key]}" onchange="_dtSet('${r.key}',this.value)">` +
        `<button type="button" class="dt-btn" onclick="_dtAdj('${r.key}',${step})">+</button>` +
        `<span style="font-size:8px;color:rgba(255,255,255,0.28);width:14px;text-align:right">${r.unit}</span>`;
      wrap.appendChild(d);
    });
  });
  _applyDT();
}
