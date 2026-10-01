# SAT-SA — Implementation Plan (v2)

> **v2 changes:** hidden-maturity synthetic data generator and blind-defect validation (removes circular validation), rule rationale / benign-explanation fields, explicit capability-indicator catalogue per dimension, "headline KPIs vs underlying evidence" view, time-boxed scope cut for the finale, and extra risks. See §0.1.

**Supervisory Analytics Tool for SOC Assessment (NCIIPC)**
Stack: **Node.js + Express (plain JavaScript, ESM)** · **React + TypeScript + Tailwind** · **PostgreSQL** · **Docker Compose** · **100% offline**

---

## 0. How to use this document

This is the single source of truth for building SAT-SA. It is written so that a human developer or an AI coding agent can pick any task and execute it without guessing. Read sections 1–4 first. Then work through sections 14–15 phase by phase. Everything else is reference.

**Non-negotiables (from the problem statement + your constraints):**

| # | Rule |
|---|------|
| N1 | Fully air-gapped: no internet, no cloud, no SaaS, no external AI/APIs, no CDN fonts/scripts at runtime or build-inside-container. |
| N2 | It is a *supervisory analytics* tool: batch/periodic data, no real-time monitoring, no log collection, not a SIEM/SOC. |
| N3 | Backend = plain JavaScript (Node + Express). **No TypeScript in backend.** Use JSDoc for types. |
| N4 | Frontend = React + TypeScript + Tailwind CSS. |
| N5 | All state lives in the **database** (PostgreSQL). **No localStorage, sessionStorage, or JSON/CSV data files** as a data source. |
| N6 | **100% dynamic**: rules, thresholds, weights, mappings, peer groups, taxonomies, dashboards, and reports are data in the DB, editable from the UI. Nothing is hard-coded in UI or services. |
| N7 | **Modular code** everywhere (feature modules, single-responsibility files, plug-in detectors). |
| N8 | Everything is explainable and auditable: every finding carries rationale, evidence, parameters and run snapshot. |
| N9 | Everything runs through Docker (`docker compose up`). |
| N10 | **Honest validation.** Synthetic data proves the *method*, not real-world accuracy. Defects must emerge from simulated behaviour, and at least part of the test set must be designed blind (§17.4). The UI, README and slides must say so. |
| N11 | **Scope discipline.** Build the thin, working vertical slice first (§22.1). Anything beyond the "Must" tier is roadmap until the slice is demo-ready. |

### 0.1 What changed in v2 (and why)

| Change | Reason |
|---|---|
| Hidden-maturity generator + blind defect set (§17.4, Phase 4) | v1 injected defects and then measured whether detectors found them — circular. A sceptical judge would attack this first. |
| Rule rationale, benign explanations, references, status (§6.1, §7.8) | Indicators must be defensible as *hypotheses* for examiners to confirm, not assumed truths. |
| Capability-indicator catalogue per dimension (§7.9) | Makes all eight assessment dimensions visibly covered with plain, familiar numbers (triage time, MTTR, escalation completeness, backlog). |
| "Headline KPIs vs underlying evidence" view (§12.2) | The clearest demonstration of an *execution gap*; also the easiest story for non-experts. |
| Time-boxed cut and smallest winning demo (§22.1) | v1 was a multi-week plan; finals are typically much shorter. |
| New risks (§22) | Circular validation, indicator validity, demo legibility. |

---

## 1. Role of the AI coding agent (read before writing any code)

You (the AI) are acting as a **Principal Full-Stack Engineer** building a government-grade, air-gapped analytics product. Your job is to produce small, correct, tested, modular increments, not big-bang code dumps.

### 1.1 Operating rules

1. **Plan, then code.** For each task, state (in 3–6 lines) the files you will create/change, the interfaces they expose, and the tests you will add. Then implement.
2. **One task = one vertical slice** (migration → repository → service → route → test → UI hook → UI component) unless the task says otherwise.
3. **Modularity is mandatory.**
   - Backend: feature modules under `src/modules/<feature>/` with the fixed layering `routes → controller → service → repository`. Controllers never touch SQL. Repositories never contain business rules. Services never touch `req`/`res`.
   - Detectors are **plug-ins** (one file each) behind a single interface (section 7.2). Adding a detector must require **zero changes** to the engine, only a new file and a DB seed row.
   - Frontend: feature folders; components ≤ ~200 lines; no business logic inside JSX; data fetching only via hooks in `features/*/api`.
4. **No hard-coding.** If a value could reasonably change (threshold, weight, label, colour mapping, category list, severity order, SLA, window length, page size), it goes in the DB/settings and is read through a service. Constants allowed only for true invariants (HTTP codes, SQL identifiers).
5. **No localStorage / sessionStorage / JSON data files.** User preferences (theme, table columns, filters) are stored in `user_preferences` via the API. Auth uses an httpOnly cookie session stored in the DB.
6. **Parameterised SQL only.** Use Knex query builder or `?` / `$1` bindings. Never string-concatenate user input into SQL. Dynamic identifiers must pass an allow-list.
7. **Every external input is validated** with Zod schemas at the route boundary (body, query, params, uploaded file metadata).
8. **Errors:** throw typed `AppError` subclasses; one central error middleware maps them to a consistent JSON error envelope `{error:{code,message,details,requestId}}`.
9. **Logging:** structured (pino), with `requestId`, never logging secrets or raw note text at info level.
10. **Tests accompany code.** Unit tests for pure logic (detectors, scoring), integration tests for repositories/routes (against a real Postgres test container), component tests for non-trivial UI. A task is not done without tests.
11. **Small commits, conventional messages** (`feat(detectors): add EG-04 templated notes`). Never leave the repo in a broken state.
12. **Don't invent dependencies.** Use only the approved list (section 4). If you need another package, justify it (why, size, licence, maintenance, offline-safe) before adding it.
13. **Offline check:** before adding anything that fetches at runtime (fonts, icons, maps, analytics, CDN), stop. Self-host or remove it.
14. **Explainability is a feature, not an afterthought.** Every detector must output `rationale`, `metrics`, `thresholds`, `peer_context` and `evidence[]`.
15. **Be honest in docs and UI.** Statistical flags are *indicators for examiner review*, never verdicts. Wording must reflect that.
16. **Do not skip failing tests** or comment them out. Fix the cause.

### 1.2 Definition of Done (every task)

- [ ] Code follows module layering and file-size guidance
- [ ] No hard-coded business values; config read from DB/settings
- [ ] Input validated; errors typed; auth/RBAC applied where needed
- [ ] Migration added (reversible) if schema changed; indexes considered
- [ ] Tests written and passing (`npm test` in the relevant package)
- [ ] Lint + format pass (`npm run lint`)
- [ ] OpenAPI spec updated (generated from Zod schemas) and frontend types regenerated
- [ ] Audit log entry emitted for mutating actions
- [ ] Docs: module README updated if behaviour/interface changed
- [ ] Works inside Docker (not only on the host)

### 1.3 Master prompt (paste at the start of every AI session)

```text
You are the Principal Full-Stack Engineer on SAT-SA, an air-gapped supervisory analytics tool.
Read /docs/implementation-plan.md sections 0-4 and the section for the current task.
Constraints: backend plain JavaScript (ESM) + Express + PostgreSQL via Knex; frontend React + TypeScript + Tailwind;
Docker only; no internet at runtime; no localStorage/sessionStorage/JSON data files; everything dynamic from the DB.
Rules: modular feature modules (routes->controller->service->repository), plug-in detectors, Zod validation,
typed errors, parameterised SQL, tests with every change, explainable outputs, audit logs on mutations.
Workflow: (1) restate the task and list files + interfaces + tests, (2) implement, (3) run tests/lint, (4) summarise
what changed and any follow-ups. Do not add dependencies outside the approved list without justification.
Current task: <paste task ID and description>
```

### 1.4 Role of AI/ML *inside the product*

The product's analytics are deliberately **assistive and transparent**:

- Primary engine: deterministic, rule-based detectors + robust statistics (explainable by construction).
- ML is limited to **unsupervised anomaly scoring** (Isolation Forest) and **text near-duplicate detection** (SimHash/MinHash). No LLM, no external model, no GPU.
- ML output never directly decides anything. It adds a *score + top contributing features* that a supervisor can inspect, accept, or dismiss.
- Examiner feedback (confirm / false positive) is stored and used to measure per-rule precision and to *suggest* (never auto-apply) threshold changes.

---

## 2. Product scope and mapping to the problem statement

| Requirement (problem statement) | Where it is satisfied |
|---|---|
| Ingest CSV/JSON/DB export/API from multiple CSEs | §6 Ingestion pipeline (CSV, JSON/NDJSON, SQL dump import, REST ingestion endpoint) |
| Large datasets, many entities/periods | §10 Scalability (partitioning, COPY, rollups, workers) |
| Detect detection/investigation/escalation weaknesses | §7 detector catalogue (EG-*), dimension mapping |
| Execution gaps | §7.3 |
| Negative space | §7.4 |
| Anomalies, outliers, suspicious patterns | §7.5 stats + Isolation Forest |
| Peer comparison / benchmarking | §8 peer groups + robust z, percentile |
| Entity-level risk indicators | §9 scoring |
| Prioritise entities/controls/processes/alert samples | §9.4 prioritised sampling |
| Explainability, evidence, traceability, audit | §11 |
| Dashboards, reports, trends, drill-down | §12 frontend, §13 reports |
| Offline/air-gapped; no external AI | §3, §16 |
| Specify ML architecture/hardware/training/update/explainability/audit | §7.6 |
| Validation vs expert manual review | §17 |
| Deliverables | §18 |

Out of scope (must be stated in README/UI "About"): real-time monitoring, SIEM features, log/telemetry collection, centralized SOC, national monitoring.

---

## 3. System architecture

