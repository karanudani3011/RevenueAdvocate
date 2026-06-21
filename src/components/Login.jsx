import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login({ onNavigateToForgot }) {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate small latency for premium UI loader feel
    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message || 'Invalid credentials.');
      }
    }, 600);
  };

  return (
    <div className="auth-container animated-fade">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">⚖️</div>
          <h1 className="auth-title">LEXJURIS CHAMBERS</h1>
          <p className="auth-subtitle">Advocate Management & Administrative Portal</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                id="login-username"
              />
              <span className="input-icon">👤</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="login-password"
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <a 
              href="#forgot" 
              className="auth-link" 
              onClick={(e) => {
                e.preventDefault();
                onNavigateToForgot();
              }}
            >
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <span>➔</span>}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <p style={{ fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo Credentials:</p>
          <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>⚖️ <strong>Super Admin:</strong> <code>admin</code> / <code>admin123</code></li>
            <li>💰 <strong>Accountant:</strong> <code>accountant</code> / <code>accountant123</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
