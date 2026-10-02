import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateParamExists } from '../middlewares/validation.middleware.js';
import { issueSanction } from '../controllers/sanction.controller.js';

export const sanctionRouter = Router();

// POST /api/v1/entities/:id/sanction - Issue statutory supervisory directive / sanction
sanctionRouter.post('/entities/:id/sanction', validateParamExists('id'), asyncHandler(issueSanction));

export default sanctionRouter;
