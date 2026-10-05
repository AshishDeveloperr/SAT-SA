# 🏛️ SAT-SA System Architecture & Forensic Design Document
### **National Critical Information Infrastructure Protection Centre (NCIIPC) • SIH 2026 (PS: SIH26157)**

> **[⬅ Return to Main README.md](../../README.md)** &nbsp;|&nbsp; **[View Jury Defense Cheat Sheet](../JURY_RUBRIC_DEFENSE.md)** &nbsp;|&nbsp; **[View Claims Defense](../CLAIMS_VERIFICATION_DEFENSE.md)** &nbsp;|&nbsp; **[View Empirical Benchmark](../BENCHMARK.md)**

---

## 1. Executive Summary & Design Invariants

**SAT-SA (Supervisory Analytics Tool for SOC Assessment)** is an air-gapped, high-throughput supervisory platform engineered for the National Critical Information Infrastructure Protection Centre (NCIIPC). It addresses the core challenge of assessing the cyber resilience and operational integrity of Critical Sector Entities (CSEs) at national scale.

SAT-SA enforces four strict architectural invariants:
1. **Supervisory Analytics, Not Operational SIEM:** SAT-SA does not monitor live attacks or deploy agents; it evaluates periodic submissions (alerts, investigation logs, escalations, asset inventories) as operational evidence.
2. **Dual-Discipline Detection (Execution Gaps & Negative Space):** Simultaneously exposes operational shortcuts (closed too fast, template notes) and absent evidence (silent assets, unfiled cases, missing threat classes).
3. **Court-Admissible Non-Repudiation:** Cryptographically seals every finding into an append-only SHA-256 chained decision ledger compliant with Section 65B of the Indian Evidence Act and Section 63 of the Bharatiya Sakshya Adhiniyam 2023.
4. **100% Air-Gapped Sovereign Independence:** Fully operational inside sovereign enclaves with zero cloud dependencies, offline quantized AI inference, and local SQLite Write-Ahead Log (WAL) storage.

---

## 2. End-to-End System Design Architecture

```mermaid
flowchart TD
    subgraph INGEST["1. Ingestion & Invariant Pre-Processing"]
        SUBMISSIONS["Periodic CSE Submissions<br/>(CSV, JSON, CEF, Syslog)"] --> PARSER["Universal Schema Normalizer<br/>(Header Aliases & Type Coercion)"]
        PARSER --> PSEUDO["Operator Pseudonymizer<br/>(Privacy & Anti-Bias Masking)"]
        PSEUDO --> WAL[("Operational Fact Ledger<br/>SQLite WAL + Strict Schema")]
    end

    subgraph ENGINE["2. Supervisory Analytics Engine (11 Detectors)"]
        WAL --> EG_ENGINE["Execution Gap Detectors<br/>• EG-01 Fast Closures (&lt;10m)<br/>• EG-02 Unescalated Critical<br/>• EG-03 Zero-Step Tickets<br/>• EG-04 SimHash Duplication<br/>• EG-05 Repeat Alert Cycles<br/>• EG-06 Metric SLA Bunching"]
        
        WAL --> NS_ENGINE["Negative Space Reasoners<br/>• NS-01 Silent Assets (Poisson P&lt;10⁻⁹)<br/>• NS-02 Absent Threat Classes<br/>• NS-03 Missing Case Records<br/>• NS-04 Missing Escalations<br/>• NS-05 Low Velocity (Modified Z)"]
        
        EG_ENGINE & NS_ENGINE --> PEER["Cross-Entity Peer Benchmarking<br/>(Robust Median & MAD Statistics)"]
        PEER --> SCORING["Composite Attention Scoring<br/>(0–100 Entity Risk Index)"]
    end

    subgraph FORENSICS["3. Cryptographic Chain-of-Custody"]
        SCORING --> HASHER{"SHA-256 Chained Sealer<br/>H[n] = SHA-256(H[n-1] || Finding || Time)"}
        HASHER --> CHAIN_STORE[("Tamper-Evident Ledger<br/>Section 65B BSA Compliant")]
    end

    subgraph CONSUMPTION["4. Supervisory Consumption Enclave"]
        SCORING & CHAIN_STORE --> WEB["Vite React Single-Pane Dashboard<br/>Heatmaps, KPI Gaps, Queue, Dossiers"]
        SCORING & CHAIN_STORE --> CLI["Standalone Examiner CLI (satsa)<br/>audit, queue, benchmark, verify-chain"]
        SCORING --> COPILOT["Local Air-Gapped AI Copilot<br/>(Ollama Qwen 2.5 / Llama 3)"]
    end
```

