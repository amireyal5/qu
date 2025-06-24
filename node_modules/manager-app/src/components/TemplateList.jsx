import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore'; // הוספת updateDoc
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ... לוגיקת טעינה נשארת זהה ...
  }, []);

  // פונקציה חדשה לשינוי סטטוס
  const toggleActiveStatus = async (templateId, currentStatus) => {
    const templateRef = doc(db, "questionnaireTemplates", templateId);
    await updateDoc(templateRef, {
      isActive: !currentStatus
    });
  };

  return (
    <div className="page-container">
      {/* ... כותרת וכפתור יצירה ... */}
      <div className="table-wrapper" style={{marginTop: '2rem'}}>
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
            {templates.map(template => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TemplateList;