import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "eighth-ability-8szp9.firebaseapp.com",
  projectId: "eighth-ability-8szp9",
  storageBucket: "eighth-ability-8szp9.appspot.com",
  messagingSenderId: "389253128291",
  appId: "1:389253128291:web:087a456f72bbc4bf0b1856"
};

const databaseId = "ai-studio-chatliz-19b8032a-22a9-4b1d-9b50-b3d4b9771a26";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
