import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateRequiredBody } from '../middlewares/validation.middleware.js';
import { ingestPayload } from '../controllers/ingestion.controller.js';

export const ingestionRouter = Router();

// POST /api/v1/ingest/payload - Universal multi-format telemetry ingestion
ingestionRouter.post(
  '/ingest/payload',
  validateRequiredBody(['payload']),
  asyncHandler(ingestPayload)
);

export default ingestionRouter;
