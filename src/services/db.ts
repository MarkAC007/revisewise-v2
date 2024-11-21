import { 
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const createUserProfile = async (userId: string, data: DocumentData) => {
  const batch = writeBatch(db);

  try {
    // Create user profile document
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        notifications: true,
        theme: 'light'
      },
      stats: {
        totalStudyTime: 0,
        sessionsCompleted: 0,
        lastActive: serverTimestamp()
      }
    });

    // Create welcome session
    const welcomeSessionRef = doc(collection(db, 'users', userId, 'sessions'), 'welcome');
    batch.set(welcomeSessionRef, {
      type: 'welcome',
      title: 'Welcome to ReviseWise',
      duration: 0,
      createdAt: serverTimestamp()
    });

    // Create initial goal
    const initialGoalRef = doc(collection(db, 'users', userId, 'goals'), 'initial');
    batch.set(initialGoalRef, {
      title: 'Start Your Learning Journey',
      description: 'Complete your first study session',
      status: 'active',
      createdAt: serverTimestamp(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Commit all changes atomically
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to initialize user data');
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('User profile not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: DocumentData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const createStudySession = async (userId: string, data: DocumentData) => {
  const batch = writeBatch(db);

  try {
    // Create new session document
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const sessionRef = doc(sessionsRef);
    batch.set(sessionRef, {
      ...data,
      createdAt: serverTimestamp(),
      status: 'completed'
    });
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      'stats.totalStudyTime': data.duration,
      'stats.sessionsCompleted': 1,
      'stats.lastActive': serverTimestamp()
    });
    
    // Commit all changes atomically
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error creating study session:', error);
    throw error;
  }
};

export const getUserSessions = async (userId: string) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const snapshot = await getDocs(sessionsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    throw error;
  }
};