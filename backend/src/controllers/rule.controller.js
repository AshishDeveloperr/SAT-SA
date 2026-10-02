import { db } from '../core/db/knex.js';

/**
 * Controller handling Dynamic Rules Studio & Parameter Management.
 */

/**
 * 1. Get all rules, versions, benign explanations, and references
 * GET /api/v1/rules
 */
export async function getRules(req, res) {
  const rules = await db('rules');
  const versions = await db('rule_versions');

  const formatted = rules.map(r => {
    const ruleVersions = versions.filter(v => v.rule_id === r.id);
    return {
      ...r,
      default_params: r.default_params_json ? JSON.parse(r.default_params_json) : {},
      benign_explanations: r.benign_explanations_json ? JSON.parse(r.benign_explanations_json) : [],
      references: r.references_json ? JSON.parse(r.references_json) : [],
      versions: ruleVersions.map(v => ({
        ...v,
        params: JSON.parse(v.params_json)
      }))
    };
  });

  res.json({ data: formatted });
}

/**
 * 2. Update Rule Thresholds Dynamically and log version
 * PATCH /api/v1/rules/:id
 */
export async function updateRule(req, res) {
  const { id } = req.params;
  const { params, enabled } = req.body;

  const rule = await db('rules').where('id', id).first();
  if (!rule) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rule not found' } });
  }

  if (params) {
    const versions = await db('rule_versions').where('rule_id', id);
    const nextVersion = versions.length + 1;

    await db('rule_versions').insert({
      id: `rv_${id}_v${nextVersion}`,
      rule_id: id,
      version: nextVersion,
      params_json: JSON.stringify(params),
      created_by: 'supervisor_admin'
    });

    await db('rules').where('id', id).update({
      default_params_json: JSON.stringify(params),
      ...(enabled !== undefined ? { enabled } : {})
    });
  } else if (enabled !== undefined) {
    await db('rules').where('id', id).update({ enabled });
  }

  res.json({ data: { status: 'updated', ruleId: id } });
}
