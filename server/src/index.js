import app from './app.js';
import { logger } from './utils/logger.js';

const port = process.env.PORT || 8080;

const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running at http://0.0.0.0:${port}`);
}).on('error', (error) => {
  logger.error('Server failed to start:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app; 