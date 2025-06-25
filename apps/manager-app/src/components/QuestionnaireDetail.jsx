import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import QuestionRenderer from '../../interviewer-app/src/components/QuestionRenderer'; // נניח שזה קובץ משותף

function QuestionnaireDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [questionnaire, setQuestionnaire] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'questionnaires', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setQuestionnaire(data);
          setEditableData(data); // אתחול הנתונים לעריכה
        } else {
          setError("שאלון לא נמצא.");
        }
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת השאלון.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionnaire();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({
      ...prev,
      answers: { ...prev.answers, [name]: value }
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setEditableData(prev => {
      const currentAnswers = prev.answers[name] || [];
      const newAnswers = { ...prev.answers, [name]: checked ? [...currentAnswers, value] : currentAnswers.filter(item => item !== value) };
      return { ...prev, answers: newAnswers };
    });
  };

  const handleSaveChanges = async () => {
    setIsProcessing(true);
    const { id: docId, ...dataToUpdate } = editableData;
    const docRef = doc(db, 'questionnaires', docId);
    try {
      await updateDoc(docRef, dataToUpdate);
      setQuestionnaire(editableData); // עדכון התצוגה עם הנתונים החדשים
      setIsEditing(false);
      alert("השינויים נשמרו בהצלחה.");
    } catch (err) {
      console.error(err);
      alert("שגיאה בשמירת השינויים.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק שאלון זה לצמיתות?")) {
      setIsProcessing(true);
      try {
        await deleteDoc(doc(db, 'questionnaires', id));
        alert("השאלון נמחק.");
        navigate('/'); // חזרה לדשבורד
      } catch (err) {
        console.error(err);
        alert("שגיאה במחיקת השאלון.");
        setIsProcessing(false);
      }
    }
  };

  const handlePrint = () => window.print();

  const handleEmail = () => {
    const subject = `סיכום שאלון עבור: ${questionnaire.intervieweeFirstName} ${questionnaire.intervieweeLastName}`;
    let body = `פרטי שאלון:\n`;
    body += `ת.ז. מרואיין: ${questionnaire.id}\n`;
    body += `שם: ${questionnaire.intervieweeFirstName} ${questionnaire.intervieweeLastName}\n`;
    body += `טלפון: ${questionnaire.intervieweePhone}\n`;
    body += `סטטוס: ${questionnaire.status || 'בוצע'}\n`;
    body += `מולא ע"י: ${questionnaire.interviewerName}\n`;
    body += `בתאריך: ${questionnaire.submissionTimestamp?.toDate().toLocaleString('he-IL')}\n\n`;
    body += `--- תשובות ---\n`;
    questionnaire.template.questions.forEach(q => {
      const answer = questionnaire.answers[q.id];
      const formattedAnswer = Array.isArray(answer) ? answer.join(', ') : (answer || '-');
      body += `${q.label}: ${formattedAnswer}\n`;
    });
    body += `\n--- הערות מנהל ---\n`;
    body += `${questionnaire.managerNotes || 'אין.'}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) return <div className="page-container"><p>טוען פרטי שאלון...</p></div>;
  if (error) return <div className="page-container validation-message error"><h2>שגיאה</h2><p>{error}</p></div>;
  if (!questionnaire) return <div className="page-container"><p>לא נמצאו נתונים.</p></div>;

  const questions = questionnaire.template?.questions || [];
  const dataToDisplay = isEditing ? editableData : questionnaire;

  return (
    <div className="page-container">
      <div className="list-item-header">
        <h2>{`${dataToDisplay.intervieweeFirstName} ${dataToDisplay.intervieweeLastName}`} <span style={{color: 'var(--text-secondary)', fontSize: '1.2rem'}}>({dataToDisplay.id})</span></h2>
        <div className="actions-bar" style={{border: 'none', padding: 0, marginTop: 0}}>
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="btn btn-cancel">בטל עריכה</button>
              <button onClick={handleSaveChanges} className="btn btn-primary" disabled={isProcessing}>{isProcessing ? 'שומר...' : 'שמור שינויים'}</button>
            </>
          ) : (
            <>
              <button onClick={handlePrint} className="btn">הדפס</button>
              <button onClick={handleEmail} className="btn">שלח במייל</button>
              <button onClick={handleDelete} className="btn btn-delete">מחק</button>
              <button onClick={() => setIsEditing(true)} className="btn btn-edit">ערוך שאלון</button>
            </>
          )}
        </div>
      </div>

      <div className="form-grid" style={{marginTop: '2rem'}}>
        <div className="form-group">
          <label>שם פרטי</label>
          <input type="text" name="intervieweeFirstName" value={dataToDisplay.intervieweeFirstName} onChange={handleInputChange} disabled={!isEditing} />
        </div>
        <div className="form-group">
          <label>שם משפחה</label>
          <input type="text" name="intervieweeLastName" value={dataToDisplay.intervieweeLastName} onChange={handleInputChange} disabled={!isEditing} />
        </div>
        <div className="form-group">
          <label>טלפון</label>
          <input type="text" name="intervieweePhone" value={dataToDisplay.intervieweePhone} onChange={handleInputChange} disabled={!isEditing} />
        </div>
        <div className="form-group">
          <label>סטטוס</label>
          <select name="status" value={dataToDisplay.status} onChange={handleInputChange} disabled={!isEditing}>
            <option value="בוצע">בוצע</option>
            <option value="אין מענה טלפוני">אין מענה טלפוני</option>
            <option value="מספר לא תקין">מספר לא תקין</option>
            <option value="מסרב להשיב">מסרב להשיב</option>
          </select>
        </div>
      </div>

      <hr style={{margin: '2rem 0'}} />
      
      <h3>תשובות לשאלות</h3>
      <div className="form-grid">
        {questions.map(q => (
          <div key={q.id} style={q.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
            <QuestionRenderer 
              question={q}
              value={dataToDisplay.answers[q.id]}
              onChange={handleAnswerChange}
              onCheckboxChange={handleCheckboxChange}
              disabled={!isEditing} // העברת מאפיין disabled לרכיב
            />
          </div>
        ))}
      </div>

      <hr style={{margin: '2rem 0'}} />

      <h3>הערות והנחיות מנהל</h3>
      <div className="form-group">
        <textarea 
          name="managerNotes" 
          rows="6" 
          placeholder="הוסף כאן הערות..."
          value={dataToDisplay.managerNotes || ''}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>
    </div>
  );
}

export default QuestionnaireDetail;
