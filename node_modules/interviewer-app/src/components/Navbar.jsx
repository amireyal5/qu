import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- הנתיב כאן מתוקן

// רכיב אייקון משתמש
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '8px'}}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
    </svg>
);

function Navbar() {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();

    const activeLinkStyle = {
      textDecoration: 'underline',
      textUnderlineOffset: '8px',
      color: 'var(--primary-blue)',
    };
    
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                {/* הקישור לדף הבית מוביל עכשיו לדף בחירת התבניות */}
                <NavLink to="/"><h1>מערכת מראיין</h1></NavLink>
            </div>
            <div className="navbar-links">
                {/* הקישורים מותאמים למבנה החדש */}
                <NavLink to="/" style={({ isActive }) => isActive && window.location.pathname === '/' ? activeLinkStyle : undefined} end>בחירת שאלון</NavLink>
                <NavLink to="/list" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>השאלונים שלי</NavLink>
            </div>
            <div className="navbar-user-info">
                <span>
                    <UserIcon />
                    שלום, {userProfile?.firstName || 'מראיין'}
                </span>
                <button onClick={handleLogout} className="btn btn-logout">התנתק</button>
            </div>
        </nav>
    );
}

export default Navbar;