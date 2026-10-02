import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateParamExists } from '../middlewares/validation.middleware.js';
import {
  getFindings,
  getFindingById
} from '../controllers/finding.controller.js';

export const findingRouter = Router();

// GET /api/v1/findings - Filterable findings explorer
findingRouter.get('/findings', asyncHandler(getFindings));

// GET /api/v1/findings/:id - Finding detail with why flagged & forensic evidence records
findingRouter.get('/findings/:id', validateParamExists('id'), asyncHandler(getFindingById));

export default findingRouter;
