/**
 * Local Air-Gapped AI Copilot & Narrative Synthesizer
 * Connects to local Ollama (qwen2.5:3b / llama3.2:3b) on localhost.
 * Strictly adheres to NCIIPC Section 5 air-gapped guidelines:
 * - 100% Offline execution, ZERO outbound traffic.
 * - AI NEVER alters risk scores or detection flags.
 * - Deterministic fallback if Ollama daemon is offline.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const OLLAMA_TIMEOUT_MS = parseInt(process.env.OLLAMA_TIMEOUT_MS || '60000', 10);

/**
 * Check if the local Ollama instance is alive and check available models
 */
export async function getOllamaStatus() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return { available: false, model: OLLAMA_MODEL, error: 'Ollama responded with error' };
    }

    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models.map(m => m.name) : [];
    const hasTargetModel = models.some(m => m.includes('qwen2.5') || m.includes('llama'));

    return {
      available: true,
      endpoint: OLLAMA_URL,
      configuredModel: OLLAMA_MODEL,
      installedModels: models,
      hasTargetModel,
      airGapped: true
    };
  } catch (err) {
    return {
      available: false,
      endpoint: OLLAMA_URL,
      configuredModel: OLLAMA_MODEL,
      error: 'Local Ollama daemon is currently offline or starting up',
      airGapped: true
    };
  }
}

/**
 * Generate a statutory supervisory inspection narrative (SAR-01 Statutory Brief)
 * using local Qwen2.5:3B, or deterministic fallback if unavailable.
 */
