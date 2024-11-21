import { auth, db } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

class Logger {
  private static instance: Logger;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // ms

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    let retries = 0;
    
    while (retries < this.MAX_RETRIES) {
      try {
        await addDoc(collection(db, 'logs'), {
          ...entry,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          platform: 'extension'
        });
        return;
      } catch (error) {
        retries++;
        if (retries === this.MAX_RETRIES) {
          console.error('Failed to persist log after maximum retries:', error);
          // Fall back to local storage
          this.saveToLocalStorage(entry);
        }
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
      }
    }
  }

  private saveToLocalStorage(entry: LogEntry): void {
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      logs.push(entry);
      // Keep only last 100 logs to prevent storage overflow
      if (logs.length > 100) {
        logs.shift();
      }
      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log to localStorage:', error);
    }
  }

  private formatError(error: any): LogEntry['error'] {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    return {
      message: String(error)
    };
  }

  async log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: any
  ): Promise<void> {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      userId: auth.currentUser?.uid,
      context,
      ...(error && { error: this.formatError(error) })
    };

    // Always log to console
    console[level](message, context || '', error || '');

    // Persist to Firestore
    await this.persistLog(entry);
  }

  async info(message: string, context?: Record<string, any>): Promise<void> {
    await this.log('info', message, context);
  }

  async warn(message: string, context?: Record<string, any>, error?: any): Promise<void> {
    await this.log('warn', message, context, error);
  }

  async error(message: string, context?: Record<string, any>, error?: any): Promise<void> {
    await this.log('error', message, context, error);
  }

  // Utility method to sync local logs when online
  async syncLocalLogs(): Promise<void> {
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      if (logs.length === 0) return;

      for (const log of logs) {
        await this.persistLog(log);
      }
      
      localStorage.removeItem('error_logs');
    } catch (error) {
      console.error('Failed to sync local logs:', error);
    }
  }
}

export const logger = Logger.getInstance();