```text
                    ┌─────────────────────────── Docker network (internal only) ───────────────────────────┐
 Browser ──HTTPS──► │  gateway (nginx)                                                                      │
 (supervisor)       │    ├─ /        → frontend static (React build)                                       │
                    │    └─ /api     → api (Express)                                                       │
                    │                                                                                       │
                    │  api (Express, plain JS)  ── enqueue jobs ──►  Postgres (pg-boss queue schema)        │
                    │     modules: auth, entities, imports, assets, alerts, cases, rules, runs, findings,    │
                    │              peers, scoring, sampling, reports, validation, audit, admin              │
                    │                                                                                       │
                    │  worker (same codebase, different entrypoint)                                         │
                    │     jobs: import.parse, import.load, rollup.refresh, analysis.run, report.render,      │
                    │           synth.generate, validation.run, model.train                                  │
                    │                                                                                       │
                    │  db (PostgreSQL 16): app data, rules, findings, queue, audit log, ML model registry    │
                    └───────────────────────────────────────────────────────────────────────────────────────┘
```

**Design choices and why**

- **Single runtime (Node)**: smaller attack surface, simpler air-gap packaging, one language for analytics + API.
- **PostgreSQL does the heavy lifting**: window functions, percentile_cont, partitioning, JSONB, `COPY`, materialised aggregates. Detectors are mostly SQL + light JS post-processing.
- **pg-boss** (Postgres-backed queue): no Redis, one less service, jobs are durable and visible in the DB.
- **Worker separate from API**: long analysis runs never block HTTP. Same image, different `command`.
- **Server-side sessions** in DB (httpOnly cookie) instead of localStorage tokens: satisfies N5 and allows instant revocation.
- **Nginx gateway**: TLS termination (self-signed or org-provided cert), strict CSP, gzip, static caching.

---

## 4. Technology choices (approved list)

### 4.1 Backend (plain JavaScript)

| Concern | Choice | Notes |
|---|---|---|
| Runtime | Node.js LTS (22 or 24), ESM (`"type":"module"`) | Pin in `.nvmrc` and Dockerfile |
| Web | Express 4/5 | |
| DB access | `knex` + `pg` | migrations, seeds, query builder |
| Queue | `pg-boss` | Postgres-backed jobs |
| Validation | `zod` | Single source for validation + OpenAPI |
| OpenAPI | `@asteasolutions/zod-to-openapi` | Generated spec → frontend types |
| Auth | `argon2`, server sessions (own table), `csrf` double-submit | httpOnly + SameSite=Strict cookie |
| Security | `helmet`, `express-rate-limit`, `cors` (same-origin by default) | |
| Upload | `multer` (disk temp) + streaming parsers | Size caps from settings |
| CSV | `csv-parse` (streaming) | |
| JSON | `stream-json` (streaming), NDJSON line parser | |
| DB bulk | `pg-copy-streams` | `COPY FROM STDIN` |
| Stats | `simple-statistics` + own small helpers (MAD, robust z, Wilson, CUSUM) | Keep own helpers tested |
| Isolation Forest | **Own adapter** `ml/anomaly/isolationForest.js` wrapping a pure-JS implementation (e.g. `ml-isolation-forest`) | Wrap behind an interface so it can be swapped or replaced by an in-house ~100-line implementation. Verify maintenance status of any package at install time (`isolation-forest` on npm had a slow release cadence) |
| Text similarity | Own SimHash / MinHash module | No dependency needed; pure JS |
| PDF | `pdfkit` (pure JS, no headless browser) | Offline-safe, small |
| Logging | `pino`, `pino-http` | |
| Tests | `vitest`, `supertest`, `testcontainers` (or compose test DB) | |
| Lint/format | `eslint`, `prettier`, JSDoc type-check via `tsc --checkJs` (dev only, no TS source) | Gives type safety without TypeScript files |

### 4.2 Frontend (React + TypeScript + Tailwind)

| Concern | Choice |
|---|---|
| Build | Vite + React 18/19 + TypeScript (strict) |
| Styling | Tailwind CSS (+ `@tailwindcss/forms`), design tokens in `tailwind.config`; **self-hosted fonts** (e.g. via `@fontsource/*` bundled at build) |
| Routing | React Router |
| Server state | TanStack Query (cache is in memory only) |
| Tables | TanStack Table + virtualisation (`@tanstack/react-virtual`) |
| Charts | Apache ECharts (`echarts`, `echarts-for-react`) *or* Recharts. ECharts recommended for heatmaps, boxplots, radar |
| Forms | `react-hook-form` + `zod` resolvers |
| UI state (non-persistent) | `zustand` (in-memory only; no persist middleware) |
| API types | `openapi-typescript` generated from backend OpenAPI; thin `fetch` wrapper |
| Icons | `lucide-react` (bundled) |
| Tests | Vitest + React Testing Library; Playwright for a few E2E flows (browsers installed in dev image only) |

### 4.3 Database

PostgreSQL 16 with extensions: `pgcrypto` (UUID/hash), `pg_trgm` (fuzzy/text search). Avoid exotic extensions to keep air-gap packaging simple. Partition large fact tables by month.

### 4.4 Infra

Docker + Docker Compose v2. Multi-stage builds. Non-root containers. Read-only filesystems where possible. `Makefile` targets for every common action.

---

## 5. Repository layout (monorepo)

```text
satsa/
├─ docker-compose.yml
├─ docker-compose.dev.yml            # hot reload overrides
├─ docker-compose.test.yml
├─ Makefile
├─ .env.example
├─ README.md
├─ docs/
│  ├─ implementation-plan.md         # this file
│  ├─ architecture.md                # 2-page submission doc
│  ├─ methodology.md                 # analytics methodology + formulas
│  ├─ data-requirements.md           # input schemas + examples
│  ├─ validation.md
│  ├─ deployment-airgap.md
│  └─ adr/                           # architecture decision records
├─ gateway/
│  ├─ Dockerfile
│  └─ nginx.conf.template
├─ backend/
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ knexfile.js
│  ├─ migrations/                    # ordered, reversible
│  ├─ seeds/                         # default rules, taxonomy, roles (editable afterwards in UI)
│  ├─ src/
│  │  ├─ server.js                   # API entrypoint
│  │  ├─ worker.js                   # worker entrypoint
│  │  ├─ app.js                      # express app factory
│  │  ├─ core/
│  │  │  ├─ config/                  # env parsing (zod) + settings service (DB-backed)
│  │  │  ├─ db/                      # knex instance, tx helper, pagination, filter builder
│  │  │  ├─ http/                    # middleware: auth, rbac, validate, error, requestId, csrf, rateLimit
│  │  │  ├─ errors/                  # AppError, NotFound, Validation, Forbidden, Conflict
│  │  │  ├─ logger/
│  │  │  ├─ queue/                   # pg-boss wiring, job registry
│  │  │  ├─ openapi/                 # registry + spec builder
│  │  │  └─ utils/                   # time, hash, stream helpers
│  │  ├─ modules/
│  │  │  ├─ auth/                    # login, sessions, password policy
│  │  │  ├─ users/  roles/
│  │  │  ├─ entities/                # CSEs, sectors, tiers
│  │  │  ├─ assets/                  # inventory + criticality
│  │  │  ├─ imports/                 # batches, mapping profiles, parsers, validators, loaders
│  │  │  ├─ alerts/  cases/  escalations/  investigations/
│  │  │  ├─ taxonomy/                # severity, category, disposition normalisation maps
│  │  │  ├─ rules/                   # rule definitions, versions, params
│  │  │  ├─ detectors/               # plug-ins (one file per detector) + registry + base
│  │  │  ├─ peers/                   # peer-group builder + benchmarks
│  │  │  ├─ analytics/               # features, rollups, stats helpers
│  │  │  ├─ ml/                      # anomaly, text-sim, model registry
│  │  │  ├─ scoring/                 # profiles, dimension mapping, composite, shrinkage
│  │  │  ├─ sampling/                # prioritised review samples
│  │  │  ├─ findings/                # findings + evidence + drill-down
│  │  │  ├─ runs/                    # analysis runs, config snapshots, comparisons
│  │  │  ├─ reviews/                 # examiner decisions / feedback
│  │  │  ├─ reports/                 # templates, renderers (pdf/csv/html)
│  │  │  ├─ synth/                   # synthetic data generator + ground truth
│  │  │  ├─ validation/              # benchmark metrics vs baselines
│  │  │  ├─ audit/                   # hash-chained audit log
│  │  │  └─ admin/                   # settings, health, backups, model registry
│  │  └─ jobs/                       # job handlers that call services
│  └─ tests/
├─ frontend/
│  ├─ Dockerfile
│  ├─ package.json  tsconfig.json  vite.config.ts  tailwind.config.ts
│  └─ src/
│     ├─ app/                        # router, providers, layout shell
│     ├─ api/                        # generated types + fetch client
│     ├─ components/                 # ui primitives (Button, Table, Modal, Chart wrappers)
│     ├─ features/
│     │  ├─ auth/ dashboard/ entities/ findings/ review-queue/ peers/ coverage/
│     │  ├─ imports/ rules/ scoring/ runs/ reports/ validation/ synth/ admin/
│     │  └─ (each: api/ components/ pages/ hooks/ types.ts)
│     ├─ hooks/  lib/  styles/
│     └─ tests/
└─ scripts/
   ├─ build-offline-bundle.sh        # docker save + checksums
   ├─ load-offline-bundle.sh
   ├─ backup.sh  restore.sh
   └─ verify-no-network.sh
```

Module convention (every backend module):

```text
modules/<feature>/
  <feature>.routes.js        # route table + zod schemas + RBAC
  <feature>.controller.js    # req/res only
  <feature>.service.js       # business rules, transactions
  <feature>.repository.js    # all SQL for this feature
  <feature>.schemas.js       # zod (also feeds OpenAPI)
  <feature>.types.js         # JSDoc typedefs
  index.js                   # public surface (only import from here across modules)
  README.md  tests/
```

Cross-module imports go **only** through `index.js`. A lint rule (`eslint-plugin-boundaries` or `no-restricted-imports`) enforces this.

---

## 6. Data model (PostgreSQL)

All timestamps `timestamptz` (UTC). All PKs UUID (`gen_random_uuid()`) except high-volume facts using `bigint` identity. All tables have `created_at`, `updated_at` where relevant. Foreign keys with `ON DELETE RESTRICT` unless stated.

### 6.1 Reference and configuration (all editable in UI)

