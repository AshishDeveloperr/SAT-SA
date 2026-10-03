import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateRequiredBody } from '../middlewares/validation.middleware.js';
import {
  ingestPayload,
  loadSampleSuite,
  getIngestSummary
} from '../controllers/ingestion.controller.js';

export const ingestionRouter = Router();

// POST /api/v1/ingest/payload - Universal multi-format telemetry ingestion
ingestionRouter.post(
  '/ingest/payload',
  (req, res, next) => {
    if (!req.body?.payload && (!Array.isArray(req.body?.files) || req.body.files.length === 0)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Either payload string or files array is required'
        }
      });
    }
    next();
  },
  asyncHandler(ingestPayload)
);

// POST /api/v1/ingest/load-sample - Load sample inspector suite from server disk
ingestionRouter.post(
  '/ingest/load-sample',
  asyncHandler(loadSampleSuite)
);

// GET /api/v1/ingest/summary - Overall ingestion metrics and batch audit records
ingestionRouter.get(
  '/ingest/summary',
  asyncHandler(getIngestSummary)
);

export default ingestionRouter;
