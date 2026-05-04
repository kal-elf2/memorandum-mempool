// ANIMATION — logo idle animation (expand, contract, rotate, spin, overshoot)

// ── LOGO IDLE ANIMATION ──
const LA = {
  expandScale: 1.20, expandDur: 400, contractDur: 400,
  ccwDeg: 5, ccwDur: 300,
  spinDur: 800, pauseDur: 3000,
  overshootDeg: 10, overshootDur: 200, settleDur: 150,
};
let _logoTimer = null;
let _logoPhase = 0;

function startLogoAnim() {
  const logo = document.getElementById('grid-logo');
  if (!logo || _logoTimer) return;
  _logoPhase = 0;
  _runLogoStep(logo);
}
function _runLogoStep(logo) {
  const ccw = LA.ccwDeg;
  const os = LA.overshootDeg;
  const phases = [
    { transform: `scale(${LA.expandScale})`, dur: LA.expandDur },
    { transform: 'scale(1)', dur: LA.contractDur },
    { transform: `scale(1) rotate(-${ccw}deg)`, dur: LA.ccwDur },
    { transform: `scale(1) rotate(${360 + os}deg)`, dur: LA.spinDur },
    { transform: `scale(1) rotate(${360}deg)`, dur: LA.settleDur },
  ];
  if (_logoPhase < phases.length) {
    const p = phases[_logoPhase];
    logo.style.transition = `transform ${p.dur}ms ease`;
    logo.style.transform = p.transform;
    const wait = p.dur || 50;
    _logoTimer = setTimeout(() => { _logoPhase++; _runLogoStep(logo); }, wait);
  } else {
    logo.style.transition = 'none';
    logo.style.transform = 'scale(1) rotate(0deg)';
    _logoTimer = setTimeout(() => { _logoPhase = 0; _runLogoStep(logo); }, LA.pauseDur);
  }
}
function stopLogoAnim() {
  if (_logoTimer) { clearTimeout(_logoTimer); _logoTimer = null; }
  const logo = document.getElementById('grid-logo');
  if (logo) { logo.style.transition = 'none'; logo.style.transform = ''; }
}

// ── LOGO ANIM TUNER ──
const LA_KNOBS = [
  { key:'expandScale', label:'Expand %', unit:'×', step:0.05, min:1, max:2 },
  { key:'expandDur',   label:'Expand ms', unit:'ms', step:50, min:100, max:2000 },
  { key:'contractDur', label:'Contract ms', unit:'ms', step:50, min:100, max:2000 },
  { key:'ccwDeg',      label:'CCW deg', unit:'°', step:1, min:1, max:30 },
  { key:'ccwDur',      label:'CCW ms', unit:'ms', step:50, min:100, max:1500 },
  { key:'spinDur',     label:'Spin ms', unit:'ms', step:50, min:200, max:3000 },
  { key:'pauseDur',    label:'Pause ms', unit:'ms', step:250, min:500, max:10000 },
  { key:'overshootDeg',label:'OS deg',   unit:'°',  step:1,   min:0,   max:30 },
  { key:'overshootDur',label:'OS ms',    unit:'ms', step:25,  min:50,  max:500 },
  { key:'settleDur',   label:'Settle ms',unit:'ms', step:25,  min:50,  max:500 },
];
