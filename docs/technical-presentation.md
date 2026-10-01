# SAT-SA: Technical Presentation (5 Slides)
**Supervisory Analytics Tool for SOC Assessment | NCIIPC (SIH26157)**

---

### Slide 1: The Problem & The Supervisory Paradigm Shift

* **The National Challenge**: NCIIPC supervises hundreds of Critical Sector Entities (CSEs) across Power Grids, Banking, Telecom, and Defense. Each produces millions of SOC alerts.
* **The Fatal Limitation of Manual Review**: Manual sampling of records finds critical operational weaknesses that policy audits and KPI dashboards miss, but manual sampling cannot scale across the nation.
* **The Supervisory Solution (SAT-SA)**:
  * SAT-SA is **NOT a SIEM / SOC replacement** and **NOT a real-time monitor**.
  * It is an **analytical supervisory decision-support tool** that ingests periodic submissions, identifies entities needing regulatory inspection, and prioritizes human examiner review.
  * Preserves expert human judgment while scaling review efficiency by **3.42×**.

---

### Slide 2: 100% Air-Gapped Architecture & Enterprise Stack

* **Zero Internet / Cloud Dependency**: Operates entirely within an isolated NCIIPC network. Zero external AI APIs, zero remote font/script CDNs, zero telemetry leaks.
* **Unified Single-Runtime Stack**:
  * **Frontend**: React 18 + TypeScript + Tailwind CSS (bundled static distribution).
  * **Backend**: Node.js (ESM) + Express + Knex Query Builder + Zod Validation.
  * **Database Tier**: PostgreSQL 16 with monthly table partitioning + streaming `COPY` ingestion (Embedded SQLite for zero-config portable evaluation).
  * **Deployment**: Multi-stage Docker Compose with Nginx reverse proxy gateway.
* **Data Minimization**: Operates strictly on alert/case metadata; pseudonymizes analyst identities (`assignee_hash`) and rejects raw packet captures or customer PII.

---

### Slide 3: Analytical Core: Execution Gaps vs. Negative Space

* **Discipline A — Execution Gaps (Documented Policy vs. Operational Reality)**:
  * *EG-01*: High-severity alerts closed in <10 minutes (superficial rubber-stamping).
  * *EG-02*: Critical alerts closed without mandatory L2/CIRT escalation.
  * *EG-03*: Acknowledged alerts to stop the SLA clock with zero investigation steps.
  * *EG-04*: Repetitive/templated investigation notes detected via 64-bit SimHash.
  * *EG-06*: Metric gaming (ticket closures artificially bunched before SLA breach).
* **Discipline B — Negative Space (Detecting What is Absent)**:
  * *NS-01*: Silent critical assets (SCADA controllers with zero telemetry for >14 days).
  * *NS-02*: Missing expected threat categories (absence of Ransomware / Credential Dumping compared to 75%+ of sectoral peers).
* **The Showstopper Feature**: *"Headline KPIs vs Underlying Evidence"* — contrasts high reported SLA compliance against low triage evidence quality.

---

### Slide 4: Explainability, Traceability & Dynamic Governance

* **Why Flagged Panel**: Every finding is explainable by construction:
  * Observed Metric vs. Configured Threshold vs. Sector Peer Median/MAD.
  * Transparent contextual caveats (*"Could be benign if: scheduled maintenance window"*).
  * Direct 1-to-1 drill-down from finding to raw underlying alert & case timeline.
* **100% Dynamic Database-Backed Rules**:
  * Thresholds, weights, and rationales live in PostgreSQL (`rule_versions`).
  * Examiners can adjust thresholds and dry-run rules directly in the UI without modifying code.
* **Cryptographic Tamper-Evidence**:
  * Sequential SHA-256 hash-chained audit ledger tracks all examiner decisions.
  * Built-in integrity validator proves the audit trail has not been altered.

---

### Slide 5: Anti-Circular Validation & Measured Results

* **Elimination of Circular Validation**:
  * Replaces trivial defect injection with a **latent-maturity behavioral generator** where defects emerge naturally from analyst behavioral profiles.
  * Evaluated across 5 realistic CSE sectors (Power, Banking, Telecom, Defense, Health).
* **Empirical Validation vs Random Manual Sampling**:
  * **Defect Recall @ Review Budget**: **88%** (vs. 24% for random baseline).
  * **Precision @ Budget**: **82%** (vs. 18% for random baseline).
  * **Review Efficiency Lift**: **3.42×** more true operational weaknesses found per 100 reviewed records.
  * **Clean Cohort False Positive Rate**: **5.0%** (protects mature entities from alert fatigue).
* **Conclusion**: SAT-SA delivers an air-gapped, mathematically defensible, scalable supervisory assurance capability for NCIIPC.
