import { logger } from './lib/logger';

// Create and inject the ReviseWise button
function createReviseWiseButton() {
  const button = document.createElement('button');
  button.id = 'revisewise-button';
  button.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="ReviseWise" />
    Ask ReviseWise
  `;
  button.style.display = 'none';
  document.body.appendChild(button);
  return button;
}

// Position the button near selected text
function positionButton(button: HTMLButtonElement, event: MouseEvent) {
  try {
    const selection = window.getSelection();
    if (!selection?.toString().trim()) {
      button.style.display = 'none';
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    button.style.position = 'fixed';
    button.style.top = `${rect.bottom + window.scrollY + 10}px`;
    button.style.left = `${rect.left + window.scrollX}px`;
    button.style.display = 'flex';
  } catch (error) {
    logger.error('Error positioning button', {
      selection: window.getSelection()?.toString(),
      event: { x: event.x, y: event.y }
    }, error);
  }
}

// Handle button click
async function handleButtonClick(button: HTMLButtonElement) {
  try {
    const selectedText = window.getSelection()?.toString().trim();
    if (!selectedText) return;

    await logger.info('Text selected for analysis', {
      textLength: selectedText.length
    });

    // Send message to background script
    chrome.runtime.sendMessage({
      type: 'ASK_REVISEWISE',
      text: selectedText
    });

    // Hide button after click
    button.style.display = 'none';
  } catch (error) {
    await logger.error('Error handling button click', {
      selection: window.getSelection()?.toString()
    }, error);
  }
}

// Initialize text selection feature
async function initTextSelection() {
  try {
    const button = createReviseWiseButton();
    await logger.info('Text selection feature initialized');

    document.addEventListener('mouseup', (e) => {
      setTimeout(() => positionButton(button, e), 10);
    });

    document.addEventListener('scroll', () => {
      button.style.display = 'none';
    });

    button.addEventListener('click', () => handleButtonClick(button));
  } catch (error) {
    await logger.error('Error initializing text selection', {}, error);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    if (message.type === 'ENABLE_TEXT_SELECTION') {
      await initTextSelection();
      await logger.info('Text selection enabled via message', {
        userRole: message.userRole
      });
      sendResponse({ success: true });
    }
  } catch (error) {
    await logger.error('Error handling message', { messageType: message.type }, error);
    sendResponse({ success: false, error: (error as Error).message });
  }
});