---

## 3. Subsystem Technical Specifications

### A. Cryptographic Forensic Ledger (Section 65B BSA Compliance)
In regulatory oversight, supervisory decisions must withstand legal challenges in appellate tribunals. SAT-SA enforces continuous sequential hash chaining across all generated findings:

```mermaid
flowchart LR
    GENESIS[("Genesis Block<br/>00000000...0000")] --> BLOCK1["Finding Block 1<br/>Hash = SHA-256(Genesis || F1 || T1)"]
    BLOCK1 --> BLOCK2["Finding Block 2<br/>Hash = SHA-256(H1 || F2 || T2)"]
    BLOCK2 --> BLOCKN["Finding Block N<br/>Hash = SHA-256(H_n-1 || Fn || Tn)"]

    subgraph VERIFY["Cryptographic Verification"]
        CLI_VERIFY["satsa verify-chain<br/>crypto.timingSafeEqual (&lt;4.2 ms / 10k blocks)"]
    end

    BLOCKN -.-> CLI_VERIFY
```

* **Recursive Sequential Chaining:**
  $$H_n = \text{SHA-256}(H_{n-1} \parallel \text{FindingRecord}_n \parallel \text{Timestamp}_n)$$
* **Non-Repudiation Guarantee:** Changing a single character in historical finding records causes an immediate hash mismatch in all descendant blocks.
* **Timing-Attack Resistance:** Verification utilizes `crypto.timingSafeEqual()` to eliminate side-channel latency vulnerabilities.

---

### B. Analytical Scoring & Peer Benchmarking Subsystem

SAT-SA evaluates Critical Sector Entities across **8 Cyber Resilience Dimensions**:
1. **Threat Detection**
2. **Investigation & Triage**
3. **Escalation Integrity**
4. **Incident Response & MTTR**
5. **Security Operations Discipline**
6. **Governance & Oversight**
7. **Operational Discipline**
8. **Cyber Resilience & Coverage**

#### Robust Statistical Normalization:
To avoid bias introduced by extreme outliers or compromised entities, SAT-SA utilizes Median and Median Absolute Deviation (MAD):
$$\text{MAD} = \text{median}(|x_i - \tilde{x}|), \quad \text{where } \tilde{x} = \text{median}(X)$$
$$\text{Modified } Z_i = \frac{0.6745 \cdot (x_i - \tilde{x})}{\text{MAD}}$$

#### Composite Attention Score Formulation:
$$\text{Attention Score} = \sum_{d=1}^{8} w_d \cdot (100 - S_d) + \sum_{f \in \text{Findings}} \text{SeverityWeight}(f)$$
Normalized to a 0–100 scale, where entities exceeding threshold 65 are prioritized for supervisory intervention.

---

### C. 85/15 Stratified Review Portfolio Engine

Supervisory examiners have limited review bandwidth. SAT-SA solves the sampling allocation problem using **Neyman-Stratified Risk Portfolio Allocation**:
* **85% Priority Stratum:** Focuses examiner effort on high-severity anomalies, repeat failures, unescalated alerts, and critical asset events.
* **15% Exploration Stratum:** Draws pseudo-random uniform samples across low-risk and closed alerts to identify emerging patterns and deter audit-gaming behaviors.

---

### D. Air-Gapped AI Copilot Architecture

```mermaid
flowchart LR
    FINDING["Supervisory Finding<br/>+ JSON Forensic Metrics"] --> PROMPT["Context Assembly Engine<br/>NCIIPC Regulatory Guidelines"]
    
    PROMPT --> MODEL{"Local Ollama Runtime<br/>(localhost:11434)"}
    
    MODEL -->|"Online (Qwen 2.5 / Llama 3)"| AI_OUT["Regulatory Briefing Dossier<br/>Section 70A Directives"]
    MODEL -->|"Offline / Service Down"| FALLBACK["Deterministic Rule Synthesizer<br/>Zero-Degradation Templates"]
```

* **Zero Cloud Egress:** Operates exclusively via local inference on port 11434.
* **Deterministic Fallback:** Guarantees that examiners always receive structured regulatory analysis even in constrained computing environments lacking GPU acceleration.
