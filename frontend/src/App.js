import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TradePage from './pages/TradePage';
import PortfolioPage from './pages/PortfolioPage';
import MarketsPage from './pages/MarketsPage';
import AdminFraudPage from './pages/AdminFraudPage';
import Layout from './components/Layout';
import { authAPI } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in, and sync a fresh balance from the server
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      authAPI.getProfile()
        .then(res => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  // Pull the latest user (esp. balance) from the server after a balance-changing action
  const refreshUser = async () => {
    try {
      const res = await authAPI.getProfile();
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      // non-critical
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ── Not logged in → show Login ──
  if (!user) {
    return (
      <Router>
         <Routes>
            <Route path="/login" element={!user ? <LoginPage onLogin={setUser} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <SignupPage onLogin={setUser} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
         </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardPage user={user} />} />
          <Route path="/portfolio" element={<PortfolioPage user={user} onBalanceChange={refreshUser} />} />
          <Route path="/markets" element={<MarketsPage user={user} />} />
          <Route path="/trade" element={<TradePage user={user} onBalanceChange={refreshUser} />} />
          <Route path="/trade/:symbol" element={<TradePage user={user} onBalanceChange={refreshUser} />} />
          <Route path="/stock/:symbol" element={<TradePage user={user} onBalanceChange={refreshUser} />} />

          {/* Admin Route: fraud / anomaly dashboard */}
          {user.role === 'ADMIN' && (
            <Route path="/admin/fraud" element={<AdminFraudPage user={user} />} />
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
