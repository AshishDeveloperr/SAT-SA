import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getAuditLog } from '../controllers/audit.controller.js';

export const auditRouter = Router();

// GET /api/v1/audit-log - Cryptographic audit ledger with sequential SHA-256 verification
auditRouter.get('/audit-log', asyncHandler(getAuditLog));

export default auditRouter;
