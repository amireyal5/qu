import React, { useState, useEffect } from 'react'; // <-- התיקון כאן
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function QuestionnaireDetail() {
  const { id } = useParams(); // קבלת ה-ID מה-URL
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'questionnaires', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuestionnaire({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("שאלון עם מזהה זה לא נמצא.");
        }
      } catch (err) {
        console.error("Error fetching questionnaire details:", err);
        setError("אירעה שגיאה בטעינת פרטי השאלון.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionnaire();
  }, [id]);

  if (loading) { return <div className="page-container"><p>טוען פרטי שאלון...</p></div>; }
  if (error) { return <div className="page-container validation-message error"><h2>שגיאה</h2><p>{error}</p></div>; }
  if (!questionnaire) { return <div className="page-container"><p>לא נמצאו נתונים.</p></div>; }

  // השאלות נלקחות מתוך "תמונת המצב" של התבנית שנשמרה עם השאלון
  const questions = questionnaire.template?.questions || [];

  return (
    <div className="page-container">
      <h2>פרטי שאלון עבור מרואיין: {questionnaire.id}</h2>
      <p><strong>מולא ע"י:</strong> {questionnaire.interviewerName}</p>
      <p><strong>בתאריך:</strong> {questionnaire.submissionTimestamp?.toDate().toLocaleString('he-IL')}</p>
      
      <hr style={{margin: '2rem 0'}} />

      {questions.map((q) => (
        <div key={q.id} className="form-group">
          <label style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{q.label}</label>
          <div className="answer-display" style={{padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginTop: '5px'}}>
            {/* טיפול בתשובות מסוג מערך (checkbox) או טקסט */}
            {Array.isArray(questionnaire.answers[q.id])
              ? (questionnaire.answers[q.id].join(', ') || <em>(לא סומנו אפשרויות)</em>)
              : (questionnaire.answers[q.id] || <em>(לא נמסרה תשובה)</em>)
            }
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuestionnaireDetail;