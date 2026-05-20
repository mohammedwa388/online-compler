let _toastTimer;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `notif-toast show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── CONTEXT MENU ─────────────────────────────────────────────────────
let _lastCtxTarget = null;

function showCtxMenu(e) {
  e.preventDefault();
  _lastCtxTarget = e.currentTarget;
  const menu = document.getElementById('ctxMenu');
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  menu.classList.add('show');
}

function ctxAction(action) {
  const label = _lastCtxTarget?.querySelector('.label')?.textContent || '';
  const actions = {
    open: () => showToast(`📂 فتح: ${label}`),
    rename: () => showToast(`✏️ إعادة تسمية: ${label}`, 'info'),
    copy: () => {
      navigator.clipboard?.writeText(`/src/${label}`);
      showToast('📋 تم نسخ المسار');
    },
    delete: () => showToast(`🗑 حذف: ${label}`, 'error'),
  };
  actions[action]?.();
  document.getElementById('ctxMenu').classList.remove('show');
}

document.addEventListener('click', () => {
  document.getElementById('ctxMenu')?.classList.remove('show');
});

// ── TABS ──────────────────────────────────────────────────────────────
const tabsState = {};

function openTab(fileName, icon = '📄') {
  const bar = document.getElementById('tabsBar');

  if (document.querySelector(`[data-file="${fileName}"]`)) {
    switchTab(document.querySelector(`[data-file="${fileName}"]`));
    return;
  }

  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.file = fileName;
  tab.innerHTML = `<span class="tab-icon">${icon}</span>${fileName}<span class="tab-close" onclick="closeTab(event,this)">✕</span>`;
  tab.onclick = () => switchTab(tab);
  bar.appendChild(tab);

  switchTab(tab);
  showToast(`فتح ${fileName}`, 'info');
}

function switchTab(tabEl) {
  document
    .querySelectorAll('.tab')
    .forEach((t) => t.classList.remove('active'));
  tabEl.classList.add('active');

  document
    .querySelectorAll('.tree-item')
    .forEach((t) => t.classList.remove('selected'));
  const match = [...document.querySelectorAll('.tree-item .label')].find(
    (l) => l.textContent === tabEl.dataset.file,
  );
  match?.closest('.tree-item')?.classList.add('selected');
}

function closeTab(e, closeBtn) {
  e.stopPropagation();
  const tab = closeBtn.closest('.tab');
  const wasActive = tab.classList.contains('active');
  tab.remove();

  if (wasActive) {
    const remaining = document.querySelector('.tab');
    if (remaining) switchTab(remaining);
  }
}

// ── SIDEBAR ──────────────────────────────────────────────────────────
function toggleSidebar(btn) {
  const sidebar = document.getElementById('sidebar');
  const isOpen = sidebar.style.width !== '0px' && sidebar.style.width !== '';
  sidebar.style.width = isOpen ? '0' : 'var(--sidebar-w)';
  sidebar.style.overflow = isOpen ? 'hidden' : '';
  btn.classList.toggle('active', !isOpen);
}

function actClick(btn) {
  document
    .querySelectorAll('.act-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(`${btn.title || 'Panel'} — قريبًا`, 'info');
}

// ── FOLDER TOGGLE ────────────────────────────────────────────────────
function toggleFolder(el) {
  const caret = el.querySelector('.caret');
  const isOpen = caret.textContent === '▼';
  caret.textContent = isOpen ? '▶' : '▼';
  el.querySelector('.icon').textContent = isOpen ? '📁' : '📂';

  let next = el.nextElementSibling;
  while (next && next.classList.contains('tree-indent-2')) {
    next.style.display = isOpen ? 'none' : '';
    next = next.nextElementSibling;
  }
}

// ── TERMINAL ────────────────────────────────────────────────────────
function toggleTerminal() {
  const panel = document.getElementById('terminalPanel');
  panel.style.display = panel.style.display === 'none' ? '' : 'none';
}

function switchTermTab(el) {
  document
    .querySelectorAll('.term-tab')
    .forEach((t) => t.classList.remove('active'));
  el.classList.add('active');
}

function addTerminalLine(html, type = '') {
  const body = document.getElementById('terminalBody');
  const div = document.createElement('div');
  div.innerHTML = type
    ? `<span class="t-${type}">[${type}]</span> ${html}`
    : html;
  const cursor = body.querySelector('.t-cursor')?.parentElement;
  body.insertBefore(div, cursor || null);
  body.scrollTop = body.scrollHeight;
}

function clearTerminal() {
  const body = document.getElementById('terminalBody');
  body.innerHTML = '<div><span class="t-cursor"></span></div>';
  showToast('Terminal cleared', 'info');
}

function newTerminalLine() {
  addTerminalLine('$ ', '');
}

// ── STATUS BAR ───────────────────────────────────────────────────────
function updateCursor(ln, col) {
  const el = document.getElementById('sbCursor');
  if (el) el.textContent = `Ln ${ln}, Col ${col}`;
}

function codeClick(e) {
  const lines = document.querySelectorAll('.code-line');
  const lineEl = e.target.closest('.code-line');
  if (!lineEl) return;
  const ln = [...lines].indexOf(lineEl) + 1;
  updateCursor(ln, 1);
}

// ── NAV ──────────────────────────────────────────────────────────────
function navClick(e, el) {
  e.preventDefault();
  document
    .querySelectorAll('.nav a')
    .forEach((a) => a.classList.remove('active'));
  el.classList.add('active');
  showToast(`${el.textContent} — قريبًا`, 'info');
}

// ── COLLABORATION ────────────────────────────────────────────────────
function messageUser(name) {
  showToast(`💬 رسالة إلى ${name} — قريبًا`, 'info');
}

function inviteTeam() {
  const link = `${location.origin}/invite/${Math.random().toString(36).slice(2, 8)}`;
  navigator.clipboard?.writeText(link);
  showToast('🔗 تم نسخ رابط الدعوة!');
}

// ── RIGHT PANEL ──────────────────────────────────────────────────────
function lintingToggled(el) {
  showToast(`Auto-linting: ${el.checked ? 'مفعّل' : 'معطّل'}`, 'info');
}

function interpreterChanged(el) {
  showToast(`Interpreter: ${el.value}`, 'info');
  const langMap = {
    'Python 3.11.2 64-bit': 'python',
    'Python 3.10.0 64-bit': 'python',
    'Node.js 18 LTS': 'javascript',
  };
  window._currentLang = langMap[el.value] || 'python';
}

setInterval(() => {
  const status = document.querySelector('.collab-status.editing');
  if (!status) return;
  const files = ['main.py', 'utils.py', 'requirements.txt'];
  status.textContent = `Editing ${files[Math.floor(Math.random() * files.length)]}`;
}, 5000);
