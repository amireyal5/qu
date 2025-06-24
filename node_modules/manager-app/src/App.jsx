import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './components/Login';
import ManagerDashboard from './components/ManagerDashboard';
import QuestionnaireDetail from './components/QuestionnaireDetail';
import TemplateList from './components/TemplateList';
import FormBuilder from './components/FormBuilder';
import Navbar from './components/Navbar';

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
  
  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <h2>טוען מערכת ניהול...</h2>
      </div>
    );
  }

  return (
    <>
      {currentUser && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={currentUser ? <ManagerDashboard /> : <Navigate to="/login" />} />
          <Route path="/templates" element={currentUser ? <TemplateList /> : <Navigate to="/login" />} />
          <Route path="/form-builder/:templateId" element={currentUser ? <FormBuilder /> : <Navigate to="/login" />} />
          <Route path="/questionnaire/:id" element={currentUser ? <QuestionnaireDetail /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App; // <-- השורה החשובה