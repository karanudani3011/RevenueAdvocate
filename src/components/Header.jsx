import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ChangePassword from './ChangePassword';

export default function Header({ currentTab }) {
  const { currentUser, theme, toggleTheme, activities } = useApp();
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Chambers Dashboard';
      case 'clients':
        return 'Client Directory';
      case 'cases':
        return 'Case Portfolios';
      case 'hearings':
        return 'Hearings Schedule';
      case 'finance':
        return 'Financial Ledgers';
      default:
        return 'Advocate Panel';
    }
  };

  // Filter activities for notifications (hearings, payments, auth)
  const notificationItems = activities.slice(0, 5);

  return (
    <header className="header">
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', textTransform: 'capitalize' }}>
          {getTitle()}
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Welcome back, {currentUser?.name}
        </p>
      </div>

      <div className="header-actions">
        {/* Search */}
        <div className="header-search">
          <input type="text" placeholder="Global Search cases, clients..." />
          <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>🔍</span>
        </div>

        {/* Theme Toggle */}
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          id="theme-toggler"
        >
          <span style={{ fontSize: '18px' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            className="theme-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            id="notifications-bell"
          >
            <span style={{ fontSize: '18px' }}>🔔</span>
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: 'var(--danger)',
              borderRadius: '50%'
            }}></span>
          </button>

          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '44px',
              right: '0',
              width: '320px',
              maxHeight: '360px',
              overflowY: 'auto',
              zIndex: 120,
              padding: '16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>Chambers Alerts</span>
                <span style={{ color: 'var(--primary)', fontSize: '11px', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>Close</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notificationItems.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No new notifications</p>
                ) : (
                  notificationItems.map(act => (
                    <div key={act.id} style={{ fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.02)', paddingBottom: '6px' }}>
                      <p style={{ color: 'var(--text-primary)' }}>{act.text}</p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{act.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Change Password Trigger */}
        <button 
          className="header-btn" 
          onClick={() => setIsChangeOpen(true)}
          id="change-pw-btn"
        >
          <span>🔑</span> Change Password
        </button>
      </div>

      <ChangePassword isOpen={isChangeOpen} onClose={() => setIsChangeOpen(false)} />
    </header>
  );
}
