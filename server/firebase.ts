import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

let fdb: any = null;
let fStorage: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let firebaseConfig: any = null;
  
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } else if (process.env.FIREBASE_CONFIG) {
     try {
       firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
     } catch (e) {
       console.error("Invalid FIREBASE_CONFIG env var");
     }
  } else if (process.env.FIREBASE_API_KEY) {
     firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
     };
  }

  if (firebaseConfig) {
    const appInfo = initializeApp(firebaseConfig);
    fdb = getFirestore(appInfo, firebaseConfig.firestoreDatabaseId || undefined);
    fStorage = getStorage(appInfo);
    console.log("Firebase initialized");
  } else {
    console.warn("No Firebase configuration found. Using fallback local storage.");
  }
} catch(e) {
  console.error("Firebase initialization failed:", e);
}

export { fdb, fStorage };
