// ════════════════════════════════════════════════════════════════════
//  js/editor.js  — v2
//  الـ editor بقى textarea حقيقي + syntax highlighting فوقه
// ════════════════════════════════════════════════════════════════════

// ── Default code per language ─────────────────────────────────────────
const DEFAULT_CODE = {
  python: `# Python — DevFlow IDE
def greet(name):
    return f"Hello, {name}!"

print(greet("DevFlow"))
print("Sum:", 3 + 4)
`,
  javascript: `// JavaScript — DevFlow IDE
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("DevFlow"));
console.log("Sum:", 3 + 4);
`,
  typescript: `// TypeScript — DevFlow IDE
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("DevFlow"));
`,
  ruby: `# Ruby — DevFlow IDE
def greet(name)
  "Hello, #{name}!"
end

puts greet("DevFlow")
puts "Sum: #{3 + 4}"
`,
};

// ── State ─────────────────────────────────────────────────────────────
window._currentLang = 'python';
const _savedCode    = { ...DEFAULT_CODE }; // بنخزن كود كل لغة لو اليوزر اتنقل

// ════════════════════════════════════════════════════════════════════
//  INIT EDITOR — بيبني الـ editor structure في الـ DOM
// ════════════════════════════════════════════════════════════════════
function initEditor() {
  const container = document.getElementById('codeView');
  if (!container) return;

  // ── بناء الـ structure ────────────────────────────────────────────
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.padding  = '0';
  container.innerHTML = `
    <div class="editor-inner" style="
      display: flex;
      width: 100%;
      height: 100%;
      overflow: auto;
      position: relative;
    ">
      <!-- Line numbers -->
      <div id="lineNumbers" style="
        min-width: 48px;
        padding: 14px 10px 14px 14px;
        background: rgba(0,0,0,0.2);
        color: #475569;
        font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        font-size: 13.5px;
        line-height: 1.65;
        text-align: right;
        user-select: none;
        border-right: 1px solid rgba(255,255,255,0.06);
        flex-shrink: 0;
        white-space: pre;
      "></div>

      <!-- Wrapper: textarea + highlight overlay في نفس المكان -->
      <div style="position: relative; flex: 1; overflow: hidden;">

        <!-- Highlight layer — فوق الـ textarea بصريًا بس مش بتستقبل clicks -->
        <pre id="highlightLayer" aria-hidden="true" style="
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          margin: 0;
          padding: 14px 16px;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 13.5px;
          line-height: 1.65;
          color: #e2e8f0;
          background: transparent;
          pointer-events: none;
          overflow: hidden;
          white-space: pre;
          word-wrap: normal;
          tab-size: 4;
          border: none;
          outline: none;
          box-sizing: border-box;
        "></pre>

        <!-- Actual editable textarea — transparent text عشان يظهر الـ highlight تحته -->
        <textarea id="codeTextarea" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" style="
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 14px 16px;
          font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          font-size: 13.5px;
          line-height: 1.65;
          color: transparent;
          caret-color: #e2e8f0;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          overflow: hidden;
          white-space: pre;
          word-wrap: normal;
          tab-size: 4;
          box-sizing: border-box;
          z-index: 1;
        "></textarea>
      </div>
    </div>
  `;

  const textarea = document.getElementById('codeTextarea');

  // ── Event Listeners ───────────────────────────────────────────────

  // كل ما اليوزر يكتب → update highlight + line numbers
  textarea.addEventListener('input', () => {
    syncHighlight();
    syncLineNumbers();
    syncScroll();
    markUnsaved();
  });

  // Tab key → إدخال 4 spaces بدل ما يخرج من الـ textarea
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end   = textarea.selectionEnd;
      const val   = textarea.value;
      textarea.value = val.slice(0, start) + '    ' + val.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
      syncHighlight();
      syncLineNumbers();
      markUnsaved();
    }

    // Ctrl+S → save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }

    // Enter → auto-indent
    if (e.key === 'Enter') {
      e.preventDefault();
      const start   = textarea.selectionStart;
      const lines   = textarea.value.slice(0, start).split('\n');
      const curLine = lines[lines.length - 1];
      const indent  = curLine.match(/^(\s*)/)[1];
      // extra indent بعد : أو { أو (
      const extra   = /[:{\(]\s*$/.test(curLine.trimEnd()) ? '    ' : '';
      const insert  = '\n' + indent + extra;
      const val     = textarea.value;
      textarea.value = val.slice(0, start) + insert + val.slice(textarea.selectionEnd);
      textarea.selectionStart = textarea.selectionEnd = start + insert.length;
      syncHighlight();
      syncLineNumbers();
      syncScroll();
      markUnsaved();
    }
  });

  // مزامنة الـ scroll بين الـ textarea والـ highlight
  textarea.addEventListener('scroll', syncScroll);

  // تحديث cursor position في الـ status bar
  textarea.addEventListener('click',   updateCursorPos);
  textarea.addEventListener('keyup',   updateCursorPos);
  textarea.addEventListener('selectionchange', updateCursorPos);

  // ── Load initial code ─────────────────────────────────────────────
  textarea.value = DEFAULT_CODE.python;
  syncHighlight();
  syncLineNumbers();
  textarea.focus();
}

