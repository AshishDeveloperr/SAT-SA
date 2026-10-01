# SAT-SA: System Architecture & Technical Specification
**Supervisory Analytics Tool for SOC Assessment | NCIIPC (SIH26157)**

---

## 1. System Topology & Trust Boundaries

SAT-SA is engineered specifically for **NCIIPC air-gapped supervisory enclaves**. It operates completely isolated from the internet, requiring zero external CDN resources, cloud databases, or remote AI APIs.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                         NCIIPC AIR-GAPPED SUPERVISORY ENVIRONMENT                                │
│                                                                                                  │
│   ┌─────────────────────────────┐        HTTP        ┌────────────────────────────────────────┐  │
│   │   Supervisory Web Client    │ ◄────────────────► │         Nginx Security Gateway         │  │
│   │   React 18 + TS + Tailwind  │                    │      Static SPA + Reverse Proxy        │  │
│   └─────────────────────────────┘                    └───────────────────┬────────────────────┘  │
│                                                                          │ /api/v1/              │
│                                                                          ▼                       │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│   │                           SAT-SA Supervisory Analytics Engine                             │  │
│   │   Node.js (ESM) + Express + Streaming CSV/JSON Parsers + SimHash Fingerprinting Engine    │  │
│   │                                                                                           │  │
│   │   • Execution Gap Detectors (EG-01 to EG-12)    • Negative Space Reasoners (NS-01 to NS-09)│  │
│   │   • Robust Statistical Baselines (Median, MAD)  • Knapsack Review Portfolio Optimizer     │  │
│   │   • Cryptographic Hash Chain Audit Ledger       • Dynamic DB-Backed Rule Registry         │  │
│   └──────────────────────────────────────────────┬────────────────────────────────────────────┘  │
│                                                  │ Knex Query Builder                            │
│                                                  ▼                                               │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│   │                             Enterprise Storage Tier                                       │  │
│   │   PostgreSQL 16 (Monthly Partitioned Alert Facts + WAL) / Embedded SQLite Development DB  │  │
│   └───────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow & Analytical Pipeline

1. **Periodic Submission Ingestion**: CSE alert metadata, case management records, investigation steps, and asset inventories are uploaded via streaming multipart CSV or JSON batch APIs. Analyst identifiers are pseudonymized with an air-gap salt (`assignee_hash`).
2. **Incremental Fact Aggregation**: Time-to-Acknowledge (TTA) and Time-to-Close (TTC) rollups are computed without re-scanning historical tables.
3. **Dual-Discipline Detection Engine**:
   - **Execution Gaps**: Surfaces discrepancies where reported KPIs (e.g. 97% SLA compliance) disguise operational rubber-stamping (e.g., 82% critical alerts closed in <10m with 0 investigation steps or templated notes).
   - **Negative Space**: Evaluates absent evidence using Poisson and lower-tail distribution tests (e.g. SCADA controllers with 0 telemetry for >14 days; absence of sectoral attack categories).
4. **Peer Benchmarking**: Normalizes metrics against sector-wide medians using robust statistics:
   $$\text{Robust } Z = \frac{x - \text{Median}}{1.4826 \times \text{MAD}}$$
5. **Attention Scoring & Portfolio Optimization**: Computes a bounded Composite Risk Score (0–100) and allocates examiner review quotas (85% priority targets + 15% exploration quota).

---

## 3. Required AI/ML Specification (Problem Statement §5 Compliance)

| Requirement | Specification |
|---|---|
| **Model Architecture** | (1) Unsupervised anomaly scoring via pure-JS Isolation Forest. (2) Lexical duplicate detection via 64-bit SimHash Hamming distance. (3) Deterministic robust statistics (Median Absolute Deviation). Zero LLMs; zero neural networks. |
| **Hardware Requirements** | Standard x86_64 CPU (4 to 8 vCPU, 8–16 GB RAM, zero GPU dependency). Runs easily on standard examiner laptops. |
| **Offline Training & Inference** | Self-contained local worker job. Reads local historical feature vectors from PostgreSQL, trains deterministically with a fixed seed, and stores model artifacts in the local database registry. |
| **Model Update Mechanism** | Retrain on newly ingested local data or import signed, version-controlled model parameter bundles via offline media transfer. |
| **Explainability Controls** | 100% explainable by construction. Every finding generates a "Why Flagged" card detailing observed metrics, configured thresholds, peer medians, and direct primary/counter evidence records. |
| **Auditability Controls** | All supervisory decisions, threshold edits, and analytical runs emit SHA-256 sequential hash-chained audit logs ensuring tamper-evidence. |
