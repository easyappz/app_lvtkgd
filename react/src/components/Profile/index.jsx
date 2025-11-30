import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile/retrieve.js';
import { getMe } from '../../api/auth/me.js';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ email: '', avatar: '' });
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProfile(username);
      setProfile(response.data);
      setEditData({
        email: response.data.email || '',
        avatar: response.data.avatar || '',
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await getMe();
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Failed to load current user');
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchCurrentUser();
  }, [fetchProfile, fetchCurrentUser]);

  const handleEditToggle = () => {
    setEditing(!editing);
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(username, editData);
      fetchProfile();
      setEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const isOwnProfile = currentUser && currentUser.username === username;

  if (loading) {
    return (
      <div data-easytag='id2-src/components/Profile/index.jsx' style={{ padding: '2rem', textAlign: 'center' }}>
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div data-easytag='id2-src/components/Profile/index.jsx' style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {/* Profile Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: profile.avatar ? `url(${profile.avatar}) center/cover no-repeat` : '#e4e6ea',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: profile.avatar ? 'transparent' : '#65676b',
          }}
        >
          {!profile.avatar && profile.username.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: '28px', margin: '0 0 0.5rem', color: '#1c1e21' }}>{profile.username}</h1>
        <div style={{ color: '#65676b', marginBottom: '1rem' }}>
          {new Date(profile.last_seen).toLocaleString('ru-RU')}
        </div>
        {isOwnProfile && (
          <button
            onClick={handleEditToggle}
            style={{
              background: '#5181b8',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {editing ? 'Отмена' : 'Редактировать профиль'}
          </button>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleEditToggle}
        >
          <div
            style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Редактировать профиль</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Email:</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Avatar URL:</label>
                <input
                  type="url"
                  value={editData.avatar}
                  onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#5181b8',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  style={{
                    flex: 1,
                    background: '#e4e6ea',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Info */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>0</div>
            <div style={{ color: '#65676b' }}>друзей</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>0</div>
            <div style={{ color: '#65676b' }}>постов</div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>Посты</h3>
        <div style={{ color: '#65676b', padding: '2rem', textAlign: 'center' }}>Посты пользователя пока недоступны</div>
      </div>
    </div>
  );
};

export { Profile };
