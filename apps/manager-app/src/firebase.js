import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. קריאת משתני הסביבה
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// 2. בדיקת תקינות - נוודא שאף משתנה לא ריק או undefined
// Object.values(firebaseConfig) יוצר מערך של כל הערכים באובייקט
// .some(value => !value) בודק אם לפחות אחד מהערכים הוא "falsy" (ריק, undefined, null)
const missingConfig = Object.values(firebaseConfig).some(value => !value);

if (missingConfig) {
  console.error("שגיאה קריטית: אחד או יותר ממשתני הסביבה של Firebase חסרים.");
  console.error("ודא שקובץ .env.local קיים בתיקייה הראשית ושהפעלת מחדש את שרת הפיתוח.");
  // זריקת שגיאה תעצור את האפליקציה ותמנע ממנה לנסות להתחבר עם פרטים שגויים.
  throw new Error("Firebase config is missing or invalid.");
}

// 3. אתחול שירותי Firebase
// רק אם כל המשתנים תקינים, נמשיך לאתחול.
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized successfully!");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // זרוק את השגיאה הלאה כדי שהיא תופיע בבירור
  throw error;
}

// 4. ייצוא השירותים לשימוש בשאר האפליקציה
export { app, auth, db };