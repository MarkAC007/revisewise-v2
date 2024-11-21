import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root API endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ReviseWise API v1',
    endpoints: {
      health: 'GET /health',
      query: 'POST /api/v1/query'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found'
  });
});

export default app; 