import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

// --- רכיב פנימי לעריכת פריט ברשימה - החלק שהיה חסר ---
function EditableListItem({ questionnaire, serialNumber }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({
        intervieweeFirstName: questionnaire.intervieweeFirstName || '',
        intervieweeLastName: questionnaire.intervieweeLastName || '',
        intervieweePhone: questionnaire.intervieweePhone || '',
        status: questionnaire.status || 'בוצע',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        setEditableData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const docRef = doc(db, "questionnaires", questionnaire.id);
            await updateDoc(docRef, {
                intervieweeFirstName: editableData.intervieweeFirstName,
                intervieweeLastName: editableData.intervieweeLastName,
                intervieweePhone: editableData.intervieweePhone,
                status: editableData.status,
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating questionnaire:", error);
            alert("שגיאה בעדכון השאלון.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditableData({
            intervieweeFirstName: questionnaire.intervieweeFirstName || '',
            intervieweeLastName: questionnaire.intervieweeLastName || '',
            intervieweePhone: questionnaire.intervieweePhone || '',
            status: questionnaire.status || 'בוצע',
        });
        setIsEditing(false);
    };

    return (
        <div className="list-item">
            <div className="list-item-header">
                <div>
                    <span className="serial">#{serialNumber}</span>
                    <span className="date">הוגש ב: {questionnaire.submissionTimestamp?.toDate().toLocaleString('he-IL')}</span>
                </div>
                <div className="actions-bar" style={{border: 'none', padding: 0, marginTop: 0}}>
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="btn btn-cancel">בטל</button>
                            <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? 'שומר...' : 'שמור'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                            ערוך
                        </button>
                    )}
                </div>
            </div>
            <div className="list-item-body">
                <div className="form-group"><label>ת.ז.</label><input type="text" value={questionnaire.id} readOnly disabled /></div>
                <div className="form-group"><label>שם פרטי</label><input type="text" name="intervieweeFirstName" value={editableData.intervieweeFirstName} onChange={handleChange} disabled={!isEditing} /></div>
                <div className="form-group"><label>שם משפחה</label><input type="text" name="intervieweeLastName" value={editableData.intervieweeLastName} onChange={handleChange} disabled={!isEditing} /></div>
                <div className="form-group"><label>טלפון</label><input type="text" name="intervieweePhone" value={editableData.intervieweePhone} onChange={handleChange} disabled={!isEditing} /></div>
                <div className="form-group"><label>סטטוס</label>
                    <select name="status" value={editableData.status} onChange={handleChange} disabled={!isEditing}>
                      <option value="בוצע">בוצע</option>
                      <option value="אין מענה טלפוני">אין מענה טלפוני</option>
                      <option value="מספר לא תקין">מספר לא תקין</option>
                      <option value="מסרב להשיב">מסרב להשיב</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
// -----------------------------------------------------------------

// הרכיב הראשי של הדף
function QuestionnaireList() {
  const { currentUser, userProfile } = useAuth();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }

    setLoading(true);
    setError(null);
    const q = query(
        collection(db, 'questionnaires'),
        where("interviewerUid", "==", currentUser.uid),
        orderBy('submissionTimestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setQuestionnaires(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    },
    (err) => {
        console.error("Error fetching questionnaires:", err);
        setError("אירעה שגיאה בטעינת הנתונים.");
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) return <div className="page-container"><p>טוען נתונים...</p></div>;
  if (error) return <div className="page-container validation-message error"><h2>שגיאה</h2><p>{error}</p></div>;

  return (
    <div className="page-container">
      <h2>השאלונים שמילאת: {userProfile?.firstName} {userProfile?.lastName}</h2>
      
      <div style={{marginTop: '2rem'}}>
        {questionnaires.length > 0 ? (
          questionnaires.map((q, index) => (
              <EditableListItem key={q.id} questionnaire={q} serialNumber={questionnaires.length - index} />
          ))
        ) : (
          <p>עדיין לא מילאת שאלונים.</p>
        )}
      </div>
    </div>
  );
}

export default QuestionnaireList;
