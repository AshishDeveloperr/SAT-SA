import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import { apiRouter } from './routes/api.js';
import { initSchema } from './core/db/schema.js';
import { seedDefaults } from './core/db/seed.js';
import { generateSyntheticData } from './modules/synth/generator.js';
import { runSupervisoryAnalysis } from './modules/analytics/engine.js';
import { db } from './core/db/knex.js';

/**
 * Initializes the database and seeds initial demo data if needed.
 */
export async function initializeDatabase() {
  await initSchema();
  await seedDefaults();
  const alertCount = await db('alerts').count('id as count').first();
  if (!alertCount || parseInt(alertCount.count, 10) === 0) {
    console.log('[SAT-SA Boot] Seeding initial latent-maturity CSE datasets...');
    await generateSyntheticData();
    await runSupervisoryAnalysis('system_boot');
  }
}

/**
 * Creates and configures the Express application instance
 * for SAT-SA (Supervisory Analytics Tool for SOC Assessment).
 * 
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express();

  // 1. Basic security headers (Air-gapped safe CSP)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // 2. Cross-Origin Resource Sharing
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // 3. Body parsers & cookies
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // 4. Request tracing middleware
  app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  // 5. Canonical Health Endpoint
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'healthy',
      air_gapped: true,
      service: 'sat-sa-api',
      mode: 'supervisory_analytics',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  });

  // 6. Mount Supervisory API Router
  app.use('/api/v1', apiRouter);

  // 7. Root status check
  app.get('/', (req, res) => {
    res.json({
      name: 'SAT-SA API Gateway',
      description: 'Supervisory Analytics Tool for SOC Assessment (NCIIPC)',
      environment: 'air-gapped',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        health: '/api/v1/health',
        entities: '/api/v1/entities',
        kpisVsEvidence: '/api/v1/kpis-vs-evidence',
        negativeSpace: '/api/v1/negative-space',
        findings: '/api/v1/findings',
        reviewSamples: '/api/v1/review-samples',
        rules: '/api/v1/rules',
        validationMetrics: '/api/v1/validation/metrics',
        auditLog: '/api/v1/audit-log'
      }
    });
  });

  // 8. 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        requestId: req.requestId
      }
    });
  });

  // 9. Centralized Error Envelope Middleware
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

    console.error(`[${req.requestId}] Error:`, err);

    res.status(statusCode).json({
      error: {
        code: errorCode,
        message: err.message || 'An unexpected supervisory analytics error occurred',
        details: err.details || null,
        requestId: req.requestId
      }
    });
  });

  return app;
}

export default createApp;
