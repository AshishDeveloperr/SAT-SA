/**
 * SAT-SA API Gateway Master Router
 * 
 * Re-exports modularized routers from the index router.
 * Maintained for backward compatibility and clean modular imports.
 */

export { apiRouter, default } from './index.js';
export * from './entity.routes.js';
export * from './finding.routes.js';
export * from './review.routes.js';
export * from './rule.routes.js';
export * from './analytics.routes.js';
export * from './audit.routes.js';
export * from './ingestion.routes.js';
export * from './trend.routes.js';
export * from './sanction.routes.js';
