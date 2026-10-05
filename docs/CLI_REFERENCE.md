# 💻 SAT-SA Examiner CLI Reference & Operating Modes Manual
### **National Critical Information Infrastructure Protection Centre (NCIIPC) • SIH 2026 (PS: SIH26157)**

> **[⬅ Return to Main README.md](../README.md)** &nbsp;|&nbsp; **[View Jury Defense Cheat Sheet](JURY_RUBRIC_DEFENSE.md)** &nbsp;|&nbsp; **[View Empirical Benchmark](BENCHMARK.md)** &nbsp;|&nbsp; **[View Detector Taxonomy](PARSERS_TAXONOMY.md)**

This document provides a comprehensive operational reference for the **Supervisory Analytics Tool for SOC Assessment (SAT-SA)** command-line interface (`satsa` / `node backend/bin/satsa.js`).

Per NCIIPC requirements, SAT-SA functions as an autonomous, zero-cloud CLI tool engineered for air-gapped supervisory enclaves, examiner forensic laptops, and secure assessment environments.

---

## 🚀 Execution Syntax

The SAT-SA CLI can be executed directly using Node.js or invoked in pipeline environments:

```bash
# Direct execution from repository root:
node backend/bin/satsa.js <command> [options]

# With command-line arguments:
node backend/bin/satsa.js audit --entity CSE-POWER-01
```

---

## 📋 Complete CLI Command & Option Reference

| Command | Short Option | Long Option | Parameter | Default | Description |
|:---|:---:|:---|:---:|:---:|:---|
| `audit` | `-e` | `--entity` | `<code>` | *All Active* | Generate high-density supervisory audit report with attention scores, execution gaps, and negative space findings. |
| `queue` | `-l` | `--limit` | `<num>` | `15` | Inspect examiner review queue stratified into **85% Priority Review** and **15% Random Exploration Review**. |
| `verify-chain` | | | *None* | *All Blocks* | Verify cryptographic integrity of SHA-256 chained supervisory decision ledger from Genesis anchor to tip. |
| `benchmark` | | | *None* | *Full Suite* | Run Section 8 validation benchmark measuring throughput, memory footprint, and 3.42× discovery lift over random sampling. |
| `ingest` | `-i`<br/>`-e` | `--input`<br/>`--entity` | `<path>`<br/>`<code>` | *Mandatory*<br/>*Optional* | Ingest structured CSE periodic submission (CSV, JSON, Syslog, CEF) with automatic format normalization. |
| `run` | | | *None* | *Full Run* | Trigger immediate end-to-end supervisory analytics execution across all entities in the local database. |
| `synth` | | | *None* | *Multi-Sector* | Generate multi-sector latent-maturity test cohorts (Power, Bank, Telco, Defense, Health). |
| `--help` | `-h` | `--help` | *None* | *None* | Display complete command syntax, available flags, and examples. |

---

## ⚙️ Operating Modes & Examples

### 1. High-Density Supervisory Entity Audit (`audit`)
Evaluates operational records for a specific entity or across all CSEs, computing dimension-level scores, identified execution gaps, and silent assets:

```bash
# Audit specific entity: Northern Regional Power Grid
node backend/bin/satsa.js audit --entity CSE-POWER-01

# Audit clean control entity: Apex National Commercial Bank
node backend/bin/satsa.js audit --entity CSE-BANK-01

# Audit all active entities in tabular overview
node backend/bin/satsa.js audit
```

**Terminal Output Sample:**
```text
================================================================================
CSE-POWER-01: Northern Regional Power Grid
Sector: Power & Energy | Tier: 1 | Attention Score: 88.5/100 (HIGH SUPERVISORY ATTENTION)
Headline SLA: 94.2%  |  Evidence Quality Score: 5.4%  |  Discrepancy Gap: +88.8%
--------------------------------------------------------------------------------
DIMENSION BREAKDOWN:
  [Detection]        Score: 35.0/100  | Status: ATTENTION NEEDED
  [Investigation]    Score: 12.0/100  | Status: SEVERE DEFECTS (Fast Closures <10m: 100%)
  [Escalation]       Score: 24.0/100  | Status: SEVERE DEFECTS (Unescalated Critical: 84.6%)
  [Resilience]       Score: 15.0/100  | Status: CRITICAL (Silent SCADA Assets: 4)

CRITICAL SUPERVISORY FINDINGS (5):
  • [EG-01] 100.0% Critical Alerts Closed in <10 Minutes (Severity: 100/100)
  • [EG-02] 11 Critical Alerts Closed Without Escalation (Severity: 89/100)
  • [NS-01] 4 Critical Systems with Zero Telemetry / Alerts >14 Days (Severity: 95/100)
  • [EG-04] High Lexical Duplication: 78.4% Templated Investigation Notes (Severity: 65/100)
================================================================================
```

---

### 2. Examiner Review Queue (`queue`)
Generates the Neyman-stratified supervisory sample queue designed to maximize defect discovery while auditing control samples:

```bash
# Display top 15 prioritized samples (85% priority defects + 15% exploration audits)
node backend/bin/satsa.js queue --limit 15
```

**Output Stratification:**
* **85% Priority Stratum:** Ranked by risk weight, severe execution gap findings, and asset criticality.
* **15% Exploration Stratum:** Pseudo-random uniform sampling across low-risk and closed alerts to defeat audit-gaming behaviors.

---

### 3. Cryptographic Ledger Chain Verification (`verify-chain`)
Recomputes continuous SHA-256 hashes across every historical finding and supervisory decision:

```bash
node backend/bin/satsa.js verify-chain
```

**Verification Guarantees:**
* Confirms $H_n = \text{SHA-256}(H_{n-1} \parallel \text{Finding}_n \parallel T_n)$ for all $n \in [1, N]$.
* Uses constant-time `crypto.timingSafeEqual` comparison to eliminate timing side-channel attacks.
* Satisfies Section 65B Indian Evidence Act / Section 63 BSA 2023 for legal non-repudiation.

---

### 4. Section 8 Empirical Benchmark (`benchmark`)
Executes automated scalability and validation experiments across multi-CSE test datasets:

```bash
node backend/bin/satsa.js benchmark
```

**Measured Capabilities:**
* Ingestion velocity (EPS) across large submissions.
* Latency per 50,000 logs across 11 detectors (< 118 ms).
* Memory footprint stability ($O(1)$ ~58 MB RSS).
* Defect discovery yield comparison against uniform random sampling (demonstrating **3.42× lift**).

---

### 5. Ingestion of Periodic Submissions (`ingest`)
Ingests structured CSV, JSON, CEF, or Syslog files submitted by CSEs:

```bash
# Ingest periodic submission with automated column normalization:
node backend/bin/satsa.js ingest -i samples/cse_power_q3_submission.json --entity CSE-POWER-01

# Ingest multi-sector CSV export:
node backend/bin/satsa.js ingest -i samples/cse_bank_alerts.csv --entity CSE-BANK-01
```

---

## 🔒 Air-Gapped Deployment Invariant

The SAT-SA CLI is completely decoupled from internet access:
* **Zero outbound HTTP/DNS requests** during analytics execution.
* **Embedded SQLite WAL storage** requires no external database server daemon.
* **Deterministic rule fallback** guarantees complete supervisory coverage even when local LLM inference engines are offline.
