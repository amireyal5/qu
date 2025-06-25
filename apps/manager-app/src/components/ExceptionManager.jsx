import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { isValidIsraeliID } from '../../interviewer-app/src/utils/validation'; // נניח שהקובץ משותף

// רכיב פנימי לטיפול בחריגה בודדת
function ExceptionItem({ exception }) {
  const [correctedId, setCorrectedId] = useState(exception.intervieweeId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFixAndMove = async () => {
    setError('');
    // 1. אימות הת.ז המתוקנת
    if (!isValidIsraeliID(correctedId)) {
      setError("הת.ז. המתוקנת אינה תקינה.");
      return;
    }
    
    setIsProcessing(true);
    try {
      // 2. בדיקה שהת.ז. המתוקנת לא קיימת כבר
      const existingDocRef = doc(db, "questionnaires", correctedId);
      const docSnap = await getDoc(existingDocRef);
      if (docSnap.exists()) {
        setError("הת.ז. המתוקנת כבר קיימת במערכת.");
        setIsProcessing(false);
        return;
      }

      // 3. ביצוע הפעולה האטומית
      const batch = writeBatch(db);
      
      // 3a. יצירת המסמך החדש ב-questionnaires
      const newQuestionnaireRef = doc(db, "questionnaires", correctedId);
      const newQuestionnaireData = { ...exception, intervieweeId: correctedId, status: 'בוצע' };
      delete newQuestionnaireData.id; // הסרת ה-ID הישן של החריגה
      batch.set(newQuestionnaireRef, newQuestionnaireData);

      // 3b. יצירת המסמך החדש ב-interviewees
      const newIntervieweeRef = doc(db, "interviewees", correctedId);
      batch.set(newIntervieweeRef, {
        interviewerName: exception.interviewerName,
        interviewerUid: exception.interviewerUid,
        submissionTimestamp: exception.submissionTimestamp,
      });

      // 3c. מחיקת המסמך הישן מהחריגות
      const oldExceptionRef = doc(db, "exceptions", exception.id);
      batch.delete(oldExceptionRef);

      // 4. הפעלת ה-batch
      await batch.commit();
      alert("השאלון תוקן והועבר בהצלחה!");
      // הרכיב ייעלם אוטומטית מהרשימה בזכות onSnapshot
    } catch (err) {
      console.error("Error fixing exception:", err);
      setError("אירעה שגיאה בתהליך התיקון.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="list-item">
      <h4>מרואיין: {exception.intervieweeFirstName} {exception.intervieweeLastName}</h4>
      <p><strong>מראיין:</strong> {exception.interviewerName}</p>
      <div className="list-item-body">
        <div className="form-group">
          <label>ת.ז. שגויה שהוזנה:</label>
          <input type="text" value={exception.intervieweeId} readOnly disabled />
        </div>
        <div className="form-group">
          <label>הזן ת.ז. מתוקנת (9 ספרות):</label>
          <input type="text" value={correctedId} onChange={(e) => setCorrectedId(e.target.value.replace(/\D/g, ''))} maxLength="9" />
        </div>
      </div>
      {error && <p className="validation-message error">{error}</p>}
      <div className="actions-bar" style={{justifyContent: 'flex-end'}}>
          <button onClick={handleFixAndMove} className="btn btn-primary" disabled={isProcessing}>
            {isProcessing ? 'מעבד...' : 'תקן והעבר'}
          </button>
      </div>
    </div>
  );
}

// הרכיב הראשי של הדף
function ExceptionManager() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "exceptions"), orderBy("submissionTimestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExceptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="page-container"><p>טוען חריגות...</p></div>;

  return (
    <div className="page-container">
      <h2>טיפול בשאלונים שגויים</h2>
      {exceptions.length > 0 ? (
        exceptions.map(ex => <ExceptionItem key={ex.id} exception={ex} />)
      ) : (
        <p>אין שאלונים הממתינים לטיפול.</p>
      )}
    </div>
  );
}
export default ExceptionManager;
