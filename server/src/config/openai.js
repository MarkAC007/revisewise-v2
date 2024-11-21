import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

// Hard-coded key for testing - REMOVE IN PRODUCTION
const OPENAI_API_KEY = '';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

logger.info('OpenAI client initialized');

export { openai }; 