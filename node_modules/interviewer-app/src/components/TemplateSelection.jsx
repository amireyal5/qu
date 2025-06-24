import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TemplateSelection() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'questionnaireTemplates'),
      where("isActive", "==", true),
      orderBy("name")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="page-container"><p>טוען שאלונים זמינים...</p></div>;

  return (
    <div className="page-container">
      <h2>שלום, {userProfile?.firstName}!</h2>
      <p>נא בחר את השאלון שברצונך למלא עבור המרואיין.</p>
      <div className="list-item-body" style={{marginTop: '2rem'}}>
        {templates.length > 0 ? (
          templates.map(template => (
            // לחיצה מנווטת לדף הטופס עם ה-ID של התבנית
            <div 
              key={template.id} 
              className="list-item" 
              onClick={() => navigate(`/form/${template.id}`)} 
              style={{cursor: 'pointer'}}
            >
              <h3>{template.name}</h3>
              <p style={{color: 'var(--text-secondary)'}}>
                מכיל {template.questions?.length || 0} שאלות.
              </p>
            </div>
          ))
        ) : (
          <p>לא נמצאו תבניות פעילות. פנה למנהל המערכת.</p>
        )}
      </div>
    </div>
  );
}
export default TemplateSelection;