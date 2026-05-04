// INSTANCE TUNER + 3D GRID — instance card and 3D perspective grid tuner panels

// ── INSTANCE CARD MODAL TUNER (#imx-panel + backdrop blur)
const IT = {
  w: 318, rad: 20, blur: 6, scale: 98,
  heroH: 188, heroPadB: 10, sprSz: 142,
  wmFs: 108, wmX: -116, wmY: -26, wmKern: 20, wmA: 14,
  bodyPy: 14, bodyPx: 17, bodyPb: 18,
  idFs: 13, nameFs: 22, nameMb: 10,
  tagGap: 7, tagMb: 10, pillFs: 8,
  essRad: 8, essPy: 10, essPx: 12, essMb: 11,
  stgRad: 12, stgPy: 10, stgPx: 12, stgMb: 12,
  barH: 6,
  mintMb: 10, mintPillFs: 10, mintPillPy: 4,
  actGap: 6,
  btnPy: 9, btnPx: 4, btnRad: 10, btnFs: 10,
  nftX: 7,
  floatH: 7, floatDur: 2.0,
  shadW: 24, shadH: 6, shadY: 82, shadOp: 60,
  shadBlurFar: 24, shadBlurNear: 10,
};
const IT_SECTIONS = [
  { label: 'Shell', items: [
    { key:'w', label:'Width', unit:'px', step:2, min:240, max:380, cssVar:'--imx-w', mode:'px' },
    { key:'rad', label:'Radius', unit:'px', step:1, min:12, max:40, cssVar:'--imx-rad', mode:'px' },
    { key:'blur', label:'Backdrop', unit:'px', step:1, min:0, max:20, cssVar:'__blur', mode:'blur' },
    { key:'scale', label:'Pop %', unit:'%', step:2, min:85, max:115, cssVar:'--imx-scale', mode:'scalePct' },
  ]},
  { label: 'Hero', items: [
    { key:'heroH', label:'Height', unit:'px', step:2, min:120, max:240, cssVar:'--imx-hero-h', mode:'px' },
    { key:'heroPadB', label:'Pad bot', unit:'px', step:1, min:0, max:24, cssVar:'--imx-hero-pad-b', mode:'px' },
    { key:'sprSz', label:'Sprite', unit:'px', step:2, min:80, max:160, cssVar:'--imx-spr-sz', mode:'px' },
  ]},
  { label: 'Watermark', items: [
    { key:'wmFs', label:'Size', unit:'px', step:2, min:48, max:200, cssVar:'--imx-wm-fs', mode:'px' },
    { key:'wmX', label:'X pos', unit:'px', step:5, min:-200, max:100, cssVar:'--imx-wm-x', mode:'px' },
    { key:'wmY', label:'Y pos', unit:'px', step:2, min:-80, max:60, cssVar:'--imx-wm-y', mode:'px' },
    { key:'wmKern', label:'Kern', unit:'px', step:1, min:-20, max:20, cssVar:'--imx-wm-kern', mode:'px' },
    { key:'wmA', label:'Opacity', unit:'%', step:1, min:2, max:40, cssVar:'--imx-wm-a', mode:'alphaPct' },
  ]},
  { label: 'Body', items: [
    { key:'bodyPy', label:'Pad Y', unit:'px', step:1, min:8, max:28, cssVar:'--imx-body-py', mode:'px' },
    { key:'bodyPx', label:'Pad X', unit:'px', step:1, min:8, max:28, cssVar:'--imx-body-px', mode:'px' },
    { key:'bodyPb', label:'Pad bot', unit:'px', step:1, min:8, max:32, cssVar:'--imx-body-pb', mode:'px' },
    { key:'idFs', label:'# id', unit:'px', step:1, min:10, max:18, cssVar:'--imx-id-fs', mode:'px' },
    { key:'nameFs', label:'Name', unit:'px', step:1, min:16, max:28, cssVar:'--imx-name-fs', mode:'px' },
    { key:'nameMb', label:'Name gap', unit:'px', step:1, min:0, max:20, cssVar:'--imx-name-mb', mode:'px' },
  ]},
  { label: 'Tags', items: [
    { key:'tagGap', label:'Gap', unit:'px', step:1, min:0, max:14, cssVar:'--imx-tag-gap', mode:'px' },
    { key:'tagMb', label:'Below', unit:'px', step:1, min:0, max:24, cssVar:'--imx-tag-mb', mode:'px' },
    { key:'pillFs', label:'Pill text', unit:'px', step:1, min:7, max:11, cssVar:'--imx-pill-fs', mode:'px' },
  ]},
  { label: 'Essence', items: [
    { key:'essRad', label:'Radius', unit:'px', step:1, min:6, max:20, cssVar:'--imx-ess-rad', mode:'px' },
    { key:'essPy', label:'Pad Y', unit:'px', step:1, min:6, max:18, cssVar:'--imx-ess-py', mode:'px' },
    { key:'essPx', label:'Pad X', unit:'px', step:1, min:6, max:18, cssVar:'--imx-ess-px', mode:'px' },
    { key:'essMb', label:'Below', unit:'px', step:1, min:0, max:24, cssVar:'--imx-ess-mb', mode:'px' },
  ]},
  { label: 'Stage', items: [
    { key:'stgRad', label:'Radius', unit:'px', step:1, min:6, max:20, cssVar:'--imx-stg-rad', mode:'px' },
    { key:'stgPy', label:'Pad Y', unit:'px', step:1, min:6, max:18, cssVar:'--imx-stg-py', mode:'px' },
    { key:'stgPx', label:'Pad X', unit:'px', step:1, min:6, max:18, cssVar:'--imx-stg-px', mode:'px' },
    { key:'stgMb', label:'Below', unit:'px', step:1, min:0, max:24, cssVar:'--imx-stg-mb', mode:'px' },
    { key:'barH', label:'Bar H', unit:'px', step:1, min:4, max:12, cssVar:'--imx-bar-h', mode:'px' },
  ]},
  { label: 'Mint+btns', items: [
    { key:'mintMb', label:'Mint gap', unit:'px', step:1, min:0, max:24, cssVar:'--imx-mint-mb', mode:'px' },
    { key:'mintPillFs', label:'Pill text', unit:'px', step:1, min:8, max:14, cssVar:'--imx-mint-pill-fs', mode:'px' },
    { key:'mintPillPy', label:'Pill pad', unit:'px', step:1, min:2, max:10, cssVar:'--imx-mint-pill-py', mode:'px' },
    { key:'actGap', label:'Btn gap', unit:'px', step:1, min:0, max:14, cssVar:'--imx-act-gap', mode:'px' },
    { key:'btnPy', label:'Btn py', unit:'px', step:1, min:6, max:14, cssVar:'--imx-btn-py', mode:'px' },
    { key:'btnPx', label:'Btn px', unit:'px', step:1, min:2, max:12, cssVar:'--imx-btn-px', mode:'px' },
    { key:'btnRad', label:'Btn rad', unit:'px', step:1, min:6, max:16, cssVar:'--imx-btn-rad', mode:'px' },
    { key:'btnFs', label:'Btn text', unit:'px', step:1, min:8, max:12, cssVar:'--imx-btn-fs', mode:'px' },
  ]},
  { label: 'NFT tag (cards)', items: [
    { key:'nftX', label:'X pos', unit:'px', step:1, min:-20, max:80, cssVar:'--inst-nft-x', mode:'px' },
  ]},
  { label: 'Float', items: [
    { key:'floatH',   label:'Height',   unit:'%',  step:0.5, min:0, max:10, cssVar:'--imx-float-h', mode:'pct' },
    { key:'floatDur',  label:'Speed',    unit:'s',  step:0.1, min:0.5, max:5, cssVar:'--imx-float-dur', mode:'sec' },
  ]},
  { label: 'Shadow', items: [
    { key:'shadW',       label:'Width',     unit:'%',  step:2, min:10, max:60, cssVar:'--imx-shad-w', mode:'pct' },
    { key:'shadH',       label:'Height',    unit:'%',  step:1, min:2,  max:20, cssVar:'--imx-shad-h', mode:'pct' },
    { key:'shadY',       label:'Y pos',     unit:'%',  step:2, min:50, max:100, cssVar:'--imx-shad-y', mode:'pct' },
    { key:'shadOp',      label:'Opacity',   unit:'%',  step:2, min:0,  max:60,  cssVar:'--imx-shad-op', mode:'alphaPct' },
    { key:'shadBlurFar', label:'Blur far',  unit:'px', step:2, min:0,  max:60,  cssVar:'--imx-shad-blur-far', mode:'px' },
    { key:'shadBlurNear',label:'Blur near', unit:'px', step:1, min:0,  max:30,  cssVar:'--imx-shad-blur-near', mode:'px' },
  ]},
];

