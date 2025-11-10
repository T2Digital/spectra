import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC4Iz229-F5i9NcF_qW5QvVwaNYh4JNtaE",
  authDomain: "spectra-store.firebaseapp.com",
  projectId: "spectra-store",
  storageBucket: "spectra-store.appspot.com",
  messagingSenderId: "103376550595",
  appId: "1:103376550595:web:f225911cb4df68704f0076",
  measurementId: "G-J77GRHQYL0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase services that your application will use
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, app };
