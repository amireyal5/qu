import React, { useState } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const validatePassword = (password) => {
    if (password.length < 6) return "הסיסמה חייבת להכיל לפחות 6 תווים.";
    if (!/[A-Z]/.test(password)) return "הסיסמה חייבת להכיל לפחות אות גדולה אחת.";
    return null;
};

function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handlePasswordReset = async () => {
    if (!email) {
      setError("נא הזן את כתובת האימייל שלך בשדה המתאים ולחץ שוב.");
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`מייל לאיפוס סיסמה נשלח לכתובת ${email}.`);
    } catch (err) {
      setError("אירעה שגיאה בשליחת מייל האיפוס.");
      console.error("Password reset error:", err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const auth = getAuth();

    if (isLoginView) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        setError("שגיאה בהתחברות. ודא שהפרטים נכונים.");
      }
    } else {
      if (password !== confirmPassword) {
        setError("הסיסמאות אינן תואמות.");
        setLoading(false);
        return;
      }
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        setLoading(false);
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { email: user.email, firstName, lastName, phone });
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          setError("האימייל הזה כבר קיים במערכת.");
        } else {
          setError("אירעה שגיאה ברישום.");
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="page-container form-container" style={{maxWidth: '600px', margin: 'auto'}}>
      <h2>{isLoginView ? 'התחברות מראיין' : 'הרשמה למערכת'}</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        {!isLoginView && (
          <>
            <div className="form-group"><label>שם פרטי *</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
            <div className="form-group"><label>שם משפחה *</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
            <div className="form-group"><label>טלפון *</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
            <hr />
          </>
        )}
        <div className="form-group"><label>כתובת אימייל *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="form-group"><label>סיסמה *</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {!isLoginView && (
          <div className="form-group"><label>אימות סיסמה *</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
        )}
        {message && <p className="validation-message info">{message}</p>}
        {error && <p className="validation-message error">{error}</p>}
        <div className="actions-bar" style={{flexDirection: 'column', gap: '1rem'}}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'מעבד...' : (isLoginView ? 'התחבר' : 'הירשם')}</button>
          <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="btn btn-link" style={{backgroundColor: 'transparent', color: 'var(--secondary-blue)'}}>{isLoginView ? 'אין לך חשבון? הירשם' : 'כבר יש לך חשבון? התחבר'}</button>
        </div>
        {isLoginView && (
          <div style={{textAlign: 'center', marginTop: '1rem'}}>
            <button type="button" onClick={handlePasswordReset} className="btn btn-link" style={{fontSize: '0.9rem', backgroundColor: 'transparent', color: 'var(--text-secondary)'}}>שכחתי סיסמה</button>
          </div>
        )}
      </form>
    </div>
  );
}
export default AuthPage;