import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithCredential,
  signInAnonymously,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

// Firebase configuration — loaded from environment variables.
// See .env.example for setup instructions.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<User | null> => {
  if (Capacitor.isNativePlatform()) {
    // Native Android: use Capacitor Firebase plugin for native Google Sign-In
    try {
      const result = await FirebaseAuthentication.signInWithGoogle({
        clientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
      });
      
      // Get the ID token from the native sign-in result
      const idToken = result.credential?.idToken;
      
      if (idToken) {
        // Create Firebase credential and sign in to the web SDK
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
      }
      
      // If no token, fall back to anonymous
      const anonResult = await signInAnonymously(auth);
      return anonResult.user;
    } catch (e: any) {
      console.error("Native Google Sign-In failed:", e);
      throw e;
    }
  }

  // Web: try popup first, fall back to redirect if blocked
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (popupError: any) {
    if (
      popupError.code === 'auth/popup-blocked' ||
      popupError.code === 'auth/popup-closed-by-user' ||
      popupError.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return auth.currentUser!;
    }
    throw popupError;
  }
};

export const loginAnonymously = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (e: any) {
    console.error("Anonymous Sign-In failed:", e);
    throw e;
  }
};

export const logout = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseAuthentication.signOut();
    } catch (e) {
      // Ignore native sign out errors
    }
  }
  await firebaseSignOut(auth);
};