| Table | Purpose / key columns |
|---|---|
| `sectors` | id, code, name (energy, telecom, BFSI, transport, health, govt...) |
| `entities` | id, code, name, sector_id, size_tier, region, metadata jsonb, active |
| `users`, `roles`, `user_roles`, `permissions`, `role_permissions` | RBAC (roles: admin, supervisor, examiner, viewer) |
| `sessions` | id, user_id, token_hash, expires_at, ip, user_agent, revoked_at |
| `user_preferences` | user_id, key, value jsonb (theme, columns, saved filters; replaces localStorage) |
| `settings` | key, value jsonb, scope, description, updated_by (upload limits, retention, SLA defaults, window sizes) |
| `taxonomy_severity` | id, label, rank, aliases text[] (maps "Crit", "P1", "Sev1"…) |
| `taxonomy_category` | id, code, name, parent_id, aliases text[] |
| `taxonomy_disposition` | id, label, class (true_positive / false_positive / benign / unknown / auto_closed), aliases |
| `mapping_profiles` | id, entity_id nullable, name, source_type, field_map jsonb, value_maps jsonb, version, active |
| `peer_groups` | id, name, strategy (sector / sector_tier / cluster / manual), params jsonb |
| `peer_group_members` | peer_group_id, entity_id, valid_from, valid_to |
| `expected_categories` | peer_group_id/sector_id, category_id, expected_min_share, source (derived/manual) |
| `scoring_profiles` | id, name, active, params jsonb (shrinkage, caps) |
| `dimensions` | id, code, name (Detection, Investigation, Escalation, Incident Response, Security Ops, Governance & Oversight, Operational Discipline, Cyber Resilience) |
| `scoring_weights` | profile_id, dimension_id, weight |
| `rules` | id, key (e.g. `EG-02`), kind (execution_gap/negative_space/anomaly), name, description, detector_key, enabled, severity_default, **rationale** (why this indicates weakness), **benign_explanations** text[] (legitimate reasons it may fire), **references** text[] (framework/practice it is based on), **maturity_status** (hypothesis / reviewed / validated), rationale_template |
| `indicator_definitions` | id, code, dimension_id, name, unit, direction (higher_better / lower_better / two_sided), definition (documented SQL expression or builder spec), rationale, benign_explanations, references, enabled |
| `feature_definitions` | id, code, name, definition (SQL expression), direction, scaling, enabled (feeds peer baselines and ML features; new features need no redeploy when expressible in SQL) |
| `rule_versions` | id, rule_id, version, params jsonb, params_hash, created_by, created_at, note |
| `rule_dimension_map` | rule_id, dimension_id, contribution_weight |
| `report_templates` | id, name, sections jsonb (ordered section definitions), format |

### 6.2 Operational facts (high volume)

| Table | Key columns |
|---|---|
| `import_batches` | id, entity_id, source_type (csv/json/sql/api), file_name, sha256, status (uploaded/validating/loaded/failed/rolled_back), period_start/end, row_counts jsonb, mapping_profile_id, uploaded_by, error_summary |
| `import_errors` | batch_id, row_no, field, code, message, raw jsonb |
| `assets` | id, entity_id, external_id, name, type, criticality (1–5), environment, owner_group, first_seen, last_seen, metadata jsonb |
| `alerts` (partitioned by month on `created_at`) | id bigint, entity_id, batch_id, external_id, asset_id, category_id, severity_id, source_tool, rule_name, created_at, acknowledged_at, closed_at, disposition_id, closure_reason, assignee_hash, auto_closed bool, case_id, raw_ref jsonb |
| `cases` | id, entity_id, batch_id, external_id, opened_at, closed_at, status, severity_id, resolution, root_cause_recorded bool, reopened_count |
| `case_alerts` | case_id, alert_id |
| `investigation_steps` | id, case_id/alert_id, entity_id, actor_hash, step_type, started_at, ended_at, note_len, note_simhash bigint, note_minhash int[], note_excerpt (optional, length-capped, configurable/redactable) |
| `escalations` | id, entity_id, case_id/alert_id, from_level, to_level, escalated_at, acknowledged_at, outcome |
| `telemetry_summaries` | entity_id, asset_id, day, source_tool, event_count (aggregate only; optional input; no raw logs) |
| `ingestion_coverage` | entity_id, source, day, rows_received (derived; powers data-completeness checks) |

Notes:
- Analyst identifiers are **pseudonymised at load time** with a per-installation salt (`assignee_hash`) so supervisors see "Analyst A7" not personal data.
- Free-text is optional. When supplied, store `simhash/minhash` + length; store excerpt only if the setting `store_note_text` is enabled.
- Indexes: `(entity_id, created_at)`, `(entity_id, asset_id, created_at)`, `(entity_id, severity_id, closed_at)`, BRIN on `created_at`, partial indexes for `closed_at IS NULL`.

### 6.3 Derived / analytics tables

| Table | Purpose |
|---|---|
| `alert_daily_agg` | entity, asset (nullable), category, severity, day → counts, closed counts, median/p90 TTA & TTC, escalated counts. Refreshed incrementally per import batch |
| `entity_period_features` | entity, period (week/month), ~40–60 numeric features (see §7.5) |
| `peer_baselines` | peer_group, period, feature, median, mad, p10, p25, p75, p90, n |
| `analysis_runs` | id, scope (entities, period), trigger (manual/after-import/scheduled), status, config_snapshot jsonb (all rule versions + weights + peer groups + settings), code_version, data_fingerprint, started/finished, created_by |
| `findings` | id, run_id, entity_id, rule_id, rule_version_id, kind, dimension_ids, title, severity_score (0–100), confidence (0–1), period_start/end, rationale jsonb, metrics jsonb, thresholds jsonb, peer_context jsonb, status (open / reviewed / dismissed) |
| `finding_evidence` | finding_id, record_type (alert/case/asset/step/escalation), record_id, role (primary/supporting/counter), note |
| `entity_scores` | run_id, entity_id, dimension_id (nullable for composite), score, confidence, rank, percentile, contributing_findings int, delta_vs_previous |
| `review_samples` | run_id, entity_id, record_type, record_id, priority_score, strategy (priority / exploration / stratified), reasons jsonb, rank |
| `review_decisions` | sample_id/finding_id, examiner_id, decision (confirmed / not_confirmed / needs_info), comment, decided_at |
| `model_registry` | id, name, version, algorithm, params jsonb, feature_schema jsonb, trained_on jsonb (batch ids, row counts, time window), artifact bytea, sha256, seed, metrics jsonb, status (candidate/active/retired), created_by |
| `audit_log` | id bigserial, ts, actor_id, action, object_type, object_id, before jsonb, after jsonb, ip, request_id, prev_hash, hash (hash-chain) |
| `synth_scenarios`, `synth_ground_truth` | scenario definition (JSON in DB), injected defects with exact record ids (for validation) |
| `validation_runs`, `validation_metrics` | benchmark outputs vs baselines |
| `reports` | id, template_id, run_id, params, status, file bytea/path in volume, sha256, created_by |

**Migrations:** one migration per logical change, each with `up` and `down`. Seeds only insert defaults (taxonomy, default rules + params, default weights, roles). After seeding, everything is editable through the UI and tracked by versions/audit.

---

## 7. Analytics methodology

### 7.1 Pipeline stages

1. **Ingest & normalise** → raw rows validated, mapped via `mapping_profiles`, severity/category/disposition normalised using taxonomy aliases, analyst IDs pseudonymised, loaded with `COPY`.
2. **Rollups** → `alert_daily_agg`, `ingestion_coverage` refreshed for affected entity/day ranges only.
3. **Feature build** → `entity_period_features` (weekly + monthly).
4. **Peer baselines** → built per peer group per period, robust (median/MAD, percentiles).
5. **Detectors run** → each enabled rule version executes (see 7.2), emits findings + evidence.
6. **ML scoring** → Isolation Forest on entity-period features and on alert-level features (optional); outputs attached to findings or as anomaly findings.
7. **Scoring** → per-dimension and composite entity scores with confidence.
8. **Sampling** → prioritised review samples per entity.
9. **Snapshot** → `analysis_runs.config_snapshot` stores everything needed to reproduce.

### 7.2 Detector plug-in contract

```js
// modules/detectors/base.js  (JSDoc types)
/**
 * @typedef {Object} DetectorContext
 * @property {import('knex').Knex} db           // read-only connection
 * @property {Object} run                       // run metadata + period
 * @property {Object} entity                    // entity under analysis
 * @property {Object} params                    // validated, versioned parameters from DB
 * @property {Object} peer                      // peer baselines accessor
 * @property {Object} taxonomy                  // normalisation helpers
 * @property {Object} logger
 */
/**
 * @typedef {Object} Finding
 * @property {string} title
 * @property {number} effect          // standardised effect size
 * @property {number} support         // number of records supporting (volume)
 * @property {Object} metrics         // observed values
 * @property {Object} thresholds      // thresholds used
 * @property {Object} peerContext     // peer median/MAD/percentile
 * @property {string} rationale       // human text from a template, filled with numbers
 * @property {Array<{type,id,role,note}>} evidence
 */
export default {
  key: 'EG-02',
  kind: 'execution_gap',
  version: 1,
  paramSchema: z.object({ ... }),     // zod, rendered as a form in the UI
  defaultParams: { ... },
  async run(ctx) { /* returns Finding[] */ },
};
```

**Registry** auto-discovers files in `modules/detectors/impl/*.js`. The `rules` table references `detector_key`; the UI renders parameter forms from `paramSchema` exposed via `/api/detectors`. Adding a detector = new file + seed row. **Parameters are never read from files**; they come from `rule_versions.params`.

**Rationale templates** live in the DB (`rules.rationale_template`) with placeholders, e.g. `"{{n_closed_fast}} of {{n_total}} critical alerts ({{pct}}%) were closed in under {{threshold_min}} min vs peer median {{peer_median_pct}}%"`.

### 7.3 Execution-gap detectors (documented controls vs operational evidence)

