
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Enable Firestore offline persistence
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db, {
      cacheSizeBytes: 40 * 1024 * 1024, // 40MB
    })
      .then(() => console.log("Firestore offline persistence enabled."))
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
        } else if (err.code == 'unimplemented') {
          console.log("The current browser does not support all of the features required to enable persistence.");
        }
      });
  } catch (error) {
    console.error("Error enabling Firestore persistence:", error)
  }
}

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Check if emulators are already running to avoid re-initialization errors
    // @ts-ignore
    if (!auth.emulatorConfig) {
        try {
            console.log("Connecting to Firebase emulators");
            connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
            connectFirestoreEmulator(db, "localhost", 8080);
            connectStorageEmulator(storage, "localhost", 9199);
        } catch (error) {
            console.error("Error connecting to emulators:", error);
        }
    }
}

export { app, auth, db, storage };