// ── syncHighlight — يطبق الـ syntax highlighting على الـ pre layer ──
function syncHighlight() {
  const textarea = document.getElementById('codeTextarea');
  const layer    = document.getElementById('highlightLayer');
  if (!textarea || !layer) return;
  // trailing newline trick عشان الـ pre يمتد للسطر الأخير
  layer.innerHTML = highlight(textarea.value, window._currentLang) + '\n';
}

// ── syncLineNumbers ────────────────────────────────────────────────
function syncLineNumbers() {
  const textarea = document.getElementById('codeTextarea');
  const lnDiv    = document.getElementById('lineNumbers');
  if (!textarea || !lnDiv) return;
  const count = textarea.value.split('\n').length;
  lnDiv.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
}

// ── syncScroll — ربط الـ scroll بين الـ textarea والـ layers ─────────
function syncScroll() {
  const textarea = document.getElementById('codeTextarea');
  const layer    = document.getElementById('highlightLayer');
  const lnDiv    = document.getElementById('lineNumbers');
  if (!textarea) return;
  if (layer)  { layer.scrollTop  = textarea.scrollTop;  layer.scrollLeft  = textarea.scrollLeft; }
  if (lnDiv)  lnDiv.scrollTop    = textarea.scrollTop;
}

// ── updateCursorPos — تحديث Ln/Col في status bar ────────────────────
function updateCursorPos() {
  const textarea = document.getElementById('codeTextarea');
  if (!textarea) return;
  const before = textarea.value.slice(0, textarea.selectionStart);
  const lines  = before.split('\n');
  const ln     = lines.length;
  const col    = lines[lines.length - 1].length + 1;
  const el     = document.getElementById('sbCursor');
  if (el) el.textContent = `Ln ${ln}, Col ${col}`;
}

// ── markUnsaved — يحط * في branch name ──────────────────────────────
function markUnsaved() {
  const el = document.getElementById('sbBranch');
  if (el && !el.textContent.includes('*')) el.textContent += '*';
}

// ════════════════════════════════════════════════════════════════════
//  SYNTAX HIGHLIGHTING — Token-based (never breaks on < > & )
//  الفكرة: بنقسم الكود لـ tokens الأول، بعدين نعمل escape لكل token
//  ده بيمنع أي تداخل بين الـ HTML escape والـ regex rules
// ════════════════════════════════════════════════════════════════════

// ── escape safe helper ────────────────────────────────────────────
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── span wrapper ─────────────────────────────────────────────────
function span(color, text, extra = '') {
  return `<span style="color:${color}${extra}">${esc(text)}</span>`;
}

