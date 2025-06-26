import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp, writeBatch, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import QuestionRenderer from './QuestionRenderer';
import { isValidIsraeliID } from '../utils/validation';
import useDebounce from '../hooks/useDebounce';

function QuestionnaireForm() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    intervieweeId: '',
    intervieweeFirstName: '',
    intervieweeLastName: '',
    intervieweePhone: '',
    status: '',
    answers: {},
  });
  
  const debouncedIntervieweeId = useDebounce(formData.intervieweeId, 600);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idError, setIdError] = useState('');

  useEffect(() => {
    if (!currentUser || !templateId) { setLoading(false); return; }
    const fetchTemplate = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'questionnaireTemplates', templateId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const tpl = docSnap.data();
          setTemplate(tpl);
          const initialAnswers = tpl.questions.reduce((acc, q) => ({ ...acc, [q.id]: q.type === 'checkbox' ? [] : '' }), {});
          setFormData({
            intervieweeId: '', intervieweeFirstName: '', intervieweeLastName: '',
            intervieweePhone: '', status: '', answers: initialAnswers
          });
        } else {
          setError("שגיאה: תבנית השאלון לא נמצאה.");
        }
      } catch (err) {
        console.error("Error fetching template:", err);
        setError("שגיאה בטעינת תבנית השאלון.");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [currentUser, templateId]);

  useEffect(() => {
    if (!currentUser || !debouncedIntervieweeId) { setIdError(''); return; }
    const checkId = async () => {
      const currentId = debouncedIntervieweeId;
      setIsCheckingId(true);
      
      if (currentId.length !== 9) {
        setIdError("ת.ז. חייבת להכיל 9 ספרות. נסה להוסיף 0 בהתחלה או שלח כשגוי.");
        setIsCheckingId(false);
        return;
      }
      if (!isValidIsraeliID(currentId)) {
        setIdError("הת.ז. אינה תקינה. נא בדוק שנית או שלח כשגוי.");
        setIsCheckingId(false);
        return;
      }
      
      try {
        const docRef = doc(db, 'interviewees', currentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIdError(`מרואיין עם ת.ז. זו כבר קיים במערכת.`);
        } else {
          setIdError('');
        }
      } catch (error) {
        console.error("Error checking ID:", error);
        setIdError("שגיאה בבדיקת הת.ז. מול השרת.");
      }
      setIsCheckingId(false);
    };
    checkId();
  }, [debouncedIntervieweeId, currentUser]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAnswerChange = (e) => setFormData(prev => ({ ...prev, answers: { ...prev.answers, [e.target.name]: e.target.value } }));
  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => {
        const currentAnswers = prev.answers[name] || [];
        const newAnswers = { ...prev.answers, [name]: checked ? [...currentAnswers, value] : currentAnswers.filter(item => item !== value) };
        return { ...prev, answers: newAnswers };
    });
  }; // ← התיקון נמצא כאן: הסוגר החסר הוסף

  const resetForm = () => {
    setFormData({
      intervieweeId: '',
      intervieweeFirstName: '',
      intervieweeLastName: '',
      intervieweePhone: '',
      status: '',
      answers: template ? template.questions.reduce((acc, q) => ({ ...acc, [q.id]: q.type === 'checkbox' ? [] : '' }), {}) : {}
    });
    setIdError('');
  };

  const handleSaveAsException = async () => {
    if (!window.confirm("האם אתה בטוח שברצונך לשמור את השאלון לטיפול עתידי?")) return;
    setIsSubmitting(true);
    const submissionData = {
      ...formData,
      status: 'טיפול נדרש (ת.ז שגויה)',
      interviewerName: `${userProfile.firstName} ${userProfile.lastName}`,
      interviewerUid: currentUser.uid,
      submissionTimestamp: serverTimestamp(),
      template: { id: templateId, name: template.name, questions: template.questions },
    };
    try {
      await addDoc(collection(db, "exceptions"), submissionData);
      alert("השאלון נשמר בהצלחה לטיפול המשרד.");
      resetForm();
    } catch (err) { console.error("Error saving exception:", err); alert("אירעה שגיאה בשמירת החריגה."); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userProfile) { alert("שגיאה: פרופיל המראיין לא נטען."); return; }
    if (idError) { alert("לא ניתן לשמור. יש בעיה עם ת.ז. המרואיין."); return; }
    
    setIsSubmitting(true);
    const batch = writeBatch(db);
    const finalStatus = formData.status || 'בוצע';
    const isPartialSubmission = ['אין מענה טלפוני', 'מספר לא תקין', 'מסרב להשיב'].includes(finalStatus);
    const finalAnswers = isPartialSubmission ? {} : formData.answers;

    const submissionData = {
      ...formData,
      answers: finalAnswers,
      status: finalStatus,
      interviewerName: `${userProfile.firstName} ${userProfile.lastName}`,
      interviewerUid: currentUser.uid,
      submissionTimestamp: serverTimestamp(),
      template: { id: templateId, name: template.name, questions: template.questions },
    };
    batch.set(doc(db, "questionnaires", formData.intervieweeId), submissionData);
    batch.set(doc(db, "interviewees", formData.intervieweeId), {
      interviewerName: `${userProfile.firstName} ${userProfile.lastName}`,
      interviewerUid: currentUser.uid,
      submissionTimestamp: serverTimestamp(),
    });
    try {
      await batch.commit();
      alert("השאלון נשמר בהצלחה!");
      resetForm();
    } catch (err) { console.error(err); alert("אירעה שגיאה בשמירת השאלון."); }
    finally { setIsSubmitting(false); }
  };
  
  const showSaveAsExceptionButton = formData.intervieweeId.length > 0 && idError && !idError.includes("כבר קיים");
  const areDynamicQuestionsRequired = !['אין מענה טלפוני', 'מספר לא תקין', 'מסרב להשיב'].includes(formData.status);

  if (loading) return <div className="page-container" style={{ textAlign: 'center' }}><h2>טוען...</h2></div>;
  if (error) return <div className="page-container validation-message error"><p>{error}</p></div>;
  if (!template) return <div className="page-container" style={{ textAlign: 'center' }}><h2>לא נמצאה תבנית.</h2></div>;

  return (
    <div className="page-container form-container questionnaire-view">
      <h2>{template.name}</h2>
      <p>נא למלא את כל הפרטים. שדות המסומנים בכוכבית (*) הינם חובה.</p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div className="form-grid">
            <div className="form-group">
              <label htmlFor="intervieweeId">ת.ז. מרואיין *</label>
              <input type="text" id="intervieweeId" name="intervieweeId" value={formData.intervieweeId} onChange={handleInputChange} maxLength="9" required />
              {isCheckingId && <div className="validation-message info">בודק...</div>}
              {idError && <div className="validation-message error">{idError}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="intervieweeFirstName">שם פרטי *</label>
              <input type="text" id="intervieweeFirstName" name="intervieweeFirstName" value={formData.intervieweeFirstName} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="intervieweeLastName">שם משפחה *</label>
              <input type="text" id="intervieweeLastName" name="intervieweeLastName" value={formData.intervieweeLastName} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="intervieweePhone">טלפון *</label>
              <input type="text" id="intervieweePhone" name="intervieweePhone" onChange={handleInputChange} required />
            </div>
        </div>
        <div className="form-group" style={{maxWidth: '400px'}}>
            <label htmlFor="status">סטטוס שאלון</label>
            <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="">(ברירת מחדל: בוצע)</option>
                <option value="אין מענה טלפוני">אין מענה טלפוני</option>
                <option value="מספר לא תקין">מספר לא תקין</option>
                <option value="מסרב להשיב">מסרב להשיב</option>
            </select>
        </div>
        
        {template.questions?.length > 0 && <hr style={{margin: '2rem 0'}} />}
        
        <div className="form-grid">
            {template.questions.map(question => {
              const isRequired = question.required && areDynamicQuestionsRequired;
              return (
                <div key={question.id} style={question.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                  <QuestionRenderer 
                    question={{ ...question, required: isRequired }}
                    value={formData.answers[question.id]}
                    onChange={handleAnswerChange}
                    onCheckboxChange={handleCheckboxChange} 
                  />
                </div>
              );
            })}
        </div>
        
        <div className="actions-bar" style={{justifyContent: 'space-between'}}>
          <button type="button" onClick={() => navigate('/')} className="btn btn-cancel">חזור</button>
          <div>
            <button type="submit" disabled={isSubmitting || isCheckingId || !!idError} className="btn btn-primary">שמור</button>
            {showSaveAsExceptionButton && (
              <button type="button" onClick={handleSaveAsException} disabled={isSubmitting} className="btn btn-warning" style={{marginRight: '10px'}}>
                שמור כשגוי
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default QuestionnaireForm;
