import { auth } from './firebase';
import { logger } from './logger';

const API_BASE_URL = 'https://revisewise-api.azurewebsites.net';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.getIdToken();
  }

  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return { success: true, data };
    } catch (error) {
      await logger.error('API request failed', {
        endpoint,
        method: options.method || 'GET'
      }, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async processQuery(text: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/query', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  async getQueryHistory(): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/queries/history');
  }
}

export const api = ApiClient.getInstance();