| ID | Detector | Logic | Key params (all dynamic) |
|---|---|---|---|
| EG-01 | High-severity alerts closed unusually quickly | Share of critical/high alerts with `closed_at − created_at` below `min_minutes` or below peer p10 for same severity/category; compare share to peer baseline | severities, min_minutes, peer_percentile, min_support |
| EG-02 | Critical alerts closed without escalation | Critical/high alerts with no escalation record and disposition not `false_positive` with documented reason | severities, allowed_dispositions, grace_hours |
| EG-03 | Acknowledged but not investigated | Alerts with `acknowledged_at` but zero investigation steps, or total note length / step duration below minimum | min_steps, min_note_len, min_investigation_minutes |
| EG-04 | Repetitive / templated investigations | SimHash/MinHash near-duplicates across different alerts (Hamming ≤ k or Jaccard ≥ τ), by analyst/entity/category; cluster size and share | hamming_k, jaccard_tau, min_cluster, min_note_len |
| EG-05 | Repeat alerts on same asset without remediation | Same asset + category ≥ N times in window, cases closed with `root_cause_recorded = false` or no change in pattern | n_repeats, window_days, categories |
| EG-06 | Metric-driven closure behaviour | (a) closures bunched just before SLA breach, (b) burst closures (many closes per minute), (c) closure spikes at period end, (d) SLA compliance "too perfect" with near-zero variance | sla_minutes, bunching_window, burst_threshold, cv_floor |
| EG-07 | Uniform handling times | Coefficient of variation of time-to-close across heterogeneous alerts far below peers (suggests scripted/rubber-stamp behaviour) | cv_ratio_threshold |
| EG-08 | Escalation hygiene | Escalations never acknowledged, long escalation delays, escalations that skip levels, high-severity with zero escalations in period | max_delay, ack_required |
| EG-09 | Disposition skew | Overwhelming false-positive/benign rate on high severity with no tuning evidence; `auto_closed` share | fp_share_threshold, auto_close_threshold |
| EG-10 | Analyst concentration | One pseudonymised analyst closing disproportionate share, especially of critical alerts, or off-hours closing patterns | max_share |
| EG-11 | Reopen/rework anomaly | Reopen rate unusually low (nothing ever revisited) or extremely high (quality problem) vs peers | bounds |
| EG-12 | Backlog ageing | Open alerts older than SLA, growth of open backlog trend | age_thresholds |

### 7.4 Negative-space detectors (expected evidence is absent)

| ID | Detector | Logic | Key params |
|---|---|---|---|
| NS-01 | Silent critical assets | Assets with criticality ≥ c and zero alerts/telemetry over `silence_days`, while peer assets of the same type/criticality have non-zero expected activity (Poisson/NegBin lower-tail probability) | min_criticality, silence_days, p_threshold |
| NS-02 | Missing expected alert categories | Categories present in ≥ x% of peers (or listed in `expected_categories`) with zero/very-low share in the entity | min_peer_prevalence, min_expected_share |
| NS-03 | Missing investigation records | High/critical alerts with no case or no investigation steps | severities |
| NS-04 | Missing escalation records | Cases of severity ≥ s with no escalation where peers escalate at rate r (lower-tail test) | severities, peer_rate_floor |
| NS-05 | Unexpectedly low activity | Alerts per asset-day (and per critical asset) vs peer baseline; lower-tail robust z or NegBin; also low investigation/escalation workload relative to alert volume | z_threshold, min_assets |
| NS-06 | Temporal blind spots | Contiguous windows with no alerts in an otherwise steady series; night/weekend dips vs peers; missing import coverage days | gap_hours, dip_ratio |
| NS-07 | Inventory ↔ telemetry mismatch | Inventory assets never seen in any alert/telemetry (blind spots); alert assets absent from inventory (shadow assets) | min_days_observed |
| NS-08 | Severity/category degeneracy | Entity never uses a severity level (e.g., zero criticals over months); single category dominating; constant daily counts | min_period, entropy_floor |
| NS-09 | Data completeness | Null rates per critical field, missing batches, truncated periods, timestamp anomalies (closed before created) | max_null_rate |

### 7.5 Anomaly / outlier detection

**Entity-level feature vector** (per entity per period; all computed in SQL; list is itself dynamic via `feature_definitions` table so new features can be added without code changes where expressible as SQL):

- Volume: alerts/day, alerts/asset/day, share by severity, category entropy
- Timing: median/p90 time-to-ack, time-to-close per severity, CV of time-to-close, % closed < 5 min, % closed in SLA, closure hour-of-day entropy
- Investigation: steps/alert, median note length, near-duplicate share, % alerts with case, % alerts with steps
- Escalation: % high/critical escalated, median escalation delay, ack rate
- Disposition: FP share, auto-closed share, reopen rate, root-cause-recorded rate
- Coverage: % inventory assets with alerts, % critical assets with alerts, null-rate score, days with data

**Methods**

1. **Peer comparison:** robust z = `(x − median) / (1.4826 × MAD)`, percentile within peer group, and direction-aware flags (low-is-bad vs high-is-bad per feature, stored in `feature_definitions.direction`).
2. **Isolation Forest** on standardised features (median/MAD scaling) → anomaly score ∈ (0,1).
3. **Trend/deterioration:** CUSUM / EWMA on weekly features per entity to catch gradual degradation or sudden drop.
4. **Small-sample safety:** Wilson intervals for proportions; Bayesian/empirical shrinkage toward peer mean when `n` is small; findings below `min_support` are suppressed or down-weighted and labelled "insufficient evidence".

### 7.6 ML specification (required by the problem statement)

| Item | Specification |
|---|---|
| Model architecture | (1) Isolation Forest, 100–300 trees, sub-sample 256, unsupervised, on entity-period feature vectors (≈40–60 dims) and optionally alert-level vectors. (2) SimHash (64-bit) + MinHash/LSH for near-duplicate note detection. (3) Robust statistics (median/MAD), NegBin/Poisson lower-tail tests, CUSUM. No neural networks, no LLMs. |
| Hardware | CPU only. Reference: 8 vCPU / 16 GB RAM / 200 GB SSD for ~5–10 M alerts; minimum demo: 4 vCPU / 8 GB. No GPU. |
| Offline training | Training is a worker job (`model.train`) that reads features from the local DB, fixes a random seed, writes artefact + metadata to `model_registry`. |
| Offline inference | Active model loaded from `model_registry` into worker memory; scoring runs inside `analysis.run`. |
| Model update | (a) Retrain locally from newly ingested data (admin action, candidate → compare → activate), or (b) import a signed model bundle (JSON metadata + artefact + SHA-256) through the admin UI on an air-gapped media transfer. Activation requires admin role + audit entry; rollback = re-activate previous version. |
| Explainability controls | Per-finding top-k contributing features (largest robust-z contributions and per-feature isolation depth deltas), peer percentile and direction; model card (algorithm, params, training window, feature schema, limitations) rendered in UI. |
| Auditability controls | Model version, SHA-256, seed, training data fingerprint and feature schema stored with every run snapshot; runs are reproducible; audit-log entries for train/activate/rollback. |

### 7.7 Dimension mapping

`rule_dimension_map` assigns each rule to one or more of the eight assessment dimensions (Threat Detection, Investigation, Escalation, Incident Response, Security Operations, Governance & Oversight, Operational Discipline, Cyber Resilience) with contribution weights. This mapping is editable data, so supervisors can re-align it without code changes.

### 7.8 Rule provenance and indicator validity (new)

Because no public SOC alert/case dataset exists and the team may lack hands-on SOC experience, every rule and indicator must carry its own justification:

- `rationale`: one or two sentences on why this pattern may indicate weak detection/investigation/escalation.
- `benign_explanations`: legitimate reasons the pattern can occur (e.g., fast closure of a well-known noisy rule; low activity on a recently decommissioned asset; template notes from an approved playbook).
- `references`: the practice or framework it is derived from (for example NIST incident-handling guidance, a SOC maturity model such as SOC-CMM, vendor SOC metric guidance). Verify each reference is accurate and cited correctly before publishing.
- `maturity_status`: starts as **hypothesis**; moves to **reviewed** after a domain expert looks at it; **validated** only after examiner feedback reaches a configured precision (setting).
- UI shows these on the finding page ("Why this matters", "Could be benign if…") and in reports' methodology appendix.
- Wording rule: findings are *indicators requiring examiner confirmation*.

### 7.9 Capability-indicator catalogue (new)

Descriptive indicators computed from submitted data, grouped by the eight dimensions. These are the "familiar numbers" supervisors expect; detectors then explain *why* a number may be misleading. All are rows in `indicator_definitions`, not code.

| Dimension | Example indicators |
|---|---|
| Threat Detection | alerts per asset-day, severity mix, category coverage vs peers, share of critical assets with alerts |
| Investigation | time-to-triage (p50/p90) by severity, investigation steps per alert, share of alerts with a case, note-length distribution, near-duplicate note share |
| Escalation | escalation completeness for high/critical, median escalation delay, escalation acknowledgement rate |
| Incident Response | time-to-contain / time-to-close (MTTR) by severity, reopen rate, root-cause-recorded rate |
| Security Operations | unhandled-alert backlog and its ageing, analyst workload concentration, auto-closed share |
| Governance & Oversight | closure-reason completeness, disposition documentation rate, data-submission regularity |
| Operational Discipline | SLA adherence *and* its variance, closure bunching, burst closures |
| Cyber Resilience | critical-asset monitoring coverage, silent-asset count, trend stability across periods |

### 7.10 "Headline KPIs vs underlying evidence" (new)

Compute the KPIs a SOC would typically *report* from the same submitted data (SLA compliance %, mean time to close, closure rate, backlog size). Show them next to evidence-quality indicators for the same entity (share of fast closures, share of closed-without-steps, templated-note share, escalation completeness). A large gap between a healthy headline and weak evidence is a first-class "execution gap" signal and drives the dashboard story. If an entity also supplies its own reported KPIs (optional `reported_metrics` import), those can be compared too; the tool does not require them.

---

## 8. Peer comparison and benchmarking

- **Peer groups** are data: strategies `sector`, `sector_tier`, `manual`, or `cluster` (k-means/hierarchical on features, computed in worker). Min peer size is a setting (default 4); below that, fall back to the parent group (sector → all).
- **Baselines** per `(peer_group, period, feature)`: n, median, MAD, p10/25/75/90.
- **Self-baseline:** compare entity to its own trailing periods (guards against "everyone in the sector is weak").
- **Outputs:** percentile, robust z, rank, "how far from peer median", boxplot data for UI, small-multiples across features.
- Peer membership validity dates allow time-correct comparisons.

