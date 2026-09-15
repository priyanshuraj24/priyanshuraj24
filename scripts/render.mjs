#!/usr/bin/env node
// Renders every SVG under assets/. Static cards always; stats.svg only when GH_TOKEN is set.
//   node scripts/render.mjs
//   GH_TOKEN=$(gh auth token) node scripts/render.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");
const LOGIN = "priyanshuraj24";
const OSS_LOGIN = "hicodersofficial";

const icons = JSON.parse(readFileSync(join(ROOT, "scripts/icons.json"), "utf8"));
const b64 = (f) => readFileSync(join(ROOT, "scripts/fonts", f)).toString("base64");
const FONTS = { G: b64("geist.woff2"), GM: b64("geist-mono.woff2") };

const C = {
  bg: "#0A0A0B",
  surface: "#111114",
  line: "#1F1F23",
  line2: "#2A2A30",
  text: "#F2F2F0",
  dim: "#9A9AA2",
  faint: "#5E5E66",
  accent: "#FF5B1F",
  accentSoft: "#FFB08A",
  live: "#B8FF3C",
};
const MONO = 0.6; // Geist Mono advance width, em

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const monoW = (text, size, ls = 0) => text.length * (size * MONO + ls);

function svg(w, h, title, body, { css = "", fonts = ["G", "GM"] } = {}) {
  const faces = fonts
    .map((f) => `@font-face{font-family:${f};src:url(data:font/woff2;base64,${FONTS[f]}) format("woff2");font-weight:100 900}`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>${faces}
.s{font-family:G,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif}
.m{font-family:GM,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre}
.in{animation:in .7s cubic-bezier(.2,.7,.2,1) backwards}
@keyframes in{from{opacity:0;transform:translateY(6px)}}
@keyframes blink{50%{opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>${body}</svg>`;
}

// Rounded dark card with hairline border; `inner` is clipped to the radius.
function card(w, h, inner, r = 20, id = "cl") {
  return `<defs><clipPath id="${id}"><rect width="${w}" height="${h}" rx="${r}"/></clipPath></defs><g clip-path="url(#${id})"><rect width="${w}" height="${h}" fill="${C.bg}"/>${inner}</g><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r - 0.5}" fill="none" stroke="${C.line}"/>`;
}

function icon(name, x, y, size, fill) {
  const i = icons[name];
  if (!i) throw new Error(`missing icon: ${name}`);
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${i.viewBox}"><path d="${i.d}" fill="${fill}"/></svg>`;
}

function tag(x, y, num, label, anchor = "start") {
  return `<text class="m" x="${x}" y="${y}" font-size="13" letter-spacing="2" text-anchor="${anchor}"><tspan fill="${C.accent}">${num}</tspan><tspan fill="${C.faint}"> / </tspan><tspan fill="${C.dim}">${esc(label)}</tspan></text>`;
}

const dotGrid = (id, pitch, r, fill) =>
  `<pattern id="${id}" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse"><circle cx="${pitch / 2}" cy="${pitch / 2}" r="${r}" fill="${fill}"/></pattern>`;

const arrow = (x, y, s, stroke) =>
  `<path d="M${x} ${y + s}L${x + s} ${y}M${x + s * 0.3} ${y}H${x + s}V${y + s * 0.7}" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

// ─── hero ────────────────────────────────────────────────────────────────────
function hero() {
  const W = 1000, H = 420, px = 40;
  const words = [
    "ESG compliance platforms",
    "real-time multiplayer games",
    "Flutter apps for real users",
    "Go & Node.js APIs",
    "self-hosted observability",
    "AI-powered tooling",
  ];
  const size = 21, cw = size * MONO, y = 322;
  const prefix = "$ now shipping ";
  const wx = px + prefix.length * cw;
  const slot = 3.6, total = slot * words.length;
  const p = (s) => `${((s / total) * 100).toFixed(3)}%`;
  const TYPE = 1.1, HOLD = 2.7, ERASE = 3.2;

  let css = `
.orb{animation:drift 14s ease-in-out infinite alternate}
@keyframes drift{0%{transform:translate(0,0)}50%{transform:translate(-160px,90px)}100%{transform:translate(-40px,170px)}}
.spot{transform:translate(780px,170px);animation:roam 20s ease-in-out infinite alternate}
@keyframes roam{0%{transform:translate(780px,150px)}33%{transform:translate(560px,300px)}66%{transform:translate(880px,320px)}100%{transform:translate(640px,110px)}}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2s ease-out infinite}
@keyframes pulse{from{transform:scale(1);opacity:.7}to{transform:scale(3.2);opacity:0}}
.t{transform-box:fill-box;transform-origin:0 0;transform:scaleX(0)}
.cur{animation:cur ${total}s infinite backwards}
`;
  let cur = "";
  words.forEach((w, i) => {
    const n = w.length, s0 = i * slot;
    css += `.t${i}{animation:t${i} ${total}s steps(${n},end) ${s0}s infinite backwards}
@keyframes t${i}{0%{transform:scaleX(0)}${p(TYPE)}{transform:scaleX(1)}${p(HOLD)}{transform:scaleX(1)}${p(ERASE)}{transform:scaleX(0)}100%{transform:scaleX(0)}}
`;
    cur += `${p(s0)}{transform:translateX(0);animation-timing-function:steps(${n},end)}${p(s0 + TYPE)}{transform:translateX(${n * cw}px);animation-timing-function:linear}${p(s0 + HOLD)}{transform:translateX(${n * cw}px);animation-timing-function:steps(${n},end)}${p(s0 + ERASE)}{transform:translateX(0)}`;
  });
  css += `@keyframes cur{${cur}100%{transform:translateX(0)}}
@media (prefers-reduced-motion:reduce){.t0{transform:none}.cur{transform:translateX(${words[0].length * cw}px)}}`;

  const masks = words
    .map((w, i) => `<mask id="mk${i}"><rect class="t t${i}" x="${wx}" y="${y - 24}" width="${w.length * cw + 1}" height="34" fill="#fff"/></mask>`)
    .join("");
  const typed = words
    .map((w, i) => `<text class="m" x="${wx}" y="${y}" font-size="${size}" fill="${C.accent}" mask="url(#mk${i})">${esc(w)}</text>`)
    .join("");

  const pill = "NOW — BUILDING @ EGP TECH";
  const pillW = monoW(pill, 12, 1.5) + 48, pillX = W - px - pillW;

  const body = card(
    W, H,
    `<defs>${dotGrid("d", 22, 1.1, "#232328")}${dotGrid("dh", 22, 1.7, C.accent)}
<radialGradient id="sg"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="sm"><circle class="spot" r="230" fill="url(#sg)"/></mask>
<filter id="bl" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="70"/></filter>
<linearGradient id="ng" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#B9B9C0"/></linearGradient>
${masks}</defs>
<circle class="orb" cx="860" cy="60" r="170" fill="${C.accent}" opacity=".20" filter="url(#bl)"/>
<rect width="${W}" height="${H}" fill="url(#d)"/>
<rect width="${W}" height="${H}" fill="url(#dh)" mask="url(#sm)" opacity=".85"/>

<g class="in"><rect x="${px}" y="41" width="8" height="8" fill="${C.accent}"/>
<text class="m" x="${px + 18}" y="50" font-size="13" letter-spacing="2" fill="${C.dim}">@PRIYANSHURAJ24</text></g>

<g class="in" style="animation-delay:.1s"><rect x="${pillX}" y="28" width="${pillW}" height="32" rx="16" fill="${C.surface}" stroke="${C.line2}"/>
<circle class="pulse" cx="${pillX + 20}" cy="44" r="3.5" fill="${C.live}"/><circle cx="${pillX + 20}" cy="44" r="3.5" fill="${C.live}"/>
<text class="m" x="${pillX + 34}" y="48.5" font-size="12" letter-spacing="1.5" fill="${C.text}">${esc(pill)}</text></g>

<text class="s in" style="animation-delay:.15s" x="${px - 5}" y="206" font-size="112" font-weight="600" letter-spacing="-5.5" fill="url(#ng)">Priyanshu Raj<tspan fill="${C.accent}">.</tspan></text>
<text class="s in" style="animation-delay:.3s" x="${px}" y="256" font-size="25" fill="${C.dim}" letter-spacing="-.3">Full-stack engineer — web, mobile, APIs &amp; infra, end to end.</text>

<g class="in" style="animation-delay:.45s"><text class="m" x="${px}" y="${y}" font-size="${size}"><tspan fill="${C.faint}">$</tspan><tspan fill="${C.text}"> now shipping </tspan></text>
${typed}<rect class="cur" x="${wx + 2}" y="${y - 19}" width="11" height="24" fill="${C.accent}"/></g>

<line x1="${px}" x2="${W - px}" y1="360" y2="360" stroke="${C.line}"/>
<text class="m" x="${px}" y="392" font-size="12" letter-spacing="2" fill="${C.faint}">FULL-STACK · INDIA · ON GITHUB SINCE 2018</text>
<text class="m" x="${W - px}" y="392" font-size="12" letter-spacing="2" fill="${C.faint}" text-anchor="end">TYPESCRIPT <tspan fill="${C.line2}">/</tspan> GO <tspan fill="${C.line2}">/</tspan> DART <tspan fill="${C.line2}">/</tspan> PYTHON</text>`,
    24,
  );
  return svg(W, H, "Priyanshu Raj — full-stack engineer", body, { css });
}

// ─── 01 whoami ───────────────────────────────────────────────────────────────
function whoami() {
  const W = 1000, size = 18, lh = 31, top = 112;
  const k = (t) => [t, C.text], s = (t) => [t, C.accentSoft], pn = (t) => [t, C.faint], kw = (t) => [t, C.accent], n = (t) => [t, "#C9A2FF"];
  const field = (key, ...val) => [pn("  "), k(key), pn(":"), pn(" ".repeat(10 - key.length)), ...val, pn(",")];
  const arr = (...xs) => [pn("["), ...xs.flatMap((x, i) => (i ? [pn(", "), s(`"${x}"`)] : [s(`"${x}"`)])), pn("]")];
  const lines = [
    [kw("$"), k(" cat priyanshu.ts")],
    [],
    [kw("const"), k(" priyanshu "), pn("= {")],
    field("role", s('"full-stack engineer"')),
    field("based", s('"India"')),
    field("now", s('"building ESG tech @ EGP Tech"')),
    field("founded", s('"HiCoders — open source & dev community"')),
    field("writes", ...arr("TypeScript", "Go", "Dart", "Python")),
    field("ships", ...arr("web", "mobile", "apis", "infra", "ai")),
    field("runs", s('"NixOS, btw"')),
    field("since", n("2018")),
    [pn("} "), kw("satisfies"), k(" Engineer"), pn(";")],
    [kw("$"), k(" ")],
  ];
  const H = top + lines.length * lh + 16;

  const code = lines
    .map((segs, i) => {
      const y = top + i * lh;
      const num = `<text class="m" x="40" y="${y}" font-size="13" fill="${C.line2}" text-anchor="start">${String(i + 1).padStart(2, "0")}</text>`;
      const txt = segs.map(([t, f]) => `<tspan fill="${f}">${esc(t)}</tspan>`).join("");
      return `<g class="in" style="animation-delay:${0.15 + i * 0.07}s">${num}<text class="m" x="84" y="${y}" font-size="${size}" xml:space="preserve">${txt}</text></g>`;
    })
    .join("");
  const lastY = top + (lines.length - 1) * lh;
  const cursor = `<rect x="${84 + 2 * size * MONO}" y="${lastY - 16}" width="10" height="21" fill="${C.accent}" style="animation:blink 1.1s steps(1) infinite"/>`;

  // PR monogram as a dot matrix
  const P = ["11110", "10001", "10001", "11110", "10000", "10000", "10000"];
  const R = ["11110", "10001", "10001", "11110", "10100", "10010", "10001"];
  const pitch = 21, gx = 700, gy = 150;
  let dots = "";
  [P, R].forEach((g, gi) =>
    g.forEach((row, r) =>
      [...row].forEach((bit, c) => {
        const cx = gx + (gi * 6 + c) * pitch, cy = gy + r * pitch;
        dots += bit === "1"
          ? `<circle class="dot" style="animation-delay:${((gi * 6 + c + r) * 0.09).toFixed(2)}s" cx="${cx}" cy="${cy}" r="7.5" fill="${C.accent}"/>`
          : `<circle cx="${cx}" cy="${cy}" r="7.5" fill="#17171A"/>`;
      }),
    ),
  );
  const css = `.dot{animation:glow 3.6s ease-in-out infinite}@keyframes glow{0%,100%{opacity:1}45%{opacity:.3}}`;
  const midX = gx + 5 * pitch;

  const body = card(
    W, H,
    `<rect width="${W}" height="56" fill="${C.surface}"/><line x1="0" x2="${W}" y1="56" y2="56" stroke="${C.line}"/>
<circle cx="30" cy="28" r="6" fill="${C.line2}"/><circle cx="50" cy="28" r="6" fill="${C.line2}"/><circle cx="70" cy="28" r="6" fill="${C.accent}"/>
<text class="m" x="${W / 2}" y="33" font-size="13" fill="${C.faint}" text-anchor="middle">priyanshu@earth: ~/profile</text>
${tag(W - 32, 33, "01", "WHOAMI", "end")}
${code}${cursor}
<g class="in" style="animation-delay:.5s">${dots}</g>
<text class="m" x="${midX}" y="${gy + 6 * pitch + 50}" font-size="12" letter-spacing="2" fill="${C.faint}" text-anchor="middle">UPTIME SINCE 2018</text>`,
  );
  return svg(W, H, "whoami — Priyanshu Raj, full-stack engineer from India", body, { css });
}

// ─── 02 what i've built ──────────────────────────────────────────────────────
const BUILT = [
  ["Compliance & ESG", "TS · REACT · NODE", ["Multi-tenant platforms that move institutions", "off spreadsheets: org trees, approvals, reports."]],
  ["Marketplaces & commerce", "NEXT.JS · FLUTTER", ["Storefronts, admin panels and a recycling", "exchange that pays on confirmed weight."]],
  ["SaaS & booking", "FLUTTER · TS", ["Coworking management, studio booking and", "live quote builders priced from rule sets."]],
  ["Real-time", "SOCKET.IO · WEBRTC", ["Multiplayer games with rooms, chat & voice,", "plus WebRTC video calling."]],
  ["Infra & observability", "DOCKER · TRAEFIK · GRAFANA", ["Self-hosted stacks — reverse proxies, metrics,", "logs, alerting, secrets and backups."]],
  ["AI & automation", "LANGCHAIN · GEMINI · PY", ["LLM-generated reports, AI data extraction,", "TTS experiments, e2e test capture & replay."]],
  ["IoT & hardware", "ESP32 · ARDUINO · C++", ["ESP32 and Arduino builds — alarms, feedback", "devices and IoT control dashboards."]],
  ["Open source", "NPM · 590+ STARS", ["60+ public repos as HiCoders — npm CLIs,", "UI widgets and a 1.1k-strong dev community."]],
];

function built() {
  const W = 1000, px = 40, gap = 16, top = 196, cellW = (W - px * 2 - gap) / 2, cellH = 136;
  const rows = Math.ceil(BUILT.length / 2);
  const H = top + rows * cellH + (rows - 1) * gap + 40;
  const cycle = BUILT.length * 2;

  const cells = BUILT.map(([title, tech, desc], i) => {
    const x = px + (i % 2) * (cellW + gap), y = top + Math.floor(i / 2) * (cellH + gap);
    return `<g class="in" style="animation-delay:${(0.15 + i * 0.06).toFixed(2)}s">
<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="14" fill="${C.surface}" stroke="${C.line}"/>
<rect class="lit" style="animation-delay:${i * 2}s" x="${x + 0.5}" y="${y + 0.5}" width="${cellW - 1}" height="${cellH - 1}" rx="13.5" fill="none" stroke="${C.accent}" stroke-opacity=".55"/>
<text class="m" x="${x + 24}" y="${y + 34}" font-size="12" letter-spacing="2" fill="${C.accent}">${String(i + 1).padStart(2, "0")}</text>
<text class="m" x="${x + cellW - 24}" y="${y + 34}" font-size="11" letter-spacing="1" fill="${C.faint}" text-anchor="end">${esc(tech)}</text>
<text class="s" x="${x + 23}" y="${y + 70}" font-size="23" font-weight="600" letter-spacing="-.7" fill="${C.text}">${esc(title)}</text>
${desc.map((l, j) => `<text class="s" x="${x + 24}" y="${y + 97 + j * 21}" font-size="15.5" fill="${C.dim}">${esc(l)}</text>`).join("")}
</g>`;
  }).join("");

  const css = `.lit{opacity:0;animation:lit ${cycle}s ease-in-out infinite backwards}
@keyframes lit{0%{opacity:0}${((0.4 / cycle) * 100).toFixed(2)}%{opacity:1}${((1.6 / cycle) * 100).toFixed(2)}%{opacity:1}${((2 / cycle) * 100).toFixed(2)}%{opacity:0}100%{opacity:0}}`;

  const body = card(
    W, H,
    `<defs><filter id="bl4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="80"/></filter></defs>
<circle cx="120" cy="40" r="160" fill="${C.accent}" opacity=".10" filter="url(#bl4)"/>
${tag(px, 56, "02", "WHAT I'VE BUILT")}<text class="m" x="${W - px}" y="56" font-size="12" letter-spacing="2" fill="${C.faint}" text-anchor="end">DESIGNED · BUILT · RUN</text>
<text class="s in" x="${px - 2}" y="120" font-size="40" font-weight="600" letter-spacing="-1.6" fill="${C.text}">Products, and the plumbing underneath<tspan fill="${C.accent}">.</tspan></text>
<text class="s in" style="animation-delay:.08s" x="${px}" y="156" font-size="19" fill="${C.dim}">Web, mobile, real-time, infra and AI — taken from first commit to production.</text>
${cells}`,
  );
  return svg(W, H, "What I've built: compliance platforms, marketplaces, SaaS, real-time apps, infra, AI tooling, IoT and open source", body, { css });
}

// ─── 03 stack ────────────────────────────────────────────────────────────────
const STACK = [
  ["LANGUAGES", [["TypeScript", "typescript"], ["Go", "go"], ["Dart", "dart"], ["Python", "python"], ["JavaScript", "javascript"], ["C++", "cplusplus"]]],
  ["FRONTEND", [["React", "react"], ["Next.js", "nextdotjs"], ["Astro", "astro"], ["Svelte", "svelte"], ["Tailwind", "tailwindcss"], ["TanStack", "reactquery"], ["Vite", "vite"]]],
  ["BACKEND", [["Node.js", "nodedotjs"], ["Bun", "bun"], ["Express", "express"], ["Zod", "zod"], ["Socket.IO", "socketdotio"], ["WebRTC", "webrtc"]]],
  ["MOBILE+IOT", [["Flutter", "flutter"], ["Expo", "expo"], ["ESP32", "espressif"], ["Arduino", "arduino"]]],
  ["DATA", [["PostgreSQL", "postgresql"], ["MongoDB", "mongodb"], ["Redis", "redis"], ["MySQL", "mysql"], ["SQLite", "sqlite"], ["Firebase", "firebase"]]],
  ["INFRA", [["Docker", "docker"], ["Traefik", "traefikproxy"], ["Prometheus", "prometheus"], ["Grafana", "grafana"], ["NixOS", "nixos"], ["Actions", "githubactions"]]],
  ["AI", [["Claude", "claude"], ["OpenAI", "openai"], ["Gemini", "googlegemini"], ["LangChain", "langchain"]]],
];

function stack() {
  const W = 1000, px = 40, x0 = 184, maxX = W - px, chipH = 38, gap = 8, rowGap = 14, fs = 13.5;
  let y = 96, rows = "", n = 0;
  for (const [label, items] of STACK) {
    let x = x0, rowTop = y;
    let chips = "";
    for (const [name, ic] of items) {
      const w = 40 + monoW(name, fs) + 12;
      if (x + w > maxX) { x = x0; y += chipH + gap; }
      chips += `<g class="in" style="animation-delay:${(0.1 + n++ * 0.025).toFixed(3)}s"><rect x="${x}" y="${y}" width="${w}" height="${chipH}" rx="10" fill="${C.surface}" stroke="${C.line}"/>${icon(ic, x + 13, y + 10, 18, "#D4D4D9")}<text class="m" x="${x + 40}" y="${y + 24}" font-size="${fs}" fill="${C.text}">${esc(name)}</text></g>`;
      x += w + gap;
    }
    rows += `<rect x="${px}" y="${rowTop + 15}" width="6" height="6" fill="${C.accent}"/><text class="m" x="${px + 16}" y="${rowTop + 23}" font-size="12" letter-spacing="2" fill="${C.dim}">${label}</text>${chips}`;
    y += chipH + rowGap;
  }
  const H = y + 22;
  const body = card(
    W, H,
    `${tag(px, 56, "03", "STACK")}<text class="m" x="${W - px}" y="56" font-size="12" letter-spacing="2" fill="${C.faint}" text-anchor="end">TOOLS I REACH FOR</text>
<line x1="${x0 - 20}" x2="${x0 - 20}" y1="96" y2="${H - 36}" stroke="${C.line}"/>${rows}`,
  );
  return svg(W, H, "Tech stack: TypeScript, Go, Dart, Python, React, Next.js, Node.js, Flutter, PostgreSQL, MongoDB, Docker and more", body);
}

// ─── 05 say hi + links ───────────────────────────────────────────────────────
function sayHi() {
  const W = 1000, H = 230, px = 40;
  const css = `.orb2{animation:drift2 12s ease-in-out infinite alternate}@keyframes drift2{to{transform:translate(-220px,40px)}}`;
  const body = card(
    W, H,
    `<defs>${dotGrid("d3", 22, 1.1, "#1E1E23")}<filter id="bl3" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="60"/></filter></defs>
<circle class="orb2" cx="880" cy="200" r="150" fill="${C.accent}" opacity=".18" filter="url(#bl3)"/>
<rect width="${W}" height="${H}" fill="url(#d3)"/>
${tag(px, 56, "05", "SAY HI")}
<text class="s" x="${px - 3}" y="130" font-size="58" font-weight="600" letter-spacing="-2.6" fill="${C.text}">Let's build something<tspan fill="${C.accent}">.</tspan></text>
<text class="s" x="${px}" y="176" font-size="19" fill="${C.dim}">Always up for collaborating on products that matter — DMs are open.</text>
<rect x="${px + 1}" y="197" width="9" height="16" fill="${C.accent}" style="animation:blink 1.1s steps(1) infinite"/>`,
    22,
  );
  return svg(W, H, "Let's build something — DMs are open", body, { css });
}

const LINKS = [
  { id: "github", label: "HICODERS", icon: "github", href: "https://github.com/hicodersofficial" },
  { id: "x", label: "X", icon: "x", href: "https://x.com/priyanshu_raz_z" },
  { id: "instagram", label: "INSTAGRAM", icon: "instagram", href: "https://www.instagram.com/hi.coders" },
  { id: "youtube", label: "YOUTUBE", icon: "youtube", href: "https://www.youtube.com/channel/UC1hooNUnK4Ivk5KBaT5PKIg" },
  { id: "discord", label: "DISCORD", icon: "discord", href: "https://discord.gg/TTsSYUJzDa" },
];

function linkButton(l) {
  const H = 48, fs = 13, W = Math.round(48 + monoW(l.label, fs, 1.5) + 14 + 8 + 18);
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="${C.bg}" stroke="${C.line2}"/>${icon(l.icon, 18, 15, 18, C.text)}<text class="m" x="48" y="29" font-size="${fs}" letter-spacing="1.5" fill="${C.text}">${esc(l.label)}</text>${arrow(W - 26, 20, 8, C.accent)}`;
  return svg(W, H, l.label, body, { fonts: ["GM"] });
}

