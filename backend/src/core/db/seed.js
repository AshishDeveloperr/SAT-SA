import { db } from './knex.js';

export async function seedDefaults() {
  // 1. Seed Dimensions
  const existingDimensions = await db('dimensions').select('id');
  if (existingDimensions.length === 0) {
    await db('dimensions').insert([
      { id: 'dim_detection', code: 'Detection', name: 'Threat Detection', weight: 1.0 },
      { id: 'dim_investigation', code: 'Investigation', name: 'Investigation & Triage', weight: 1.2 },
      { id: 'dim_escalation', code: 'Escalation', name: 'Escalation Integrity', weight: 1.2 },
      { id: 'dim_ir', code: 'IncidentResponse', name: 'Incident Response & MTTR', weight: 1.0 },
      { id: 'dim_secops', code: 'SecOps', name: 'Security Operations Discipline', weight: 0.9 },
      { id: 'dim_governance', code: 'Governance', name: 'Governance & Oversight', weight: 0.8 },
      { id: 'dim_discipline', code: 'Discipline', name: 'Operational Discipline', weight: 1.1 },
      { id: 'dim_resilience', code: 'Resilience', name: 'Cyber Resilience & Coverage', weight: 1.3 }
    ]);
  }

  // 2. Seed Sectors
  const existingSectors = await db('sectors').select('id');
  if (existingSectors.length === 0) {
    await db('sectors').insert([
      { id: 'sec_energy', code: 'ENERGY', name: 'Power Grid, Energy & Petroleum' },
      { id: 'sec_bfsi', code: 'BFSI', name: 'Banking, Financial Services & Insurance' },
      { id: 'sec_telecom', code: 'TELECOM', name: 'Telecommunications & Satcom' },
      { id: 'sec_defense', code: 'DEFENSE', name: 'Defense & Strategic Enclaves' },
      { id: 'sec_transport', code: 'TRANSPORT', name: 'Civil Aviation & High-Speed Rail' },
      { id: 'sec_health', code: 'HEALTH', name: 'Critical Healthcare Infrastructure' }
    ]);
  }

  // 3. Seed Default Dynamic Rules
  const existingRules = await db('rules').select('id');
  if (existingRules.length === 0) {
    const rulesList = [
      {
        id: 'rule_eg_01',
        key: 'EG-01',
        kind: 'execution_gap',
        dimension_code: 'Investigation',
        name: 'High-Severity Alerts Closed Unusually Quickly',
        description: 'Identifies critical/high severity alerts closed in under the minimum triage threshold or below peer 10th percentile, indicating superficial rubber-stamping.',
        detector_key: 'EG-01',
        severity_default: 'HIGH',
        rationale: 'Alerts closed in under 10 minutes cannot have undergone genuine forensic or log triage.',
        benign_explanations_json: JSON.stringify(['Known automated rule tuning', 'Decommissioned test host alerts']),
        references_json: JSON.stringify(['NIST SP 800-61 Rev 2 §3.2', 'SOC-CMM Operational Discipline']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ min_minutes: 10, peer_percentile: 10, severities: ['CRITICAL', 'HIGH'] })
      },
      {
        id: 'rule_eg_02',
        key: 'EG-02',
        kind: 'execution_gap',
        dimension_code: 'Escalation',
        name: 'Critical Alerts Closed Without Escalation',
        description: 'Critical alerts closed without an escalation record or documented false-positive justification.',
        detector_key: 'EG-02',
        severity_default: 'CRITICAL',
        rationale: 'Mandatory supervisory policy requires critical-tier threats to be escalated to L2/CIRT.',
        benign_explanations_json: JSON.stringify(['Known recurring false positive with approval ID']),
        references_json: JSON.stringify(['CERT-In Cyber Crisis Management Plan §4.1']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ severities: ['CRITICAL'], grace_hours: 2 })
      },
      {
        id: 'rule_eg_03',
        key: 'EG-03',
        kind: 'execution_gap',
        dimension_code: 'Investigation',
        name: 'Acknowledged Alerts with Zero Investigation Steps',
        description: 'Alerts timestamped as acknowledged and closed with no recorded investigation steps or notes.',
        detector_key: 'EG-03',
        severity_default: 'HIGH',
        rationale: 'Acknowledging an alert to stop the SLA clock without conducting an investigation represents metric gaming.',
        benign_explanations_json: JSON.stringify(['Bulk auto-close of confirmed maintenance window events']),
        references_json: JSON.stringify(['NCIIPC Cyber Resilience Assessment Framework §5']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ min_steps: 1, min_note_len: 20 })
      },
      {
        id: 'rule_eg_04',
        key: 'EG-04',
        kind: 'execution_gap',
        dimension_code: 'Discipline',
        name: 'Repetitive / Templated Investigation Notes',
        description: 'Detects identical or near-duplicate investigation notes across distinct alerts using SimHash fingerprinting.',
        detector_key: 'EG-04',
        severity_default: 'MEDIUM',
        rationale: 'Copy-pasting identical investigation notes across heterogeneous alerts suggests scripted rubber-stamping.',
        benign_explanations_json: JSON.stringify(['Standardized playbook closing statement for known scanner IPs']),
        references_json: JSON.stringify(['SOC Quality Assurance Guidelines §6.3']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ simhash_hamming_threshold: 4, min_cluster_size: 5 })
      },
      {
        id: 'rule_eg_05',
        key: 'EG-05',
        kind: 'execution_gap',
        dimension_code: 'IncidentResponse',
        name: 'Repeat Alerts on Same Asset Without Remediation',
        description: 'Recurring alerts on identical critical assets closed without recording root-cause remediation.',
        detector_key: 'EG-05',
        severity_default: 'HIGH',
        rationale: 'Closing recurring alerts without root cause mitigation leads to persistent attacker footholds.',
        benign_explanations_json: JSON.stringify(['Pending procurement/maintenance window scheduled']),
        references_json: JSON.stringify(['ISO/IEC 27035-2 Incident Management']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ repeat_count_threshold: 4, window_days: 30 })
      },
      {
        id: 'rule_eg_06',
        key: 'EG-06',
        kind: 'execution_gap',
        dimension_code: 'Discipline',
        name: 'Metric-Driven SLA Bunching & Burst Closures',
        description: 'Identifies suspicious spikes in closures immediately prior to SLA breach thresholds.',
        detector_key: 'EG-06',
        severity_default: 'HIGH',
        rationale: 'Bunching ticket closures right before breach deadlines indicates managing to KPIs rather than reducing risk.',
        benign_explanations_json: JSON.stringify(['End of shift batch queue resolution']),
        references_json: JSON.stringify(['NCIIPC Supervisory Review Guidelines §7.1']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ bunching_window_minutes: 15, sla_breach_minutes: 60 })
      },
      {
        id: 'rule_ns_01',
        key: 'NS-01',
        kind: 'negative_space',
        dimension_code: 'Resilience',
        name: 'Silent Critical Assets (Zero Telemetry / Alerts)',
        description: 'High-criticality assets (e.g. SCADA controllers, Active Directory servers) with zero alert generation while peer assets exhibit expected baseline activity.',
        detector_key: 'NS-01',
        severity_default: 'CRITICAL',
        rationale: 'Absence of security telemetry from critical systems represents an unmonitored blindspot or sensor failure.',
        benign_explanations_json: JSON.stringify(['Isolated offline backup system with manual sync']),
        references_json: JSON.stringify(['NCIIPC Critical Information Infrastructure Guidelines §3.1']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ min_criticality: 4, silence_days: 14 })
      },
      {
        id: 'rule_ns_02',
        key: 'NS-02',
        kind: 'negative_space',
        dimension_code: 'Detection',
        name: 'Missing Expected Alert Categories vs Peer Baseline',
        description: 'Security categories present in ≥75% of sectoral peers (e.g. Credential Dumping, Lateral Movement) completely absent in the entity.',
        detector_key: 'NS-02',
        severity_default: 'HIGH',
        rationale: 'Total absence of common threat categories in a critical sector points to detection gap in SIEM correlation rules.',
        benign_explanations_json: JSON.stringify(['Different architecture (e.g. non-Windows environment)']),
        references_json: JSON.stringify(['MITRE ATT&CK for Enterprise Coverage Baseline']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ min_peer_prevalence: 0.70 })
      },
      {
        id: 'rule_ns_03',
        key: 'NS-03',
        kind: 'negative_space',
        dimension_code: 'Investigation',
        name: 'Missing Investigation Records for High-Severity Alerts',
        description: 'Critical or High alerts that completely lack corresponding case management files.',
        detector_key: 'NS-03',
        severity_default: 'HIGH',
        rationale: 'High severity alerts must generate formal investigation cases for supervisory auditability.',
        benign_explanations_json: JSON.stringify(['Direct containment action recorded in external ticket']),
        references_json: JSON.stringify(['NIST SP 800-61']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ severities: ['CRITICAL', 'HIGH'] })
      },
      {
        id: 'rule_ns_05',
        key: 'NS-05',
        kind: 'negative_space',
        dimension_code: 'Detection',
        name: 'Unexpectedly Low Operational Activity',
        description: 'Alert volume per asset-day significantly below sectoral peer median (robust z < -2.0).',
        detector_key: 'NS-05',
        severity_default: 'HIGH',
        rationale: 'A critical sector entity generating virtually no alerts suggests log ingestion failure or disabled rules.',
        benign_explanations_json: JSON.stringify(['Newly deployed entity undergoing baseline tuning']),
        references_json: JSON.stringify(['SOC-CMM Assessment Methodology']),
        maturity_status: 'validated',
        default_params_json: JSON.stringify({ robust_z_threshold: -2.0 })
      }
    ];

    await db('rules').insert(rulesList);

    // Seed version 1 for each rule
    for (const rule of rulesList) {
      await db('rule_versions').insert({
        id: `rv_${rule.id}_v1`,
        rule_id: rule.id,
        version: 1,
        params_json: rule.default_params_json,
        created_by: 'system_initializer'
      });
    }
  }

  // 4. Initial Audit Log entry
  const auditCount = await db('audit_log').count('id as count').first();
  if (!auditCount || parseInt(auditCount.count, 10) === 0) {
    await db('audit_log').insert({
      actor_id: 'system_bootstrap',
      action: 'SYSTEM_INITIALIZED',
      object_type: 'SYSTEM',
      object_id: 'GLOBAL',
      details_json: JSON.stringify({ version: '1.0.0', air_gapped: true }),
      prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    });
  }
}

export default seedDefaults;
