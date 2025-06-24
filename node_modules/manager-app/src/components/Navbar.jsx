import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
    const { currentUser, logout } = useAuth(); // Assuming useAuth is available in context

    const activeLinkStyle = {
      textDecoration: 'underline',
      textUnderlineOffset: '8px',
      color: 'var(--primary-blue)',
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/"><h1>מערכת ניהול</h1></NavLink>
            </div>
            <div className="navbar-links" style={{display: 'flex', gap: '2rem'}}>
                <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>שאלונים שמולאו</NavLink>
                <NavLink to="/templates" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>ניהול תבניות</NavLink>
            </div>
            <div className="navbar-user-info">
                <span>שלום, {currentUser?.email}</span>
                <button onClick={logout} className="btn btn-logout">התנתק</button>
            </div>
        </nav>
    );
}

// You still need to import useAuth or pass currentUser/logout as props
import { useAuth } from '../context/AuthContext';
export default Navbar;