import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const getInitials = (username) => {
  if (!username || typeof username !== 'string' || username.trim() === '') return '?';
  return username.trim().charAt(0).toUpperCase();
};

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar-open');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        document.body.classList.remove('sidebar-open');
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header data-easytag="id0-src/components/Header/index.jsx" className="header">
      <div className="logo">
        <div style={{
          width: '42px',
          height: '42px',
          background: '#4C75A0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          marginRight: '1rem'
        }}>
          S
        </div>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4C75A0' }}>Social</span>
      </div>
      <div className="header-actions">
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="user-section" style={{ position: 'relative' }}>
          {user ? (
            <>
              <div 
                className="avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: user.avatar ? `url(${user.avatar}) center/cover` : '#e4e6ea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: user.avatar ? 'transparent' : '#65676b',
                  cursor: 'pointer'
                }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {!user.avatar && getInitials(user.username)}
              </div>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to={`/profile/${user.username}`} onClick={() => setUserMenuOpen(false)}>
                    Профиль
                  </Link>
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)}>
                    Настройки
                  </Link>
                  <button onClick={handleLogout}>
                    Выход
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link">Войти</Link>
              <Link to="/register" className="auth-link primary">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };