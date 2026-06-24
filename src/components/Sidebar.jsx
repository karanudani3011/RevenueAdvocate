import React from 'react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { currentUser, logout, t } = useApp();

  if (!currentUser) return null;

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const navItems = [
    { id: 'dashboard', label: t('Dashboard'),   icon: '📊' },
    { id: 'clients',   label: t('Clients'),      icon: '👥' },
    { id: 'cases',     label: t('Cases & Files'), icon: '📁' },
    { id: 'finance',   label: t('Financials'),   icon: '💰' },
    { id: 'profile',   label: t('My Profile'),   icon: '👤' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">⚖️</div>
        <div className="sidebar-title">
          <span style={{ fontWeight: '700', color: 'var(--primary)' }}>LEXJURIS</span>
          <span style={{ fontWeight: '400', fontSize: '14px', display: 'block', color: 'var(--text-muted)' }}>{t('Advocate Panel')}</span>
        </div>
      </div>

      <div className="user-profile-badge">
        <div className="avatar">
          {getInitials(currentUser.name)}
        </div>
        <div className="user-info">
          <span className="user-name">{currentUser.name || 'User'}</span>
          <span className="user-role">{(currentUser.role || 'Advocate').split(' ')[0]}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(item.id)}
            id={`nav-tab-${item.id}`}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div 
          className="nav-item" 
          onClick={logout} 
          style={{ color: 'var(--danger)', background: 'transparent' }}
          id="logout-btn"
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>{t('Sign Out')}</span>
        </div>
      </div>
    </aside>
  );
}
