// Cloudflare Worker for COMMUNE password gate
// This worker controls access to the main site by requiring a password.
// The password itself is stored in a secret environment variable (LOCK_PASSWORD).
// The worker checks requests: if the user is authenticated via a signed cookie,
// it proxies to the GitHub Pages origin; otherwise it serves the locked page
// and intercepts POST requests to /api/login.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isHtml = (request.headers.get('Accept') || '').includes('text/html');
    const cookie  = parseCookie(request.headers.get('Cookie') || '');
    const token   = cookie['commune_auth'] || '';

    // Handle login POST at /api/login
    if (url.pathname === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    // If authorized, proxy everything to GitHub Pages origin
    if (await isAuthorized(token, env)) {
      return proxyToOrigin(request, env);
    }

    // Not authorized: if HTML, serve locked page; else proxy assets for locked page
    if (isHtml && request.method === 'GET') {
      const lockedUrl = new URL(request.url);
      lockedUrl.hostname = env.ORIGIN_HOST;
      lockedUrl.pathname = '/locked.html';
      return fetch(lockedUrl.toString(), { headers: passthroughHeaders(request.headers) });
    }
    return proxyToOrigin(request, env);
  }
};

/* Utility functions */
function parseCookie(cookie) {
  const out = {};
  cookie.split(/;\s*/).forEach(part => {
    const idx = part.indexOf('=');
    if (idx > -1) out[decodeURIComponent(part.slice(0, idx))] = decodeURIComponent(part.slice(idx + 1));
  });
  return out;
}
function passthroughHeaders(h) {
  const headers = new Headers(h);
  headers.delete('Host');
  return headers;
}
async function proxyToOrigin(request, env) {
  const url = new URL(request.url);
  url.hostname = env.ORIGIN_HOST;
  return fetch(url.toString(), {
    method: request.method,
    headers: passthroughHeaders(request.headers),
    redirect: 'follow',
    body: (request.method === 'GET' || request.method === 'HEAD') ? undefined : request.body
  });
}
async function handleLogin(request, env) {
  try {
    const { password } = await request.json();
    const secret = env.LOCK_PASSWORD || '';
    const ok     = await safeEqual(password || '', secret);
    if (!ok) return json({ ok: false });

    // Signed cookie: expiry payload + signature
    const ttlSeconds = 60 * 60 * 24 * 7; // 7 days
    const exp  = Math.floor(Date.now() / 1000) + ttlSeconds;
    const payload = String(exp);
    const sig = await hmacHex(payload, env.SIGNING_KEY || '');
    const value = `${exp}.${sig}`;

    const headers = new Headers({
      'Set-Cookie': cookieString('commune_auth', value, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        path: '/',
        maxAge: ttlSeconds,
      }),
      'Content-Type': 'application/json'
    });
    return new Response(JSON.stringify({ ok: true, redirect: '/' }), { headers });
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
}
async function isAuthorized(token, env) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [expStr, sig] = parts;
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacHex(expStr, env.SIGNING_KEY || '');
  return timingSafeEqual(sig, expected);
}
async function hmacHex(message, key) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a.charCodeAt(i) || 0;
    const y = b.charCodeAt(i) || 0;
    mismatch |= x ^ y;
  }
  return mismatch === 0;
}
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}
function cookieString(name, value, opts = {}) {
  let s = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${opts.path || '/'}`;
  if (opts.maxAge) s += `; Max-Age=${opts.maxAge}`;
  if (opts.secure) s += '; Secure';
  if (opts.httpOnly) s += '; HttpOnly';
  if (opts.sameSite) s += `; SameSite=${opts.sameSite}`;
  return s;
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}