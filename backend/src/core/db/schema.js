import { db } from './knex.js';

/**
 * Initializes all required database tables for SAT-SA if they do not exist.
 */
export async function initSchema() {
  // 1. Sectors
  if (!await db.schema.hasTable('sectors')) {
    await db.schema.createTable('sectors', (table) => {
      table.string('id').primary();
      table.string('code').unique().notNullable();
      table.string('name').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 2. Entities (CSEs)
  if (!await db.schema.hasTable('entities')) {
    await db.schema.createTable('entities', (table) => {
      table.string('id').primary();
      table.string('code').unique().notNullable();
      table.string('name').notNullable();
      table.string('sector_id').references('id').inTable('sectors');
      table.string('size_tier').defaultTo('TIER_1');
      table.string('region').defaultTo('National');
      table.text('metadata_json');
      table.boolean('active').defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 3. Assets
  if (!await db.schema.hasTable('assets')) {
    await db.schema.createTable('assets', (table) => {
      table.string('id').primary();
      table.string('entity_id').references('id').inTable('entities').index();
      table.string('external_id').notNullable();
      table.string('name').notNullable();
      table.string('type').notNullable(); // SCADA, OT_SWITCH, AD_SERVER, DB_CLUSTER, FIREWALL
      table.integer('criticality').notNullable().defaultTo(3); // 1-5
      table.string('environment').defaultTo('PRODUCTION');
      table.timestamp('first_seen');
      table.timestamp('last_seen').index();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 4. Alerts
  if (!await db.schema.hasTable('alerts')) {
    await db.schema.createTable('alerts', (table) => {
      table.string('id').primary();
      table.string('entity_id').references('id').inTable('entities').index();
      table.string('batch_id').index();
      table.string('external_id').notNullable();
      table.string('asset_id').references('id').inTable('assets').index();
      table.string('category').notNullable().index();
      table.string('severity').notNullable().index(); // CRITICAL, HIGH, MEDIUM, LOW
      table.string('source_tool');
      table.string('rule_name');
      table.timestamp('created_at').notNullable().index();
      table.timestamp('acknowledged_at');
      table.timestamp('closed_at').index();
      table.string('disposition'); // true_positive, false_positive, benign, auto_closed
      table.string('closure_reason');
      table.string('assignee_hash').index();
      table.string('case_id').index();
    });
  }

  // 5. Cases
  if (!await db.schema.hasTable('cases')) {
    await db.schema.createTable('cases', (table) => {
      table.string('id').primary();
      table.string('entity_id').references('id').inTable('entities').index();
      table.string('external_id').notNullable();
      table.timestamp('opened_at').notNullable();
      table.timestamp('closed_at');
      table.string('status').defaultTo('CLOSED');
      table.string('severity').defaultTo('HIGH');
      table.string('resolution');
      table.boolean('root_cause_recorded').defaultTo(false);
      table.integer('reopened_count').defaultTo(0);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 6. Investigation Steps
  if (!await db.schema.hasTable('investigation_steps')) {
    await db.schema.createTable('investigation_steps', (table) => {
      table.string('id').primary();
      table.string('case_id').references('id').inTable('cases').index();
      table.string('alert_id').references('id').inTable('alerts').index();
      table.string('entity_id').references('id').inTable('entities').index();
      table.string('actor_hash');
      table.string('step_type').defaultTo('ANALYSIS');
      table.timestamp('started_at');
      table.timestamp('ended_at');
      table.integer('note_len').defaultTo(0);
      table.string('note_simhash');
      table.text('note_text');
    });
  }

  // 7. Escalations
  if (!await db.schema.hasTable('escalations')) {
    await db.schema.createTable('escalations', (table) => {
      table.string('id').primary();
      table.string('entity_id').references('id').inTable('entities').index();
      table.string('case_id').references('id').inTable('cases').index();
      table.string('alert_id').references('id').inTable('alerts').index();
      table.string('from_level'); // L1, L2
      table.string('to_level');   // L2, L3, CIRT, CISO
      table.timestamp('escalated_at').notNullable();
      table.timestamp('acknowledged_at');
      table.string('outcome');
    });
  }

  // 8. Rules & Parameters (Dynamic DB-driven)
  if (!await db.schema.hasTable('rules')) {
    await db.schema.createTable('rules', (table) => {
      table.string('id').primary();
      table.string('key').unique().notNullable(); // e.g., EG-01, NS-01
      table.string('kind').notNullable(); // execution_gap, negative_space, anomaly
      table.string('dimension_code').notNullable(); // Detection, Investigation, Escalation, etc.
      table.string('name').notNullable();
      table.text('description');
      table.string('detector_key').notNullable();
      table.boolean('enabled').defaultTo(true);
      table.string('severity_default').defaultTo('HIGH');
      table.text('rationale');
      table.text('benign_explanations_json');
      table.text('references_json');
      table.string('maturity_status').defaultTo('validated');
      table.text('rationale_template');
      table.text('default_params_json');
    });
  }

  // 9. Rule Versions (Parameter changes audit)
  if (!await db.schema.hasTable('rule_versions')) {
    await db.schema.createTable('rule_versions', (table) => {
      table.string('id').primary();
      table.string('rule_id').references('id').inTable('rules').index();
      table.integer('version').notNullable();
      table.text('params_json').notNullable();
      table.string('created_by').defaultTo('system');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 10. Dimensions
  if (!await db.schema.hasTable('dimensions')) {
    await db.schema.createTable('dimensions', (table) => {
      table.string('id').primary();
      table.string('code').unique().notNullable();
      table.string('name').notNullable();
      table.float('weight').defaultTo(1.0);
    });
  }

  // 11. Analysis Runs
  if (!await db.schema.hasTable('analysis_runs')) {
    await db.schema.createTable('analysis_runs', (table) => {
      table.string('id').primary();
      table.string('trigger').defaultTo('manual');
      table.string('status').defaultTo('COMPLETED');
      table.text('config_snapshot_json');
      table.string('data_fingerprint');
      table.timestamp('started_at').defaultTo(db.fn.now());
      table.timestamp('finished_at');
    });
  }

  // 12. Findings
  if (!await db.schema.hasTable('findings')) {
    await db.schema.createTable('findings', (table) => {
      table.string('id').primary();
      table.string('run_id').references('id').inTable('analysis_runs').index();
      table.string('entity_id').references('id').inTable('entities').index();
      table.string('rule_id').references('id').inTable('rules').index();
      table.string('rule_key').notNullable().index();
      table.string('kind').notNullable();
      table.string('dimension_code').notNullable();
      table.string('title').notNullable();
      table.float('severity_score').notNullable(); // 0-100
      table.float('confidence').defaultTo(0.9);
      table.text('rationale');
      table.text('metrics_json');
      table.text('thresholds_json');
      table.text('peer_context_json');
      table.string('status').defaultTo('open'); // open, reviewed, dismissed
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 13. Finding Evidence
  if (!await db.schema.hasTable('finding_evidence')) {
    await db.schema.createTable('finding_evidence', (table) => {
      table.string('id').primary();
      table.string('finding_id').references('id').inTable('findings').index();
      table.string('record_type').notNullable(); // alert, case, asset, escalation
      table.string('record_id').notNullable();
      table.string('role').defaultTo('primary'); // primary, supporting, counter
      table.text('note');
      table.text('raw_record_json');
    });
  }

  // 14. Entity Scores
  if (!await db.schema.hasTable('entity_scores')) {
    await db.schema.createTable('entity_scores', (table) => {
      table.string('id').primary();
      table.string('run_id').references('id').inTable('analysis_runs').index();
      table.string('entity_id').references('id').inTable('entities').index();
      table.float('composite_score').notNullable(); // 0-100 Attention Score
      table.text('dimension_scores_json');
      table.integer('rank');
      table.float('percentile');
      table.float('delta_vs_previous').defaultTo(0);
      table.integer('contributing_findings').defaultTo(0);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 15. Review Samples (Portfolio Optimizer)
  if (!await db.schema.hasTable('review_samples')) {
    await db.schema.createTable('review_samples', (table) => {
      table.string('id').primary();
      table.string('run_id').references('id').inTable('analysis_runs').index();
      table.string('entity_id').references('id').inTable('entities').index();
      table.string('record_type').notNullable();
      table.string('record_id').notNullable();
      table.float('priority_score').notNullable();
      table.string('strategy').notNullable(); // priority, exploration
      table.text('reasons_json');
      table.boolean('reviewed').defaultTo(false);
      table.string('examiner_decision'); // confirmed, false_positive, needs_info
      table.text('examiner_comment');
      table.timestamp('decided_at');
    });
  }

  // 16. Hash-Chained Audit Log
  if (!await db.schema.hasTable('audit_log')) {
    await db.schema.createTable('audit_log', (table) => {
      table.increments('id').primary();
      table.timestamp('ts').defaultTo(db.fn.now());
      table.string('actor_id').defaultTo('supervisor_1');
      table.string('action').notNullable();
      table.string('object_type');
      table.string('object_id');
      table.text('details_json');
      table.string('prev_hash').notNullable();
      table.string('hash').notNullable();
    });
  }

  // 17. Import Batches
  if (!await db.schema.hasTable('import_batches')) {
    await db.schema.createTable('import_batches', (table) => {
      table.string('id').primary();
      table.string('entity_id').references('id').inTable('entities').index();
      table.string('source_type').defaultTo('CSV');
      table.string('file_name').notNullable();
      table.string('sha256').notNullable();
      table.string('status').defaultTo('LOADED');
      table.text('row_counts_json');
      table.text('error_summary');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }
}

export default initSchema;
