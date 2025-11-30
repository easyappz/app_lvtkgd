import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth/logout';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside data-easytag='id6-src/components/Sidebar/index.jsx' className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Главная
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/friends" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Друзья
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/messages" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Сообщения
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/profile/user1" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Профиль
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Настройки
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout}>
              Выход
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export { Sidebar };
