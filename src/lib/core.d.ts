export const MAX_AI_TURNS: number;
export type Hearing = {
  hearingId: string;
  caseId: string;
  visitorId: string;
  status: "ACTIVE" | "DELIBERATION" | "CLOSED";
  aiTurns: number;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  verdict: null | "SPARE" | "DELETE";
};
export function createHearing(args: { hearingId: string; caseId: string; visitorId: string }): Hearing;
export function recordUserMessage(hearing: Hearing, content: string): Hearing;
export function recordAiMessage(hearing: Hearing, content: string): Hearing;
export function submitVerdict(hearing: Hearing, verdict: "SPARE" | "DELETE"): Hearing;
export function createLedger(): ReadonlyArray<{ id: string; type: string; amount: number; note?: string }>;
export function appendLedgerEntry<T extends { id: string; type: string; amount: number; note?: string }>(ledger: ReadonlyArray<T>, entry: T): ReadonlyArray<T>;
export function ledgerBalance(ledger: ReadonlyArray<{ amount: number }>): number;
export function canSpend(ledger: ReadonlyArray<{ amount: number }>, credits: number): boolean;
export function compilePersonaPrompt(args: { caseFile: { title: string; kind: string; disclosure: string; facts: string[]; disputedFacts: string[] }; persona: { name: string; motivation: string }; hearing: Hearing }): string;
