import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();

    const activeLinkStyle = {
      fontWeight: '700',
      color: 'var(--primary-blue)',
      borderBottom: '2px solid var(--primary-blue)',
      paddingBottom: '4px'
    };
    
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/"><h1>מערכת מראיין</h1></NavLink>
            </div>
            <div className="navbar-links">
                <NavLink to="/" style={({ isActive }) => isActive && window.location.pathname === '/' ? activeLinkStyle : undefined} end>
                    <i className="fa-solid fa-pen-to-square"></i>
                    <span>בחירת שאלון</span>
                </NavLink>
                <NavLink to="/list" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <i className="fa-solid fa-list-ol"></i>
                    <span>השאלונים שלי</span>
                </NavLink>
            </div>
            <div className="navbar-user-info">
                <span>
                    <i className="fa-solid fa-user"></i>
                    שלום, {userProfile?.firstName || 'מראיין'}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{padding: '8px 16px'}}>
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>התנתק</span>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
