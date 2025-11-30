import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Home } from './components/Home';
import { Profile } from './components/Profile';
import { Friends } from './components/Friends';
import { Messages } from './components/Messages';
import { Settings } from './components/Settings';
import { updateLastSeen } from './api/messages/lastSeen.js';

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    let interval;
    if (user?.id) {
      const update = async () => {
        try {
          await updateLastSeen(user.id);
        } catch (err) {
          console.error('Failed to update last seen:', err);
        }
      };

      update();
      interval = setInterval(update, 30000);

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          update();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user]);

  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/', '/login', '/register', '/profile/:username', '/friends', '/messages', '/settings']);
    }
  }, []);

  return (
    <div data-easytag='id1-src/App.jsx' className="App">
      <Header />
      <div className="body-layout">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:username" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/friends" element={<RequireAuth><Friends /></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="*" element={<div>Страница не найдена</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
