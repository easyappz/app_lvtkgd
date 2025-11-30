import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const closeMobileSidebar = () => {
    if (window.innerWidth < 768) {
      document.body.classList.remove('sidebar-open');
    }
  };

  const handleLogout = () => {
    logout();
    closeMobileSidebar();
  };

  return (
    <aside data-easytag='id6-src/components/Sidebar/index.jsx' className="sidebar">
      <nav>
        <ul>
          {user ? (
            <>
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileSidebar}
                >
                  Лента
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/friends" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileSidebar}
                >
                  Друзья
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/messages" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileSidebar}
                >
                  Сообщения
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to={`/profile/${user.username}`} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileSidebar}
                >
                  Профиль
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/settings" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileSidebar}
                >
                  Настройки
                </NavLink>
              </li>
              <li>
                <button className="nav-link logout" onClick={handleLogout}>
                  Выход
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink 
                  to="/login" 
                  className="nav-link"
                  onClick={closeMobileSidebar}
                >
                  Войти
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/register" 
                  className="nav-link"
                  onClick={closeMobileSidebar}
                >
                  Регистрация
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export { Sidebar };
