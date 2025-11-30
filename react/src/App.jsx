import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import Sidebar from './components/Sidebar';
import { Home } from './components/Home';
import { Profile } from './components/Profile';
import { Friends } from './components/Friends';
import { Messages } from './components/Messages';
import { Settings } from './components/Settings';

function App() {
  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/', '/profile/:username', '/friends', '/messages', '/settings']);
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div data-easytag='id1-src/App.jsx' className="App">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
