class ApiClient {
  constructor() {
    this.baseUrl = 'https://revisewise-api.azurewebsites.net/api/v1';
  }

  async explain(text, user) {
    try {
      const token = user.token || user.getIdToken;

      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('Using token:', token);

      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text,
          userId: user.uid
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();