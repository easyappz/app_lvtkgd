import React, { useState, useEffect, useCallback } from 'react';
import { getPosts } from '../../api/posts/list.js';
import { createPost } from '../../api/posts/create.js';
import { toggleLike } from '../../api/posts/like.js';
import { createComment } from '../../api/posts/comment.js';
import { getMe } from '../../api/auth/me.js';

const getInitials = (username) => {
  if (!username || typeof username !== 'string' || username.trim() === '') return '?';
  return username.trim().charAt(0).toUpperCase();
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPosts(1, 20);
      setPosts(response.data.results || []);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await getMe();
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Failed to load current user');
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, [fetchPosts, fetchCurrentUser]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      await createPost({ content: newPostContent });
      setNewPostContent('');
      fetchPosts();
    } catch (err) {
      setError('Failed to create post');
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await toggleLike(postId);
      fetchPosts();
    } catch (err) {
      setError('Failed to toggle like');
    }
  };

  const handleComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      await createComment(postId, { text });
      fetchPosts();
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const now = new Date();
    const seen = new Date(lastSeen);
    return (now - seen) < 5 * 60 * 1000;
  };

  if (loading) {
    return (
      <div data-easytag='id2-src/components/Home/index.jsx' style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Загрузка постов...</div>
      </div>
    );
  }

  return (
    <div data-easytag='id2-src/components/Home/index.jsx' style={{ padding: '1rem', maxWidth: '500px', margin: '0 auto' }}>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {/* New Post Form */}
      <form onSubmit={handleCreatePost} style={{ background: '#f0f2f5', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Что у вас нового?"
          style={{
            width: '100%',
            minHeight: '80px',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            resize: 'vertical',
            fontSize: '14px',
            background: 'white',
            marginBottom: '0.5rem',
          }}
        />
        <button
          type="submit"
          disabled={!newPostContent.trim()}
          style={{
            background: '#4C75A0',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: newPostContent.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Опубликовать
        </button>
      </form>

      {/* Posts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Post Header */}
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: post.author?.avatar ? `url(${post.author.avatar}) center/cover` : '#e4e6ea',
                  color: post.author?.avatar ? 'transparent' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                {!post.author?.avatar && getInitials(post.author?.username)}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{post.author?.username || 'Unknown'}</div>
                <div style={{ fontSize: '12px', color: '#65676b' }}>
                  {post.created_at ? new Date(post.created_at).toLocaleString('ru-RU') : 'Неизвестно'}
                </div>
              </div>
              {post.author?.last_seen && isOnline(post.author.last_seen) && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    background: 'green',
                    borderRadius: '50%',
                    marginLeft: 'auto',
                  }}
                />
              )}
            </div>

            {/* Post Content */}
            <div style={{ padding: '0 1rem 1rem' }}>
              <p style={{ margin: '0 0 1rem', whiteSpace: 'pre-wrap' }}>{post.content}</p>

              {/* Media Placeholders */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {post.media_urls.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '100px',
                        height: '100px',
                        background: '#e4e6ea',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#65676b',
                        fontSize: '12px',
                      }}
                    >
                      Media
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #e4e6ea', display: 'flex', gap: '2rem' }}>
              <button
                onClick={() => handleToggleLike(post.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#65676b',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                👍 {post.likes_count || 0}
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#65676b',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                💬 {post.comments_count || 0}
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: '#65676b', padding: '2rem' }}>
          Нет постов. Создайте первый!
        </div>
      )}
    </div>
  );
};

export { Home };