// ── Token patterns per language ───────────────────────────────────
const TOKENS = {
  python: [
    // comments
    { re: /(#[^\n]*)/,          fn: m => span('#475569', m[1], ';font-style:italic') },
    // triple-quoted strings
    { re: /("""[\s\S]*?"""|'''[\s\S]*?''')/, fn: m => span('#6ee7b7', m[1]) },
    // strings
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, fn: m => span('#6ee7b7', m[1]) },
    // keywords
    { re: /\b(import|from|def|class|return|if|elif|else|for|while|with|as|try|except|finally|pass|raise|yield|True|False|None|in|not|and|or|lambda|del|global|nonlocal|assert|break|continue)\b/, fn: m => span('#818cf8', m[1], ';font-weight:600') },
    // builtins
    { re: /\b(print|len|range|int|str|float|list|dict|set|tuple|type|isinstance|input|open|enumerate|zip|map|filter|sorted|reversed|sum|min|max|abs|round|repr|format|hasattr|getattr|setattr)\b/, fn: m => span('#fde047', m[1]) },
    // numbers
    { re: /\b(\d+\.?\d*)\b/, fn: m => span('#f59e0b', m[1]) },
    // uppercase (classes/constants)
    { re: /\b([A-Z][a-zA-Z0-9_]*)\b/, fn: m => span('#67e8f9', m[1]) },
  ],

  javascript: [
    // single-line comment
    { re: /(\/\/[^\n]*)/, fn: m => span('#475569', m[1], ';font-style:italic') },
    // multi-line comment
    { re: /(\/\*[\s\S]*?\*\/)/, fn: m => span('#475569', m[1], ';font-style:italic') },
    // template literals
    { re: /(`(?:[^`\\]|\\.)*`)/, fn: m => span('#6ee7b7', m[1]) },
    // strings
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, fn: m => span('#6ee7b7', m[1]) },
    // keywords
    { re: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|import|export|default|async|await|try|catch|finally|throw|typeof|instanceof|of|in|delete|void)\b/, fn: m => span('#818cf8', m[1], ';font-weight:600') },
    // builtins
    { re: /\b(console|Math|JSON|Object|Array|String|Number|Boolean|Promise|Date|Error|Map|Set|parseInt|parseFloat|setTimeout|clearTimeout|setInterval|clearInterval|fetch|document|window)\b/, fn: m => span('#fde047', m[1]) },
    // literals
    { re: /\b(true|false|null|undefined|NaN|Infinity)\b/, fn: m => span('#f87171', m[1]) },
    // numbers
    { re: /\b(\d+\.?\d*)\b/, fn: m => span('#f59e0b', m[1]) },
  ],

  typescript: [
    { re: /(\/\/[^\n]*)/, fn: m => span('#475569', m[1], ';font-style:italic') },
    { re: /(\/\*[\s\S]*?\*\/)/, fn: m => span('#475569', m[1], ';font-style:italic') },
    { re: /(`(?:[^`\\]|\\.)*`)/, fn: m => span('#6ee7b7', m[1]) },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, fn: m => span('#6ee7b7', m[1]) },
    { re: /\b(const|let|var|function|return|if|else|for|while|class|extends|new|this|import|export|default|async|await|try|catch|throw|interface|type|enum|implements|abstract|readonly|public|private|protected|declare|namespace|as|from|of|in)\b/, fn: m => span('#818cf8', m[1], ';font-weight:600') },
    { re: /\b(string|number|boolean|void|any|never|unknown|object|symbol|bigint)\b/, fn: m => span('#67e8f9', m[1]) },
    { re: /\b(true|false|null|undefined)\b/, fn: m => span('#f87171', m[1]) },
    { re: /\b(\d+\.?\d*)\b/, fn: m => span('#f59e0b', m[1]) },
  ],

  ruby: [
    { re: /(#[^\n]*)/, fn: m => span('#475569', m[1], ';font-style:italic') },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, fn: m => span('#6ee7b7', m[1]) },
    { re: /\b(def|end|class|module|if|elsif|else|unless|while|until|do|begin|rescue|ensure|for|return|yield|include|extend|require|puts|print|raise|true|false|nil|and|or|not|then|case|when|break|next|super|self)\b/, fn: m => span('#818cf8', m[1], ';font-weight:600') },
    { re: /\b(\d+\.?\d*)\b/, fn: m => span('#f59e0b', m[1]) },
    { re: /(:[a-zA-Z_]\w*)/, fn: m => span('#f472b6', m[1]) },
  ],
};

// ── Tokenizer — الدالة الرئيسية ──────────────────────────────────
// بتمشي على الكود character by character وبتحدد كل token
function highlight(code, lang) {
  const rules = TOKENS[lang] || TOKENS.javascript;
  let result  = '';
  let pos     = 0;

  while (pos < code.length) {
    let matched = false;

    for (const rule of rules) {
      // نطبق الـ regex من الـ position الحالية
      const slice = code.slice(pos);
      const m     = slice.match(rule.re);

      if (m && m.index === 0) {
        // الـ match في بداية الـ slice بالظبط
        result  += rule.fn(m);
        pos     += m[0].length;
        matched  = true;
        break;
      }
    }

    if (!matched) {
      // مش token معروف → escape الحرف وكمّل
      result += esc(code[pos]);
      pos++;
    }
  }

  return result;
}

// ════════════════════════════════════════════════════════════════════
//  GET EDITOR CODE — بيجيب الكود من الـ textarea
// ════════════════════════════════════════════════════════════════════
function getEditorCode() {
  const ta = document.getElementById('codeTextarea');
  return ta ? ta.value : '';
}

// ════════════════════════════════════════════════════════════════════
//  RUN CODE ▶
// ════════════════════════════════════════════════════════════════════
async function runCode() {
  const btn  = document.getElementById('runBtn');
  const code = getEditorCode().trim();
  const lang = window._currentLang || 'python';

  if (!code) {
    showToast('الـ editor فاضي! اكتب كود الأول.', 'error');
    return;
  }

  btn.textContent = '⏳ Running...';
  btn.disabled    = true;

  addTerminalLine(`$ run <strong>${lang}</strong>`, 'info');

  const startTime = Date.now();

  try {
    const result  = await apiRunCode(code, lang);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.status === 'success') {
      addTerminalLine(`<span class="t-success">✓ Finished in ${elapsed}s</span>`);
      result.output.split('\n').forEach(line => {
        if (line.trim()) addTerminalLine(`<span class="t-arrow">→</span> ${escHtml(line)}`);
      });
      document.getElementById('sbErrors').textContent = '⊗ 0';
      showToast(`✓ Done in ${elapsed}s`);
    } else {
      addTerminalLine(`<span style="color:#f87171">✗ Runtime Error:</span>`);
      result.output.split('\n').forEach(line => {
        if (line.trim()) addTerminalLine(`<span style="color:#f87171">${escHtml(line)}</span>`);
      });
      document.getElementById('sbErrors').textContent = '⊗ 1';
      showToast('خطأ في الكود', 'error');
    }

  } catch (err) {
    addTerminalLine(`<span style="color:#f87171">✗ ${escHtml(err.message)}</span>`);
    showToast(err.message || 'فشل الاتصال بالسيرفر', 'error');
    if (err.message?.toLowerCase().includes('login') || err.message?.includes('دخول')) {
      setTimeout(() => (location.href = '/login.html'), 1500);
    }
  } finally {
    btn.textContent = '▶ Run';
    btn.disabled    = false;
  }
}

// ════════════════════════════════════════════════════════════════════
//  SAVE FILE — Ctrl+S أو زرار الـ Save
// ════════════════════════════════════════════════════════════════════
function saveFile() {
  const code     = getEditorCode();
  const lang     = window._currentLang;
  _savedCode[lang] = code;

  const branch = document.getElementById('sbBranch');
  if (branch) branch.textContent = '⑂ main';

  showToast('💾 Saved');
}

// ════════════════════════════════════════════════════════════════════
//  LANGUAGE CHANGE
// ════════════════════════════════════════════════════════════════════
function changeLanguage(newLang) {
  // احفظ الكود الحالي للغة القديمة
  _savedCode[window._currentLang] = getEditorCode();

  // غيّر اللغة
  window._currentLang = newLang;

  // حمّل كود اللغة الجديدة (المحفوظ أو الـ default)
  const ta = document.getElementById('codeTextarea');
  if (ta) {
    ta.value = _savedCode[newLang] || DEFAULT_CODE[newLang] || '';
    syncHighlight();
    syncLineNumbers();
    ta.focus();
  }

  showToast(`Language: ${newLang}`, 'info');
}

// ════════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════════
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// codeClick — مش محتاجه بقى لأن الـ textarea بتعمله تلقائيًا
function codeClick() {}

// ════════════════════════════════════════════════════════════════════
//  INIT — DOMContentLoaded
// ════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {

  // 1) بناء الـ editor
  initEditor();

  // 2) بيانات اليوزر من localStorage
  const user   = JSON.parse(localStorage.getItem('user') || '{}');
  const avatar = document.querySelector('.avatar');
  if (avatar && user.name) {
    avatar.textContent = user.name.slice(0, 2).toUpperCase();
    avatar.title       = user.name;
    avatar.onclick     = () => showToast(`👤 ${user.name}`, 'info');
  }

  // 3) تحميل اللغات من السيرفر
  try {
    const { data } = await apiGetLanguages();
    const select   = document.querySelector('.setting-select');
    if (select && data?.languages) {
      select.innerHTML = data.languages.map(l =>
        `<option value="${l.id}">${l.label} (${l.ext})</option>`
      ).join('');
    }
  } catch {
    // السيرفر offline → نكمل بالـ defaults
  }

  // 4) ربط الـ language select
  const select = document.querySelector('.setting-select');
  if (select) {
    select.value = 'python';
    select.addEventListener('change', () => changeLanguage(select.value));
  }
});
