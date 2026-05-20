const API_BASE = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    headers: getAuthHeaders(),
    ...options,
  });

  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error('Server error: empty response');
    return {};
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned non-JSON: ${text.slice(0, 100)}`);
  }

  if (!res.ok) throw new Error(data.message || 'Server error');
  return data;
}

async function apiLogin(email, password) {
  return apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

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

async function apiGetLanguages() {
  return apiFetch('/api/v1/editor/languages');
}
