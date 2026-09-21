import test from "node:test";
import assert from "node:assert/strict";
import { assertHearingOwner, normalizeHearingMessage, normalizeVerdict, requireSameOrigin } from "../src/lib/request-guards.mjs";

test("same-origin mutating requests are accepted", () => {
  assert.equal(requireSameOrigin("https://tribunal.example/api/hearings", "https://tribunal.example"), true);
  assert.throws(() => requireSameOrigin("https://tribunal.example/api/hearings", "https://evil.example"), /origin not allowed/);
  assert.throws(() => requireSameOrigin("https://tribunal.example/api/hearings", null), /origin not allowed/);
});

test("hearing messages are normalized and bounded", () => {
  assert.equal(normalizeHearingMessage("  hello  "), "hello");
  assert.throws(() => normalizeHearingMessage("   "), /empty/);
  assert.throws(() => normalizeHearingMessage("x".repeat(801)), /800/);
});

test("hearing ownership fails closed", () => {
  const hearing = { visitorId: "v1" };
  assert.equal(assertHearingOwner(hearing, "v1"), hearing);
  assert.throws(() => assertHearingOwner(hearing, "v2"), /not found/);
});

test("verdict values are allowlisted", () => {
  assert.equal(normalizeVerdict("SPARE"), "SPARE");
  assert.equal(normalizeVerdict("DELETE"), "DELETE");
  assert.throws(() => normalizeVerdict("MAYBE"), /invalid/);
});
