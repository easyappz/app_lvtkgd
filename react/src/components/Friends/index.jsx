import React, { useState, useEffect } from 'react';
import { getMe } from '../../api/auth/me.js';
import { getFriendsList } from '../../api/friends/list.js';
import { sendFriendRequest } from '../../api/friends/request.js';
import { acceptFriendRequest } from '../../api/friends/accept.js';
import { removeFriend } from '../../api/friends/remove.js';

const Friends = () => {
  const [me, setMe] = useState(null);
  const [friends, setFriends] = useState([]);
  const [target, setTarget] = useState('');
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const meRes = await getMe();
      setMe(meRes.data);
      if (meRes.data.username) {
        const friendsRes = await getFriendsList(meRes.data.username);
        setFriends(friendsRes.data.results || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendRequest = async () => {
    if (!me || !target.trim()) return;
    try {
      await sendFriendRequest(me.username, target.trim());
      setTarget('');
      loadData();
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleAccept = async () => {
    if (!me || !requestId) return;
    try {
      await acceptFriendRequest(me.username, parseInt(requestId));
      setRequestId('');
      loadData();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRemove = async (friendUsername) => {
    if (!me) return;
    try {
      await removeFriend(me.username, friendUsername);
      loadData();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  return (
    <div data-easytag="id3-Friends" style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
      <h1 style={{color: '#4c75a3', marginBottom: '2rem'}}>Друзья</h1>
      {loading ? (
        <div>Загрузка друзей...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {friends.map((friend) => (
            <div key={friend.username} style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '1.5rem',
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                <img 
                  src={friend.avatar || 'https://via.placeholder.com/60x60/4c75a3/ffffff?text=%F0%9F%91%A4'} 
                  alt={friend.username}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    marginRight: '1rem',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{friend.username}</div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: friend.is_online ? '#00ff00' : '#ccc',
                      marginRight: '0.5rem'
                    }}></span>
                    <span style={{color: friend.is_online ? '#28a745' : '#6c757d', fontSize: '0.9rem'}}>
                      {friend.is_online ? 'онлайн' : 'оффлайн'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleRemove(friend.username)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px'}}>
        <div>
          <input 
            type="text"
            placeholder="Имя пользователя для запроса в друзья"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              boxSizing: 'border-box'
            }}
          />
          <button 
            onClick={handleSendRequest}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '1rem'
            }}
          >
            Отправить запрос
          </button>
        </div>
        <div>
          <input 
            type="number"
            placeholder="ID запроса для принятия"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              boxSizing: 'border-box'
            }}
          />
          <button 
            onClick={handleAccept}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '1rem'
            }}
          >
            Принять запрос
          </button>
        </div>
      </div>
    </div>
  );
};

export { Friends };