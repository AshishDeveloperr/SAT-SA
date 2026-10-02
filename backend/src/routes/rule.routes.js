import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateParamExists } from '../middlewares/validation.middleware.js';
import {
  getRules,
  updateRule
} from '../controllers/rule.controller.js';

export const ruleRouter = Router();

// GET /api/v1/rules - 100% DB-backed dynamic rules studio
ruleRouter.get('/rules', asyncHandler(getRules));

// PATCH /api/v1/rules/:id - Update rule thresholds & record version
ruleRouter.patch('/rules/:id', validateParamExists('id'), asyncHandler(updateRule));

export default ruleRouter;
