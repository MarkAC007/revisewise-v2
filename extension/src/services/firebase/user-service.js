import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase-app';

class UserService {
  async getUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      console.warn('No user document found for uid:', uid);
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 