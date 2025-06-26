import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// קבלת onHelpClick כ-prop
function Navbar({ onHelpClick }) {
    const { currentUser, logout } = useAuth();

    const activeLinkStyle = {
      fontWeight: '700',
      color: 'var(--primary-blue)',
      borderBottom: '2px solid var(--primary-blue)',
      paddingBottom: '4px'
    };
    
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/"><h1>מערכת ניהול</h1></NavLink>
            </div>
            <div className="navbar-links">
                <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>
                    <i className="fa-solid fa-table-list"></i><span>שאלונים שמולאו</span>
                </NavLink>
                <NavLink to="/templates" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <i className="fa-solid fa-file-lines"></i><span>ניהול תבניות</span>
                </NavLink>
                <NavLink to="/exceptions" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <i className="fa-solid fa-triangle-exclamation"></i><span>טיפול בחריגות</span>
                </NavLink>
            </div>
            <div className="navbar-user-info">
                <span><i className="fa-solid fa-user-shield"></i>{currentUser?.email}</span>
                <button onClick={logout} className="btn btn-secondary" style={{padding: '8px 16px'}}>
                    <i className="fa-solid fa-right-from-bracket"></i><span>התנתק</span>
                </button>
                {/* כפתור העזרה החדש */}
                <button onClick={onHelpClick} className="btn btn-link" title="עזרה ומדריך למשתמש" style={{padding: 0}}>
                    <i className="fa-solid fa-circle-question" style={{fontSize: '1.8rem', color: 'var(--text-secondary)'}}></i>
                </button>
            </div>
        </nav>
    );
}
export default Navbar;
