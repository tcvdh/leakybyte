// Plug: scan model output for ways data can leave (the output, once rendered, is the exit).
import { detect } from "./redact.ts";

export type Finding = { type: "URL" | "HIDDEN_TEXT" | "SECRET"; detail: string };

// Zero-width, bidi/format controls and the Unicode "tag" block, all used to smuggle invisible text.
const HIDDEN = /[​-‏‪-‮⁠-⁤\u{E0000}-\u{E007F}]/gu;
const URLS = /https?:\/\/[^\s)>\]"'`]+/g;
const BLOB = /[A-Za-z0-9+/_=-]{20,}/; // long base64/hex-looking run

function urlRisk(raw: string, allow: Set<string>) {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (allow.has(u.hostname)) return null;
  const params = [...u.searchParams.values()].join("");
  if (BLOB.test(params) || params.length > 40) return "carries data in the query string";
  if (u.pathname.split("/").some((p) => BLOB.test(p) && p.length >= 32)) return "carries an encoded blob in the path";
  if (detect(decodeURIComponent(u.search + u.pathname)).length) return "contains a secret or personal data";
  return null;
}

export function plug(text: string, allowHosts: string[] = []) {
  const allow = new Set(allowHosts.map((h) => h.trim().toLowerCase()).filter(Boolean));
  const findings: Finding[] = [];

  let out = text.replace(HIDDEN, () => "");
  const hidden = text.length - out.length;
  if (hidden) findings.push({ type: "HIDDEN_TEXT", detail: `${hidden} invisible character${hidden > 1 ? "s" : ""} removed` });

  out = out.replace(URLS, (url) => {
    const why = urlRisk(url, allow);
    if (!why) return url;
    findings.push({ type: "URL", detail: `${new URL(url).hostname} ${why}` });
    return `[blocked link to ${new URL(url).hostname}]`;
  });

  let last = 0, clean = "";
  for (const s of detect(out)) {
    findings.push({ type: "SECRET", detail: `${s.kind} in output` });
    clean += out.slice(last, s.start) + `[removed ${s.kind}]`;
    last = s.end;
  }
  return { text: clean + out.slice(last), findings };
}
