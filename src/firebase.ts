import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signInWithPopup, signOut, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7bxL4mp0mPaPe0Iy1miN8T7JzVKYFcv8",
  authDomain: "sree-damodar-transports.firebaseapp.com",
  projectId: "sree-damodar-transports",
  storageBucket: "sree-damodar-transports.firebasestorage.app",
  messagingSenderId: "918174781719",
  appId: "1:918174781719:web:aefcca9d62fd6271cee752",
  measurementId: "G-GZC6RT13PM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Use redirect on mobile, popup on desktop
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const signInWithGoogle = async () => {
  await setPersistence(auth, browserLocalPersistence);
  if (isMobile) {
    return signInWithRedirect(auth, provider);
  } else {
    return signInWithPopup(auth, provider);
  }
};

export const signOutUser = () => signOut(auth);