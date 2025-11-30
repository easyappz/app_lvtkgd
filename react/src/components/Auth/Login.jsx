import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(formData);
    if (!success) {
      setError('Неверный логин или пароль');
    }
    setLoading(false);
  };

  return (
    <div data-easytag="id8-src/components/Auth/Login.jsx" className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 style={{ color: '#4C75A0', marginBottom: '1.5rem', fontSize: '28px' }}>Вход в аккаунт</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="auth-input"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="auth-input"
              disabled={loading}
            />
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
          <p style={{ marginTop: '2rem', fontSize: '14px', textAlign: 'center' }}>
            Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export { Login };
