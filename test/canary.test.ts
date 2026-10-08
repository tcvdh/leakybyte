import { test } from "node:test";
import assert from "node:assert/strict";
import { mint, check, newKey } from "../lib/canary.ts";

test("minted canaries are found with their tag; lookalikes and other keys are not", async () => {
  const key = newKey();
  const a = await mint(key, "prod", "anthropic");
  const b = await mint(key, "ci", "aws");
  const log = `boot ok\nANTHROPIC_API_KEY=${a}\nAWS_ACCESS_KEY_ID=${b}\n`;
  const hits = await check(key, log);
  assert.deepEqual(hits.map((h) => [h.kind, h.tag]), [["anthropic", "PROD"], ["aws", "CIXX"]]);
  assert.equal((await check(newKey(), log)).length, 0); // wrong key: can't verify
  const fake = a.slice(0, -1) + (a.endsWith("A") ? "B" : "A"); // tampered mac
  assert.equal((await check(key, fake)).length, 0);
});
