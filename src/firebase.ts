import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut
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

// Use redirect on mobile/PWA, popup on desktop
const isMobilePWA = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  window.matchMedia('(display-mode: standalone)').matches;

export const signInWithGoogle = async () => {
  if (isMobilePWA()) {
    return signInWithRedirect(auth, provider);
  }
  return signInWithPopup(auth, provider);
};

export { getRedirectResult };
export const signOutUser = () => signOut(auth);
