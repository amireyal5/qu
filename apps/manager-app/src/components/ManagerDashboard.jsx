import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
// ... שאר הייבואים

function ManagerDashboard() {
  const [allQuestionnaires, setAllQuestionnaires] = useState([]); // State חדש לכל השאלונים
  const [availableTemplates, setAvailableTemplates] = useState([]); // State חדש לתבניות
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  // ... שאר ה-states (searchTerm, sortConfig)

  // שלב 1: טען את *כל* השאלונים פעם אחת
  useEffect(() => {
    const q = query(collection(db, 'questionnaires'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setAllQuestionnaires(data);
      
      // שלב 2: בנה את רשימת התבניות הייחודיות מתוך השאלונים
      const templatesMap = new Map();
      data.forEach(q => {
        if (q.template?.id && q.template?.name) {
          templatesMap.set(q.template.id, q.template.name);
        }
      });
      const uniqueTemplates = Array.from(templatesMap, ([id, name]) => ({ id, name }));
      setAvailableTemplates(uniqueTemplates);

      // בחר את התבנית הראשונה כברירת מחדל אם עדיין לא נבחרה
      if (uniqueTemplates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(uniqueTemplates[0].id);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedTemplateId]); // תלות ב-selectedTemplateId כדי לעדכן את הבחירה הראשונית

  // שלב 3: סנן את השאלונים להצגה לפי התבנית שנבחרה
  const filteredQuestionnaires = useMemo(() => {
    if (!selectedTemplateId) return [];
    return allQuestionnaires.filter(q => q.template?.id === selectedTemplateId);
  }, [selectedTemplateId, allQuestionnaires]);

  // שלב 4: החל חיפוש ומיון על הרשימה המסוננת
  const processedData = useMemo(() => {
    let dataToProcess = [...filteredQuestionnaires];
    // ... לוגיקת חיפוש ומיון (ללא שינוי) ...
    return dataToProcess;
  }, [filteredQuestionnaires, searchTerm, sortConfig]);

  // ... שאר הקוד (פונקציות עזר ו-JSX) נשאר דומה, אבל משתמש ב-availableTemplates
  // במקום ב-allTemplates ב-dropdown.

  return (
    <div className="page-container">
      {/* ... */}
      <div className="dashboard-controls">
        <div className="form-group">
          <label>הצג שאלונים עבור תבנית:</label>
          <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
            {/* שימוש ברשימת התבניות החדשה */}
            {availableTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {/* ... */}
      </div>
      {/* ... הטבלה משתמשת עכשיו ב-processedData ... */}
    </div>
  );
}
export default ManagerDashboard;