// ─── 04 signal (live stats) ──────────────────────────────────────────────────
async function fetchStats(token) {
  const query = `query($login:String!,$oss:String!){
    user(login:$login){
      pullRequests{totalCount}
      repositoriesContributedTo(contributionTypes:[COMMIT,PULL_REQUEST,REPOSITORY]){totalCount}
      contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}
      repositories(first:100,ownerAffiliations:OWNER,isFork:false){nodes{stargazerCount languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}}}
    }
    oss:user(login:$oss){repositories(first:100,ownerAffiliations:OWNER,isFork:false){nodes{stargazerCount}}}
  }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `bearer ${token}`, "content-type": "application/json", "user-agent": "profile-render" },
    body: JSON.stringify({ query, variables: { login: LOGIN, oss: OSS_LOGIN } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub GraphQL failed: ${JSON.stringify(json.errors ?? json)}`);
  const u = json.data.user;

  const days = u.contributionsCollection.contributionCalendar.weeks.map((w) => w.contributionDays);
  const flat = days.flat();
  const active = flat.filter((x) => x.contributionCount > 0).length;

  const langs = new Map();
  for (const r of u.repositories.nodes)
    for (const e of r.languages.edges) langs.set(e.node.name, (langs.get(e.node.name) ?? 0) + e.size);
  const stars = [...u.repositories.nodes, ...json.data.oss.repositories.nodes].reduce((a, r) => a + r.stargazerCount, 0);

  return {
    total: u.contributionsCollection.contributionCalendar.totalContributions,
    prs: u.pullRequests.totalCount,
    repos: u.repositoriesContributedTo.totalCount,
    stars,
    active,
    days: flat.length,
    weeks: days,
    langs: [...langs.entries()].sort((a, b) => b[1] - a[1]),
  };
}

