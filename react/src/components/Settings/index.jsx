import React, { useState, useEffect } from 'react';
import { getMe } from '../../api/auth/me.js';
import { updateProfile } from '../../api/profile/update.js';
import { logout } from '../../api/auth/logout.js';

const Settings = () => {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({email: '', avatar: ''});
  const [loading, setLoading] = useState(false);

  const loadMe = async () => {
    try {
      const res = await getMe();
      setMe(res.data);
      setForm({email: res.data.email || '', avatar: res.data.avatar || ''});
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!me) return;
    setLoading(true);
    try {
      await updateProfile(me.username, form);
      await loadMe();
      alert('Профиль обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      window.location.href = '/';
    }
  };

  return (
    <div data-easytag='id5-src/components/Settings/index.jsx' style={{padding: '2rem', maxWidth: '600px', margin: '0 auto'}}>
      <h1 style={{color: '#4c75a3', marginBottom: '2rem'}}>Настройки профиля</h1>
      {me ? (
        <div>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <img 
              src={me.avatar || 'https://via.placeholder.com/120x120/4c75a3/ffffff?text=%F0%9F%91%A4'} 
              alt="Avatar"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #4c75a3',
                marginBottom: '1rem'
              }}
            />
            <h2 style={{color: '#333'}}>{me.username}</h2>
          </div>
          <form onSubmit={handleUpdate} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333'}}>Email:</label>
              <input 
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333'}}>Avatar URL:</label>
              <input 
                type="url"
                value={form.avatar}
                onChange={(e) => setForm({...form, avatar: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem'
              }}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              marginTop: '1rem',
              width: '100%'
            }}
          >
            Выйти из аккаунта
          </button>
        </div>
      ) : (
        <div>Загрузка профиля...</div>
      )}
    </div>
  );
};

export { Settings };