export async function generateSupervisoryNarrative({
  entityName,
  entityCode,
  sector,
  riskTier,
  score,
  headlineSla,
  evidenceQuality,
  executionGapSize,
  findingsCount,
  silentAssetsCount,
  topFindings = []
}) {
  const status = await getOllamaStatus();

  // Prompt constructed strictly for supervisory decision-support
  const prompt = `You are a Senior Cyber Resilience Supervisory Examiner at NCIIPC (National Critical Information Infrastructure Protection Centre), assessing a Critical Sector Entity (CSE) under Section 70A of the Information Technology Act.

Analyze the following empirical operational evidence:
- Entity: ${entityName} (${entityCode})
- Sector: ${sector}
- Composite Supervisory Attention Score: ${score}/100 [Tier: ${riskTier}]
- Self-Reported SLA Compliance: ${headlineSla}%
- Empirical Evidence Quality Score: ${evidenceQuality}%
- Execution Gap (Goodhart's Law Discrepancy): +${executionGapSize}%
- Contributing Forensic Findings: ${findingsCount}
- Silent / Unmonitored Critical Assets: ${silentAssetsCount}
- Key Defect Rules Flagged: ${topFindings.map(f => `${f.rule_key}: ${f.title}`).join('; ')}

Task:
Draft a concise, rigorous 3-paragraph Supervisory Examination Briefing:
1. Executive Assessment: Highlight the divergence between reported compliance and forensic operational evidence.
2. Forensic Weakness Analysis: Detail the specific failure modes (e.g., rushed closures, unescalated high-severity alerts, or silent crown jewels).
3. Supervisory Recommendation: Prescribe specific directives for on-site examination, management inquiry, or Section 70A rectification notices.

Tone: Authoritative, objective, regulatory, and legally sound. Do not invent numbers not provided above.`;

  if (status.available && (status.hasTargetModel || status.installedModels?.length > 0)) {
    try {
      const activeModel = status.installedModels.find(m => m.includes('qwen2.5')) || status.installedModels[0] || OLLAMA_MODEL;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          prompt,
          stream: false,
          options: {
            temperature: 0.2, // Low temperature for maximum deterministic accuracy
            top_p: 0.9,
            num_ctx: 2048
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const result = await response.json();
        if (result && result.response) {
          return {
            narrative: result.response.trim(),
            engine: `Ollama Local Air-Gapped (${activeModel})`,
            isAiGenerated: true,
            model: activeModel,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Ollama generation error, falling back to deterministic template:', err.message);
    }
  }

  // Deterministic Fallback Template (Ensures 100% uptime even if model is not yet loaded)
  const fallbackNarrative = `STATUTORY SUPERVISORY EXAMINATION BRIEFING (SECTION 70A / NCIIPC)

1. EXECUTIVE ASSESSMENT:
Empirical supervisory analysis of ${entityName} (${entityCode}) identifies a severe operational divergence. While the entity self-reports a headline SLA compliance rate of ${headlineSla}%, forensic verification of underlying SOC case-management telemetry reveals an Evidence Quality score of only ${evidenceQuality}%, establishing an execution gap of +${executionGapSize}%. This discrepancy indicates metric-satisficing behavior without proportionate risk reduction.

2. FORENSIC DEFECT & WEAKNESS ANALYSIS:
The entity presents ${findingsCount} substantiated supervisory defects across critical security workflows. Specifically, investigators identified systemic failure modes including rapid sub-threshold alert triage, unescalated high-severity security incidents, and high lexical repetition in investigation notes. Furthermore, ${silentAssetsCount} critical infrastructure assets exhibit negative-space telemetry silence exceeding regulatory baselines, indicating monitoring blind spots in operational segments.

3. STATUTORY DIRECTIVES & NEXT ACTIONS:
Under regulatory guidelines, ${entityName} is prioritized at Risk Tier ${riskTier} (Composite Score: ${score}/100). It is formally recommended that NCIIPC examiners issue an on-site operational review directive to inspect Level 3 SOC shift handover logs, mandate telemetric re-attestation for unmonitored assets, and verify remedial action plans regarding repeat security anomalies.`;

  return {
    narrative: fallbackNarrative,
    engine: 'SAT-SA Deterministic Heuristic Engine (Air-Gapped Standard)',
    isAiGenerated: false,
    model: 'Rule-Based Deterministic Fallback',
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate Section 65B Peer Supervisory Synthesis comparing two Critical Sector Entities
 * using local Qwen2.5:3B, or deterministic fallback if unavailable.
 */
export async function generatePeerComparisonNarrative({
  sectorName = 'Critical Infrastructure',
  entity1,
  entity2,
  deltas = {}
}) {
  const e1 = entity1 || { code: 'CSE-01', name: 'Entity 1', headlineSlaPct: 95, evidenceQualityScore: 80, executionGapSize: 15, unescalatedCriticalPct: 2 };
  const e2 = entity2 || { code: 'CSE-02', name: 'Entity 2', headlineSlaPct: 98, evidenceQualityScore: 35, executionGapSize: 63, unescalatedCriticalPct: 35 };

  const prompt = `You are a Senior Cyber Resilience Supervisory Examiner at NCIIPC (National Critical Information Infrastructure Protection Centre) evaluating Critical Sector Entities under Section 70B of the IT Act and Section 65B of the Indian Evidence Act.

Empirical Operational Evidence for Peer Comparison:
Sector: ${sectorName}
- Entity A: ${e1.name || e1.code} (${e1.code})
  * Reported SLA Compliance: ${e1.headlineSlaPct}%
  * Forensic Evidence Quality Score: ${e1.evidenceQualityScore}%
  * Execution Gap (Goodhart's Law Discrepancy): +${e1.executionGapSize}%
  * Unescalated Critical Incidents: ${e1.unescalatedCriticalPct || 0}%
  * Risk Tier / Composite Score: ${e1.compositeScore ?? 'N/A'}/100

- Entity B: ${e2.name || e2.code} (${e2.code})
  * Reported SLA Compliance: ${e2.headlineSlaPct}%
  * Forensic Evidence Quality Score: ${e2.evidenceQualityScore}%
  * Execution Gap (Goodhart's Law Discrepancy): +${e2.executionGapSize}%
  * Unescalated Critical Incidents: ${e2.unescalatedCriticalPct || 0}%
  * Risk Tier / Composite Score: ${e2.compositeScore ?? 'N/A'}/100

Task:
Write a concise, high-impact 2-sentence supervisory determination comparing ${e1.code} and ${e2.code}:
- Sentence 1: Contrast their operational triage discipline, directly stating how ${e1.code}'s reported SLA (${e1.headlineSlaPct}%) vs evidence quality (${e1.evidenceQualityScore}%) compares with ${e2.code} under Goodhart's Law (execution gap +${e1.executionGapSize}% vs +${e2.executionGapSize}%).
- Sentence 2: Deliver the supervisory directive pursuant to NCIIPC Guidelines v2.4 and Section 70A.

Rules:
- Write natural, grammatical English prose (exactly 2 complete sentences).
- Do NOT output abbreviations or key-value fragments like 'Metric: Value' or isolated labels.
- Bold the critical entity codes and metric percentages.`;

  const status = await getOllamaStatus();
  if (status.available && (status.hasTargetModel || status.installedModels?.length > 0)) {
    try {
      const activeModel = status.installedModels.find(m => m.includes('qwen2.5')) || status.installedModels[0] || OLLAMA_MODEL;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          prompt,
          stream: false,
          options: {
            temperature: 0.2,
            top_p: 0.9,
            num_ctx: 1024
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const result = await response.json();
        if (result && result.response) {
          return {
            narrative: result.response.trim(),
            engine: `Ollama Local Air-Gapped (${activeModel})`,
            isAiGenerated: true,
            model: activeModel,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Ollama peer comparison generation error, using fallback:', err.message);
    }
  }

  // Deterministic Fallback (2 Natural Fluent Sentences)
  const fallbackNarrative = `While **${e1.code}** reports **${e1.headlineSlaPct}% SLA compliance**, underlying investigation telemetry verifies only **${e1.evidenceQualityScore}% Evidence Quality**, exposing an execution gap of **+${e1.executionGapSize}%** under Goodhart's Law compared to **${e2.code}**'s authentic **${e2.evidenceQualityScore}% Evidence Quality**. Pursuant to **NCIIPC Guidelines v2.4**, supervisory examiners mandate a priority **Section 70A verification directive** to inspect triage depth and unescalated alerts.`;

  return {
    narrative: fallbackNarrative,
    engine: 'SAT-SA Deterministic Heuristic Engine (Air-Gapped Standard)',
    isAiGenerated: false,
    model: 'Rule-Based Deterministic Fallback',
    timestamp: new Date().toISOString()
  };
}

