import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateParamExists } from '../middlewares/validation.middleware.js';
import {
  getTrends,
  getEntityTrends
} from '../controllers/trend.controller.js';

export const trendRouter = Router();

// GET /api/v1/trends - Multi-Quarter longitudinal resilience trajectories (Requirement 16)
trendRouter.get('/trends', asyncHandler(getTrends));

// GET /api/v1/entities/:id/trends - Specific entity quarter-by-quarter history
trendRouter.get('/entities/:id/trends', validateParamExists('id'), asyncHandler(getEntityTrends));

export default trendRouter;
