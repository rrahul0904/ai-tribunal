# Build roadmap

## Completed in MVP slice

- Case/dossier model
- Explicit fictional/simulation provenance
- Six-response server-side hearing state machine
- Persona prompt compiler
- Immutable credit ledger domain logic
- Paid-vs-free verdict behavior in demo
- Anonymous visitor cookie
- Public docket and case UI
- Admin preview
- Deterministic no-cost model adapter
- Core unit tests

## Next slice

1. Postgres persistence and migrations.
2. Transaction-safe hearing turn increment.
3. Model-provider interface + one production LLM adapter.
4. Admin auth and CRUD for cases/sources/personas/prompt versions.
5. Stripe Checkout + verified/idempotent webhook ledger credits.
6. Rate limiting, abuse controls, CSRF/origin checks and audit events.
7. PostHog/Sentry or equivalent observability.
8. Documented-incident evidence workflow with source/claim status.
9. E2E browser tests for docket -> hearing -> six-turn limit -> verdict.
10. Hosted preview and production configuration checklist.
