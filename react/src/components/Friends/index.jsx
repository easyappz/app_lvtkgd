import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { getFriendsList } from '../../api/friends/list.js';
import { acceptFriendRequest } from '../../api/friends/accept.js';
import { removeFriend } from '../../api/friends/remove.js';
import { getRequests, rejectRequest } from '../../api/friends/requests.js';
import { searchUsers } from '../../api/friends/search.js';

const Friends = () => {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const timeoutRef = useRef(null);

  const loadFriends = async () => {
    if (!me?.username) return;
    try {
      const res = await getFriendsList(me.username);
      setFriends(res.data.results || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadRequests = async () => {
    if (!me?.username) return;
    setLoadingRequests(true);
    try {
      const res = await getRequests(me.username);
      setRequests(res.data.results || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadFriends(), loadRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [me]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchQuery.trim().length >= 3) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const res = await searchUsers(searchQuery.trim());
          setSearchResults(res.data.results || []);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleAcceptRequest = async (requestId) => {
    if (!me?.username) return;
    try {
      await acceptFriendRequest(me.username, requestId);
      loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!me?.username) return;
    try {
      await rejectRequest(me.username, requestId);
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleRemove = async (friendUsername) => {
    if (!me?.username) return;
    try {
      await removeFriend(me.username, friendUsername);
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const flexStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem'
  };

  const imgStyle = {
    width: 60,
    height: 60,
    borderRadius: '50%',
    marginRight: '1rem',
    objectFit: 'cover'
  };

  const onlineStyle = {
    display: 'flex',
    alignItems: 'center'
  };

  const statusDot = (isOnline) => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: isOnline ? '#00ff00' : '#ccc',
    marginRight: '0.5rem'
  });

  const statusText = (isOnline) => ({
    color: isOnline ? '#28a745' : '#6c757d',
    fontSize: '0.9rem'
  });

  const buttonStyle = (bgColor) => ({
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    backgroundColor: bgColor
  });

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '1rem',
    boxSizing: 'border-box',
    fontSize: '1rem'
  };

  const toggleButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '300px'
  };

  return (
    <div data-easytag="id3-src/components/Friends/index.jsx" style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
      <h1 style={{color: '#4c75a3', marginBottom: '2rem'}}>Друзья</h1>
      {loading ? (
        <div>Загрузка друзей и запросов...</div>
      ) : (
        <>
          <div style={gridStyle}>
            {friends.map((friend) => (
              <div key={friend.username} style={cardStyle}>
                <div style={flexStyle}>
                  <img 
                    src={friend.avatar || 'https://via.placeholder.com/60x60/4c75a3/ffffff?text=%F0%9F%91%A4'} 
                    alt={friend.username}
                    style={imgStyle}
                  />
                  <div>
                    <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{friend.username}</div>
                    <div style={onlineStyle}>
                      <span style={statusDot(friend.is_online)}></span>
                      <span style={statusText(friend.is_online)}>
                        {friend.is_online ? 'онлайн' : 'оффлайн'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(friend.username)}
                  style={buttonStyle('#dc3545')}
                >
                  Удалить
                </button>
              </div>
            ))}
            {friends.length === 0 && <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#6c757d'}}>У вас нет друзей</div>}
          </div>

          <h2 style={{color: '#4c75a3', margin: '2rem 0 1rem 0'}}>Запросы в друзья</h2>
          {loadingRequests ? (
            <div>Загрузка запросов...</div>
          ) : (
            <div style={gridStyle}>
              {requests.map((request) => (
                <div key={request.id} style={cardStyle}>
                  <div style={flexStyle}>
                    <img 
                      src={request.from_member?.avatar || 'https://via.placeholder.com/60x60/4c75a3/ffffff?text=%F0%9F%91%A4'} 
                      alt={request.from_member?.username}
                      style={imgStyle}
                    />
                    <div>
                      <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{request.from_member?.username}</div>
                      <div style={onlineStyle}>
                        <span style={statusDot(request.from_member?.is_online)}></span>
                        <span style={statusText(request.from_member?.is_online)}>
                          {request.from_member?.is_online ? 'онлайн' : 'оффлайн'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                    <button 
                      onClick={() => handleAcceptRequest(request.id)}
                      style={buttonStyle('#28a745')}
                    >
                      Принять
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id)}
                      style={buttonStyle('#dc3545')}
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
              {requests.length === 0 && <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#6c757d'}}>Нет входящих запросов</div>}
            </div>
          )}

          <div style={{marginTop: '2rem'}}>
            <button 
              onClick={() => setShowSearch(!showSearch)}
              style={toggleButtonStyle}
            >
              {showSearch ? 'Скрыть поиск' : 'Поиск пользователей'}
            </button>
          </div>

          {showSearch && (
            <div style={{marginTop: '1rem'}}>
              <h2 style={{color: '#4c75a3', marginBottom: '1rem'}}>Поиск пользователей</h2>
              <input 
                type="text"
                placeholder="Введите имя пользователя (минимум 3 символа)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={inputStyle}
              />
              {searchResults.length > 0 ? (
                <div style={{...gridStyle, marginTop: '1rem'}}>
                  {searchResults.map((result) => (
                    <div 
                      key={result.username}
                      onClick={() => navigate(`/profile/${result.username}`)}
                      style={{
                        ...cardStyle,
                        cursor: 'pointer',
                        ':hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                      }}
                    >
                      <div style={flexStyle}>
                        <img 
                          src={result.avatar || 'https://via.placeholder.com/60x60/4c75a3/ffffff?text=%F0%9F%91%A4'} 
                          alt={result.username}
                          style={imgStyle}
                        />
                        <div>
                          <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{result.username}</div>
                          <div style={onlineStyle}>
                            <span style={statusDot(result.is_online)}></span>
                            <span style={statusText(result.is_online)}>
                              {result.is_online ? 'онлайн' : 'оффлайн'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 3 ? (
                <div style={{textAlign: 'center', color: '#6c757d', marginTop: '1rem'}}>Ничего не найдено</div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { Friends };
