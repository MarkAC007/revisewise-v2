# ReviseWise Server Documentation

## Overview
The ReviseWise server is a Node.js/Express application that provides AI-powered educational assistance through OpenAI's GPT models. It includes authentication via Firebase, rate limiting, and usage tracking.

## Server Environments

### Production
- Base URL: `https://revisewise-api.azurewebsites.net`
- Hosted on Azure App Service
- Uses Azure Container Registry

### Development
- Base URL: `http://localhost:8080`
- Run via Docker
- Local development setup:
```bash
# Build and run locally
docker build -t revisewise-api .
docker run -p 8080:8080 --name revisewise-api-container revisewise-api
```

## Core Components

### 1. Authentication
- Uses Firebase Authentication
- Requires Bearer token in requests
- Verification endpoint: `POST /auth/verify`

```javascript
// Production
const AUTH_URL = 'https://revisewise-api.azurewebsites.net/auth/verify';
// Development
const AUTH_URL = 'http://localhost:8080/auth/verify';

const response = await fetch(AUTH_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'firebase-id-token'
  })
});
```

### 2. Query Processing
- Main endpoint: `POST /api/v1/query`
- Requires authentication
- Rate limited to 50 requests per hour
- Returns AI-generated educational assistance

```javascript
// Production
const QUERY_URL = 'https://revisewise-api.azurewebsites.net/api/v1/query';
// Development
const QUERY_URL = 'http://localhost:8080/api/v1/query';

const response = await fetch(QUERY_URL, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <firebase-token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Your educational question here'
  })
});
```

### 3. Usage Tracking
- Endpoint: `GET /api/v1/query/usage`
- Tracks daily and total query usage
- Stores recent query history
- Enforces daily limits

## Chrome Extension Integration Guide

### 1. Initial Setup

1. Configure extension manifest:
```json
{
  "permissions": [
    "https://revisewise-api.azurewebsites.net/*",
    "identity"
  ],
  "host_permissions": [
    "https://revisewise-api.azurewebsites.net/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self' https://revisewise-api.azurewebsites.net http://localhost:8080"
  }
}
```

### 2. API Client Configuration

```javascript
// api-config.js
export const API_CONFIG = {
  PRODUCTION: {
    BASE_URL: 'https://revisewise-api.azurewebsites.net',
    ENDPOINTS: {
      QUERY: '/api/v1/query',
      USAGE: '/api/v1/query/usage',
      AUTH: '/auth/verify'
    }
  },
  DEVELOPMENT: {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
      QUERY: '/api/v1/query',
      USAGE: '/api/v1/query/usage',
      AUTH: '/auth/verify'
    }
  }
};

export const getApiUrl = (endpoint) => {
  const config = process.env.NODE_ENV === 'production' 
    ? API_CONFIG.PRODUCTION 
    : API_CONFIG.DEVELOPMENT;
  return `${config.BASE_URL}${config.ENDPOINTS[endpoint]}`;
};
```

### 3. Authentication Flow

1. Implement Firebase Authentication
2. Store the Firebase token securely
3. Include token in all API requests

```javascript
// Example authentication implementation
async function authenticateUser() {
  const auth = firebase.auth();
  const user = await auth.signInWithPopup(provider);
  const token = await user.getIdToken();
  return token;
}
```

### 4. Making Queries

1. Ensure authenticated state
2. Send query to server
3. Handle response and rate limits

```javascript
async function makeQuery(question) {
  const token = await getStoredToken();
  
  const response = await fetch('https://your-server-domain.com/api/v1/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: question })
  });

  const data = await response.json();
  return data.answer;
}
```

### 5. Usage Monitoring

1. Track remaining queries
2. Show usage statistics to users
3. Handle rate limit errors

```javascript
async function checkUsage() {
  const token = await getStoredToken();
  
  const response = await fetch('https://your-server-domain.com/api/v1/query/usage', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
}
```

## API Response Formats

### Query Response
```json
{
  "answer": "AI-generated response",
  "metadata": {
    "tokens": 123,
    "model": "gpt-4o-mini",
    "timestamp": "2024-03-14T12:00:00Z",
    "usage": {
      "queries_today": 5,
      "remaining_today": 45,
      "total_queries": 100
    }
  }
}
```

### Usage Response
```json
{
  "queries_today": 5,
  "total_queries": 100,
  "remaining_today": 45,
  "queries": [
    {
      "text": "Question excerpt...",
      "tokens": 123,
      "timestamp": "2024-03-14T12:00:00Z"
    }
  ]
}
```

## Error Handling

### Common Error Responses

1. Authentication Error (401):
```json
{
  "error": "Authentication failed",
  "message": "Invalid token"
}
```

2. Rate Limit Error (429):
```json
{
  "error": "Rate limit exceeded",
  "message": "Daily query limit reached. Please try again tomorrow.",
  "usage": {
    "queries_today": 50,
    "remaining_today": 0
  }
}
```

3. Server Error (500):
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Best Practices

1. **Token Management**
   - Store Firebase token securely
   - Implement token refresh logic
   - Handle token expiration gracefully

2. **Error Handling**
   - Implement retry logic for failed requests
   - Show user-friendly error messages
   - Handle network errors appropriately

3. **Rate Limiting**
   - Track remaining queries locally
   - Show usage warnings to users
   - Disable query functionality when limit reached

4. **User Experience**
   - Show loading states during queries
   - Cache responses when appropriate
   - Provide clear feedback on query status

## Security Considerations

1. Always use HTTPS for API requests
2. Never store sensitive data in extension storage
3. Implement proper CSP in manifest
4. Validate all user input before sending to server
5. Handle sensitive data securely in transit 

## Environment-Specific Testing

### Production Testing
```javascript
// Health check
curl https://revisewise-api.azurewebsites.net/health

// API root
curl https://revisewise-api.azurewebsites.net/api/v1
```

### Development Testing
```javascript
// Health check
curl http://localhost:8080/health

// API root
curl http://localhost:8080/api/v1
```

## Deployment Verification

1. Check server status:
```bash
# Production
curl https://revisewise-api.azurewebsites.net/health

# Development
curl http://localhost:8080/health
```

2. Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-14T12:00:00Z",
  "uptime": 123.45
}
``` 