import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0e6gYb3RAEQuHsn-2YTkMc7_FUkp8yIQ",
  authDomain: "questionnaire-47fee.firebaseapp.com",
  projectId: "questionnaire-47fee",
  storageBucket: "questionnaire-47fee.firebasestorage.app",
  messagingSenderId: "940663380247",
  appId: "1:940663380247:web:394dbf5204981a303fff52",
  measurementId: "G-BVYWXD5VWC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);