function _itFind(key) {
  for (const s of IT_SECTIONS) {
    const r = s.items.find(x => x.key === key);
    if (r) return r;
  }
  return null;
}

function _applyIT() {
  const panel = document.getElementById('imx-panel');
  const ov = document.getElementById('imx-overlay');
  if (!panel) return;
  IT_SECTIONS.forEach(s => s.items.forEach(r => {
    const v = IT[r.key];
    const elInp = document.getElementById('it-' + r.key);
    if (r.mode === 'blur') {
      if (elInp) elInp.value = IT[r.key];
      return;
    }
    let val;
    if (r.mode === 'scalePct') val = String(v / 100);
    else if (r.mode === 'alphaPct') val = String(v / 100);
    else if (r.mode === 'pct') val = v + '%';
    else if (r.mode === 'sec') val = v + 's';
    else val = v + 'px';
    if (r.cssVar === '--inst-nft-x') {
      document.documentElement.style.setProperty(r.cssVar, val);
    } else {
      panel.style.setProperty(r.cssVar, val);
    }
    if (elInp) elInp.value = IT[r.key];
  }));
  if (ov) ov.style.setProperty('--imx-blur', IT.blur + 'px');
  const ro = document.getElementById('it-readout');
  if (ro) {
    ro.style.whiteSpace = 'pre-line';
    ro.textContent = [
      `shell w${IT.w} r${IT.rad} blur${IT.blur} sc${IT.scale}%`,
      `hero h${IT.heroH} padB${IT.heroPadB} spr${IT.sprSz}`,
      `wm sz${IT.wmFs} x${IT.wmX} y${IT.wmY} kern${IT.wmKern} α${IT.wmA}%`,
      `body py/px/pb ${IT.bodyPy}/${IT.bodyPx}/${IT.bodyPb} id${IT.idFs} name${IT.nameFs} gap${IT.nameMb}`,
      `tags gap${IT.tagGap} below${IT.tagMb} pill${IT.pillFs}`,
      `ess r${IT.essRad} py${IT.essPy} px${IT.essPx} below${IT.essMb}`,
      `stage r${IT.stgRad} py${IT.stgPy} px${IT.stgPx} below${IT.stgMb} bar${IT.barH}`,
      `mint+btns mintMb${IT.mintMb} pillFs${IT.mintPillFs} pillPy${IT.mintPillPy} gap${IT.actGap} btn py${IT.btnPy} px${IT.btnPx} r${IT.btnRad} fs${IT.btnFs}`,
      `nft-tag x${IT.nftX}`,
      `float h${IT.floatH}% dur${IT.floatDur}s`,
      `shadow w${IT.shadW}% h${IT.shadH}% y${IT.shadY}% α${IT.shadOp}% blurF${IT.shadBlurFar} blurN${IT.shadBlurNear}`,
    ].join('\n');
  }
  try { localStorage.setItem('mempool-imx-v2', JSON.stringify(IT)); } catch (e) {}
}

