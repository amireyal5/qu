import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';

function ManagerDashboard() {
  const { currentUser } = useAuth();
  const [allQuestionnaires, setAllQuestionnaires] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'submissionTimestamp', direction: 'desc' });

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'questionnaires'), orderBy('submissionTimestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setAllQuestionnaires(allData);

      const templatesMap = new Map();
      allData.forEach(questionnaire => {
        if (questionnaire.template?.id && questionnaire.template?.name) {
          templatesMap.set(questionnaire.template.id, questionnaire.template.name);
        }
      });
      
      const uniqueTemplates = Array.from(templatesMap, ([id, name]) => ({ id, name }));
      setAvailableTemplates(uniqueTemplates);

      if (uniqueTemplates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(uniqueTemplates[0].id);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching all questionnaires:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredByTemplate = useMemo(() => {
    if (!selectedTemplateId) return allQuestionnaires; // אם לא נבחרה תבנית, הצג הכל
    return allQuestionnaires.filter(q => q.template?.id === selectedTemplateId);
  }, [selectedTemplateId, allQuestionnaires]);

  const processedData = useMemo(() => {
    let dataToProcess = [...filteredByTemplate];
    
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      dataToProcess = dataToProcess.filter(item =>
        (item.intervieweeId?.includes(lowercasedFilter)) ||
        (item.intervieweeFirstName?.toLowerCase().includes(lowercasedFilter)) ||
        (item.intervieweeLastName?.toLowerCase().includes(lowercasedFilter)) ||
        (item.interviewerName?.toLowerCase().includes(lowercasedFilter))
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

  const dynamicColumns = useMemo(() => {
    if (!selectedTemplateId) return [];
    const currentTemplateData = allQuestionnaires.find(q => q.template?.id === selectedTemplateId)?.template;
    return currentTemplateData?.questions?.filter(q => q.type === 'radio' && q.showInDashboard) || [];
  }, [selectedTemplateId, allQuestionnaires]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    if (processedData.length === 0) {
      alert("אין נתונים לייצוא.");
      return;
    }
    const headers = ['#', 'ת.ז. מרואיין', 'שם מלא (מרואיין)', 'טלפון', 'סטטוס', 'שם המראיין', 'תאריך הגשה'];
    dynamicColumns.forEach(col => headers.push(col.label));

    const dataToExport = processedData.map((q, index) => {
      const row = [
        index + 1, q.intervieweeId, `${q.intervieweeLastName || ''} ${q.intervieweeFirstName || ''}`,
        q.intervieweePhone || '', q.status || 'בוצע', q.interviewerName,
        q.submissionTimestamp?.toDate().toLocaleString('he-IL') || ''
      ];
      dynamicColumns.forEach(col => {
        const answer = q.answers[col.id];
        row.push(Array.isArray(answer) ? answer.join(', ') : (answer || '-'));
      });
      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataToExport]);
    worksheet['!cols'] = headers.map(header => ({ wch: Math.max(header.length, 18) }));
    worksheet['!rtl'] = true;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "שאלונים");
    const templateName = availableTemplates.find(t => t.id === selectedTemplateId)?.name || 'כל-השאלונים';
    XLSX.writeFile(workbook, `${templateName}.xlsx`);
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
            <option value="">הצג הכל</option>
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
