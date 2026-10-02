import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateParamExists } from '../middlewares/validation.middleware.js';
import {
  getEntities,
  getEntitySummary,
  getKpisVsEvidence,
  getNegativeSpace
} from '../controllers/entity.controller.js';

export const entityRouter = Router();

// GET /api/v1/entities - List all entities with attention scores & risk tiers
entityRouter.get('/entities', asyncHandler(getEntities));

// GET /api/v1/entities/:id/summary - Detailed entity operational profile
entityRouter.get('/entities/:id/summary', validateParamExists('id'), asyncHandler(getEntitySummary));

// GET /api/v1/kpis-vs-evidence - Headline Reported SLAs vs Underlying Evidence Quality
entityRouter.get('/kpis-vs-evidence', asyncHandler(getKpisVsEvidence));

// GET /api/v1/negative-space - Negative space coverage & silent assets
entityRouter.get('/negative-space', asyncHandler(getNegativeSpace));

export default entityRouter;