function _itAdj(key, delta) {
  const r = _itFind(key); if (!r) return;
  let v = IT[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  IT[key] = v;
  _applyIT();
}
function _itSet(key, val) {
  const r = _itFind(key); if (!r) return;
  let v = parseFloat(val); if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  IT[key] = v;
  _applyIT();
}
function copyInstanceCardTuner() {
  const ro = document.getElementById('it-readout');
  if (ro) navigator.clipboard?.writeText(ro.textContent).catch(()=>{});
}

function _initInstanceCardTuner() {
  try {
    const raw = localStorage.getItem('mempool-imx-v2') || localStorage.getItem('mempool-imx-v1');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        for (const k of Object.keys(IT)) {
          if (saved[k] !== undefined && typeof saved[k] === typeof IT[k]) {
            const n = saved[k];
            if (typeof n === 'number' && !Number.isNaN(n)) IT[k] = n;
          }
        }
      }
    }
  } catch (e) {}
  const wrap = document.getElementById('it-rows');
  if (!wrap) return;
  wrap.innerHTML = '';
  IT_SECTIONS.forEach(sec => {
    const h = document.createElement('div');
    h.className = 'it-sec';
    h.textContent = sec.label;
    wrap.appendChild(h);
    sec.items.forEach(r => {
      const d = document.createElement('div');
      d.className = 'it-row';
      const step = r.step ?? 1;
      d.innerHTML =
        `<span class="it-lbl">${r.label}</span>` +
        `<button type="button" class="it-btn" onclick="_itAdj('${r.key}',-${step})">−</button>` +
        `<input id="it-${r.key}" class="it-inp" type="number" value="${IT[r.key]}" onchange="_itSet('${r.key}',this.value)">` +
        `<button type="button" class="it-btn" onclick="_itAdj('${r.key}',${step})">+</button>` +
        `<span style="font-size:8px;color:rgba(255,255,255,0.28);width:14px;text-align:right">${r.unit}</span>`;
      wrap.appendChild(d);
    });
  });
  _applyIT();
}

