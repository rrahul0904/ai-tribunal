# AI Tribunal MVP

Clean-room interactive AI ethics hearing platform inspired by the mechanics of AIJail, with stronger provenance and non-deceptive fiction boundaries.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Test core invariants

```bash
npm run test:core
```

## Current state

This repository contains a functional demo-mode product slice. It intentionally uses an in-memory store and a deterministic response adapter so the UX can be exercised without paid infrastructure. Production readiness requires the persistence, auth, payments, rate-limit, observability and E2E work in `docs/ROADMAP.md`.
