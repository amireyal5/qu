import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TemplateList() {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    
    const q = query(collection(db, 'questionnaireTemplates'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplates(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const toggleActiveStatus = async (templateId, currentStatus) => {
    const templateRef = doc(db, "questionnaireTemplates", templateId);
    await updateDoc(templateRef, {
      isActive: !currentStatus
    });
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את התבנית "${templateName}"? פעולה זו אינה הפיכה.`)) {
      try {
        await deleteDoc(doc(db, "questionnaireTemplates", templateId));
        alert("התבנית נמחקה בהצלחה.");
      } catch (error) {
        console.error("Error deleting template: ", error);
        alert("אירעה שגיאה במחיקת התבנית.");
      }
    }
  };

  if (loading) return <div className="page-container"><p>טוען תבניות...</p></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>ניהול תבניות שאלונים</h2>
        {/* --- הכפתור שהוחזר --- */}
        <button onClick={() => navigate('/form-builder/new')} className="btn btn-primary">
          + צור שאלון חדש
        </button>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>שם התבנית</th>
              <th>מספר שאלות</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {templates.length > 0 ? (
              templates.map(template => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td>{template.questions?.length || 0}</td>
                  <td>
                    <span style={{
                      color: template.isActive ? 'var(--success-green)' : 'var(--danger-red)',
                      fontWeight: 'bold'
                    }}>
                      {template.isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td style={{display: 'flex', gap: '10px'}}>
                    <Link to={`/form-builder/${template.id}`} className="btn btn-secondary">ערוך</Link>
                    <button onClick={() => toggleActiveStatus(template.id, template.isActive)} className="btn btn-secondary">
                      {template.isActive ? 'השבת' : 'הפעל'}
                    </button>
                    <button onClick={() => handleDeleteTemplate(template.id, template.name)} className="btn btn-danger">
                      מחק
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>לא נמצאו תבניות.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TemplateList;
