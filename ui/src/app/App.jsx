import React, { useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Content, Theme } from '@carbon/react';
import Shell from './Shell.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Assessment from '../pages/Assessment.jsx';
import Settings from '../pages/Settings.jsx';
import { getToken, setToken, clearToken } from '../lib/auth.js';

export default function App() {
  const [token, setTok] = useState(getToken());
  const [theme, setTheme] = useState(localStorage.getItem('bcm_theme') || 'g100');
  const authed = useMemo(() => !!token, [token]);
  const navigate = useNavigate();

  const onLogin = (t) => { setToken(t); setTok(t); navigate('/'); };
  const onLogout = () => { clearToken(); setTok(null); navigate('/login'); };
  const toggleTheme = () => {
    const next = theme === 'g100' ? 'white' : 'g100';
    setTheme(next);
    localStorage.setItem('bcm_theme', next);
  };

  return (
    <Theme theme={theme}>
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/*" element={
          authed ? (
            <Shell onLogout={onLogout} onToggleTheme={toggleTheme} theme={theme}>
              <Content>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/assessment/:id" element={<Assessment />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Content>
            </Shell>
          ) : (<Navigate to="/login" />)
        }/>
      </Routes>
    </Theme>
  );
}
