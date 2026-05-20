// ============================================================
// 1. TOAST NOTIFICATION SYSTEM
// ============================================================

let toastTimer = null;

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'notif-toast ' + type + ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================
// 2. RUN BUTTON - محاكاة تشغيل الكود
// ============================================================
function runCode() {
  const btn = document.getElementById('runBtn');
  const terminal = document.getElementById('terminalBody');

  btn.textContent = '⏹ Stop';
  btn.style.background = 'var(--red)';

  addTerminalLine('<span class="t-info">[run]</span> Starting server...');

  setTimeout(() => {
    addTerminalLine(
      '<span class="t-arrow">→</span> <span class="t-success">Server started on localhost:8000</span>',
    );
    showToast('✅ Code running on localhost:8000', 'success');
  }, 800);

  setTimeout(() => {
    btn.textContent = '▶ Run';
    btn.style.background = '';
    addTerminalLine('<span class="t-info">[info]</span> Ready.');
    addTerminalLine('<span class="t-cursor"></span>');
  }, 2500);
}

// ============================================================
// 3. TERMINAL FUNCTIONS
// ============================================================
function addTerminalLine(html) {
  const body = document.getElementById('terminalBody');
  const cursor = body.querySelector('.t-cursor');
  if (cursor) cursor.parentElement.remove();
  const div = document.createElement('div');
  div.innerHTML = html;
  body.appendChild(div);

  const cur = document.createElement('div');
  cur.innerHTML = '<span class="t-cursor"></span>';
  body.appendChild(cur);

  body.scrollTop = body.scrollHeight;
}

function clearTerminal() {
  const body = document.getElementById('terminalBody');
  body.innerHTML = '<div><span class="t-cursor"></span></div>';
  showToast('Terminal cleared', 'info');
}

function newTerminalLine() {
  addTerminalLine('<span style="color:var(--muted)">$ </span>');
  showToast('New terminal session', 'info');
}

function toggleTerminal() {
  const panel = document.getElementById('terminalPanel');
  panel.classList.toggle('collapsed');
}

function switchTermTab(el) {
  document
    .querySelectorAll('.term-tab')
    .forEach((t) => t.classList.remove('active'));
  el.classList.add('active');
}

function switchTab(tab) {
  document
    .querySelectorAll('.tab')
    .forEach((t) => t.classList.remove('active'));
  tab.classList.add('active');

  const file = tab.dataset.file;
  document.querySelectorAll('.tree-item').forEach((item) => {
    item.classList.remove('selected');
    if (item.querySelector('.label')?.textContent === file) {
      item.classList.add('selected');
    }
  });

  updateCursor(1, 1);
}

function openTab(name, icon) {
  const existing = [...document.querySelectorAll('.tab')].find(
    (t) => t.dataset.file === name,
  );
  if (existing) {
    switchTab(existing);
    return;
  }

  // إنشاء تاب جديد
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.file = name;
  tab.innerHTML = `<span class="tab-icon">${icon}</span>${name}<span class="tab-close" onclick="closeTab(event,this)">✕</span>`;
  tab.addEventListener('click', () => switchTab(tab));
  document.getElementById('tabsBar').appendChild(tab);
  switchTab(tab);
  showToast(`Opened: ${name}`, 'info');
}

function closeTab(e, closeBtn) {
  e.stopPropagation();
  const tab = closeBtn.closest('.tab');
  const wasActive = tab.classList.contains('active');
  tab.remove();

  if (wasActive) {
    const remaining = document.querySelectorAll('.tab');
    if (remaining.length > 0) switchTab(remaining[remaining.length - 1]);
  }
}

function toggleFolder(item) {
  const caret = item.querySelector('.caret');
  const label = item.querySelector('.label').textContent;
  const isOpen = caret.textContent === '▼';

  caret.textContent = isOpen ? '▶' : '▼';
  item.querySelector('.icon').textContent = isOpen ? '📁' : '📂';

  showToast(`${isOpen ? 'Collapsed' : 'Expanded'}: ${label}`, 'info');
}

