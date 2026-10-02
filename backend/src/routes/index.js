import { Router } from 'express';
import { entityRouter } from './entity.routes.js';
import { findingRouter } from './finding.routes.js';
import { reviewRouter } from './review.routes.js';
import { ruleRouter } from './rule.routes.js';
import { analyticsRouter } from './analytics.routes.js';
import { auditRouter } from './audit.routes.js';
import { ingestionRouter } from './ingestion.routes.js';
import { trendRouter } from './trend.routes.js';
import { sanctionRouter } from './sanction.routes.js';

export const apiRouter = Router();

// Mount modular feature routers
apiRouter.use(entityRouter);
apiRouter.use(findingRouter);
apiRouter.use(reviewRouter);
apiRouter.use(ruleRouter);
apiRouter.use(analyticsRouter);
apiRouter.use(auditRouter);
apiRouter.use(ingestionRouter);
apiRouter.use(trendRouter);
apiRouter.use(sanctionRouter);

export default apiRouter;
