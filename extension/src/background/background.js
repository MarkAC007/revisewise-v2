// Basic background script
console.log('ReviseWise: Background service worker initialized');

import { apiClient } from '../services/api/api-client.js';

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'explain-text',
    title: 'Explain with ReviseWise',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'explain-text' && tab?.id) {
    try {
      // Check if the URL is valid for content script injection
      if (!isValidUrl(tab.url)) {
        console.warn('Cannot inject content script into this page:', tab.url);
        return;
      }

      // Ensure content script is loaded
      await ensureContentScriptLoaded(tab.id);
      await handleExplainRequest(info.selectionText, tab.id);
    } catch (error) {
      console.error('Error handling context menu click:', error);
    }
  }
});

// Function to check if URL is valid for content script injection
function isValidUrl(url) {
  return url && 
         !url.startsWith('chrome://') && 
         !url.startsWith('chrome-extension://') &&
         !url.startsWith('edge://') &&
         !url.startsWith('about:') &&
         !url.startsWith('chrome-error://');
}

// Function to ensure content script is loaded
async function ensureContentScriptLoaded(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
  } catch (error) {
    // Only inject if it's not already loaded
    if (error.message.includes('Could not establish connection')) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/content.js']
      });
    } else {
      throw error; // Re-throw other errors
    }
  }
}

async function handleExplainRequest(text, tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_LOADING'
    });

    const user = await getCurrentUser();
    console.log('Current user:', user);

    if (!user) {
      await chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_ERROR',
        payload: 'Please sign in to use ReviseWise'
      });
      return;
    }

    if (!user.token && !user.getIdToken) {
      await chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_ERROR',
        payload: 'Authentication token not found. Please sign in again.'
      });
      return;
    }

    const response = await apiClient.explain(text, user);

    // Format the response with usage info
    const formattedResponse = `
      <div style="white-space: pre-wrap;">${response.answer}</div>
      <div class="revisewise-metadata">
        <div class="metadata-item">
          <span class="label">Tokens used:</span>
          <span class="value">${response.metadata.tokens}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Queries today:</span>
          <span class="value">${response.metadata.usage.queries_today}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Remaining:</span>
          <span class="value">${response.metadata.usage.remaining_today}</span>
        </div>
      </div>
    `;

    await chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_EXPLANATION',
      payload: formattedResponse
    });

    // Update popup with latest usage
    updatePopupUsage(response.metadata.usage);

  } catch (error) {
    console.error('Error handling explain request:', error);
    if (tabId) {
      await chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_ERROR',
        payload: error.message || 'Failed to get explanation'
      });
    }
  }
}

// Helper function to update popup usage display
async function updatePopupUsage(usage) {
  try {
    await chrome.storage.local.set({ usage });
    
    // Show notification if running low on queries
    if (usage.remaining_today <= 5) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'ReviseWise Usage Alert',
        message: `Only ${usage.remaining_today} queries remaining today!`,
        priority: 2
      });
    }
  } catch (error) {
    console.error('Error updating usage:', error);
  }
}

// Helper function to get current user with more detailed logging
async function getCurrentUser() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['user'], (result) => {
      console.log('Storage result:', result); // Debug log
      resolve(result.user || null);
    });
  });
}

// This will be expanded later for context menu and message handling 