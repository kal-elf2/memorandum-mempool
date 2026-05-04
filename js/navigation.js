// NAVIGATION — screen switching, tab/filter/mode changes

// ══════════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════════
function showScreen(name) {
  if (name === 'grid') closeInstanceModal();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  syncDevPanelVisibility(name);
  if (name === 'detail') renderDetail();
  if (name === 'grid') startLogoAnim(); else stopLogoAnim();
}

function switchTab(btn) {
  document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const tabName = btn.dataset.tab;
  document.getElementById('tab-' + tabName).classList.add('active');
  if (tabName !== 'collection') closeInstanceModal();
  renderDetail();
}

function setMode(btn) {
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  S.mode = btn.dataset.mode;
  S.filter = 'all';
  document.querySelectorAll('.ftab').forEach(t => t.classList.toggle('active', t.dataset.f === 'all'));
  const typeRow = document.getElementById('type-icon-row');
  if (typeRow) typeRow.classList.remove('visible');
  renderGrid();
}

function setFilter(btn) {
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  S.filter = btn.dataset.f;
  const typeRow = document.getElementById('type-icon-row');
  if (typeRow) {
    typeRow.classList.toggle('visible', S.filter === 'type');
  }
  renderGrid();
}
