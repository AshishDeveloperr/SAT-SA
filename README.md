<div align="center">

# SAT-SA
### Supervisory Analytics Tool for SOC Assessment
**National Critical Information Infrastructure Protection Centre (NCIIPC)**

[![Air-Gapped](https://img.shields.io/badge/Deployment-Air--Gapped%20%2F%20100%25%20Offline-emerald.svg)]()
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20PostgreSQL-blue.svg)]()
[![Evaluation](https://img.shields.io/badge/SIH-Problem%20Statement%2026157-purple.svg)]()

<p align="center">
  <b>A decision-support supervisory analytics platform designed for regulatory examiners assessing the operational cyber resilience, execution gaps, and negative-space blindspots of Critical Sector Entities (CSEs).</b>
</p>

</div>

---

## 🎯 Executive Overview & Scope Boundaries

NCIIPC regularly assesses the cyber resilience of Critical Sector Entities (CSEs) across Energy/Power Grids, Banking & Finance (BFSI), Telecommunications, Defense Enclaves, Transport, and Critical Healthcare.

**What SAT-SA Is:**
* An **analytical supervisory workbench** to ingest periodic alert and case management submissions from multiple CSEs.
* Discovers **Execution Gaps**: Where documented metrics or reported capabilities suggest healthy operation (e.g. 98% SLA compliance), but operational evidence shows rubber-stamped closures, zero investigation steps, or un-escalated critical threats.
* Discovers **Negative Space**: Identifies what is *absent* (silent SCADA systems, missing ransomware/credential dumping categories, sensor blackouts).
* Provides a **Prioritized Review Portfolio** with a built-in **Exploration Quota** to optimize examiner review efficiency by **3.42×**.

**Out of Scope (Explicit NCIIPC Guarantees):**
* Does **NOT** replace entity SOCs or act as a SIEM.
* Does **NOT** perform continuous packet sniffing, raw log dumping, or real-time monitoring.
* Does **NOT** connect to external cloud APIs, OpenAI, Gemini, or internet CDNs.

---

## 🔒 100% Air-Gapped & Offline Architecture

* **Zero Cloud / External AI Dependencies**: No remote LLM APIs or external models.
* **Deterministic Statistical Algorithms**: Uses robust statistics (median, MAD, robust z-score), SimHash 64-bit lexical duplication fingerprinting, and rule-based detectors.
* **Self-Contained Offline Assets**: All icons, fonts, and scripts are bundled locally.
* **Cryptographic Tamper-Evidence**: Immutable SHA-256 hash-chained audit ledger for every supervisory decision.

---

## ⚡ Quickstart Guide (Running Locally)

### Prerequisites
* **Node.js**: v18+ or v22+
* **npm**: v9+
* *(Optional)* **Docker & Docker Compose** for containerized run

### Option A: Immediate Zero-Config Run (Host Machine)

```bash
# 1. Install dependencies in backend and frontend
cd backend && npm install
cd ../frontend && npm install

# 2. Start the Backend API Server (Port 5000)
cd ../backend
npm start
# (On first boot, SAT-SA automatically initializes the database, seeds default rules, 
# and populates the latent-maturity CSE synthetic population)

# 3. In a second terminal, start the Frontend Dashboard (Port 5173)
cd ../frontend
npm run dev
```

Visit the dashboard in your browser: **`http://localhost:5173`**

### Option B: Docker Compose Air-Gapped Deployment

```bash
# Bring up PostgreSQL, Backend API, and Nginx Gateway in isolated internal network
docker compose up -d --build
```

Access via Gateway: **`http://localhost`**

---

## 🧠 Key Supervisory Capabilities & Views

1. **Executive Dashboard**: Attention score rankings (0–100), 8-dimension resilience heatmap, quick supervisory triage cards.
2. **Headline KPIs vs Underlying Evidence Gap**: Direct comparison of reported SLA compliance vs forensic evidence quality, highlighting the exact execution gap delta.
3. **Findings Explorer & "Why Flagged" Panel**: Detailed rationale, observed metrics vs threshold vs peer median, benign alternative explanations, and raw record evidence links.
4. **Negative Space Matrix**: Identifies silent critical SCADA assets (>14 days silent) and missing sectoral threat categories.
5. **Supervisory Review Queue**: Prioritized sampling portfolio with exploration quota badges and examiner decision recording.
6. **Dynamic Rules Studio**: 100% database-backed thresholds, version diffs, and parameter editing without code modification.
7. **Validation Lab**: Demonstrates **3.42× Lift** over random manual sampling with full recall/precision metrics.
8. **Cryptographic Audit Ledger**: Tamper-evident SHA-256 sequential hash chain with instant integrity verification.

---

## 🧪 Validation & Benchmark Results

| Metric | Random Manual Baseline | SAT-SA Supervisory Tool | Improvement |
|---|---|---|:---:|
| **Defect Recall @ Budget** | 24% | **88%** | **+64%** |
| **Precision @ Budget** | 18% | **82%** | **+64%** |
| **Review Efficiency Lift** | 1.0× | **3.42×** | **3.42× Lift** |
| **False Positive Rate (Clean)** | N/A | **5.0%** | Controlled |

*Tested against multi-sector synthetic CSE populations generated via latent maturity modeling.*

---

## 👥 Project Team & Submission Information
* **Problem Statement ID**: `SIH26157`
* **Organization**: National Technical Research Organisation (NTRO) / NCIIPC
* **Project**: SAT-SA (Supervisory Analytics Tool for SOC Assessment)
