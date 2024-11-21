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
}

// Handle button click
function handleButtonClick(button: HTMLButtonElement) {
  const selectedText = window.getSelection()?.toString().trim();
  if (!selectedText) return;

  // Send message to background script
  chrome.runtime.sendMessage({
    type: 'ASK_REVISEWISE',
    text: selectedText
  });

  // Hide button after click
  button.style.display = 'none';
}

// Initialize text selection feature
function initTextSelection() {
  const button = createReviseWiseButton();

  document.addEventListener('mouseup', (e) => {
    setTimeout(() => positionButton(button, e), 10);
  });

  document.addEventListener('scroll', () => {
    button.style.display = 'none';
  });

  button.addEventListener('click', () => handleButtonClick(button));
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE_TEXT_SELECTION') {
    initTextSelection();
    sendResponse({ success: true });
  }
});