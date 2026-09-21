import { randomUUID } from "crypto";
import { createRequire } from "module";
import type { TribunalCase } from "./demo-data";

const require = createRequire(import.meta.url);
const core = require("./core.mjs") as typeof import("./core.mjs");

type Hearing = ReturnType<typeof core.createHearing>;

type RuntimeState = {
  hearings: Map<string, Hearing>;
  ledgers: Map<string, ReadonlyArray<{ id: string; type: string; amount: number; note?: string }>>;
};

const globalForRuntime = globalThis as typeof globalThis & { __tribunalRuntime?: RuntimeState };

const state = globalForRuntime.__tribunalRuntime ?? {
  hearings: new Map(),
  ledgers: new Map(),
};

if (process.env.NODE_ENV !== "production") globalForRuntime.__tribunalRuntime = state;

export function startDemoHearing(caseFile: TribunalCase, visitorId: string) {
  const hearing = core.createHearing({ hearingId: randomUUID(), caseId: caseFile.slug, visitorId });
  state.hearings.set(hearing.hearingId, hearing);
  return hearing;
}

export function getHearing(id: string) {
  return state.hearings.get(id);
}

export function saveHearing(hearing: Hearing) {
  state.hearings.set(hearing.hearingId, hearing);
  return hearing;
}

export function creditVisitor(visitorId: string, amount = 2) {
  const ledger = state.ledgers.get(visitorId) ?? core.createLedger();
  if (core.ledgerBalance(ledger) > 0) return ledger;
  const next = core.appendLedgerEntry(ledger, {
    id: randomUUID(),
    type: "DEMO_GRANT",
    amount,
    note: "Non-persistent demo credits",
  });
  state.ledgers.set(visitorId, next);
  return next;
}

export function spendCredit(visitorId: string, reason: string) {
  const ledger = state.ledgers.get(visitorId) ?? core.createLedger();
  if (!core.canSpend(ledger, 1)) throw new Error("insufficient credits");
  const next = core.appendLedgerEntry(ledger, { id: randomUUID(), type: reason, amount: -1 });
  state.ledgers.set(visitorId, next);
  return next;
}

export function getBalance(visitorId: string) {
  return core.ledgerBalance(state.ledgers.get(visitorId) ?? []);
}

export { core };
