import { admin } from '../config/firebase.js';
import { logger } from '../utils/logger.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
}; 

const securityMiddleware = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs for login attempts
  },
  headers: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block"
  }
};

function sanitizeInput(input) {
  return input.replace(/[<>]/g, ''); // Basic example, use a proper sanitization library
}

function logSecurityEvent(event, severity = 'info') {
  logger.log({
    level: severity,
    message: event,
    timestamp: new Date().toISOString(),
    // Don't log sensitive data
    metadata: {
      type: 'SECURITY_EVENT'
    }
  });
} 