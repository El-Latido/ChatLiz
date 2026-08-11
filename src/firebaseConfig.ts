import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBgTuV7xHa3PAPSzacRsEkcnJ59Fukye1A",
  authDomain: "eighth-ability-8szp9.firebaseapp.com",
  projectId: "eighth-ability-8szp9",
  storageBucket: "eighth-ability-8szp9.appspot.com",
  messagingSenderId: "389253128291",
  appId: "1:389253128291:web:087a456f72bbc4bf0b1856"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
