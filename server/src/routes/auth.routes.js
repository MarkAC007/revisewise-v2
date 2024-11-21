import express from 'express';
import { admin } from '../config/firebase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Verify Firebase ID token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    logger.info('Token verified successfully', { uid: decodedToken.uid });

    res.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      verified: true
    });
  } catch (error) {
    logger.error('Token verification failed:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: error.message
    });
  }
});

export const authRoutes = router; 