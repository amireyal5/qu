import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext'; // ייבוא הקונטקסט

function ManagerDashboard() {
  const { currentUser } = useAuth(); // קבלת המשתמש המחובר
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State לטיפול בשגיאות

  useEffect(() => {
    // אם אין משתמש, או אם המשתמש הוא אנונימי, אל תנסה למשוך נתונים
    if (!currentUser || currentUser.isAnonymous) {
      setLoading(false);
      // אין צורך להציג שגיאה, כי ייתכן שהמשתמש פשוט לא מחובר
      return; 
    }

    setLoading(true);
    setError(null);
    const q = query(collection(db, 'questionnaires'), orderBy('submissionTimestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          serialNumber: index + 1,
          ...doc.data(),
        }));
        setQuestionnaires(data);
        setLoading(false);
      }, 
      (err) => {
        // כאן נתפוס את שגיאת ה-permission-denied אם היא בכל זאת קורית
        console.error("Error fetching questionnaires: ", err);
        setError("אין לך הרשאה לצפות בנתונים אלה.");
        setLoading(false);
      }
    );

    // ניקוי המאזין
    return () => unsubscribe();
  }, [currentUser]); // ה-useEffect תלוי עכשיו ב-currentUser

  // --- תצוגה מותנית משופרת ---
  if (loading) {
    return <div className="page-container"><p>טוען רשימת שאלונים...</p></div>;
  }
  
  if (error) {
    return <div className="page-container validation-message error"><h2>שגיאה</h2><p>{error}</p></div>;
  }

  // אם הגענו לכאן, הכל תקין, הצג את הטבלה
  return (
    <div className="page-container">
      <h2>כל השאלונים שמולאו</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ת.ז. מרואיין</th>
              <th>שם המראיין</th>
              <th>תאריך מילוי</th>
            </tr>
          </thead>
          <tbody>
            {questionnaires.length > 0 ? (
              questionnaires.map(q => (
                <tr key={q.id}>
                  <td>{q.serialNumber}</td>
                  <td>{q.id}</td>
                  <td>{q.interviewerName}</td>
                  <td>{q.submissionTimestamp?.toDate().toLocaleString('he-IL')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>לא נמצאו שאלונים.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagerDashboard;