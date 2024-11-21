import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

// Hard-coded key for testing - REMOVE IN PRODUCTION
const OPENAI_API_KEY = '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';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

logger.info('OpenAI client initialized');

export { openai }; 