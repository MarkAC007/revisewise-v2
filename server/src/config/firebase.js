import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Read the service account file
  const serviceAccountPath = join(__dirname, '..', '..', 'firebase-service-account.json');
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf8')
  );

  logger.info('Firebase Config:', {
    hasServiceAccount: !!serviceAccount,
    projectId: serviceAccount.project_id
  });

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  logger.info('Firebase Admin initialized successfully');
} catch (error) {
  logger.error('Firebase Admin initialization error:', {
    message: error.message,
    stack: error.stack
  });
  throw error;
}

export { admin }; 