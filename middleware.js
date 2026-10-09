/*
 * Vercel Routing Middleware: password gate for the whole prototype.
 *
 * Set SITE_PASSWORD in the Vercel project (Settings > Environment Variables).
 * The password never ships to the browser. A correct entry sets a signed,
 * HttpOnly cookie valid for 12 hours. Changing SITE_PASSWORD signs everyone out.
 *
 * Runs on the Edge runtime, so it uses Web Crypto and no Node APIs.
 */
export const config = { matcher: "/((?!_vercel).*)" };

const COOKIE = "vb_session";
const SESSION_S = 12 * 60 * 60;
const enc = new TextEncoder();

// Only these paths are ever served after login; everything else is a 404.
const ALLOWED = [/^\/$/, /^\/index\.html$/, /^\/styles\.css$/, /^\/app\.js$/, /^\/data\.js$/, /^\/assets\/[\w.-]+\.(svg|png)$/];
// Visible without logging in, so the login page can show the brand.
const PUBLIC = [/^\/assets\/(logo-light\.svg|favicon-32x32\.png|apple-touch-icon\.png)$/];

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
async function sha256(s) { return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s))); }
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}
async function hmac(password, msg) {
  const key = await crypto.subtle.importKey("raw", await sha256("vb-session:" + password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
async function makeToken(password) {
  const exp = Date.now() + SESSION_S * 1000;
  return exp + "." + (await hmac(password, String(exp)));
}
async function tokenOk(password, token) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = await hmac(password, exp);
  return safeEqual(enc.encode(sig), enc.encode(good));
}
function getCookie(request, name) {
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return "";
}
const cookieHeader = (value, maxAge) => `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
const html = (body, status = 200) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "x-robots-tag": "noindex" } });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function loginPage(error) {
  return `<!doctype html>
<html lang="nl-BE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Toegang · Webshop Vanden Broele</title>
<link rel="icon" href="/assets/favicon-32x32.png">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Jost:wght@600&display=swap" rel="stylesheet">
<style>
:root{--navy:#163E65;--navy-deep:#0E2D4B;--mint:#2BEBCE;--err:#B3261E;--err-soft:#FCE9E7}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--navy);color:#fff;font:400 14px/1.5 Inter,system-ui,sans-serif}
main{width:100%;max-width:400px}
img{height:32px;display:block;margin-bottom:28px}
h1{font:600 28px/1.15 Jost,"Century Gothic",sans-serif;margin:0 0 8px}
p{margin:0 0 20px;color:#C5D4E3}
label{display:block;font-weight:600;margin-bottom:6px}
input{width:100%;height:52px;border-radius:8px;border:1px solid transparent;padding:0 16px;font-size:16px;background:#fff;color:#000}
input:focus-visible{outline:3px solid var(--mint);outline-offset:1px}
button{margin-top:16px;width:100%;height:52px;border:0;border-radius:999px;background:var(--mint);color:#0B2A45;font:600 15px Inter,sans-serif;cursor:pointer}
button:hover{background:#5BF1DA}
button:focus-visible{outline:3px solid #fff;outline-offset:2px}
.err{background:var(--err-soft);color:var(--err);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-weight:500}
::selection{background:var(--mint);color:var(--navy-deep)}
</style></head><body><main>
<img src="/assets/logo-light.svg" alt="Vanden Broele">
<h1>Webshop prototype</h1>
<p>Geef het wachtwoord in om verder te gaan.</p>
${error ? `<div class="err" role="alert">${error}</div>` : ""}
<form method="post" action="/login">
<label for="pw">Wachtwoord</label>
<input id="pw" name="password" type="password" autocomplete="current-password" autofocus required>
<button type="submit">Verder</button>
</form></main></body></html>`;
}

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return html(loginPage("De site is nog niet geconfigureerd: SITE_PASSWORD ontbreekt."), 503);

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/logout") {
    return new Response(null, { status: 302, headers: { Location: "/", "Set-Cookie": cookieHeader("", 0) } });
  }

  if (path === "/login" && request.method === "POST") {
    const form = new URLSearchParams(await request.text());
    const given = await sha256(form.get("password") || "");
    if (safeEqual(given, await sha256(password))) {
      return new Response(null, { status: 302, headers: { Location: "/", "Set-Cookie": cookieHeader(await makeToken(password), SESSION_S) } });
    }
    await wait(800); // slows down guessing; the edge has no shared state for a real counter
    return html(loginPage("Dat wachtwoord klopt niet."), 401);
  }

  const passThrough = () => new Response(null, { headers: { "x-middleware-next": "1" } });
  if (PUBLIC.some((r) => r.test(path))) return passThrough();
  if (!(await tokenOk(password, getCookie(request, COOKIE)))) return html(loginPage(""), 401);
  if (!ALLOWED.some((r) => r.test(path))) return html("Niet gevonden", 404);
  return passThrough();
}
