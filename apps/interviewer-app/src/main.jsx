// ייבוא הספריות הבסיסיות של React
import React from 'react';
import ReactDOM from 'react-dom/client';

// ייבוא קומפוננטת ה-App הראשית שלך
import App from './App.jsx'; // וודא שהנתיב ל-App.jsx נכון!

// ייבוא קובץ ה-CSS המשותף
import '../../../packages/shared-ui/src/style.css'; // הנתיב שהוספת

// ייבוא מופעי Firebase המאותחלים מהקובץ המשותף
// הנתיב המדויק עשוי להשתנות בהתאם למיקום הקובץ המשותף שלך.
// וודא שנתיב זה ( '../../../common/firebase.js' ) אכן מוביל לקובץ שלך
// שמכיל את הקוד שהצגת זה עתה (עם firebaseConfig, initializeApp, ו-exports).
import { auth, db } from '../../../common/firebase.js';

// רינדור אפליקציית ה-React לדף ה-HTML
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// הערה: אין צורך לקרוא כאן initializeApp(firebaseConfig) שוב,
// מכיוון שזה כבר נעשה בקובץ '../../../common/firebase.js'.
// משתני הסביבה של Vite (VITE_FIREBASE_API_KEY וכו') צריכים להיות מוגדרים
// ב-Netlify UI ובשימוש בקובץ ה-firebase.js המשותף.
