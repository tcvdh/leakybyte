// leakybyte redact | plug [--allow host,host] | canary mint <tag> [anthropic|aws] | canary check   (text on stdin)
import { redact } from "../lib/redact.ts";
import { plug } from "../lib/plug.ts";
import { mint, check } from "../lib/canary.ts";

const [cmd, ...args] = process.argv.slice(2);
const stdin = async () => { let s = ""; for await (const c of process.stdin) s += c; return s; };
const fail = (m: string): never => { console.error(m); process.exit(1); };
const key = () => process.env.LEAKYBYTE_CANARY_KEY ?? fail("Set LEAKYBYTE_CANARY_KEY to a secret string only you know.");

if (cmd === "redact") {
  const r = redact(await stdin());
  process.stdout.write(r.text);
  console.error(`\n${r.vault.size} value(s) redacted`);
} else if (cmd === "plug") {
  const i = args.indexOf("--allow");
  const r = plug(await stdin(), i >= 0 ? args[i + 1]?.split(",") : []);
  process.stdout.write(r.text);
  for (const f of r.findings) console.error(`${f.type}: ${f.detail}`);
} else if (cmd === "canary" && args[0] === "mint") {
  console.log(await mint(key(), args[1] ?? "", (args[2] as "anthropic" | "aws") ?? "anthropic"));
} else if (cmd === "canary" && args[0] === "check") {
  const hits = await check(key(), await stdin());
  for (const h of hits) console.log(`LEAK: ${h.kind} canary "${h.tag}" at char ${h.index}`);
  process.exit(hits.length ? 2 : 0);
} else fail("usage: leakybyte redact | plug [--allow hosts] | canary mint <tag> [anthropic|aws] | canary check");
