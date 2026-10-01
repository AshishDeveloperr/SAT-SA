import dotenv from 'dotenv';
import { createApp, initializeDatabase } from './src/app.js';

// Load environment variables if available
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    console.log('[SAT-SA Boot] Initializing Database & Analytics Registry...');
    await initializeDatabase();

    const app = createApp();

    const server = app.listen(PORT, HOST, () => {
      console.log(`
========================================================================
  SAT-SA: Supervisory Analytics Tool for SOC Assessment (NCIIPC)
========================================================================
  * Operational Mode: Supervisory Analytics (Air-Gapped Enclave)
  * Server URL:       http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}
  * Health Endpoint:  http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/api/v1/health
  * Entities API:     http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/api/v1/entities
  * KPIs vs Evidence: http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/api/v1/kpis-vs-evidence
  * Review Queue:     http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/api/v1/review-samples
  * Validation Lab:   http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/api/v1/validation/metrics
  * Audit Trail:      http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/api/v1/audit-log
  * Node Runtime:     ${process.version}
  * Air-Gapped Mode:  ACTIVE (Zero remote dependencies)
========================================================================
  System ready. Ingestion, detection, and supervisory scoring operational.
`);
    });

    const handleShutdown = (signal) => {
      console.log(`\n[SAT-SA] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[SAT-SA] HTTP server closed. Process terminating.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err) {
    console.error('[SAT-SA Boot Error] Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
