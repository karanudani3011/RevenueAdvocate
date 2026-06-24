import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Header({ currentTab }) {
  const { currentUser, theme, toggleTheme, activities, language, setLanguage, t } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard': return t('Chambers Dashboard');
      case 'clients':   return t('Client Directory');
      case 'cases':     return t('Case Portfolios');
      case 'finance':   return t('Financial Ledgers');
      case 'profile':   return t('My Profile');
      default:          return t('Advocate Panel');
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
          {t('Welcome back, ')}{currentUser?.name}
        </p>
      </div>

      <div className="header-actions">
        {/* Search */}
        <div className="header-search">
          <input type="text" placeholder={t('Global Search cases, clients...')} />
          <span style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}>🔍</span>
        </div>

        {/* Language dropdown */}
        <div className="language-selector" style={{ position: 'relative' }}>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
              height: '36px',
              fontWeight: '500'
            }}
            id="language-select"
          >
            <option value="en">🇺🇸 English</option>
            <option value="gu">🇮🇳 ગુજરાતી</option>
          </select>
        </div>



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
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{t('Chambers Alerts')}</span>
                <span style={{ color: 'var(--primary)', fontSize: '11px', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>{t('Close')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notificationItems.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>{t('No new notifications')}</p>
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

      </div>

    </header>
  );
}
