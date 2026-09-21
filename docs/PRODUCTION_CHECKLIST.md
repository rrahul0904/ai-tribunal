# Production launch checklist

## Must be true before calling the product production-ready

- [ ] Postgres migration applied in a hosted database.
- [ ] Hearing creation, message append and AI-turn increment use transactions/row locks.
- [ ] Sixth response is enforced in the database-backed service, not only UI code.
- [ ] One production model adapter is integrated with bounded output tokens and timeouts.
- [ ] Prompt version/hash and provider/model are persisted for every hearing.
- [ ] Admin authentication is enabled; public users cannot mutate cases or prompt versions.
- [ ] Documented cases cannot publish without approved sources.
- [ ] Research consent is versioned and separated from ordinary product acceptance.
- [ ] Stripe Checkout is server-created.
- [ ] Credits are granted only after verified Stripe webhook events.
- [ ] Stripe webhook event IDs are idempotent and stored before ledger settlement.
- [ ] Credit balance is derived from immutable ledger entries.
- [ ] Distributed rate limiting protects hearing creation and model turns.
- [ ] Per-visitor and per-IP abuse limits exist without treating browser values as authoritative.
- [ ] CSRF/origin checks cover mutating browser requests.
- [ ] Structured audit events cover admin changes, payments, hearings and verdicts.
- [ ] Error monitoring strips message content unless explicitly required and consented.
- [ ] Product analytics avoids collecting raw hearing content by default.
- [ ] E2E tests cover first visit, six turns, early verdict, insufficient credit, duplicate payment webhook and recovery.
- [ ] Accessibility pass covers keyboard navigation, focus states and contrast.
- [ ] Legal copy clearly distinguishes fictional cases, simulations and documented incidents.
- [ ] Hosted preview is verified at the exact deployment commit before production promotion.

## Launch gates

**Gate A — Repository certified:** unit/integration tests green, migration review complete, no high-severity dependency findings.

**Gate B — Hosted preview certified:** browser UAT green, model/payment sandbox flows green, webhook replay/idempotency tested.

**Gate C — Production configured:** production secrets, domain, alerting, backups, privacy/terms and support channel in place.

Do not merge these gates into a single “done” percentage. A green repository does not certify hosted infrastructure.
