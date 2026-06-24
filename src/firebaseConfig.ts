import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPnyUYiErVRr-AiHuftNEqJ4SQd7l2qVM",
  authDomain: "chatliz-app.firebaseapp.com",
  projectId: "chatliz-app",
  storageBucket: "chatliz-app.firebasestorage.app",
  messagingSenderId: "371309552333",
  appId: "1:371309552333:web:3b7f061bc90ac45468bf84"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
