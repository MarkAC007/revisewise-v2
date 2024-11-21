import express from 'express';
import { queryController } from '../controllers/query.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

router.post('/',
  authMiddleware,
  rateLimitMiddleware,
  queryController.processQuery
);

router.get('/usage',
  authMiddleware,
  queryController.getUserUsage
);

export const queryRoutes = router; 