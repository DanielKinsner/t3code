// Validate a T3 Code environment theme: exact role set (from T3 source), hex format, WCAG contrast.
// Usage: node check_theme.mjs <theme.json> <themePalettes.ts>
import { readFileSync } from "node:fs";

const [themePath, rolesSrcPath] = process.argv.slice(2);
const theme = JSON.parse(readFileSync(themePath, "utf8"));
const src = readFileSync(rolesSrcPath, "utf8");
const rolesBlock = src.match(/THEME_COLOR_ROLES = \[([\s\S]*?)\] as const/)[1];
const ROLES = [...rolesBlock.matchAll(/"([a-zA-Z]+)"/g)].map((m) => m[1]);

const lum = (hex) => {
  const n = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, minimum]: 4.5 = body text, 3 = large text / UI indicators.
const PAIRS = [
  ["text", "canvas", 4.5], ["text", "surface", 4.5], ["text", "surfaceOverlay", 4.5],
  ["textMuted", "canvas", 4.5], ["textMuted", "surface", 4.5],
  ["toolbarForeground", "toolbar", 4.5], ["toolbarControlForeground", "toolbarControl", 4.5],
  ["accentForeground", "accent", 4.5], ["secondaryForeground", "secondary", 4.5],
  ["mutedForeground", "muted", 4.5], ["placeholder", "canvas", 3.5], ["iconMuted", "canvas", 3],
  ["secondaryLabel", "canvas", 4.5],
  ["errorForeground", "errorSurface", 4.5], ["warningForeground", "warningSurface", 4.5],
  ["updateForeground", "updateSurface", 4.5], ["accentSurfaceForeground", "accentSurface", 4.5],
  ["messageForeground", "messageSurface", 4.5], ["messageActionForeground", "messageAction", 4.5],
  ["messageActionForeground", "messageActionHover", 4.5],
  ["codeForeground", "codeBackground", 4.5],
  ["searchMatchForeground", "searchMatchBackground", 4.5],
  ["searchMatchActiveForeground", "searchMatchActiveBackground", 4.5],
  ["sidebarForeground", "sidebar", 4.5], ["sidebarMutedForeground", "sidebar", 4.5],
  ["sidebarForeground", "sidebarRowActive", 4.5], ["sidebarForeground", "sidebarRowSelected", 4.5],
  ["sidebarForeground", "sidebarRowHover", 4.5],
  ["terminalForeground", "terminalBackground", 4.5], ["terminalForeground", "terminalSelection", 4.5],
  ["focus", "canvas", 3], ["accent", "canvas", 3], ["error", "canvas", 3], ["warning", "canvas", 3],
  ["terminalCursor", "terminalBackground", 3],
];

let failures = 0;
const check = (label, colors) => {
  const keys = Object.keys(colors);
  const missing = ROLES.filter((r) => !keys.includes(r));
  const extra = keys.filter((k) => !ROLES.includes(k));
  const badHex = keys.filter((k) => !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colors[k]));
  console.log(`\n== ${label}: ${keys.length}/${ROLES.length} roles` +
    (missing.length ? ` MISSING ${missing}` : "") + (extra.length ? ` EXTRA ${extra}` : "") +
    (badHex.length ? ` BADHEX ${badHex}` : ""));
  failures += missing.length + extra.length + badHex.length;
  for (const [fg, bg, min] of PAIRS) {
    const r = ratio(colors[fg], colors[bg]);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(`${ok ? " ok " : "FAIL"} ${r.toFixed(2).padStart(5)} >= ${min}  ${fg} on ${bg}`);
  }
};

if (!/^(?!(?:system|light|dark)$)[a-z0-9](?:[a-z0-9-]{0,47})$/.test(themePath.split(/[\\/]/).pop().replace(/\.json$/, ""))) {
  console.log("FAIL theme id (filename)"); failures++;
}
check(`${theme.name} ${theme.appearance}`, theme.colors);
for (const [mode, colors] of Object.entries(theme.variants ?? {})) check(`${theme.name} ${mode}`, colors);
console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL CHECKS PASS");
process.exit(failures ? 1 : 0);
