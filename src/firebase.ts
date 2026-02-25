import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  browserLocalPersistence,
  setPersistence
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

const app         = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const provider = new GoogleAuthProvider();

// Set persistence to keep users logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set persistence:', error);
});

// Improved mobile/PWA detection
const isMobileOrPWA = () => {
  // Check if running as installed PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
  
  // Check if on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check if screen is mobile-sized
  const isSmallScreen = window.innerWidth < 768;
  
  return isStandalone || isMobile || isSmallScreen;
};

export const signInWithGoogle = async () => {
  try {
    if (isMobileOrPWA()) {
      console.log('Using redirect flow for mobile/PWA');
      // Use redirect for mobile and PWA
      return await signInWithRedirect(auth, provider);
    } else {
      console.log('Using popup flow for desktop');
      // Use popup for desktop
      return await signInWithPopup(auth, provider);
    }
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  }
};

export { getRedirectResult };
export const signOutUser = () => signOut(auth);
