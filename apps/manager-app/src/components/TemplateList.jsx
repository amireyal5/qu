import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TemplateList() {
  const { currentUser } = useAuth(); // קבלת המשתמש מהקונטקסט
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
    // --- בדיקת הרשאות בצד הלקוח ---
    console.log("Attempting to toggle status. Current user:", currentUser);
    if (!currentUser) {
      alert("שגיאה: אינך מחובר.");
      return;
    }
    console.log("User's provider data:", currentUser.providerData);
    // --------------------------------

    const templateRef = doc(db, "questionnaireTemplates", templateId);
    try {
        await updateDoc(templateRef, {
            isActive: !currentStatus
        });
    } catch (error) {
        console.error("Error toggling status:", error);
        alert("שגיאה בעדכון הסטטוס.");
    }
  };

  if (loading) return <div className="page-container"><p>טוען תבניות...</p></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>ניהול תבניות שאלונים</h2>
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
                    <span style={{color: template.isActive ? 'var(--success-green)' : 'var(--danger-red)', fontWeight: 'bold'}}>
                      {template.isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td style={{display: 'flex', gap: '10px'}}>
                    <Link to={`/form-builder/${template.id}`} className="action-link">ערוך</Link>
                    <button onClick={() => toggleActiveStatus(template.id, template.isActive)} className="btn" style={{padding: '6px 14px', fontSize: '0.9rem'}}>
                      {template.isActive ? 'הפוך ללא פעיל' : 'הפוך לפעיל'}
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
