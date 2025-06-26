import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import AuthPage from './components/AuthPage';
import ManagerDashboard from './components/ManagerDashboard';
import QuestionnaireDetail from './components/QuestionnaireDetail';
import TemplateList from './components/TemplateList';
import FormBuilder from './components/FormBuilder';
import ExceptionManager from './components/ExceptionManager';
import Navbar from './components/Navbar';
import HelpCenter from './components/HelpCenter'; // ייבוא חדש

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [isHelpOpen, setIsHelpOpen] = useState(false); // State לניהול חלון העזרה

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center' }}><h2>טוען...</h2></div>;
  }

  return (
    <>
      {/* העברת הפונקציה לפתיחת המודאל ל-Navbar */}
      {currentUser && <Navbar onHelpClick={() => setIsHelpOpen(true)} />}
      
      <div className="container">
        <Routes>
          {!currentUser && (
            <>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          )}

          {currentUser && (
            <>
              <Route path="/" element={<ManagerDashboard />} />
              <Route path="/templates" element={<TemplateList />} />
              <Route path="/form-builder/:templateId" element={<FormBuilder />} />
              <Route path="/questionnaire/:id" element={<QuestionnaireDetail />} />
              <Route path="/exceptions" element={<ExceptionManager />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>

      {/* הצגת המודאל בתנאי */}
      {isHelpOpen && <HelpCenter onClose={() => setIsHelpOpen(false)} />}
    </>
  );
}

export default App;