// ── 3D GRID TUNER (hero perspective grid)
const G3D = {
  persp: 189, rx: 58, botW: 300, h: 120, bot: -2,
  gap: 45, lw: 2, lineA: 20,
  fadeTop: 2, fadeMid: 40, midA: 62,
  tearSz: 60,
};
const G3D_SECTIONS = [
  { label: 'Perspective', items: [
    { key:'persp', label:'Depth', unit:'px', step:10, min:60, max:600, cssVar:'--g3d-persp', mode:'px' },
    { key:'rx', label:'Rotate X', unit:'°', step:1, min:20, max:80, cssVar:'--g3d-rx', mode:'deg' },
  ]},
  { label: 'Dimensions', items: [
    { key:'botW', label:'Bot width', unit:'%', step:5, min:100, max:500, cssVar:'--g3d-bot-w', mode:'pct' },
    { key:'h', label:'Height', unit:'%', step:5, min:50, max:300, cssVar:'--g3d-h', mode:'pct' },
    { key:'bot', label:'Bot offset', unit:'px', step:1, min:-40, max:40, cssVar:'--g3d-bot', mode:'px' },
  ]},
  { label: 'Grid lines', items: [
    { key:'gap', label:'Spacing', unit:'px', step:1, min:8, max:60, cssVar:'--g3d-gap', mode:'px' },
    { key:'lw', label:'Thickness', unit:'px', step:1, min:1, max:4, cssVar:'--g3d-lw', mode:'px' },
    { key:'lineA', label:'Opacity', unit:'%', step:1, min:1, max:30, cssVar:'--g3d-line-a', mode:'alphaPct' },
  ]},
  { label: 'Fade gradient', items: [
    { key:'fadeTop', label:'Top start', unit:'%', step:2, min:0, max:60, cssVar:'--g3d-fade-top', mode:'pct' },
    { key:'fadeMid', label:'Mid point', unit:'%', step:2, min:10, max:90, cssVar:'--g3d-fade-mid', mode:'pct' },
    { key:'midA', label:'Mid opacity', unit:'%', step:2, min:10, max:100, cssVar:'--g3d-mid-a', mode:'alphaPct' },
  ]},
  { label: 'Tear button', items: [
    { key:'tearSz', label:'Icon %', unit:'%', step:5, min:30, max:100, cssVar:'--imx-tear-sz', mode:'pct' },
  ]},
];

