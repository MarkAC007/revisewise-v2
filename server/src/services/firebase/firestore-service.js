import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../utils/logger.js';

const db = getFirestore();

class FirestoreService {
  async trackQuery(userId, queryData) {
    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      const timestamp = Timestamp.now();
      const queryInfo = {
        text: queryData.text.substring(0, 100), // Store first 100 chars
        tokens: queryData.tokens,
        timestamp: timestamp,
      };

      if (!userDoc.exists) {
        // Create new user document
        await userRef.set({
          queries_today: 1,
          total_queries: 1,
          last_query: timestamp,
          daily_reset: timestamp,
          queries: [queryInfo]
        });
      } else {
        const userData = userDoc.data();
        const today = new Date();
        const lastQueryDate = userData.daily_reset instanceof Timestamp 
          ? userData.daily_reset.toDate() 
          : new Date(userData.daily_reset);

        // Check if we need to reset daily count
        if (!this.isSameDay(lastQueryDate, today)) {
          // New day, reset counter
          await userRef.update({
            queries_today: 1,
            last_query: timestamp,
            daily_reset: timestamp,
            queries: [queryInfo]
          });
        } else {
          // Same day, increment counter
          await userRef.update({
            queries_today: (userData.queries_today || 0) + 1,
            total_queries: (userData.total_queries || 0) + 1,
            last_query: timestamp,
            queries: [...(userData.queries || []).slice(-9), queryInfo] // Keep last 10 queries
          });
        }
      }

      logger.info('Query tracked successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Error tracking query:', error);
      throw error;
    }
  }

  async getUserUsage(userId) {
    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();

      if (!doc.exists) {
        return {
          queries_today: 0,
          total_queries: 0,
          remaining_today: 50, // Default daily limit
          queries: []
        };
      }

      const userData = doc.data();
      const today = new Date();
      const lastQueryDate = userData.daily_reset instanceof Timestamp 
        ? userData.daily_reset.toDate() 
        : new Date(userData.daily_reset);

      // Check if we need to reset daily count
      if (!this.isSameDay(lastQueryDate, today)) {
        return {
          queries_today: 0,
          total_queries: userData.total_queries || 0,
          remaining_today: 50,
          queries: userData.queries || []
        };
      }

      return {
        queries_today: userData.queries_today || 0,
        total_queries: userData.total_queries || 0,
        remaining_today: Math.max(0, 50 - (userData.queries_today || 0)),
        queries: userData.queries || []
      };
    } catch (error) {
      logger.error('Error getting user usage:', error);
      throw error;
    }
  }

  isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}

export const firestoreService = new FirestoreService(); 