// ============================================================
// 6. SIDEBAR TOGGLE
// ============================================================
function toggleSidebar(actBtn) {
  const sidebar = document.getElementById('sidebar');
  const isCollapsed = sidebar.classList.toggle('collapsed');
  actBtn.classList.toggle('active', !isCollapsed);
}

function actClick(btn) {
  document
    .querySelectorAll('.act-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(btn.title + ' panel', 'info');
}

// ============================================================
// 7. NAVIGATION
// ============================================================
function navClick(e, link) {
  e.preventDefault();
  document
    .querySelectorAll('.nav a')
    .forEach((a) => a.classList.remove('active'));
  link.classList.add('active');
  showToast('Navigate to: ' + link.textContent, 'info');
}

// ============================================================
// 8. SAVE
// ============================================================
function saveFile() {
  const activeTab = document.querySelector('.tab.active');
  const file = activeTab?.dataset.file || 'file';
  showToast(`💾 Saved: ${file}`, 'success');
  // إضافة نجمة للإشارة لحفظ ناجح
  document.getElementById('sbBranch').textContent = '⑂ main';
  setTimeout(() => {
    document.getElementById('sbBranch').textContent = '⑂ main*';
  }, 2000);
}

// ============================================================
// 9. SETTINGS - Interpreter & Linting
// ============================================================
function interpreterChanged(select) {
  showToast('Interpreter: ' + select.value, 'info');
}

function lintingToggled(checkbox) {
  showToast(
    'Auto-linting: ' + (checkbox.checked ? 'ON ✅' : 'OFF ❌'),
    checkbox.checked ? 'success' : 'error',
  );
}

// ============================================================
// 10. COLLABORATION
// ============================================================
function messageUser(name) {
  showToast(`💬 Messaging ${name}...`, 'info');
}

function inviteTeam() {
  const email = prompt('Enter email to invite:');
  if (email) showToast(`📨 Invite sent to: ${email}`, 'success');
}

// ============================================================
// 11. CURSOR POSITION in STATUS BAR
// ============================================================
function updateCursor(ln, col) {
  document.getElementById('sbCursor').textContent = `Ln ${ln}, Col ${col}`;
}

function codeClick(e) {
  const line = e.target.closest('.code-line');
  if (!line) return;
  const lines = [...document.querySelectorAll('.code-line')];
  const ln = lines.indexOf(line) + 1;
  updateCursor(ln, 1);
}

// ============================================================
// 12. RIGHT-CLICK CONTEXT MENU
// ============================================================
let ctxTarget = null;

function showCtxMenu(e) {
  e.preventDefault();
  ctxTarget = e.target.closest('.tree-item');
  const menu = document.getElementById('ctxMenu');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.classList.add('show');
}

function ctxAction(action) {
  const label = ctxTarget?.querySelector('.label')?.textContent || 'item';
  const msgs = {
    open: `📂 Opening: ${label}`,
    rename: `✏️ Rename: ${label}`,
    copy: `📋 Path copied: /src/${label}`,
    delete: `🗑 Deleted: ${label}`,
  };
  showToast(msgs[action], action === 'delete' ? 'error' : 'info');
  document.getElementById('ctxMenu').classList.remove('show');
}

// إغلاق القائمة عند الضغط في أي مكان
document.addEventListener('click', () => {
  document.getElementById('ctxMenu').classList.remove('show');
});

// ============================================================
// 13. KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 's') {
      e.preventDefault();
      saveFile();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
    if (e.key === 'b') {
      e.preventDefault();
      toggleSidebar(document.querySelector('.act-btn'));
    }
  }
});

// ============================================================
// 14. SIMULATED LIVE COLLABORATION (typing indicator)
// ============================================================
const statuses = ['Editing main.py', 'Viewing line 8', 'Typing...', 'Idle'];
let statusIdx = 0;
setInterval(() => {
  statusIdx = (statusIdx + 1) % statuses.length;
  const el = document.querySelector('.collab-status.editing');
  if (el) el.textContent = statuses[statusIdx];
}, 4000);

fetch('/api/health')
  .then((res) => res.json())
  .then((data) => console.log(data));
