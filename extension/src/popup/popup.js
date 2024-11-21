import { authService } from '../services/firebase/firebase-auth';

class PopupUI {
  constructor() {
    // Get DOM elements
    this.loginSection = document.getElementById('login-section');
    this.userSection = document.getElementById('user-section');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.loginButton = document.getElementById('login-button');
    this.signupLink = document.getElementById('signup-link');
    this.logoutButton = document.getElementById('logout-button');
    this.userEmail = document.getElementById('user-email');
    this.userRole = document.getElementById('user-role');
    this.authError = document.getElementById('auth-error');
    this.queriesCount = document.getElementById('queries-count');
    this.queriesRemaining = document.getElementById('queries-remaining');
    this.historyToggle = document.getElementById('toggle-history');
    this.historyContent = document.getElementById('history-content');
    this.queryList = document.getElementById('query-list');
    this.usageAlert = document.getElementById('usage-alert');

    this.initializeUI();
  }

  initializeUI() {
    // Add event listeners
    this.loginButton?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSignIn();
    });

    this.signupLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSignUp();
    });

    this.logoutButton?.addEventListener('click', () => this.handleLogout());

    // Listen for auth state changes
    authService.onAuthStateChange((user) => {
      if (user) {
        this.updateUIForUser(user);
      } else {
        this.updateUIForGuest();
      }
    });

    // Add history toggle handler
    this.historyToggle?.addEventListener('click', () => {
      this.toggleHistory();
    });
  }

  async handleSignIn() {
    try {
      const email = this.emailInput.value;
      const password = this.passwordInput.value;
      const user = await authService.signIn(email, password);
      
      // Get a fresh token
      const token = await user.getIdToken(true); // Force refresh token
      
      // Store user data in chrome.storage
      await chrome.storage.local.set({
        user: {
          uid: user.uid,
          email: user.email,
          token: token,  // Store the actual token
          getIdToken: token // For compatibility with existing code
        }
      });
      
      this.clearError();
    } catch (error) {
      console.error('Sign in error:', error);
      this.showError(error.message);
    }
  }

  async handleSignUp() {
    try {
      const email = this.emailInput.value;
      const password = this.passwordInput.value;
      await authService.signUp(email, password);
      this.clearError();
    } catch (error) {
      this.showError(error.message);
    }
  }

  async handleLogout() {
    try {
      await authService.signOut();
      // Clear user data from storage
      await chrome.storage.local.remove('user');
    } catch (error) {
      console.error('Logout failed:', error);
      this.showError('Logout failed');
    }
  }

  async updateUIForUser(user) {
    try {
      this.loginSection.classList.add('hidden');
      this.userSection.classList.remove('hidden');
      this.userEmail.textContent = user.email;
      
      // Get a fresh token
      const token = await user.getIdToken(true);
      
      // Store user data
      await chrome.storage.local.set({
        user: {
          uid: user.uid,
          email: user.email,
          token: token,
          getIdToken: token
        }
      });

      // Fetch and display usage
      await this.updateUsageDisplay();
      
      this.clearForm();
    } catch (error) {
      console.error('Error updating UI:', error);
      this.showError('Error updating user interface');
    }
  }

  async updateUsageDisplay() {
    try {
      const { usage } = await chrome.storage.local.get('usage');
      
      if (usage) {
        this.queriesCount.textContent = usage.queries_today;
        this.queriesRemaining.textContent = usage.remaining_today;
        
        // Update usage alert
        this.updateUsageAlert(usage.remaining_today);
        
        // Update history
        if (usage.queries && usage.queries.length > 0) {
          this.updateQueryHistory(usage.queries);
        }
      } else {
        // If no usage in storage, fetch from API
        const response = await fetch('http://localhost:3000/api/v1/query/usage', {
          headers: {
            'Authorization': `Bearer ${(await chrome.storage.local.get('user')).user.token}`
          }
        });
        
        if (response.ok) {
          const usage = await response.json();
          this.queriesCount.textContent = usage.queries_today;
          this.queriesRemaining.textContent = usage.remaining_today;
          
          // Store for future use
          await chrome.storage.local.set({ usage });
        }
      }
    } catch (error) {
      console.error('Error updating usage display:', error);
      this.queriesCount.textContent = '?';
      this.queriesRemaining.textContent = '?';
    }
  }

  updateUIForGuest() {
    this.loginSection.classList.remove('hidden');
    this.userSection.classList.add('hidden');
  }

  showError(message) {
    this.authError.textContent = message;
    this.authError.classList.remove('hidden');
  }

  clearError() {
    this.authError.textContent = '';
    this.authError.classList.add('hidden');
  }

  clearForm() {
    if (this.emailInput) this.emailInput.value = '';
    if (this.passwordInput) this.passwordInput.value = '';
  }

  toggleHistory() {
    this.historyContent.classList.toggle('visible');
    const arrow = this.historyToggle.querySelector('.arrow-down');
    arrow.style.transform = this.historyContent.classList.contains('visible') 
      ? 'rotate(180deg)' 
      : 'rotate(0deg)';
  }

  updateUsageAlert(remaining) {
    if (remaining <= 10) {
      this.usageAlert.textContent = remaining <= 5
        ? `Only ${remaining} queries remaining today!`
        : 'Running low on queries today!';
      this.usageAlert.classList.remove('hidden');
      this.usageAlert.style.backgroundColor = remaining <= 5 ? '#fef2f2' : '#fff7ed';
      this.usageAlert.style.color = remaining <= 5 ? '#dc2626' : '#d97706';
    } else {
      this.usageAlert.classList.add('hidden');
    }
  }

  updateQueryHistory(queries) {
    this.queryList.innerHTML = queries.reverse().map(query => `
      <div class="query-item">
        <div class="query-text">${query.text}</div>
        <div class="query-meta">
          <span>${this.formatTimestamp(query.timestamp)}</span>
          <span>${query.tokens} tokens</span>
        </div>
      </div>
    `).join('');
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
});

// Listen for storage changes to update usage display
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.usage) {
    const popup = chrome.extension.getViews({ type: 'popup' })[0];
    if (popup) {
      const ui = popup.document.querySelector('#queries-count');
      if (ui) {
        ui.textContent = changes.usage.newValue.queries_today;
        popup.document.querySelector('#queries-remaining').textContent = 
          changes.usage.newValue.remaining_today;
      }
    }
  }
}); 