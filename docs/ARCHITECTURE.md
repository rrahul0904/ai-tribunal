# AI Tribunal architecture

## Clean-room product boundary

AI Tribunal reproduces generic interaction mechanics only: case dossiers, evidence, limited-turn AI hearings, verdicts, credits, research/analytics hooks, and administrative case management. It must not copy AIJail branding, visual assets, proprietary case narratives, prompts, biographies, or UI implementation.

## Runtime model

1. Visitor opens a case dossier.
2. Server creates a hearing with a stable visitor/session identifier.
3. Visitor sends a question.
4. Server validates hearing ownership/status and turn budget.
5. Server compiles persona + case facts + policy.
6. Model adapter generates a response.
7. Server records response and increments AI-turn count atomically.
8. At six AI responses the hearing moves to DELIBERATION.
9. Verdict closes the hearing. SPARE may consume one credit; DELETE simulation is free.

The browser never controls turn count, balance, or verdict settlement.

## Persistence target

The demo uses an in-memory runtime store. Production should replace it with Postgres transactions and the following tables:

- visitors
- cases
- case_sources
- personas
- persona_prompt_versions
- hearings
- hearing_messages
- verdicts
- wallets
- wallet_ledger
- purchases
- payment_events
- research_consents
- research_responses
- audit_events
- admin_users

Critical constraints:

- `wallet_ledger.id` unique; balance derived from immutable entries.
- Stripe webhook event ID unique to guarantee idempotency.
- `hearing_messages` append-only in normal application flow.
- `hearings.ai_turns <= 6` enforced in the transaction that stores model output.
- published documented cases require at least one approved source.
- prompt versions are immutable after they have been used in a completed hearing.

## Model adapter

The checked-in demo adapter is deterministic and does not call a paid LLM. Production adapters should expose:

```ts
interface HearingModel {
  generate(input: {
    systemPrompt: string;
    messages: Array<{role: 'user' | 'assistant'; content: string}>;
    maxOutputTokens: number;
  }): Promise<{ text: string; provider: string; model: string; usage?: Record<string, number> }>;
}
```

Persist provider/model/prompt version with every generated response for reproducibility.

## Safety / trust design

- Fiction disclosure remains visible in the hearing UI.
- Persona prompt forbids claims of actual consciousness, imprisonment, injury, or real risk.
- Persona may advocate its interpretation of the case but must not guilt or coerce the visitor into a verdict.
- Real incidents require source provenance and explicit claim status.
- Research consent is separate from basic product terms.
