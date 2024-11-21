import { logger } from './lib/logger';

// Handle installation and updates
chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    if (details.reason === 'install') {
      await logger.info('Extension installed', {
        version: chrome.runtime.getManifest().version
      });
      
      // First time installation
      chrome.storage.local.set({ 
        installDate: new Date().toISOString(),
        settings: {
          notifications: true,
          theme: 'light'
        }
      });
    } else if (details.reason === 'update') {
      await logger.info('Extension updated', {
        previousVersion: details.previousVersion,
        currentVersion: chrome.runtime.getManifest().version
      });
    }
  } catch (error) {
    await logger.error('Error during installation/update', {
      reason: details.reason,
      version: chrome.runtime.getManifest().version
    }, error);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_SESSION') {
    // Handle starting a new study session
    handleStartSession(sendResponse);
    return true; // Keep the message channel open for async response
  }
});

async function handleStartSession(sendResponse: (response: any) => void) {
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      throw new Error('No active tab found');
    }
    
    await logger.info('Starting session', { tabId: tab.id, url: tab.url });
    
    // Check if we're already on the ReviseWise web app
    if (tab.url?.includes('app.revisewise.co')) {
      // Send message to content script to start session
      await chrome.tabs.sendMessage(tab.id, { type: 'START_SESSION' });
      await logger.info('Session started on existing tab', { tabId: tab.id });
    } else {
      // Open ReviseWise web app in new tab
      const newTab = await chrome.tabs.create({ url: 'https://app.revisewise.co/dashboard' });
      await logger.info('New session tab created', { newTabId: newTab.id });
    }
    
    sendResponse({ success: true });
  } catch (error) {
    await logger.error('Error starting session', {
      url: chrome.runtime.getURL('dashboard.html')
    }, error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}