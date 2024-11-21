import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCLzrL67qaYtz0Bg6h25k6K-fHrLN3X6No",
  authDomain: "app.revisewise.xyz",
  projectId: "revisewise",
  storageBucket: "revisewise.firebasestorage.app",
  messagingSenderId: "819105471747",
  appId: "1:819105471747:web:4fba3b988c6d0d9863dd36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginView = document.getElementById('loginView');
const profileView = document.getElementById('profileView');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');
const startSession = document.getElementById('startSession');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userRole = document.getElementById('userRole');
const userAvatar = document.getElementById('userAvatar');
const studyTime = document.getElementById('studyTime');
const sessionCount = document.getElementById('sessionCount');
const errorMessage = document.getElementById('errorMessage');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', handleSignOut);
startSession.addEventListener('click', handleStartSession);

// Check authentication state on popup open
auth.onAuthStateChanged(handleAuthStateChanged);

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    hideError();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await loadUserProfile(userCredential.user);
    showProfileView();
  } catch (error) {
    console.error('Authentication error:', error);
    showError(getErrorMessage(error.code));
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
    showLoginView();
  } catch (error) {
    console.error('Sign out error:', error);
    showError('Failed to sign out. Please try again.');
  }
}

async function handleAuthStateChanged(user) {
  if (user) {
    await loadUserProfile(user);
    showProfileView();
  } else {
    showLoginView();
  }
}

async function loadUserProfile(user) {
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

    // Enable text selection feature
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        type: 'ENABLE_TEXT_SELECTION',
        userRole: userData?.role
      });
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    showError('Failed to load profile data.');
  }
}

function handleStartSession() {
  chrome.tabs.create({ url: 'https://app.revisewise.xyz/dashboard' });
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

function formatStudyTime(minutes) {
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

function getErrorMessage(errorCode) {
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