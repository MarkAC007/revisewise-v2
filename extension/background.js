// Handle installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First time installation
    chrome.storage.local.set({ 
      installDate: new Date().toISOString(),
      settings: {
        notifications: true,
        theme: 'light'
      }
    });
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

async function handleStartSession(sendResponse) {
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're already on the ReviseWise web app
    if (tab.url.includes('revisewise.web.app')) {
      // Send message to content script to start session
      await chrome.tabs.sendMessage(tab.id, { type: 'START_SESSION' });
    } else {
      // Open ReviseWise web app in new tab
      await chrome.tabs.create({ url: 'https://revisewise.web.app/dashboard' });
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error starting session:', error);
    sendResponse({ success: false, error: error.message });
  }
}