import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDoc, setDoc, writeBatch, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext'; // ייבוא הקונטקסט
import { isValidIsraeliID } from '../utils/validation';

// רכיב פנימי לטיפול בחריגה בודדת
function ExceptionItem({ exception }) {
  const [correctedId, setCorrectedId] = useState(exception.intervieweeId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFixAndMove = async () => {
    setError('');
    if (!isValidIsraeliID(correctedId)) { setError("הת.ז. המתוקנת אינה תקינה."); return; }
    setIsProcessing(true);
    try {
      const existingDocRef = doc(db, "questionnaires", correctedId);
      const docSnap = await getDoc(existingDocRef);
      if (docSnap.exists()) { setError("הת.ז. המתוקנת כבר קיימת במערכת."); setIsProcessing(false); return; }

      const batch = writeBatch(db);
      const newQuestionnaireRef = doc(db, "questionnaires", correctedId);
      const newQuestionnaireData = { ...exception, intervieweeId: correctedId, status: 'בוצע' };
      delete newQuestionnaireData.id;
      batch.set(newQuestionnaireRef, newQuestionnaireData);
      const newIntervieweeRef = doc(db, "interviewees", correctedId);
      batch.set(newIntervieweeRef, {
        interviewerName: exception.interviewerName,
        interviewerUid: exception.interviewerUid,
        submissionTimestamp: exception.submissionTimestamp,
      });
      const oldExceptionRef = doc(db, "exceptions", exception.id);
      batch.delete(oldExceptionRef);
      await batch.commit();
      alert("השאלון תוקן והועבר בהצלחה!");
    } catch (err) { console.error(err); setError("שגיאה בתהליך התיקון."); setIsProcessing(false); }
  };
  
  const handleDelete = async () => {
      if (!window.confirm("למחוק חריגה זו?")) return;
      await deleteDoc(doc(db, "exceptions", exception.id));
  }

  return (
    <div className="list-item">
      <h4>מרואיין: {exception.intervieweeFirstName} {exception.intervieweeLastName}</h4>
      <p><strong>מראיין:</strong> {exception.interviewerName}</p>
      <div className="list-item-body">
        <div className="form-group"><label>ת.ז. שגויה:</label><input type="text" value={exception.intervieweeId} readOnly disabled /></div>
        <div className="form-group"><label>הזן ת.ז. מתוקנת:</label><input type="text" value={correctedId} onChange={(e) => setCorrectedId(e.target.value.replace(/\D/g, ''))} maxLength="9" /></div>
      </div>
      {error && <p className="validation-message error">{error}</p>}
      <div className="actions-bar" style={{justifyContent: 'flex-end'}}>
          <button onClick={handleDelete} className="btn btn-delete" disabled={isProcessing}>מחק</button>
          <button onClick={handleFixAndMove} className="btn btn-primary" disabled={isProcessing}>{isProcessing ? 'מעבד...' : 'תקן והעבר'}</button>
      </div>
    </div>
  );
}

// הרכיב הראשי של הדף
function ExceptionManager() {
  const { currentUser } = useAuth(); // קבלת המשתמש מהקונטקסט
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // בדיקת הגנה: אל תנסה למשוך נתונים אם אין משתמש מנהל
    if (!currentUser || currentUser.isAnonymous) {
      setLoading(false);
      setError("אין לך הרשאה לצפות בדף זה.");
      return;
    }

    setLoading(true);
    setError(null);
    const q = query(collection(db, "exceptions"), orderBy("submissionTimestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExceptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching exceptions:", err);
      setError("אירעה שגיאה בטעינת החריגות.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]); // ה-useEffect תלוי עכשיו ב-currentUser

  if (loading) return <div className="page-container"><p>טוען חריגות...</p></div>;
  if (error) return <div className="page-container validation-message error"><h2>שגיאה</h2><p>{error}</p></div>;

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
