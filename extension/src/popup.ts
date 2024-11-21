import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { logger } from './lib/logger';

// DOM Elements
const loginView = document.getElementById('loginView') as HTMLDivElement;
const profileView = document.getElementById('profileView') as HTMLDivElement;
const loginForm = document.getElementById('loginForm') as HTMLFormElement;
const logoutButton = document.getElementById('logoutButton') as HTMLButtonElement;
const startSession = document.getElementById('startSession') as HTMLButtonElement;
const userName = document.getElementById('userName') as HTMLHeadingElement;
const userEmail = document.getElementById('userEmail') as HTMLParagraphElement;
const userRole = document.getElementById('userRole') as HTMLSpanElement;
const userAvatar = document.getElementById('userAvatar') as HTMLImageElement;
const studyTime = document.getElementById('studyTime') as HTMLSpanElement;
const sessionCount = document.getElementById('sessionCount') as HTMLSpanElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', handleSignOut);
startSession.addEventListener('click', handleStartSession);

// Check authentication state on popup open
onAuthStateChanged(auth, handleAuthStateChanged);

// Sync local logs when online
window.addEventListener('online', () => {
  logger.syncLocalLogs();
});

async function handleLogin(e: Event) {
  e.preventDefault();
  
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    hideError();
    await logger.info('Login attempt', { email });
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await loadUserProfile(userCredential.user);
    await logger.info('Login successful', { userId: userCredential.user.uid });
    showProfileView();
  } catch (error: any) {
    console.error('Authentication error:', error);
    await logger.error('Login failed', { email }, error);
    showError(getErrorMessage(error.code));
  }
}

async function handleSignOut() {
  try {
    const userId = auth.currentUser?.uid;
    await logger.info('Logout attempt', { userId });
    await signOut(auth);
    await logger.info('Logout successful', { userId });
    showLoginView();
  } catch (error) {
    console.error('Sign out error:', error);
    await logger.error('Logout failed', { userId: auth.currentUser?.uid }, error);
    showError('Failed to sign out. Please try again.');
  }
}

async function handleAuthStateChanged(user: any) {
  try {
    if (user) {
      await loadUserProfile(user);
      showProfileView();
      await logger.info('Auth state changed - user logged in', { userId: user.uid });
    } else {
      showLoginView();
      await logger.info('Auth state changed - user logged out');
    }
  } catch (error) {
    await logger.error('Error handling auth state change', {}, error);
  }
}

async function loadUserProfile(user: any) {
  try {
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    // Update UI
    userName.textContent = userData?.name || 'Student';
    userEmail.textContent = user.email;
    userRole.textContent = userData?.role || 'Student';
    userAvatar.src = userData?.photoURL || 'icons/default-avatar.png';

    if (userData?.stats) {
      studyTime.textContent = formatStudyTime(userData.stats.totalStudyTime || 0);
      sessionCount.textContent = userData.stats.sessionsCompleted || 0;
    }

    await logger.info('User profile loaded', { userId: user.uid });

    // Enable text selection feature
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      try {
        if (!tabs[0].id) throw new Error('No active tab found');
        
        await chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'ENABLE_TEXT_SELECTION',
          userRole: userData?.role
        });
        
        await logger.info('Text selection enabled', { 
          userId: user.uid,
          tabId: tabs[0].id
        });
      } catch (error) {
        await logger.error('Failed to enable text selection', {
          userId: user.uid,
          tabId: tabs[0].id
        }, error);
      }
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    await logger.error('Failed to load user profile', { userId: user.uid }, error);
    showError('Failed to load profile data.');
  }
}

function handleStartSession() {
  chrome.tabs.create({ url: 'https://app.revisewise.co/dashboard' });
}

function showLoginView() {
  loginView.classList.remove('hidden');
  profileView.classList.add('hidden');
  loginForm.reset();
}

function showProfileView() {
  loginView.classList.add('hidden');
  profileView.classList.remove('hidden');
}

function formatStudyTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function showError(message: string) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
}