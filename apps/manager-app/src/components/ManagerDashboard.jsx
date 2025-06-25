import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

function ManagerDashboard() {
  const [allTemplates, setAllTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'submissionTimestamp', direction: 'desc' });

  useEffect(() => {
    const q = query(collection(db, 'questionnaireTemplates'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllTemplates(templates);
      if (templates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(templates[0].id);
      }
    });
    return () => unsubscribe();
  }, [selectedTemplateId]);

  useEffect(() => {
    if (!selectedTemplateId) {
      setQuestionnaires([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'questionnaires'),
      where('template.id', '==', selectedTemplateId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setQuestionnaires(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedTemplateId]);

  const processedData = useMemo(() => {
    let filteredData = [...questionnaires];
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(lowercasedFilter)
        )
      );
    }
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
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
    return filteredData;
  }, [questionnaires, searchTerm, sortConfig]);

  const dynamicColumns = useMemo(() => {
    if (!selectedTemplateId || allTemplates.length === 0) return [];
    const currentTemplate = allTemplates.find(t => t.id === selectedTemplateId);
    return currentTemplate?.questions.filter(q => q.type === 'radio' && q.showInDashboard) || [];
  }, [selectedTemplateId, allTemplates]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    const dataToExport = processedData.map((q, index) => {
      const baseData = {
        '#': index + 1,
        'ת.ז. מרואיין': q.intervieweeId,
        'שם מלא (מרואיין)': `${q.intervieweeLastName || ''} ${q.intervieweeFirstName || ''}`,
        'טלפון': q.intervieweePhone || '',
        'סטטוס': q.status || 'בוצע',
        'שם המראיין': q.interviewerName,
        'תאריך הגשה': q.submissionTimestamp?.toDate().toLocaleString('he-IL') || '',
      };
      dynamicColumns.forEach(col => {
        baseData[col.label] = q.answers[col.id] || '';
      });
      return baseData;
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "שאלונים");
    XLSX.writeFile(workbook, `שאלונים-${new Date().toLocaleDateString('he-IL').replace(/\./g, '-')}.xlsx`);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  };

  return (
    <div className="page-container">
      <h2>כל השאלונים שמולאו</h2>
      <div className="dashboard-controls" style={{display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem'}}>
        <div className="form-group" style={{flex: 1}}>
          <label>הצג שאלונים עבור תבנית:</label>
          <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
            {allTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{flex: 2}}>
          <label>חיפוש חופשי:</label>
          <input type="text" placeholder="חפש..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              <th onClick={() => requestSort('status')}>סטטוס {getSortIndicator('status')}</th>
              <th onClick={() => requestSort('submissionTimestamp')}>מועד הגשה {getSortIndicator('submissionTimestamp')}</th>
              {dynamicColumns.map(col => (
                <th key={col.id} onClick={() => requestSort(`answers.${col.id}`)}>{col.label} {getSortIndicator(`answers.${col.id}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5 + dynamicColumns.length}>טוען...</td></tr>
            ) : processedData.length > 0 ? (
              processedData.map((q, index) => (
                <tr key={q.docId}>
                  <td>{index + 1}</td>
                  <td><Link to={`/questionnaire/${q.docId}`}>{`${q.intervieweeLastName || ''} ${q.intervieweeFirstName || ''}`}</Link></td>
                  <td>{q.interviewerName}</td>
                  <td>{q.status || 'בוצע'}</td>
                  <td>{q.submissionTimestamp?.toDate().toLocaleString('he-IL')}</td>
                  {dynamicColumns.map(col => (
                    <td key={col.id}>{q.answers[col.id] || '-'}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr><td colSpan={5 + dynamicColumns.length}>לא נמצאו שאלונים.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagerDashboard;
