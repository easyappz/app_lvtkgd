import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
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
    const success = await register(formData);
    if (!success) {
      setError('Ошибка регистрации. Возможно, имя пользователя или email уже заняты');
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div data-easytag="id9-src/components/Auth/Register.jsx" className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 style={{ color: '#4C75A0', marginBottom: '1.5rem', fontSize: '28px' }}>Регистрация</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              minLength={3}
              maxLength={30}
              className="auth-input"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="auth-input"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Пароль (минимум 8 символов)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="auth-input"
              disabled={loading}
            />
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
          <p style={{ marginTop: '2rem', fontSize: '14px', textAlign: 'center' }}>
            Уже есть аккаунт? <Link to="/login" className="auth-link">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export { Register };
