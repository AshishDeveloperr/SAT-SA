import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  triggerRun,
  regenerateSynth,
  getValidationMetrics
} from '../controllers/analytics.controller.js';

export const analyticsRouter = Router();

// POST /api/v1/runs - Trigger full supervisory analytics pipeline
analyticsRouter.post('/runs', asyncHandler(triggerRun));

// POST /api/v1/synth/generate - Regenerate synthetic scenarios and re-analyze
analyticsRouter.post('/synth/generate', asyncHandler(regenerateSynth));

// GET /api/v1/validation/metrics - Validation Lab metrics & lift over random baseline
analyticsRouter.get('/validation/metrics', asyncHandler(getValidationMetrics));

export default analyticsRouter;
