export interface Entity {
  id: string;
  code: string;
  name: string;
  sector_name: string;
  score: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rank: number;
  percentile: number;
  contributing_findings: number;
  dimension_scores: Record<string, number>;
}

export interface Finding {
  id: string;
  entity_id: string;
  entity_code: string;
  entity_name: string;
  rule_key: string;
  kind: string;
  dimension_code: string;
  title: string;
  severity_score: number;
  confidence: number;
  rationale: string;
  status: string;
  metrics: Record<string, any>;
  thresholds: Record<string, any>;
  peer_context: Record<string, any>;
  evidence?: Array<{
    id: string;
    record_type: string;
    record_id: string;
    role: string;
    note: string;
    raw_record: any;
  }>;
}

export interface KpiGap {
  entityId: string;
  entityCode: string;
  entityName: string;
  sectorCode?: string;
  sectorName?: string;
  headlineSlaPct: number;
  evidenceQualityScore: number;
  executionGapSize: number;
  fastClosePct: number;
  unescalatedCriticalPct: number;
  findingsCount: number;
}

export interface SilentAsset {
  id: string;
  external_id: string;
  name: string;
  type: string;
  criticality: number;
  daysSilent: number;
  entityCode: string;
  entityName: string;
  tierLabel?: string;
  purdueLevel?: string;
  expectedTelemetryRate?: string;
}

export interface AuditLog {
  id: number | string;
  action: string;
  actor_id: string;
  object_id: string;
  object_type?: string;
  hash: string;
  prev_hash?: string;
  timestamp?: string;
  details_json?: any;
}

export interface Rule {
  id: string;
  key: string;
  kind: string;
  dimension_code: string;
  name: string;
  description: string;
  detector_key: string;
  severity_default?: string;
  rationale: string;
  benign_explanations_json?: string;
  references_json?: string;
  maturity_status?: string;
  default_params?: Record<string, any>;
  default_params_json?: string;
}

export interface ReviewSample {
  id: string;
  record_id: string;
  entity_code: string;
  entity_name?: string;
  strategy: 'priority' | 'exploration' | string;
  stratum?: string;
  priority_score: number;
  reviewed: boolean;
  examiner_decision?: 'confirmed' | 'benign' | null;
  examiner_comment?: string;
  reasons: string[];
  alertDetails?: {
    severity?: string;
    disposition?: string;
    created_at?: string;
    closed_at?: string;
    analyst?: string;
    rule_name?: string;
  };
  rawLog?: string;
  rawCsv?: string;
}

export interface ValidationMetrics {
  totalAlertsInPool?: number;
  totalCasesInPool?: number;
  metrics: {
    liftOverRandomBaseline: number;
    defectRecallAtBudget: number;
    falsePositiveRateOnCleanCohort: number;
    totalReviewedBudget?: number;
    totalActualDefects?: number;
  };
  defectTypeCoverage: Array<{
    defect: string;
    lift: string;
    rule?: string;
  }>;
}

export type TabType = 
  | 'dashboard' 
  | 'upload' 
  | 'gap' 
  | 'findings' 
  | 'negative' 
  | 'queue' 
  | 'rules' 
  | 'validation' 
  | 'audit' 
  | 'compare';
