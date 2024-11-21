import { logger } from '../utils/logger.js';

// Simple in-memory store for rate limiting
const requestCounts = new Map();

export const rateLimitMiddleware = (req, res, next) => {
  const userId = req.user.uid;
  const now = Date.now();
  const userRequests = requestCounts.get(userId) || [];
  
  // Clean old requests (older than 1 hour)
  const recentRequests = userRequests.filter(time => now - time < 3600000);
  
  // Check if user has exceeded limit (50 requests per hour)
  if (recentRequests.length >= 50) {
    logger.warn(`Rate limit exceeded for user ${userId}`);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.'
    });
  }
  
  // Add current request
  recentRequests.push(now);
  requestCounts.set(userId, recentRequests);
  
  next();
}; 