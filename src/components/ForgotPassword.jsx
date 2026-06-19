import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ForgotPassword({ onNavigateToLogin }) {
  const { forgotPassword } = useApp();
  const [username, setUsername] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getQuestion = (user) => {
    switch (user.toLowerCase().trim()) {
      case 'admin':
        return 'What is your primary office location branch?';
      case 'staff':
        return 'In which city did you attend staff training?';
      case 'accountant':
        return 'Where did you complete your accountancy degree?';
      default:
        return 'What is your security location?';
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter your username.');
      return;
    }
    const user = username.toLowerCase().trim();
    if (user !== 'admin' && user !== 'staff' && user !== 'accountant') {
      setError('Username not found in system.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!securityAnswer || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const res = forgotPassword(username, securityAnswer, newPassword);
    if (res.success) {
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } else {
      setError(res.message || 'Incorrect answer to security question.');
    }
  };

  return (
    <div className="auth-container animated-fade">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">⚖️</div>
          <h1 className="auth-title">RECOVER ACCESS</h1>
          <p className="auth-subtitle">Secure credential resetting portal</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✅</span> {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNextStep}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  id="forgot-username"
                />
                <span className="input-icon">👤</span>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Verify Account <span>➔</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13.5px' }}>
              <strong>Security Question:</strong>
              <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{getQuestion(username)}</p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Demo Tip: admin &rarr; delhi, staff &rarr; mumbai, accountant &rarr; bangalore</span>
            </div>

            <div className="form-group">
              <label className="form-label">Security Answer</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  id="forgot-answer"
                />
                <span className="input-icon">🔑</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  id="forgot-password"
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  id="forgot-confirm"
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Reset Password
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a
            href="#login"
            className="auth-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToLogin();
            }}
            style={{ fontSize: '14px' }}
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
