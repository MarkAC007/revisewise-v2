import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCLzrL67qaYtz0Bg6h25k6K-fHrLN3X6No",
  authDomain: "app.revisewise.co",
  projectId: "revisewise",
  storageBucket: "revisewise.firebasestorage.app",
  messagingSenderId: "819105471747",
  appId: "1:819105471747:web:4fba3b988c6d0d9863dd36"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);