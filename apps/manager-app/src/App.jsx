import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage'; // <-- שימוש בקומפוננטה החדשה
import ManagerDashboard from './components/ManagerDashboard';
import QuestionnaireDetail from './components/QuestionnaireDetail';
import TemplateList from './components/TemplateList';
import FormBuilder from './components/FormBuilder';
import Navbar from './components/Navbar';

// ודא שה-CSS המשותף מיובא בקובץ main.jsx

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
    return <div className="page-container" style={{ textAlign: 'center' }}><h2>טוען...</h2></div>;
  }

  return (
    <>
      {currentUser && <Navbar />}
      <div className="container">
        <Routes>
          {/* אם המשתמש לא מחובר, כל הדרכים מובילות לדף האימות */}
          {!currentUser && (
            <>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          )}

          {/* אם המשתמש מחובר */}
          {currentUser && (
            <>
              <Route path="/" element={<ManagerDashboard />} />
              <Route path="/templates" element={<TemplateList />} />
              <Route path="/form-builder/:templateId" element={<FormBuilder />} />
              <Route path="/questionnaire/:id" element={<QuestionnaireDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </>
  );
}

export default App;