---

## 9. Scoring and prioritisation

### 9.1 Finding score (0–100)

```
severity_score = 100 × sigmoid_scaled( w_effect·effect + w_support·log(1+support) + w_crit·asset_criticality_factor )
confidence     = f(support, peer_n, data_completeness)
```
All `w_*`, caps and scaling live in `scoring_profiles.params`.

### 9.2 Entity score

- Dimension score = confidence-weighted aggregation of finding scores mapped to the dimension (e.g., `1 − Π(1 − s_i)` noisy-OR or weighted top-k mean, chosen by profile).
- Composite = Σ weight_d × dimension_score; weights in `scoring_weights`.
- Output includes rank, percentile within peer group, delta vs previous run, and number/strength of contributing findings.
- Entities with insufficient data are flagged **"Insufficient evidence"**, not "low risk" (important for negative space).

### 9.3 Controls / processes

Aggregate findings by `(dimension, process)` where process is derived from rule metadata (triage, investigation, escalation, closure, coverage, governance). This produces the "controls / processes requiring attention" view.

### 9.4 Prioritised review samples

For each entity:
1. Compute per-record flags from detectors (record-level evidence) → `priority_score`.
2. Select top-K with **diversity constraints** (cap per analyst, category, day) so the sample isn't 50 copies of one issue.
3. Reserve an **exploration quota** (e.g., 10–20%, setting) of random/stratified records. This (a) catches unknown unknowns, (b) provides an unbiased estimate for validation, (c) prevents over-fitting to existing detectors.
4. Each sample carries `reasons[]` (rule keys + short text) and a deep link to evidence.

---

## 10. Scalability and performance plan

| Technique | Detail |
|---|---|
| Streaming ingestion | Parse with streams; never load full file in memory; batch `COPY` (50k–200k rows) |
| Staging tables | Load into `stg_*` (UNLOGGED), validate with SQL set operations, then insert-select into facts in one transaction |
| Partitioning | `alerts` (and `investigation_steps` if large) partitioned monthly; auto-create partitions in migration helper/job |
| Rollups | Incremental `alert_daily_agg` refresh by batch scope; detectors prefer rollups over raw scans |
| Indexing | B-tree on filter keys, BRIN on time, partial indexes for open items, `pg_trgm` only where needed |
| Concurrency | Worker concurrency configurable; per-entity detector execution in parallel with connection pool limits |
| Pagination | Keyset pagination for large tables; server-side filtering/sorting; virtualised tables in UI |
| Caching | Materialised/derived tables per run; ETag on read-only run results |
| Postgres tuning | `shared_buffers`, `work_mem`, `max_parallel_workers_per_gather` set in compose via config file; documented per hardware tier |
| Targets (to be measured, then published in README) | 5 M alerts / 20 entities: full run < 10 min on 8 vCPU; UI list endpoints p95 < 500 ms; import 1 M rows < 3 min |
| Benchmark harness | `synth` module can generate N entities × M alerts; `validation` module records timings |

---

## 11. Explainability, traceability, auditability

1. **Why flagged panel** on every finding: rule name + plain-language rationale; observed value vs threshold vs peer median/MAD; direction; sample size; confidence; list of evidence records (primary / supporting / **counter-evidence**, e.g. mitigating cases).
2. **Drill-down chain:** Dashboard → Entity → Dimension → Finding → Evidence list → Raw record (alert/case/steps/escalations timeline) → Import batch + source file hash.
3. **Reproducibility:** each run stores a snapshot (rule versions, params, weights, peer groups, model version, settings, data fingerprint = hash of batch ids + row counts). "Re-run with same snapshot" reproduces identical findings (determinism test in CI).
4. **Audit log:** hash-chained (`hash = SHA256(prev_hash || canonical_json(entry))`); admin page can **verify chain integrity**; logs login, imports, rule edits, weight edits, runs, report exports, decisions, model changes.
5. **Rule versioning:** every parameter edit creates a new `rule_versions` row; findings reference the exact version.
6. **Language guardrails:** UI copy uses "indicator", "may suggest", "requires examiner review".
7. **Data lineage:** every record links to `import_batches` (file name, sha256, uploader, time).

---

## 12. Frontend plan (React + TypeScript + Tailwind)

### 12.1 Principles

- All data from the API; no mock data in the app; no localStorage/sessionStorage; preferences saved via `/api/me/preferences`.
- Typed API client generated from OpenAPI; API errors normalised into a single error component.
- Accessible (keyboard, ARIA, contrast ≥ 4.5:1), responsive down to tablet, dark mode via `user_preferences`.
- Skeleton loaders, empty states, and error boundaries on every data surface.
- Charts wrapped in reusable components that accept **series definitions from the API** (metadata-driven), not hard-coded series.

### 12.2 Pages and features

| Page | Contents |
|---|---|
| **Login / session** | Cookie-based login, session expiry handling, password change |
| **Overview dashboard** | Entity risk ranking, heatmap (entity × dimension), KPI tiles (entities needing attention, open findings, coverage gaps, data freshness), trend sparkline per entity, run selector |
| **Entity detail** | Dimension radar vs peer median, composite trend, findings grouped by dimension/rule, peer percentile bars, data-completeness card, top review samples |
| **Findings explorer** | Server-side filter/sort (entity, rule, kind, dimension, score, status, period), saved filters (stored in DB), bulk status change |
| **Finding detail** | "Why flagged" panel, metrics vs thresholds vs peers chart, evidence table, timeline of related alerts/cases, examiner decision form, audit trail |
| **Review queue** | Prioritised sample list per entity, strategy badges (priority / exploration), reasons, export (CSV/PDF), mark reviewed with decision + comment |
| **Peer benchmarking** | Choose entity + peer group + features → boxplots/small multiples, rank table, self-vs-history |
| **Negative-space coverage** | Asset × time heatmap (silent assets), category × entity matrix (expected vs observed), inventory-vs-telemetry diff list, data completeness calendar |
| **KPIs vs Evidence** | Per entity: headline KPIs (SLA %, MTTR, closure rate, backlog) beside evidence-quality indicators; gap highlighted; click a gap to open the supporting findings and sample records. Entity ranking can be sorted by "gap size" |
| **Trends** | Time-series across entities (select features), changepoint markers, run-to-run comparison |
| **Data imports** | Upload wizard (select entity → file → auto-detect columns → mapping UI → dry-run validation report → confirm load), batch history, rollback batch, error download |
| **Mapping profiles** | Create/edit field & value maps with live preview on a sample of rows |
| **Rules & parameters** | List rules (enable/disable), dynamic parameter form from schema, version history/diff, **dry-run preview on one entity**, impact estimate |
| **Scoring & weights** | Edit dimension weights and finding-score parameters, rule→dimension mapping, "what-if" preview of ranking changes |
| **Peer groups** | Strategy config, membership editor, validity dates |
| **Taxonomy** | Severity/category/disposition alias management (drives normalisation) |
| **Runs** | History, status/progress (polling or SSE), config snapshot viewer, compare two runs (new/resolved/changed findings), re-run |
| **Reports** | Template picker, parameters, generate (PDF/CSV/HTML), history, download with checksum |
| **Validation lab** | Generate synthetic scenario, run validation, view recall/precision/NDCG vs baselines, ablations |
| **Synthetic data studio** | Scenario builder: entities, volume, defect types + intensity, seed; generate into a clearly marked synthetic dataset |
| **Admin** | Users/roles, settings, audit log viewer + chain verification, model registry (train/activate/rollback), health/status, backups |

### 12.3 Frontend folder rules

- `features/<name>/{api,components,pages,hooks,types.ts}`; cross-feature imports only through feature `index.ts`.
- `components/ui` = presentational primitives only; no API calls.
- Table state (sort/filter/page) lives in URL query params (shareable), not in storage.
- Strict TypeScript (`strict`, `noUncheckedIndexedAccess`), ESLint with `@typescript-eslint`, `eslint-plugin-react-hooks`, Prettier + Tailwind plugin.

---

## 13. API design

REST, JSON, versioned `/api/v1`. Consistent envelope:
`{ data, meta:{page, nextCursor, total?}, }` and errors `{ error:{code,message,details,requestId} }`.