function _g3dFind(key) {
  for (const s of G3D_SECTIONS) { const r = s.items.find(x => x.key === key); if (r) return r; }
  return null;
}
function _applyG3D() {
  const root = document.documentElement;
  G3D_SECTIONS.forEach(s => s.items.forEach(r => {
    const v = G3D[r.key];
    const el = document.getElementById('g3d-' + r.key);
    if (el) el.value = v;
    if (r.mode === 'px') root.style.setProperty(r.cssVar, v + 'px');
    else if (r.mode === 'deg') root.style.setProperty(r.cssVar, v + 'deg');
    else if (r.mode === 'pct') root.style.setProperty(r.cssVar, v + '%');
    else if (r.mode === 'alphaPct') root.style.setProperty(r.cssVar, String(v / 100));
  }));
  const ro = document.getElementById('g3d-readout');
  if (ro) ro.textContent = [
    `persp ${G3D.persp}px rotX ${G3D.rx}°`,
    `dim botW${G3D.botW}% h${G3D.h}% bot${G3D.bot}px`,
    `lines gap${G3D.gap} w${G3D.lw} α${G3D.lineA}%`,
    `fade top${G3D.fadeTop}% mid${G3D.fadeMid}% midα${G3D.midA}%`,
    `tear sz${G3D.tearSz}%`,
  ].join('\n');
  try { localStorage.setItem('mempool-g3d-v1', JSON.stringify(G3D)); } catch(e) {}
}
function _g3dAdj(key, delta) {
  const r = _g3dFind(key); if (!r) return;
  let v = G3D[key] + delta;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  G3D[key] = v; _applyG3D();
}
function _g3dSet(key, val) {
  const r = _g3dFind(key); if (!r) return;
  let v = parseFloat(val); if (isNaN(v)) return;
  if (r.min !== undefined) v = Math.max(r.min, v);
  if (r.max !== undefined) v = Math.min(r.max, v);
  G3D[key] = v; _applyG3D();
}
function copyGrid3dTuner() {
  const ro = document.getElementById('g3d-readout');
  if (ro) navigator.clipboard?.writeText(ro.textContent).catch(()=>{});
}
function _initGrid3dTuner() {
  try {
    const raw = localStorage.getItem('mempool-g3d-v1');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        for (const k of Object.keys(G3D)) {
          if (saved[k] !== undefined && typeof saved[k] === 'number' && !Number.isNaN(saved[k])) G3D[k] = saved[k];
        }
      }
    }
  } catch(e) {}
  const wrap = document.getElementById('g3d-rows'); if (!wrap) return;
  wrap.innerHTML = '';
  const ROW = 'display:flex;align-items:center;gap:3px;margin-bottom:2px';
  const BTN = 'padding:1px 5px;border-radius:4px;border:none;background:rgba(255,255,255,0.12);color:white;cursor:pointer;font-size:11px;line-height:1.4';
  const INP = 'width:42px;text-align:center;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.18);border-radius:4px;color:white;font-size:10px;padding:1px 3px;font-family:monospace';
  G3D_SECTIONS.forEach(sec => {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;color:rgba(255,255,255,0.38);letter-spacing:0.8px;margin-top:8px;margin-bottom:3px';
    hdr.textContent = sec.label;
    wrap.appendChild(hdr);
    sec.items.forEach(r => {
      const d = document.createElement('div');
      d.style.cssText = ROW;
      d.innerHTML =
        `<span style="width:66px;font-size:9px;color:rgba(255,255,255,0.45)">${r.label}</span>` +
        `<button onclick="_g3dAdj('${r.key}',-${r.step})" style="${BTN}">−</button>` +
        `<input id="g3d-${r.key}" type="number" value="${G3D[r.key]}" onchange="_g3dSet('${r.key}',this.value)" style="${INP}">` +
        `<button onclick="_g3dAdj('${r.key}',${r.step})" style="${BTN}">+</button>` +
        `<span style="font-size:9px;color:rgba(255,255,255,0.28);width:14px">${r.unit}</span>`;
      wrap.appendChild(d);
    });
  });
  _applyG3D();
}
