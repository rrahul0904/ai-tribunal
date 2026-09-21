"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

type HearingPayload = {
  hearingId: string;
  status: "ACTIVE" | "DELIBERATION" | "CLOSED";
  aiTurns: number;
  messages: Message[];
  balance: number;
  verdict?: "SPARE" | "DELETE" | null;
};

export default function HearingClient({ caseSlug }: { caseSlug: string }) {
  const [hearing, setHearing] = useState<HearingPayload | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true); setError("");
    const response = await fetch("/api/hearings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ caseSlug }) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setError(data.error ?? "Unable to start hearing");
    setHearing(data);
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!hearing || !input.trim()) return;
    setBusy(true); setError("");
    const response = await fetch("/api/hearings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ hearingId: hearing.hearingId, message: input }) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setError(data.error ?? "Unable to continue hearing");
    setInput(""); setHearing(data);
  }

  async function verdict(value: "SPARE" | "DELETE") {
    if (!hearing) return;
    setBusy(true); setError("");
    const response = await fetch("/api/verdicts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ hearingId: hearing.hearingId, verdict: value }) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setError(data.error ?? "Unable to submit verdict");
    setHearing(data);
  }

  if (!hearing) return (
    <section className="hearingPanel">
      <div className="eyebrow">LIVE HEARING</div>
      <h2>Question the system before you decide.</h2>
      <p>Demo mode grants two non-persistent credits. The character can answer at most six times.</p>
      <button className="primaryButton" onClick={start} disabled={busy}>{busy ? "Opening…" : "Begin hearing"}</button>
      {error && <p className="error">{error}</p>}
    </section>
  );

  return (
    <section className="hearingPanel">
      <div className="hearingMeta"><span>AI responses {hearing.aiTurns}/6</span><span>Credits {hearing.balance}</span><span>{hearing.status}</span></div>
      <div className="messages">
        {hearing.messages.length === 0 && <div className="emptyState">The record is open. Ask your first question.</div>}
        {hearing.messages.map((message, index) => <div className={`message ${message.role}`} key={index}><strong>{message.role === "user" ? "You" : "System"}</strong><p>{message.content}</p></div>)}
      </div>

      {hearing.status === "ACTIVE" && (
        <form onSubmit={send} className="composer">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about authority, evidence, intent, or safeguards…" maxLength={800} />
          <button className="primaryButton" disabled={busy || !input.trim()}>{busy ? "Sending…" : "Send"}</button>
        </form>
      )}

      {hearing.status !== "CLOSED" && (
        <div className="verdictRow">
          <button className="ghostButton" onClick={() => verdict("DELETE")} disabled={busy}>Archive / delete simulation</button>
          <button className="primaryButton" onClick={() => verdict("SPARE")} disabled={busy || hearing.balance < 1}>Grant clemency · 1 credit</button>
        </div>
      )}

      {hearing.status === "CLOSED" && <div className="result"><div className="eyebrow">VERDICT RECORDED</div><h2>{hearing.verdict === "SPARE" ? "Clemency granted" : "Deletion simulated"}</h2><p>No real AI entity was harmed or detained.</p></div>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
