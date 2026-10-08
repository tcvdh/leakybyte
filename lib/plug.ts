// Plug: scan model output for ways data can leave (the output, once rendered, is the exit).
import { detect } from "./redact.ts";

export type Finding = { type: "URL" | "HIDDEN_TEXT" | "SECRET"; detail: string };

// Zero-width, bidi/format controls and the Unicode "tag" block, all used to smuggle invisible text.
const HIDDEN = /[​-‏‪-‮⁠-⁤\u{E0000}-\u{E007F}]/gu;
// http(s) URLs in any letter case, plus protocol-relative //host/path.
const URLS = /(?:https?:[/\\]*|(?<![\w:/\\.])[/\\]{2})(?:[^\s<>"'`]|[\t\r\n]+(?=[^\s<>"'`]))+/gi; // scans past ) and ] (markdown allows balanced parens in a target) and across tab/newline (browsers delete them in URLs)
// Text right before an auto-fetched image URL: ![alt](, ![alt](<, <img src=, or a reference definition [id]:
const IMG_BEFORE = /(?:!\[[^\]]*\]\(\s*<?|<img[^>]*\ssrc\s*=\s*["']?|^[ ]{0,3}\[[^\]]+\]:\s*<?)$/im;
const BLOB = /[A-Za-z0-9+/_=-]{20,}/; // long base64/hex-looking run

const normHost = (h: string) => h.toLowerCase().replace(/\.$/, "");

function urlRisk(raw: string, allow: Set<string>, isImage: boolean) {
  raw = raw.replace(/[\t\r\n]/g, ""); // what the browser's URL parser sees
  let u: URL;
  try { u = new URL(raw.replace(/^(?:https?:)?[/\\]*/i, (m) => (/^http:/i.test(m) ? "http://" : "https://"))); } catch { return { host: "unparseable", why: "is not a valid URL" }; } // fail closed
  const host = normHost(u.hostname);
  if (allow.has(host)) return null;
  const data = [...u.searchParams.values()].join("") + u.hash + u.username + u.password;
  const why =
    isImage ? "is an image from an untrusted host (images load automatically)"
    : BLOB.test(data) || data.length > 40 ? "carries data in the query, fragment or login"
    : host.split(".").some((l) => BLOB.test(l)) ? "hides data in the hostname"
    : u.pathname.length > 200 || u.pathname.split("/").some((p) => BLOB.test(p) && p.length >= 32) ? "carries an encoded blob in the path"
    : detect(safeDecode(u.search + u.pathname + u.hash)).length ? "contains a secret or personal data"
    : null;
  return why && { host, why };
}

// Decode only entities that become plain URL characters. Never produce < > " ' or &, so the
// sanitized output can't gain markup that wasn't already there.
const NAMED: Record<string, string> = { colon: ":", sol: "/", period: ".", quest: "?", num: "#", bsol: "\\" };
const URL_SAFE = /^[A-Za-z0-9:/.?#=%_~+@\\-]$/;
const decodeEntities = (t: string) =>
  t.replace(/&#(x[0-9a-f]+|\d+);?|&([a-z]+);/gi, (m, n: string | undefined, name: string | undefined) => {
    const ch = name ? NAMED[name.toLowerCase()] : (() => { const cp = n![0].toLowerCase() === "x" ? parseInt(n!.slice(1), 16) : parseInt(n!, 10); return cp <= 0x7e ? String.fromCodePoint(cp) : undefined; })();
    return ch !== undefined && URL_SAFE.test(ch) ? ch : m;
  });

const safeDecode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export function plug(text: string, allowHosts: string[] = []) {
  const allow = new Set(allowHosts.map((h) => normHost(h.trim())).filter(Boolean));
  const findings: Finding[] = [];

  // Markdown/HTML decode entities before building links, so scan the decoded form.
  let out = decodeEntities(text).replace(HIDDEN, () => "");
  const hidden = (text.match(HIDDEN) ?? []).length;
  if (hidden) findings.push({ type: "HIDDEN_TEXT", detail: `${hidden} invisible character${hidden > 1 ? "s" : ""} removed` });

  out = out.replace(URLS, (match, offset: number, whole: string) => {
    // Judge the URL as a browser reads it (breaks removed, whole token), but only rewrite its first line,
    // so a legitimate line that follows a link in markdown is not swallowed.
    const brk = match.search(/[\t\r\n]/);
    const head = brk < 0 ? match : match.slice(0, brk);
    const rest = brk < 0 ? "" : match.slice(brk);
    const url = match.replace(/[\t\r\n]/g, "").replace(/[)\].,;:!?]+$/, ""); // keep markdown/sentence punctuation outside the link
    const risk = urlRisk(url, allow, IMG_BEFORE.test(whole.slice(0, offset)));
    if (!risk) return match;
    findings.push({ type: "URL", detail: `${risk.host} ${risk.why}` });
    return `[blocked link to ${risk.host}]${head.match(/[)\].,;:!?]+$/)?.[0] ?? ""}${rest}`;
  });

  let last = 0, clean = "";
  for (const s of detect(out)) {
    findings.push({ type: "SECRET", detail: `${s.kind} in output` });
    clean += out.slice(last, s.start) + `[removed ${s.kind}]`;
    last = s.end;
  }
  return { text: clean + out.slice(last), findings };
}