function signal(d) {
  const W = 1000, H = 490, px = 40;
  const fmt = (n) => n.toLocaleString("en-US");
  const nums = [
    [fmt(d.total), "CONTRIBUTIONS", "last 12 months"],
    [fmt(d.active), "ACTIVE DAYS", `out of the last ${d.days}`],
    [fmt(d.prs), "PULL REQUESTS", "opened, all time"],
    [fmt(d.stars), "STARS EARNED", "across open source"],
  ];
  const colW = (W - px * 2) / 4;
  const numbers = nums
    .map(([v, l, sub], i) => {
      const x = px + i * colW + (i ? 24 : 0);
      return `<g class="in" style="animation-delay:${0.05 + i * 0.07}s">${i ? `<line x1="${x - 24}" x2="${x - 24}" y1="94" y2="190" stroke="${C.line}"/>` : ""}<text class="s" x="${x - 2}" y="140" font-size="48" font-weight="600" letter-spacing="-2" fill="${i ? C.text : C.accent}">${esc(v)}</text><text class="m" x="${x}" y="166" font-size="11.5" letter-spacing="1.8" fill="${C.dim}">${l}</text><text class="m" x="${x}" y="185" font-size="11.5" fill="${C.faint}">${esc(sub)}</text></g>`;
    })
    .join("");

  // contribution matrix
  const weeks = d.weeks.slice(-53);
  const pitch = (W - px * 2) / weeks.length, cell = pitch - 3.6, my = 246;
  const counts = weeks.flat().map((x) => x.contributionCount).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => counts[Math.floor((counts.length - 1) * p)] ?? 1;
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  const shade = (c) => (c === 0 ? "#17171A" : c <= q1 ? "#4A2415" : c <= q2 ? "#86381A" : c <= q3 ? "#C4491C" : C.accent);
  let cells = "", months = "", lastMonth = -1, lastLabelCol = -9;
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  weeks.forEach((wk, c) => {
    const x = px + c * pitch;
    const m = new Date(wk[0].date).getUTCMonth();
    if (m !== lastMonth && c - lastLabelCol >= 4 && c < weeks.length - 2) {
      months += `<text class="m" x="${x.toFixed(1)}" y="${my - 12}" font-size="10.5" letter-spacing="1.5" fill="${C.faint}">${MONTHS[m]}</text>`;
      lastLabelCol = c;
    }
    lastMonth = m;
    // first partial week is bottom-aligned by weekday
    const offset = c === 0 ? 7 - wk.length : 0;
    cells += `<g class="col" style="animation-delay:${(0.2 + c * 0.012).toFixed(3)}s">`;
    wk.forEach((day, r) => {
      cells += `<rect x="${x.toFixed(1)}" y="${(my + (r + offset) * pitch).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="3" fill="${shade(day.contributionCount)}"/>`;
    });
    cells += `</g>`;
  });
  const mBottom = my + 7 * pitch;
  const levels = [0, q1, q2, q3, q3 + 1];
  const sx = W - px - monoW("MORE", 10.5, 1.5) - 8 - levels.length * 15;
  const scale = `<text class="m" x="${sx - 8}" y="${mBottom + 20}" font-size="10.5" letter-spacing="1.5" fill="${C.faint}" text-anchor="end">LESS</text>${levels
    .map((l, i) => `<rect x="${sx + i * 15}" y="${mBottom + 11}" width="11" height="11" rx="2.5" fill="${shade(l)}"/>`)
    .join("")}<text class="m" x="${W - px}" y="${mBottom + 20}" font-size="10.5" letter-spacing="1.5" fill="${C.faint}" text-anchor="end">MORE</text>`;

  // languages
  const top = d.langs.slice(0, 6);
  const sum = d.langs.reduce((a, [, v]) => a + v, 0) || 1;
  const rest = sum - top.reduce((a, [, v]) => a + v, 0);
  const segs = [...top, ...(rest > 0 ? [["Other", rest]] : [])];
  const ramp = [C.accent, "#FF8A55", "#FFB08A", "#D9CFC9", "#9A9AA2", "#5E5E66", "#34343A"];
  const barY = mBottom + 58, barW = W - px * 2;
  let bx = px, bar = "", legend = "", lx = px;
  segs.forEach(([name, v], i) => {
    const w = (v / sum) * barW;
    bar += `<rect x="${bx.toFixed(1)}" y="${barY}" width="${Math.max(w - 2, 1).toFixed(1)}" height="8" fill="${ramp[i]}"/>`;
    bx += w;
    const label = `${name} ${((v / sum) * 100).toFixed(1)}%`;
    legend += `<rect x="${lx}" y="${barY + 25}" width="8" height="8" rx="2" fill="${ramp[i]}"/><text class="m" x="${lx + 14}" y="${barY + 33}" font-size="11.5" fill="${C.dim}">${esc(label)}</text>`;
    lx += 14 + monoW(label, 11.5) + 22;
  });

  const updated = new Date().toISOString().slice(0, 10);
  const css = `.col{animation:colIn .5s ease-out backwards}@keyframes colIn{from{opacity:0}}
.scan{animation:scan 7s cubic-bezier(.6,0,.4,1) infinite}@keyframes scan{0%{transform:translateX(-80px)}60%,100%{transform:translateX(${W}px)}}`;

  const body = card(
    W, H,
    `<defs><linearGradient id="scg" x1="0" x2="1"><stop offset="0" stop-color="${C.accent}" stop-opacity="0"/><stop offset="1" stop-color="${C.accent}" stop-opacity=".22"/></linearGradient>
<clipPath id="mc"><rect x="${px}" y="${my}" width="${W - px * 2}" height="${7 * pitch}"/></clipPath></defs>
${tag(px, 56, "04", "SIGNAL")}<text class="m" x="${W - px}" y="56" font-size="12" letter-spacing="2" fill="${C.faint}" text-anchor="end">LIVE · UPDATED ${updated}</text>
${numbers}${months}${cells}
<g clip-path="url(#mc)"><rect class="scan" x="0" y="${my}" width="80" height="${7 * pitch}" fill="url(#scg)"/></g>
${scale}
<text class="m" x="${px}" y="${barY - 12}" font-size="11" letter-spacing="1.8" fill="${C.dim}">LANGUAGES <tspan fill="${C.faint}" letter-spacing="0">by bytes, owned repos</tspan></text>
${bar}${legend}`,
  );
  return svg(W, H, `GitHub activity: ${d.total} contributions in the last year, ${d.prs} pull requests, ${d.stars} stars`, body, { css });
}

// ─── main ────────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
const write = (name, content) => {
  writeFileSync(join(OUT, name), content);
  console.log(`  ${name.padEnd(26)} ${(content.length / 1024).toFixed(1)} KB`);
};

write("hero.svg", hero());
write("whoami.svg", whoami());
write("built.svg", built());
write("stack.svg", stack());
write("say-hi.svg", sayHi());
LINKS.forEach((l) => write(`link-${l.id}.svg`, linkButton(l)));

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (token) write("signal.svg", signal(await fetchStats(token)));
else console.log("  signal.svg                 skipped (set GH_TOKEN to render live stats)");
