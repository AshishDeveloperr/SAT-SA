import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateParamExists, validateRequiredBody } from '../middlewares/validation.middleware.js';
import {
  getReviewSamples,
  recordReviewDecision
} from '../controllers/review.controller.js';

export const reviewRouter = Router();

// GET /api/v1/review-samples - Prioritized review queue
reviewRouter.get('/review-samples', asyncHandler(getReviewSamples));

// POST /api/v1/review-samples/:id/decision - Record examiner decision with SHA-256 audit entry
reviewRouter.post(
  '/review-samples/:id/decision',
  validateParamExists('id'),
  validateRequiredBody(['decision']),
  asyncHandler(recordReviewDecision)
);

export default reviewRouter;
