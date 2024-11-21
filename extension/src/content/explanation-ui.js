export class ExplanationUI {
  constructor() {
    this.container = null;
    this.createContainer();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'revisewise-explanation';
    this.container.innerHTML = `
      <div class="explanation-header">
        <h3>ReviseWise Explanation</h3>
        <button class="close-button">×</button>
      </div>
      <div class="explanation-content"></div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .revisewise-explanation {
        position: fixed;
        right: 20px;
        top: 20px;
        width: 300px;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-radius: 8px;
        z-index: 10000;
        display: none;
      }
      .explanation-header {
        padding: 12px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .explanation-content {
        padding: 12px;
        max-height: 400px;
        overflow-y: auto;
      }
      .close-button {
        border: none;
        background: none;
        font-size: 20px;
        cursor: pointer;
        padding: 4px 8px;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.container);

    // Add event listeners
    this.container.querySelector('.close-button').addEventListener('click', () => {
      this.hide();
    });
  }

  show(content) {
    this.container.querySelector('.explanation-content').innerHTML = content;
    this.container.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
  }

  showLoading() {
    this.show('<div class="loading">Getting explanation...</div>');
  }

  showError(message) {
    this.show(`<div class="error">${message}</div>`);
  }
} 