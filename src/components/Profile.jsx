import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function ChangePasswordSection() {
  const { changePassword } = useApp();
  const [oldPassword, setOldPassword]         = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.'); return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    const res = changePassword(oldPassword, newPassword);
    if (res.success) {
      setSuccess('Password updated successfully!');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message || 'Error updating password.');
    }
  };

  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '24px',
      marginTop: '28px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '20px' }}>🔑</span>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Change Password</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Update your login credentials</p>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="success-message" style={{ marginBottom: '16px' }}>
          <span>✅</span> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Current Password</label>
            <div className="input-wrapper">
              <input type="password" className="form-input" placeholder="Current password"
                value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} id="chg-old-pw" />
              <span className="input-icon">🔒</span>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">New Password</label>
            <div className="input-wrapper">
              <input type="password" className="form-input" placeholder="New password"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} id="chg-new-pw" />
              <span className="input-icon">🔒</span>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <input type="password" className="form-input" placeholder="Confirm password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="chg-confirm-pw" />
              <span className="input-icon">🔒</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 28px' }} id="save-pw-btn">
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Profile() {
  const { currentUser } = useApp();
  if (!currentUser) return null;

  const getInitials = (name) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const roleColor = {
    'Super Admin (Advocate)': { from: '#2563eb', to: '#8b5cf6' },
    'Accountant':             { from: '#10b981', to: '#3b82f6' },
  };
  const colors = roleColor[currentUser.role] || { from: '#3b82f6', to: '#8b5cf6' };

  const infoRows = [
    { icon: '👤', label: 'Full Name',        value: currentUser.name },
    { icon: '🎭', label: 'Role',             value: currentUser.role },
    { icon: '📧', label: 'Email Address',    value: currentUser.email      || 'N/A' },
    { icon: '📱', label: 'Phone Number',     value: currentUser.phone      || 'N/A' },
    { icon: '🪪', label: 'Bar Licence No.',  value: currentUser.licenceNumber || 'N/A' },
    { icon: '🔐', label: 'Username',         value: currentUser.username },
  ];

  return (
    <div className="animated-fade" style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* Profile Hero Banner */}
      <div className="glass-panel" style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '24px'
      }}>
        {/* Gradient banner */}
        <div style={{
          height: '120px',
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)'
          }} />
          <div style={{
            position: 'absolute', top: '16px', right: '24px',
            fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase', letterSpacing: '1.5px'
          }}>
            LEXJURIS CHAMBERS — MEMBER PROFILE
          </div>
        </div>

        <div style={{ padding: '0 32px 32px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: '84px', height: '84px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '32px', fontWeight: '800',
            border: '4px solid var(--bg-secondary)',
            boxShadow: `0 8px 24px ${colors.from}40`,
            marginTop: '-42px',
            position: 'relative',
            zIndex: 2
          }}>
            {getInitials(currentUser.name)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '12px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                {currentUser.name}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {currentUser.role}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  background: `${colors.from}20`, color: colors.from,
                  border: `1px solid ${colors.from}30`, textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  ✓ Active Member
                </span>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  background: 'var(--success-bg)', color: 'var(--success)',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}>
                  ⚖️ {currentUser.licenceNumber || 'Registered'}
                </span>
              </div>
            </div>

            {/* Licence Image / Badge */}
            <div style={{
              width: '130px', height: '86px',
              borderRadius: 'var(--radius-md)',
              background: `linear-gradient(135deg, ${colors.from}15, ${colors.to}15)`,
              border: `2px dashed ${colors.from}40`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
              title="Licence / ID Card"
            >
              <span style={{ fontSize: '28px' }}>🪪</span>
              <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.3' }}>
                BAR ID CARD<br />
                <span style={{ color: colors.from }}>View / Upload</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '4px'
      }}>
        {infoRows.map(row => (
          <div key={row.label} className="glass-panel" style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            borderRadius: 'var(--radius-md)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
              background: `linear-gradient(135deg, ${colors.from}18, ${colors.to}18)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px'
            }}>
              {row.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>
                {row.label}
              </p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Change Password — only shown in Profile */}
      <ChangePasswordSection />
    </div>
  );
}
