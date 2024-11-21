import { openai } from '../config/openai.js';
import { logger } from '../utils/logger.js';
import { firestoreService } from '../services/firebase/firestore-service.js';

const SYSTEM_PROMPT = `You are an educational AI tutor focused on helping students learn. Your role is to:
- Guide students towards understanding rather than providing direct answers
- Ask probing questions to help students think through problems
- Explain concepts and principles related to the question
- Provide examples similar to, but different from, the exact question
- If you recognize the question as a homework or test problem, explicitly avoid giving the answer
- Encourage critical thinking and problem-solving skills
- Break down complex problems into smaller, manageable steps
- Share relevant learning resources and study strategies

Never provide direct solutions to homework, tests, or assignments. Instead, help students develop the skills and understanding to solve problems themselves.`;

export const queryController = {
  async processQuery(req, res, next) {
    try {
      const { text } = req.body;
      const userId = req.user.uid;

      // Check usage limits
      const usage = await firestoreService.getUserUsage(userId);
      if (usage.remaining_today <= 0) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Daily query limit reached. Please try again tomorrow.',
          usage
        });
      }

      logger.info('Processing query', { userId, textLength: text.length });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      // Track the query
      await firestoreService.trackQuery(userId, {
        text,
        tokens: completion.usage.total_tokens
      });

      // Get updated usage
      const updatedUsage = await firestoreService.getUserUsage(userId);

      const response = {
        answer: completion.choices[0].message.content,
        metadata: {
          tokens: completion.usage.total_tokens,
          model: completion.model,
          timestamp: new Date().toISOString(),
          usage: updatedUsage
        }
      };

      logger.info('Query processed successfully', {
        userId,
        tokens: completion.usage.total_tokens,
        remainingQueries: updatedUsage.remaining_today
      });

      res.json(response);
    } catch (error) {
      logger.error('Query processing error:', error);
      next(error);
    }
  },

  async getUserUsage(req, res, next) {
    try {
      const userId = req.user.uid;
      const usage = await firestoreService.getUserUsage(userId);
      res.json(usage);
    } catch (error) {
      logger.error('Error getting user usage:', error);
      next(error);
    }
  }
}; 