| Area | Endpoints (representative) |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password` |
| Preferences | `GET/PUT /me/preferences` |
| Entities | `GET/POST /entities`, `GET/PATCH /entities/:id`, `GET /entities/:id/summary` |
| Assets | `GET/POST /entities/:id/assets`, `PATCH /assets/:id`, `POST /assets/import` |
| Imports | `POST /imports` (multipart), `GET /imports`, `GET /imports/:id`, `GET /imports/:id/errors`, `POST /imports/:id/validate`, `POST /imports/:id/commit`, `POST /imports/:id/rollback`, `POST /ingest/:entityId` (JSON API ingestion, API-key scoped) |
| Mapping | `GET/POST/PATCH /mapping-profiles`, `POST /mapping-profiles/:id/preview` |
| Taxonomy | `GET/POST/PATCH /taxonomy/{severity,category,disposition}` |
| Rules | `GET /detectors` (catalogue + schemas), `GET/POST/PATCH /rules`, `GET /rules/:id/versions`, `POST /rules/:id/versions`, `POST /rules/:id/dry-run` |
| Peers | `GET/POST/PATCH /peer-groups`, `POST /peer-groups/:id/rebuild`, `GET /benchmarks` |
| Scoring | `GET/PUT /scoring-profiles/:id`, `GET/PUT /dimensions/weights`, `POST /scoring/what-if` |
| Runs | `POST /runs`, `GET /runs`, `GET /runs/:id`, `GET /runs/:id/progress`, `GET /runs/:id/snapshot`, `GET /runs/compare?a=&b=` |
| Findings | `GET /findings`, `GET /findings/:id`, `GET /findings/:id/evidence`, `PATCH /findings/:id/status` |
| Scores | `GET /runs/:id/entity-scores`, `GET /entities/:id/scores/history` |
| Samples | `GET /runs/:id/review-samples`, `POST /review-samples/:id/decision` |
| Records | `GET /alerts`, `GET /alerts/:id`, `GET /cases/:id` (with steps + escalations timeline) |
| Reports | `GET /report-templates`, `POST /reports`, `GET /reports/:id/download` |
| Synth/Validation | `POST /synth/scenarios`, `POST /synth/scenarios/:id/generate`, `POST /validation/runs`, `GET /validation/runs/:id` |
| Models | `GET /models`, `POST /models/train`, `POST /models/:id/activate`, `POST /models/import` |
| Admin | `GET/PUT /settings`, `GET /audit-log`, `POST /audit-log/verify`, `GET /health`, `GET /system/info` |
| Docs | `GET /openapi.json` (served locally; Swagger UI bundled locally for dev, optional in prod) |

**RBAC matrix (default, editable):**
admin = everything · supervisor = view all, run analyses, edit rules/weights, generate reports · examiner = view, record decisions, export samples · viewer = read-only.

---

## 14. Ingestion pipeline details

1. **Upload** (multipart) or **API push** → file stored in a temp volume, SHA-256 computed; duplicate hash detection (warn/block via setting).
2. **Detect format**: CSV (delimiter/encoding sniffing), JSON array, NDJSON, SQL export (restricted `INSERT` parser or CSV dumps from DB), or API payload.
3. **Profile columns**: sample rows, infer types, suggest mapping from `mapping_profiles` (fuzzy name match with `pg_trgm`/Levenshtein).
4. **Dry-run validation** (no commit): required fields, type/time parsing (timezone setting), `closed_at ≥ created_at`, duplicate external IDs, referential checks (asset exists or auto-create setting), unknown categories → "unmapped values" report so the supervisor can add aliases.
5. **Commit**: stage → normalise → pseudonymise → `COPY` → insert-select into facts → refresh rollups → write `import_batches` row counts → audit entry → optionally auto-trigger an analysis run (setting).
6. **Rollback**: a batch can be rolled back (delete by `batch_id`), rollups recomputed.
7. **Data-minimisation**: raw logs/packets/customer data are **not accepted**; the schema has no columns for them. Free-text notes optional and length-capped; excerpt storage off by default.
8. **Error handling**: row-level errors recorded in `import_errors`; thresholds (`max_error_rate`) decide whether a batch can commit.

Input contract examples live in `docs/data-requirements.md` (CSV headers + JSON schemas for alerts, cases, steps, escalations, assets, telemetry summaries). The UI offers "Download template" generated from the canonical schema.

---

## 15. Security and compliance (inside an air-gap)

- Passwords: argon2id; policy (length, lockout, expiry) in `settings`.
- Sessions: random 256-bit token, hashed in DB; httpOnly, Secure, SameSite=Strict cookie; idle + absolute timeout; CSRF double-submit token.
- RBAC middleware on every route (deny by default). Row-level scoping is possible by entity assignment (`user_entities`) if needed.
- Rate limiting for login and ingestion endpoints; request size limits.
- Helmet + strict CSP (`default-src 'self'`; no inline scripts; fonts/images from self only).
- TLS at gateway (self-signed generated at first boot or customer-provided certs via volume).
- Containers: non-root users, `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges`, resource limits, internal network only (no published DB port in prod).
- Secrets: `.env`/Docker secrets; never committed; startup validation fails loudly on weak/missing secrets.
- Supply chain: lockfiles, `npm ci`, pinned base image digests, SBOM (`syft` offline) and licence report generated in the online build environment, then shipped with the bundle.
- Pseudonymisation of analyst identifiers; optional redaction of free text.
- Backup/restore scripts (`pg_dump` custom format, encrypted with a passphrase via `openssl`/`age` if available) with documented RPO/RTO.
- `scripts/verify-no-network.sh`: runs the stack with `internal: true` network and asserts that no outbound connections are attempted (e.g., fails if any container resolves external DNS).

---

## 16. Docker and air-gapped deployment

### 16.1 Compose services

| Service | Image / build | Notes |
|---|---|---|
| `gateway` | nginx (alpine) + built frontend | Only service publishing ports (80→redirect, 443). Static assets, `/api` proxy, CSP headers |
| `api` | `backend/Dockerfile` (multi-stage, node alpine/slim) | `command: node src/server.js`, healthcheck `/health` |
| `worker` | same image | `command: node src/worker.js`, scalable (`deploy.replicas`) |
| `db` | postgres:16 | Volume `pgdata`, tuned config mounted, healthcheck `pg_isready`, not published |
| `migrate` | same backend image | One-shot: `knex migrate:latest && seed (idempotent)`; `depends_on: db healthy`; api/worker depend on its success |

Networks: single `internal` network (`internal: true` in the air-gapped profile). Volumes: `pgdata`, `uploads`, `reports`, `backups`.

### 16.2 Dockerfiles (principles)

- Multi-stage: `deps` (npm ci) → `build` (frontend only) → `runtime` (copy built assets, prod deps only, `NODE_ENV=production`).
- `USER node`; `HEALTHCHECK`; `.dockerignore` strict.
- No `npm install` at container start. Everything pre-baked.
- Frontend built in a build stage; final gateway image contains only static files + nginx.

### 16.3 Makefile targets

`make up`, `make down`, `make dev`, `make logs`, `make migrate`, `make seed`, `make test`, `make lint`, `make openapi` (regenerate spec + frontend types), `make synth` (generate demo dataset), `make bundle` (build + `docker save` + checksums), `make load-bundle`, `make backup`, `make restore`.

### 16.4 Offline bundle workflow

1. On a connected build machine: `make bundle` → `satsa-images.tar`, `docker-compose.yml`, `.env.example`, `SHA256SUMS`, `SBOM.json`, docs.
2. Transfer via approved media to the air-gapped host.
3. `scripts/load-offline-bundle.sh` verifies checksums → `docker load` → `docker compose up -d`.
4. First-boot wizard creates the admin user (no default passwords).
5. Upgrades: load new bundle → `migrate` service applies migrations → rollback instructions documented.

---

## 17. Validation methodology (vs expert manual review)

### 17.1 Ground truth sources

1. **Synthetic with injected defects** (primary, fully controlled): the generator writes defects and exact record IDs to `synth_ground_truth`. Defect types map 1:1 to the illustrative use cases (fast closures, un-escalated criticals, templated notes, repeat alerts, silent assets, missing categories, low activity, metric gaming bursts, etc.) at tunable intensity (e.g., 2%, 5%, 15% of records), plus "clean" entities and "tricky benign" cases (legitimate quick closures, legitimate low activity).
2. **Examiner labels** (secondary): in the UI, examiners mark findings/samples confirmed / not confirmed. These labels become real-data validation and drive per-rule precision.
3. **Simulated manual sampling baseline**: random sampling and severity-weighted sampling with the *same review budget* (e.g., 100 records per entity) as what the tool proposes.

### 17.2 Metrics

| Metric | Meaning |
|---|---|
| Defect recall@K | Share of injected defect records found within top-K review samples |
| Precision@K | Share of top-K samples that are real defects |
| Entity ranking quality | Spearman/Kendall vs ground-truth entity risk; NDCG@K for top-risk entities |
| Defect-type coverage | Recall per defect type (execution gap vs negative space) |
| False-positive rate on clean entities | Flags raised on entities with no injected defects |
| Lift vs baseline | Recall@K tool ÷ recall@K random/severity-only sampling |
| Review-effort saving | Records an examiner must read to find N defects (tool vs baseline) |
| Robustness | Performance under noisy data, missing fields, different volumes, different seeds (mean ± sd over ≥ 20 seeds) |
| Sensitivity curves | Detection rate vs defect intensity |
| Ablations | Rules-only vs stats-only vs ML-only vs combined |
| Determinism | Same snapshot + data → identical findings hash |
| Performance | Wall-clock and memory at 1×/5×/10× data volume |

### 17.3 Acceptance criteria (proposed, tune after first runs)

- Recall@K ≥ 2× random baseline on all defect types; ≥ 0.8 for strong defects
- Precision@K ≥ 0.6 at default thresholds on synthetic data
- Clean-entity false-flag rate ≤ 10%
- Determinism test passes; audit chain verifies
- Full-run performance within targets in §10

Validation runs are executed from the UI (Validation lab) and the CLI (`make validate`), results stored in the DB, and exported into `docs/validation.md` and slides.

### 17.4 Avoiding circular validation (new)

Risk: if the generator stamps defects onto records and the detectors are written to find exactly those stamps, results only show the tool rediscovering our own assumptions. Mitigations:

1. **Hidden-maturity generator.** Each synthetic entity gets a latent *maturity* value and each analyst a *behaviour profile* (careful, overloaded, rushed, template-user, metric-gamer, absent). Closure times, note quality, escalation and coverage emerge from these through stochastic rules, so defects appear as consequences, not as labels pasted onto rows. Ground truth = the latent variables (entity maturity, analyst profile) plus the records influenced by them.
2. **Separation of knowledge.** The generator module and the detector modules must not share constants. Detector thresholds are tuned on a *tuning* scenario set; reported results come from a different *held-out* set with different seeds and parameter ranges.
3. **Blind defect set.** At least one teammate who has not read the detector code designs a scenario (which weaknesses, what intensity, which confounders) through the scenario builder. Report results on that set separately.
4. **Out-of-catalogue defects.** Include 1–2 defect patterns for which no detector exists. Report how many are still surfaced via anomaly scoring and exploration samples (supports the "previously unknown indicators" requirement) and how many are missed.
5. **Realism checks.** Compare generated distributions (volume per asset, severity mix, time-to-close, diurnal pattern) against published SOC benchmark ranges and your own domain reading; keep a `docs/synthetic-data-assumptions.md` listing every assumption and its source. Model field names on real alert/case schemas (for example TheHive-style cases and Elastic Common Schema fields — verify) so real exports map with little effort.
6. **Confounders.** Legitimate fast closures, legitimately quiet systems, and noisy-but-benign rules must exist in the data so precision is measured honestly.
7. **Honest reporting.** Present synthetic results as "method validation". State limitations on the Validation lab page, README and slides. Show the examiner-label workflow as the route to validation on real data.
8. **Optional external sanity check.** If any public SOC-like or incident-response case data is found (for example public incident write-ups, CTF/blue-team exercise datasets), use it only to sanity-check schema and distributions; verify licence and never assume it represents CSE behaviour.

---

## 18. Execution plan (phases, tasks, and exit criteria)

Estimated for 1–2 developers; compress by cutting items marked ⭐ (stretch). Day counts are relative effort, adjust to your hackathon calendar.

### Phase 0 — Foundations (Days 1–2)

- [ ] T0.1 Repo, monorepo scaffolding, ESLint/Prettier, commit hooks, `.nvmrc`
- [ ] T0.2 Docker Compose (db, migrate, api, worker, gateway) running "hello world" end to end
- [ ] T0.3 Backend core: config (zod env), logger, error classes, request ID, validate middleware, health endpoint
- [ ] T0.4 Knex setup, migration framework, test DB container, CI script (`make test`)
- [ ] T0.5 OpenAPI generation pipeline → frontend type generation
- [ ] T0.6 Frontend scaffold: Vite + TS + Tailwind, layout shell, router, API client, error boundary, self-hosted fonts
- [ ] T0.7 ADR-001 (stack), ADR-002 (no browser storage), ADR-003 (Postgres-only infra)

**Exit:** `make up` brings the stack up; `/api/v1/health` visible through the gateway; frontend renders with a typed call.

### Phase 1 — Auth, RBAC, audit, settings (Days 3–4)

- [ ] T1.1 Users/roles/permissions migrations + seeds; argon2 auth; session table; CSRF
- [ ] T1.2 RBAC middleware + route annotations
- [ ] T1.3 Hash-chained audit log service + verify endpoint
- [ ] T1.4 Settings service (DB-backed, typed accessors, cache with invalidation)
- [ ] T1.5 User preferences API
- [ ] T1.6 Frontend: login, session guard, user menu, preferences (theme) from DB
- [ ] T1.7 Admin pages: users, roles, settings, audit viewer

**Exit:** secure login, role-based UI, audit chain verified in a test.

### Phase 2 — Reference data and domain entities (Days 4–5)

- [ ] T2.1 Sectors/entities/assets CRUD
- [ ] T2.2 Taxonomy (severity/category/disposition + aliases) CRUD and normaliser service
- [ ] T2.3 Dimensions, scoring profiles, weights (tables + seeds + CRUD)
- [ ] T2.4 Peer groups + membership (manual + sector strategies first)
- [ ] T2.5 Frontend: entity list/detail shell, taxonomy editor, peer group editor

### Phase 3 — Ingestion (Days 6–9)

- [ ] T3.1 Fact-table migrations (alerts partitioned, cases, steps, escalations, telemetry)
- [ ] T3.2 Upload endpoint, file hashing, temp storage, size/type guards
- [ ] T3.3 Streaming parsers (CSV, JSON, NDJSON), format sniffing
- [ ] T3.4 Mapping profiles + column profiler + preview endpoint
- [ ] T3.5 Staging + validation SQL, `import_errors`, unmapped-values report
- [ ] T3.6 Loader (`COPY`), pseudonymisation, note fingerprinting (SimHash/MinHash), partition auto-create
- [ ] T3.7 Rollups (`alert_daily_agg`, `ingestion_coverage`) incremental refresh job
- [ ] T3.8 Commit/rollback flows via queue; progress reporting
- [ ] T3.9 JSON API ingestion endpoint with API keys
- [ ] T3.10 Frontend import wizard, mapping UI, validation report, batch history
- [ ] T3.11 Template downloads from canonical schema

**Exit:** a 1 M-row synthetic CSV imports end to end with row-level error reporting and rollback.

### Phase 4 — Synthetic data studio (Days 7–9, parallel with Phase 3)

- [ ] T4.1 Scenario schema (stored in DB), seeded RNG, **latent entity maturity + analyst behaviour profiles**, entity/asset/alert/case/step/escalation generators with realistic distributions (diurnal patterns, severity mix, per-sector baselines)
- [ ] T4.2 Behaviour models and optional explicit defect injectors (one module per pattern) + ground-truth writer (latent variables + affected record ids). Generator code must not import detector constants
- [ ] T4.3 "Benign confounders" (legit fast closures, legit quiet systems)
- [ ] T4.4 Generation job + progress; direct load through the same ingestion pipeline (so ingestion is exercised)
- [ ] T4.5 Frontend scenario builder + dataset listing (synthetic data clearly labelled)
- [ ] T4.6 Tuning vs held-out scenario sets (different seeds/parameter ranges) with a flag that prevents tuning on held-out data
- [ ] T4.7 Blind scenario designed by a teammate who has not read detector code; at least 1–2 out-of-catalogue patterns
- [ ] T4.8 `docs/synthetic-data-assumptions.md` with every distribution assumption and its source

### Phase 5 — Analytics core (Days 9–14)

- [ ] T5.1 Feature definitions table + feature builder (SQL-driven) → `entity_period_features`
- [ ] T5.2 Peer baseline builder (median/MAD/percentiles) + fallback rules
- [ ] T5.3 Detector base, registry, param schemas, rule/rule_versions tables, `/detectors` catalogue
- [ ] T5.4 Implement detectors EG-01…EG-12 (one PR each, with unit + integration tests against synthetic fixtures)
- [ ] T5.5 Implement detectors NS-01…NS-09
- [ ] T5.6 Stats helpers (robust z, Wilson, shrinkage, NegBin/Poisson tail, CUSUM) with property tests
- [ ] T5.7 SimHash/MinHash module + tests
- [ ] T5.8 Isolation Forest adapter + model registry + train/activate jobs
- [ ] T5.9 Run orchestrator: snapshot, per-entity fan-out, progress, error isolation (one failing detector doesn't kill the run), idempotency
- [ ] T5.10 Findings + evidence persistence; rationale rendering from templates
- [ ] T5.11 Indicator catalogue engine (`indicator_definitions` → computed per entity/period) and KPI-vs-evidence gap calculation
- [ ] T5.12 Seed every rule/indicator with rationale, benign explanations, references, maturity_status = hypothesis

**Exit:** a run over the synthetic dataset produces findings with evidence for every injected defect type.

### Phase 6 — Scoring, sampling, comparison (Days 14–16)

- [ ] T6.1 Finding scorer + confidence
- [ ] T6.2 Dimension and composite entity scoring; "insufficient evidence" logic
- [ ] T6.3 Controls/process aggregation
- [ ] T6.4 Prioritised sampling with diversity + exploration quota
- [ ] T6.5 Run comparison (new/resolved/changed) + trend history
- [ ] T6.6 What-if scoring preview

### Phase 7 — Frontend analytics experience (Days 14–20, overlaps)

- [ ] T7.1 Dashboard (ranking, heatmap, KPIs)
- [ ] T7.2 Entity detail (radar, trends, findings, samples)
- [ ] T7.3 Findings explorer + finding detail ("why flagged", evidence, timeline)
- [ ] T7.4 Review queue + decisions
- [ ] T7.5 Peer benchmarking charts
- [ ] T7.6 Negative-space coverage views (heatmaps, matrices)
- [ ] T7.7 Rules/parameters editor with dry-run and version diff
- [ ] T7.8 Scoring & weights editor with what-if
- [ ] T7.9 Runs page (progress, snapshot, compare)
- [ ] T7.10 Raw-record drill-down (alert/case timeline)
- [ ] T7.11 KPIs vs Evidence page (headline KPIs vs evidence-quality indicators, gap ranking)
- [ ] T7.12 Rule provenance panel ("Why this matters", "Could be benign if…", references, maturity status) on finding detail and rule editor

### Phase 8 — Reports (Days 19–21)

- [ ] T8.1 Report template model (sections as data) + renderer registry
- [ ] T8.2 PDF renderer (pdfkit): executive summary, entity profile, findings with evidence references, methodology appendix, run snapshot hash
- [ ] T8.3 CSV exports (findings, samples, scores)
- [ ] T8.4 Report job + download with checksum + audit
- [ ] T8.5 Frontend report builder/history

### Phase 9 — Validation and hardening (Days 21–25)

- [ ] T9.1 Validation module: baselines (random, severity-weighted), metrics, ablations, multi-seed runner, **separate reporting for tuning set, held-out set, blind set and out-of-catalogue patterns**
- [ ] T9.2 Validation lab UI and exportable results
- [ ] T9.3 Examiner-feedback precision per rule + threshold suggestions (human-approved)
- [ ] T9.4 Performance benchmark at 1×/5×/10× data; index/query tuning with `EXPLAIN ANALYZE`
- [ ] T9.5 Security pass (OWASP ASVS-lite checklist), dependency audit, CSP verification
- [ ] T9.6 Determinism, audit-chain, and no-network (`verify-no-network.sh`) tests in CI
- [ ] T9.7 Accessibility pass; empty/error states; loading states

### Phase 10 — Packaging and submission (Days 25–28)

- [ ] T10.1 Offline bundle (`make bundle`) and load script tested on a clean VM with no internet
- [ ] T10.2 README with setup, default demo flow, troubleshooting
- [ ] T10.3 Architecture document (≤ 2 pages) from §3, §6, §7, §10, §11
- [ ] T10.4 Technical presentation (≤ 5 slides) — see 19.2
- [ ] T10.5 Demo video (≤ 2 min) — see 19.3
- [ ] T10.6 Public/private repo link prepared, secrets scrubbed, licence file

---

## 19. Deliverables mapping

| Required deliverable | Source in this plan |
|---|---|
| Solution architecture | §3 + architecture.md |
| Functional design | §12–13 |
| Analytics methodology | §7–9 + methodology.md |
| Data requirements | §6, §14 + data-requirements.md |
| Tool / prototype | Whole repo, `docker compose up` |
| Infrastructure requirements | §10, §16 (hardware tiers table in README) |
| Validation methodology | §17 + validation.md |
| Deployment and operational requirements | §15–16 + deployment-airgap.md (install, backup, upgrade, monitoring, roles/runbook) |
| Source code link | Git repository |
| README with setup | Prereqs, `cp .env.example .env`, `make up`, first-boot wizard, `make synth`, demo walkthrough |
| Architecture doc (≤ 2 pages) | Diagram + data flow + module map + ML spec table + offline guarantees |
| Demo video (≤ 2 min) | 19.3 |
| Technical presentation (≤ 5 slides) | 19.2 |

### 19.1 README outline

1. What it is / is not (scope boundaries)
2. Quick start (offline and online)
3. Default credentials policy (none; first-boot admin)
4. Demo walkthrough (generate synthetic data → run → explore)
5. Architecture summary + links to docs
6. Hardware tiers and performance numbers (measured)
7. Configuration reference (env vs DB settings)
8. Backup/restore/upgrade
9. Testing, validation, determinism
10. Troubleshooting + licence

### 19.2 Five-slide structure

1. **Problem and approach**: manual review does not scale → supervisory analytics that prioritises examiner effort (assistive, not replacing)
2. **Architecture**: air-gapped stack, modular detector plug-ins, DB-driven configuration
3. **Analytics**: execution gaps, negative space, peer benchmarking, scoring, prioritised sampling (with 2–3 concrete examples)
4. **Explainability and governance**: why-flagged panel, evidence drill-down, versioned rules, hash-chained audit, reproducible runs, ML spec
5. **Validation and results**: recall/precision vs random sampling, effort saved, scalability numbers, roadmap — and a plain statement that synthetic validation proves the method, not real-world accuracy

### 19.3 Two-minute demo script (timecoded)

| Time | Scene |
|---|---|
| 0:00–0:10 | One-line problem + "fully offline" (internal-only Docker network) |
| 0:10–0:25 | Import wizard: upload an entity's data, map columns, validation report, commit |
| 0:25–0:45 | Run analysis; dashboard ranks entities; headline KPIs look healthy for the top-ranked one |
| 0:45–1:05 | **KPIs vs Evidence** gap: SLA 97% but many critical alerts closed in minutes with no investigation steps |
| 1:05–1:25 | Open finding "critical alerts closed without escalation" → why-flagged panel (observed vs threshold vs peer median, "could be benign if…") → evidence → raw case timeline |
| 1:25–1:35 | Review queue: prioritised sample for the examiner, with exploration share |
| 1:35–1:45 | Negative-space view: silent critical assets and missing expected categories |
| 1:45–1:55 | Edit a rule threshold in the UI (dynamic) → re-run → ranking updates; audit entry |
| 1:55–2:00 | Validation lab: recall vs random sampling on held-out and blind sets; closing line |

---

## 20. Testing strategy

| Level | What | Tooling |
|---|---|---|
| Unit | detectors (pure functions with fixture data), stats helpers, SimHash/MinHash, scorers, normalisers | vitest |
| Property-based | stats helpers invariants (e.g., robust z of constant series, shrinkage bounds) | `fast-check` (dev) |
| Integration | repositories and routes against real Postgres (testcontainers/compose) | vitest + supertest |
| Contract | OpenAPI spec validity; generated TS types compile | `tsc` on frontend |
| E2E | login → import → run → finding → report | Playwright (dev image) |
| Data-quality | ingestion edge cases: bad timestamps, duplicate IDs, huge files, wrong encodings | fixtures |
| Determinism | same snapshot → same findings hash | CI test |
| Security | authz matrix tests (each route × each role), SQL-injection probes, upload abuse | vitest |
| Performance | synthetic 1×/5×/10× benchmark | `make bench` |
| Static checks | no `localStorage`, `sessionStorage`, or `.json` data reads in `src` (CI grep rule); no external URLs in built frontend (CI scan of `dist`) | scripts |

---

## 21. "100% dynamic" checklist (verify before every release)

- [ ] No hard-coded entity names, categories, severities, or thresholds in code
- [ ] All thresholds/windows/weights come from `rule_versions`, `scoring_*`, or `settings`
- [ ] Dropdown options and filters populated from DB endpoints
- [ ] Charts built from API-provided series/metadata
- [ ] Rule parameter forms rendered from detector schemas
- [ ] New severity/category aliases take effect without code change
- [ ] New peer group / dimension weight takes effect without code change
- [ ] Report sections defined by template rows
- [ ] User preferences persisted in DB (grep confirms no browser storage usage)
- [ ] Seeds are defaults only; every seeded item is editable and audited
- [ ] Features (metrics) expressible as SQL can be added through `feature_definitions` without redeploy

---

## 22. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| No real SOC data available | Weak validation | Rich synthetic generator + confounders + examiner-label workflow ready for real data |
| Over-flagging (alert fatigue for supervisors) | Low trust | Confidence + min-support gates, diversity caps, rule-level precision tracking, adjustable thresholds |
| Peer group too small/heterogeneous | Misleading benchmarks | Fallback hierarchy, self-baseline, explicit "insufficient evidence" state |
| Negative space is inherently uncertain | False accusations | Probabilistic lower-tail tests, wording as "indicator", counter-evidence panel |
| Pure-JS ML library quality | Reliability | Adapter + own tests; fallback to in-house implementation; ML is additive, rules carry core logic |
| Performance on huge data in Node | Slow runs | Push computation to SQL, rollups, partitions, worker concurrency, benchmarks early (Phase 3/5) |
| Scope creep | Missed submission | Priority ladder below; stretch items clearly marked |
| Air-gap packaging surprises | Demo failure | Test clean-VM offline install early (end of Phase 3), not at the end |
| Free-text sensitivity | Privacy concern | Optional, off by default, hash/fingerprint only, pseudonymised analysts |
| Circular validation (synthetic data encodes our assumptions) | Judges dismiss results | Hidden-maturity generator, held-out and blind sets, out-of-catalogue patterns, honest wording (§17.4) |
| Indicators do not truly reflect SOC weakness | Misleading findings, lost credibility | Rationale + benign explanations + references per rule, `hypothesis` status, examiner feedback loop, domain-expert review if available (§7.8) |
| Demo is legible only to specialists | Weak impression | KPIs-vs-evidence story, two-entity narrative, plain-language why-flagged text (§7.10, §22.1) |
| Finals window shorter than plan | Unfinished demo | Time-boxed cut in §22.1; build the thin vertical slice first |

### Priority ladder (cut from the bottom if time runs short)

1. **Must:** ingestion, normalisation, 6 core detectors (EG-01, EG-02, EG-03, EG-04, NS-01, NS-02), peer comparison, entity scoring, review samples, explainability panel, Docker offline, synthetic data + validation vs random
2. **Should:** remaining detectors, rule editor with dry-run, run comparison, PDF reports, audit chain verify, Isolation Forest
3. **Could:** clustering-based peer groups, CUSUM trends, threshold suggestions from feedback, what-if scoring
4. ⭐ **Stretch:** local embedding model (ONNX Runtime, CPU, bundled offline) for semantic note similarity; SSE live progress; multi-language UI

### 22.1 Time-boxed cut for a short finale (e.g. ~36 hours — confirm your round's rules)

**Smallest thing that wins the room:** load two synthetic organisations; show one ranked as needing supervisory attention because its headline KPIs look healthy while its evidence is weak (escalation completeness, closure discipline); drill into the exact sample of cases an examiner should read; show the why-flagged panel; show validation versus random sampling.

| Block | Build | Skip / mock as roadmap |
|---|---|---|
| Foundations | Docker Compose (db, api, worker or in-process jobs, gateway), auth with a single admin role, settings table | Full RBAC matrix, API keys, hash-chained audit (keep simple audit table) |
| Data | Synthetic generator with latent maturity, 3–5 entities, 50k–200k alerts, CSV import via the real pipeline | JSON/SQL/API ingestion, partitioning, 1 M+ row benchmarks |
| Detectors | EG-01, EG-02, EG-03, EG-04, NS-01, NS-02 plus indicator catalogue | Remaining 15 detectors, CUSUM, clustering peer groups |
| Analytics | Peer baselines (median/MAD), entity score, prioritised samples with exploration quota | Isolation Forest if short on time (keep adapter stub), what-if scoring |
| UI | Dashboard ranking, entity page, finding detail with why-flagged and evidence, KPIs vs Evidence, review queue, rule threshold editor | Mapping UI polish, run comparison, report builder (use CSV export) |
| Validation | Recall/precision vs random and severity-only on held-out + blind set, with limitations stated | Ablations, multi-seed sweeps beyond ~10 seeds |
| Packaging | README, architecture doc, 5 slides, 2-min video, offline `docker save` bundle | Signed model bundles, backup encryption |

Order of work: generator → import → 2 detectors end to end (EG-02, NS-01) → scoring/samples → dashboard + why-flagged → remaining 4 detectors → KPIs vs Evidence → validation → packaging. Do a clean offline install test once before the final day.

---

## 23. Operational runbook (summary)

- **Install:** load bundle → set `.env` → `docker compose up -d` → first-boot admin.
- **Daily/periodic use:** import batches per CSE → (auto) run → review dashboard → export samples → record decisions.
- **Monitoring the tool itself:** `/health`, queue depth, failed jobs page in Admin, disk usage, DB size, last backup time.
- **Backups:** nightly `pg_dump` + volume snapshot; restore drill documented.
- **Retention:** settings-driven purge of old batches/findings with audit entries.
- **Upgrade/rollback:** versioned bundles; migrations are reversible; always back up first.
- **Incident handling for the tool:** structured logs with request IDs; `docker compose logs`; documented common failures (bad mapping, stuck job, full disk).

---

## 24. First 48 hours — concrete starting steps

1. Create repo and folders from §5; commit scaffolding.
2. Write `docker-compose.yml` with `db`, `migrate`, `api`, `worker`, `gateway`; get `/health` working.
3. Add migrations for users/roles/sessions/settings/audit; implement login.
4. Create taxonomy + entities + assets + facts migrations.
5. Build the synthetic generator **early** (even a minimal version): it unblocks every later phase and the validation story.
6. Implement the import pipeline for CSV only; add JSON later.
7. Implement EG-02 and NS-01 end to end (detector → finding → evidence → UI "why flagged"). This thin vertical slice proves the whole architecture. Then widen.

---

## 25. Glossary

- **CSE** — Critical Sector Entity
- **SOC** — Security Operations Centre
- **Execution gap** — documented/reported capability vs operational evidence mismatch
- **Negative space** — expected evidence that is absent
- **Peer group** — comparable entities used for benchmarking
- **MAD** — median absolute deviation
- **Finding** — a detector's output about an entity/period with rationale and evidence
- **Review sample** — a specific record recommended for manual examiner review
