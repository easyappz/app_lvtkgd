import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChats } from '../../api/messages/chats.js';
import { getChatMessages } from '../../api/messages/messages.js';
import { sendMessage } from '../../api/messages/send.js';
import { updateLastSeen } from '../../api/messages/lastSeen.js';

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);

  const colors = {
    primary: '#4a76a8',
    bg: '#f7f9fb',
    chatBg: '#fafbfc',
    bubbleOwn: '#e4f3fd',
    bubbleOwnText: '#2e414e',
    bubbleOther: '#ffffff',
    bubbleBorder: '#dee2e6',
    text: '#2c2e2f',
    textSecondary: '#93959b',
    online: '#6dbe56',
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'сейчас';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + '\n' +
           date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const now = new Date();
    const seen = new Date(lastSeen);
    return (now - seen) < 5 * 60 * 1000;
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') return '?';
    const words = name.trim().split(' ');
    if (words.length === 0) return '?';
    const first = words[0][0]?.toUpperCase() || '?';
    const second = words[1]?.[0]?.toUpperCase() || '';
    return first + second;
  };

  const Avatar = ({ name, size = 40, isOnline: online }) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: Math.floor(size / 3),
        fontWeight: 'bold',
        position: 'relative',
      }}
    >
      {getInitials(name)}
      {online && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.online,
            border: '2px solid white',
          }}
        />
      )}
    </div>
  );

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const { data } = await getChats(1, 20);
      setChats(data.results || data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    setLoadingMessages(true);
    try {
      const { data } = await getChatMessages(chatId, 1, 50);
      setMessages(data.results || data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const handleChatSelect = useCallback(async (chat) => {
    setCurrentChat(chat);
    await loadMessages(chat.id);
    // Update last seen for opponent
    if (chat.opponent_id) {
      try {
        await updateLastSeen(chat.opponent_id);
      } catch (error) {
        console.error('Error updating last seen:', error);
      }
    }
  }, [loadMessages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !currentChat) return;
    try {
      await sendMessage(currentChat.id, { text: input.trim() });
      setInput('');
      loadMessages(currentChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [input, currentChat, loadMessages]);

  // Polling for chats
  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, [loadChats]);

  // Polling for messages when chat selected
  useEffect(() => {
    if (!currentChat?.id) return;
    loadMessages(currentChat.id);
    const interval = setInterval(() => loadMessages(currentChat.id), 10000);
    return () => clearInterval(interval);
  }, [currentChat?.id, loadMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Responsive
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    flexDirection: isMobile ? 'column' : 'row',
    backgroundColor: colors.bg,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const sidebarStyle = {
    flex: isMobile ? '1 1 100%' : '0 0 350px',
    maxHeight: isMobile ? '40vh' : '100vh',
    overflow: 'auto',
    backgroundColor: 'white',
    borderRight: isMobile ? 'none' : '1px solid #e6e9f0',
    boxShadow: isMobile ? 'none' : '0 2px 10px rgba(0,0,0,0.1)',
  };

  const mainStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const messagesContainerStyle = {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
    backgroundColor: colors.chatBg,
  };

  return (
    <div data-easytag='id4-src/components/Messages/index.jsx' style={containerStyle}>
      {/* Sidebar - Chats */}
      <div style={sidebarStyle}>
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e6e9f0',
            fontSize: 20,
            fontWeight: 700,
            color: colors.primary,
          }}
        >
          Чаты
        </div>
        {loadingChats ? (
          <div style={{ padding: '20px', textAlign: 'center', color: colors.textSecondary }}>
            Загрузка...
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: colors.textSecondary }}>
            Нет чатов
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              style={{
                display: 'flex',
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f1f3f5',
                backgroundColor: currentChat?.id === chat.id ? '#e3f2fd' : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f0f8ff'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = currentChat?.id === chat.id ? '#e3f2fd' : 'transparent'; }}
            >
              <Avatar
                name={chat.name}
                size={48}
                isOnline={isOnline(chat.opponent_last_seen || chat.last_seen)}
              />
              <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontWeight: 600, color: colors.text, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.name}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, minWidth: 40, textAlign: 'right' }}>
                    {formatTime(chat.last_time || chat.last_activity)}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.last_preview || chat.last_message?.text?.slice(0, 50) || ' '}
                </div>
                {chat.unread_count > 0 && (
                  <div
                    style={{
                      backgroundColor: '#ff5a5f',
                      color: 'white',
                      borderRadius: 12,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                      marginTop: 4,
                      minWidth: 20,
                      textAlign: 'center',
                    }}
                  >
                    {chat.unread_count}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main chat area */}
      <div style={mainStyle}>
        {currentChat ? (
          <>
            {/* Chat header */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e6e9f0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                name={currentChat.name}
                size={40}
                isOnline={isOnline(currentChat.opponent_last_seen || currentChat.last_seen)}
              />
              <div style={{ marginLeft: 12, flex: 1 }}>
                <div style={{ fontWeight: 600, color: colors.text, fontSize: 16 }}>{currentChat.name}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={messagesContainerStyle}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
                  Загрузка сообщений...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
                  Нет сообщений
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      marginBottom: 16,
                      maxWidth: '70%',
                    }}
                  >
                    <Avatar name={msg.author?.username || 'Unknown'} size={32} />
                    <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{msg.author?.username || 'Unknown'}</span>
                        <span>{formatTime(msg.created_at)}</span>
                      </div>
                      <div
                        style={{
                          padding: '12px 16px',
                          backgroundColor: colors.bubbleOther,
                          borderRadius: 18,
                          border: `1px solid ${colors.bubbleBorder}`,
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: 'white',
                borderTop: '1px solid #e6e9f0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Сообщение..."
                style={{
                  flex: 1,
                  border: '1px solid #e6e9f0',
                  borderRadius: 24,
                  padding: '12px 20px',
                  fontSize: 15,
                  outline: 'none',
                  marginRight: 12,
                }}
                disabled={loadingMessages}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loadingMessages}
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: 20,
                  padding: '12px 24px',
                  fontWeight: 600,
                  cursor: input.trim() && !loadingMessages ? 'pointer' : 'default',
                  opacity: input.trim() && !loadingMessages ? 1 : 0.6,
                }}
              >
                {loadingMessages ? '...' : 'Отправить'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary }}>
            Выберите чат, чтобы начать переписку
          </div>
        )}
      </div>
    </div>
  );
};

export { Messages };