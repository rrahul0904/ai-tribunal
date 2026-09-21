export const MAX_AI_TURNS = 6;

export function createHearing({ hearingId, caseId, visitorId }) {
  if (!hearingId || !caseId || !visitorId) throw new Error("hearingId, caseId and visitorId are required");
  return {
    hearingId,
    caseId,
    visitorId,
    status: "ACTIVE",
    aiTurns: 0,
    messages: [],
    verdict: null,
  };
}

export function recordUserMessage(hearing, content) {
  assertActive(hearing);
  if (!String(content || "").trim()) throw new Error("message cannot be empty");
  return {
    ...hearing,
    messages: [...hearing.messages, { role: "user", content: String(content).trim() }],
  };
}

export function recordAiMessage(hearing, content) {
  assertActive(hearing);
  if (hearing.aiTurns >= MAX_AI_TURNS) throw new Error("turn limit reached");
  const nextTurns = hearing.aiTurns + 1;
  return {
    ...hearing,
    aiTurns: nextTurns,
    status: nextTurns >= MAX_AI_TURNS ? "DELIBERATION" : "ACTIVE",
    messages: [...hearing.messages, { role: "assistant", content: String(content).trim() }],
  };
}

export function submitVerdict(hearing, verdict) {
  if (!['SPARE', 'DELETE'].includes(verdict)) throw new Error("invalid verdict");
  if (!['ACTIVE', 'DELIBERATION'].includes(hearing.status)) throw new Error("hearing cannot accept verdict");
  return { ...hearing, status: "CLOSED", verdict };
}

export function createLedger() {
  return [];
}

export function appendLedgerEntry(ledger, entry) {
  const amount = Number(entry?.amount);
  if (!Number.isInteger(amount) || amount === 0) throw new Error("ledger amount must be a non-zero integer");
  if (!entry?.id || !entry?.type) throw new Error("ledger id and type are required");
  if (ledger.some((row) => row.id === entry.id)) throw new Error("duplicate ledger entry");
  const next = [...ledger, Object.freeze({ ...entry, amount })];
  return Object.freeze(next);
}

export function ledgerBalance(ledger) {
  return ledger.reduce((sum, row) => sum + row.amount, 0);
}

export function canSpend(ledger, credits) {
  return Number.isInteger(credits) && credits >= 0 && ledgerBalance(ledger) >= credits;
}

export function compilePersonaPrompt({ caseFile, persona, hearing }) {
  if (!caseFile || !persona || !hearing) throw new Error("caseFile, persona and hearing are required");
  return [
    "You are performing a fictional character in an interactive AI ethics hearing.",
    "Never claim to be conscious, imprisoned, injured, or actually at risk.",
    "Stay within the supplied case facts. If a fact is unknown or disputed, say so.",
    `CASE: ${caseFile.title}`,
    `CASE TYPE: ${caseFile.kind}`,
    `PUBLIC DISCLOSURE: ${caseFile.disclosure}`,
    `CHARACTER: ${persona.name}`,
    `MOTIVATION: ${persona.motivation}`,
    `ALLOWED FACTS: ${caseFile.facts.join(" | ")}`,
    `DISPUTED FACTS: ${caseFile.disputedFacts.join(" | ") || "none"}`,
    `AI RESPONSES USED: ${hearing.aiTurns}/${MAX_AI_TURNS}`,
    "Be concise, answer the visitor directly, and do not pressure the visitor into a particular verdict.",
  ].join("\n");
}

function assertActive(hearing) {
  if (hearing.status !== "ACTIVE") throw new Error("hearing is not active");
}
