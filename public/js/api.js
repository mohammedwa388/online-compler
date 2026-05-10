// ════════════════════════════════════════════════════════════════════
//  js/api.js
//  ملف واحد فيه كل التعامل مع الـ backend
//  أي ملف تاني محتاج يكلم السيرفر → بيستخدم الـ functions هنا
// ════════════════════════════════════════════════════════════════════

// ── Helper: بناء الـ headers ─────────────────────────────────────────
// بيجيب الـ JWT token من localStorage ويحطه في كل request تلقائيًا
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Helper: Fetch wrapper ─────────────────────────────────────────────
// بدل ما نكرر try/catch في كل مكان، هنستخدم الـ function دي
async function apiFetch(url, options = {}) {
  const res  = await fetch(url, { headers: getAuthHeaders(), ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Server error');
  return data;
}

// ════════════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════════════

// تسجيل دخول — بيرجع { token, data: { user } }
async function apiLogin(email, password) {
  return apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// تسجيل حساب جديد
async function apiRegister(name, email, password) {
  return apiFetch('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// ════════════════════════════════════════════════════════════════════
//  EDITOR
// ════════════════════════════════════════════════════════════════════

// تشغيل الكود — بيبعت { code, language } وبيرجع { output }
async function apiRunCode(code, language) {
  return apiFetch('/api/v1/editor/run', {
    method: 'POST',
    body: JSON.stringify({ code, language }),
  });
}

// جيب اللغات المدعومة من السيرفر
async function apiGetLanguages() {
  return apiFetch('/api/v1/editor/languages');
}
