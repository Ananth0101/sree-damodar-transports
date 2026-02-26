import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyA7bxL4mp0mPaPe0Iy1miN8T7JzVKYFcv8",
  authDomain:        "sree-damodar-transports.firebaseapp.com",
  projectId:         "sree-damodar-transports",
  storageBucket:     "sree-damodar-transports.firebasestorage.app",
  messagingSenderId: "918174781719",
  appId:             "1:918174781719:web:aefcca9d62fd6271cee752"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Keep users logged in even after closing browser
setPersistence(auth, browserLocalPersistence);

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Create new user account (you'll use this once to create accounts for family members)
export const createUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => signOut(auth);
