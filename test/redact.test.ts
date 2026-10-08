import { test } from "node:test";
import assert from "node:assert/strict";
import { redact, restore } from "../lib/redact.ts";

test("redacts, reuses placeholders, skips invalid cards, restores", () => {
  const input = "Mail ana@acme.io, again ana@acme.io. key sk-ant-api03-abcdefghijklmnopqrstuvwx card 4242 4242 4242 4242 not 4242 4242 4242 4243 ip 10.0.0.12";
  const r = redact(input);
  assert.equal(r.text, "Mail ‹EMAIL_1›, again ‹EMAIL_1›. key ‹ANTHROPIC_KEY_1› card ‹CARD_1› not 4242 4242 4242 4243 ip ‹IP_1›");
  assert.equal(restore(r.text, r.vault), input);
});
