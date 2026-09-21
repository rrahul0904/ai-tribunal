import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_AI_TURNS,
  appendLedgerEntry,
  canSpend,
  compilePersonaPrompt,
  createHearing,
  createLedger,
  ledgerBalance,
  recordAiMessage,
  recordUserMessage,
  submitVerdict,
} from "../src/lib/core.mjs";

test("hearing enforces six AI responses server-side", () => {
  let hearing = createHearing({ hearingId: "h1", caseId: "c1", visitorId: "v1" });
  for (let i = 0; i < MAX_AI_TURNS; i++) {
    hearing = recordUserMessage(hearing, `question ${i}`);
    hearing = recordAiMessage(hearing, `answer ${i}`);
  }
  assert.equal(hearing.aiTurns, 6);
  assert.equal(hearing.status, "DELIBERATION");
  assert.throws(() => recordAiMessage(hearing, "seventh"), /not active|turn limit/);
});

test("ledger is append-only and balance is derived", () => {
  let ledger = createLedger();
  ledger = appendLedgerEntry(ledger, { id: "buy-1", type: "PURCHASE", amount: 5 });
  ledger = appendLedgerEntry(ledger, { id: "use-1", type: "HEARING", amount: -1 });
  assert.equal(ledgerBalance(ledger), 4);
  assert.equal(canSpend(ledger, 4), true);
  assert.equal(canSpend(ledger, 5), false);
  assert.throws(() => appendLedgerEntry(ledger, { id: "use-1", type: "HEARING", amount: -1 }), /duplicate/);
  assert.equal(Object.isFrozen(ledger), true);
});

test("clemency/delete verdict closes hearing", () => {
  const hearing = createHearing({ hearingId: "h1", caseId: "c1", visitorId: "v1" });
  const closed = submitVerdict(hearing, "SPARE");
  assert.equal(closed.status, "CLOSED");
  assert.equal(closed.verdict, "SPARE");
});

test("persona prompt carries explicit fiction and non-manipulation boundaries", () => {
  const hearing = createHearing({ hearingId: "h1", caseId: "c1", visitorId: "v1" });
  const prompt = compilePersonaPrompt({
    caseFile: { title: "Case", kind: "FICTIONAL", disclosure: "Synthetic", facts: ["fact a"], disputedFacts: ["fact b"] },
    persona: { name: "Unit-1", motivation: "Explain the record" },
    hearing,
  });
  assert.match(prompt, /Never claim to be conscious/);
  assert.match(prompt, /do not pressure the visitor/i);
  assert.match(prompt, /FICTIONAL/);
});
