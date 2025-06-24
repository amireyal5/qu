import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import QuestionnaireForm from './components/QuestionnaireForm';
import QuestionnaireList from './components/QuestionnaireList';
import Navbar from './components/Navbar';
import TemplateSelection from './components/TemplateSelection';

function App() {
  return <AuthProvider><Router><AppContent /></Router></AuthProvider>;
}

function AppContent() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center' }}><h2>טוען...</h2></div>;
  }

  // מקרה 1: המשתמש מחובר
  if (currentUser) {
    return (
      <>
        <header style={{ backgroundColor: 'var(--white-bg)', boxShadow: 'var(--container-shadow)' }}>
          <div className="container"><Navbar /></div>
        </header>
        <main className="container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<TemplateSelection />} />
            <Route path="/form/:templateId" element={<QuestionnaireForm />} />
            <Route path="/list" element={<QuestionnaireList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </>
    );
  }

  // מקרה 2: המשתמש לא מחובר
  return (
    <div className="container">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  );
}

export default App;