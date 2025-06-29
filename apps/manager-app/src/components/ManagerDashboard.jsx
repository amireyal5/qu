import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

function ManagerDashboard() {
  const [allQuestionnaires, setAllQuestionnaires] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  
  // --- ה-states שהיו חסרים ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'submissionTimestamp', direction: 'desc' });

  // שלב 1: טען את כל השאלונים פעם אחת
  useEffect(() => {
    const q = query(collection(db, 'questionnaires'), orderBy('submissionTimestamp', 'desc'));
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

      if (uniqueTemplates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(uniqueTemplates[0].id);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // תלות ריקה כדי שירוץ פעם אחת

  // שלב 3: סנן את השאלונים להצגה לפי התבנית שנבחרה
  const filteredByTemplate = useMemo(() => {
    if (!selectedTemplateId) return [];
    return allQuestionnaires.filter(q => q.template?.id === selectedTemplateId);
  }, [selectedTemplateId, allQuestionnaires]);

  // שלב 4: החל חיפוש ומיון על הרשימה המסוננת
  const processedData = useMemo(() => {
    let dataToProcess = [...filteredByTemplate];
    
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      dataToProcess = dataToProcess.filter(item =>
        (item.intervieweeId && item.intervieweeId.includes(lowercasedFilter)) ||
        (item.intervieweeFirstName && item.intervieweeFirstName.toLowerCase().includes(lowercasedFilter)) ||
        (item.intervieweeLastName && item.intervieweeLastName.toLowerCase().includes(lowercasedFilter)) ||
        (item.interviewerName && item.interviewerName.toLowerCase().includes(lowercasedFilter))
      );
    }

    if (sortConfig.key) {
      dataToProcess.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'submissionTimestamp') {
            aValue = aValue?.toDate() || 0;
            bValue = bValue?.toDate() || 0;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return dataToProcess;
  }, [filteredByTemplate, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => { /* ... ללא שינוי ... */ };
  const getSortIndicator = (key) => { /* ... ללא שינוי ... */ };

  return (
    <div className="page-container">
      <h2>כל השאלונים שמולאו</h2>
      <div className="dashboard-controls" style={{display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem'}}>
        <div className="form-group" style={{flex: 1}}>
          <label>הצג שאלונים עבור תבנית:</label>
          <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
            {availableTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{flex: 2}}>
          <label>חיפוש חופשי:</label>
          <input type="text" placeholder="חפש לפי שם, ת.ז, מראיין..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="form-group">
          <button onClick={exportToExcel} className="btn btn-add">יצא לאקסל</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('docId')}>#</th>
              <th onClick={() => requestSort('intervieweeLastName')}>שם מלא (מרואיין) {getSortIndicator('intervieweeLastName')}</th>
              <th onClick={() => requestSort('interviewerName')}>שם המראיין {getSortIndicator('interviewerName')}</th>
              <th onClick={() => requestSort('submissionTimestamp')}>מועד הגשה {getSortIndicator('submissionTimestamp')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">טוען...</td></tr>
            ) : processedData.length > 0 ? (
              processedData.map((q, index) => (
                <tr key={q.docId}>
                  <td>{index + 1}</td>
                  <td><Link to={`/questionnaire/${q.docId}`}>{`${q.intervieweeLastName || ''} ${q.intervieweeFirstName || ''}`}</Link></td>
                  <td>{q.interviewerName}</td>
                  <td>{q.submissionTimestamp?.toDate().toLocaleString('he-IL')}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">לא נמצאו שאלונים.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagerDashboard;
