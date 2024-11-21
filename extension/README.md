# ReviseWise Chrome Extension

A Chrome extension for ReviseWise that provides quick access to study tools and session tracking.

## Features

- Google OAuth authentication
- User profile display
- Study session tracking
- Quick access to ReviseWise web app

## Development

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## Security

- Uses Manifest V3 for enhanced security
- Implements strict CSP
- Secure authentication flow with Google OAuth
- Minimal permission requirements

## Build Process

The extension uses Vite for building and bundling. The build process:
1. Bundles JavaScript modules
2. Copies static assets
3. Generates production-ready files in `dist`