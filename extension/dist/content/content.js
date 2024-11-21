/******/ (() => { // webpackBootstrap
/*!********************************!*\
  !*** ./src/content/content.js ***!
  \********************************/
// Basic content script
console.log('ReviseWise: Content script loaded');

// Create and inject styles
const style = document.createElement('style');
style.textContent = `
  .revisewise-container {
    position: fixed;
    right: 20px;
    top: 20px;
    width: 350px;
    background: white;
    box-shadow: 0 4px 15px rgba(91, 79, 219, 0.1);
    border-radius: 12px;
    border: 1px solid #5B4FDB;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s, transform 0.3s;
  }

  .revisewise-container.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .revisewise-header {
    padding: 12px 16px;
    background: #5B4FDB;
    color: white;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .revisewise-title {
    font-size: 14px;
    font-weight: 500;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .revisewise-close {
    padding: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    border-radius: 4px;
  }

  .revisewise-close:hover {
    background: #f3f4f6;
  }

  .revisewise-content {
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
  }

  .revisewise-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #6b7280;
  }

  .revisewise-error {
    padding: 12px;
    background: #fef2f2;
    color: #dc2626;
    border-radius: 4px;
    margin: 8px;
    font-size: 13px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .revisewise-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
  }

  .revisewise-metadata {
    margin-top: 16px;
    padding: 12px;
    background: #f8f7ff;
    border-radius: 8px;
    font-size: 12px;
  }

  .metadata-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .metadata-item .label {
    color: #9ca3af;
  }

  .metadata-item .value {
    font-weight: 500;
    color: #4b5563;
  }
`;
document.head.appendChild(style);
class ReviseWiseUI {
  constructor() {
    this.container = null;
    this.createContainer();
  }
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'revisewise-container';
    this.container.innerHTML = `
      <div class="revisewise-header">
        <h3 class="revisewise-title">ReviseWise Explanation</h3>
        <button class="revisewise-close">×</button>
      </div>
      <div class="revisewise-content"></div>
    `;
    document.body.appendChild(this.container);

    // Add event listeners
    this.container.querySelector('.revisewise-close').addEventListener('click', () => {
      this.hide();
    });
  }
  show() {
    this.container.classList.add('visible');
  }
  hide() {
    this.container.classList.remove('visible');
  }
  setContent(content) {
    const contentEl = this.container.querySelector('.revisewise-content');
    contentEl.innerHTML = content;
    this.show();
  }
  showLoading() {
    this.setContent(`
      <div class="revisewise-loading">
        <div class="revisewise-spinner"></div>
        <span>Getting your explanation...</span>
      </div>
    `);
    this.show();
  }
  showError(message) {
    this.setContent(`
      <div class="revisewise-error">
        ${message}
      </div>
    `);
    this.show();
  }
}

// Initialize UI
let ui = null;
function initializeUI() {
  if (!ui) {
    ui = new ReviseWiseUI();
    console.log('ReviseWise UI initialized');
  }
  return ui;
}

// Initialize when the content script loads
initializeUI();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const uiInstance = initializeUI();
  try {
    switch (message.type) {
      case 'PING':
        sendResponse({
          status: 'ok'
        });
        break;
      case 'SHOW_LOADING':
        uiInstance.showLoading();
        break;
      case 'SHOW_EXPLANATION':
        uiInstance.setContent(message.payload);
        break;
      case 'SHOW_ERROR':
        uiInstance.showError(message.payload);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
    sendResponse({
      received: true
    });
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({
      error: error.message
    });
  }

  // Return true to indicate we'll send a response asynchronously
  return true;
});

// This will be expanded later to handle text selection and interactions
/******/ })()
;
//# sourceMappingURL=content.js.map