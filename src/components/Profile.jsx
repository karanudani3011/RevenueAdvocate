import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

function ChangePasswordSection() {
  const { changePassword, t } = useApp();
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError(t('Please fill in all fields.') || 'Please fill in all fields.'); 
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('New passwords do not match.') || 'New passwords do not match.'); 
      return;
    }
    if (newPassword.length < 6) {
      setError(t('Password must be at least 6 characters.') || 'Password must be at least 6 characters.'); 
      return;
    }

    setLoading(true);
    const res = await changePassword(newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess(t('Password updated successfully!') || 'Password updated successfully!');
      setNewPassword(''); 
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(res.message || t('Error updating password.'));
    }
  };

  return (
    <div className="profile-card glass-panel" style={{ marginTop: '28px' }}>
      <div className="profile-section-header">
        <span className="profile-section-icon">🔑</span>
        <div>
          <h4 className="profile-section-title">{t('Change Password')}</h4>
          <p className="profile-section-subtitle">{t('Update your login credentials securely')}</p>
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
        <div className="responsive-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('New Password')}</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                className="form-input" 
                placeholder={t('New Password')}
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                id="chg-new-pw" 
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('Confirm Password')}</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                className="form-input" 
                placeholder={t('Confirm Password')}
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                id="chg-confirm-pw" 
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>
        </div>
        <div className="profile-form-footer">
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} disabled={loading}>
            {loading ? t('Updating...') : t('Update Password')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Profile() {
  const { currentUser, updateProfile, t } = useApp();
  const fileInputRef = useRef(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [licenceFile, setLicenceFile] = useState(null);
  const [licencePreview, setLicencePreview] = useState(currentUser?.licenceImageUrl || '');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const getInitials = (nameStr) => {
    if (!nameStr) return '';
    return nameStr.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicencePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError(t('Name field cannot be left blank.') || 'Name field cannot be left blank.');
      return;
    }

    setLoading(true);
    const res = await updateProfile(name, phone, licenceFile || licencePreview);
    setLoading(false);

    if (res.success) {
      setSuccess(t('Profile updated successfully!') || 'Profile updated successfully!');
      setIsEditMode(false);
      setLicenceFile(null);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message || t('Failed to update profile.'));
    }
  };

  const handleCancel = () => {
    setName(currentUser.name || '');
    setPhone(currentUser.phone || '');
    setLicencePreview(currentUser.licenceImageUrl || '');
    setLicenceFile(null);
    setIsEditMode(false);
    setError('');
  };

  return (
    <div className="animated-fade profile-container">
      {/* Profile Hero Banner */}
      <div className="glass-panel profile-banner-card">
        {/* Banner Graphic Header */}
        <div className="profile-banner-graphic">
          <div className="profile-banner-overlay" />
          <div className="profile-banner-meta">
            {t('LEXJURIS CHAMBERS — MEMBER ACCOUNT')}
          </div>
        </div>

        <div className="profile-avatar-details-container">
          {/* Avatar circle */}
          <div className="profile-avatar-circle">
            {getInitials(name || currentUser.name)}
          </div>

          <div className="profile-header-info-row">
            <div style={{ flex: 1 }}>
              <h1 className="profile-display-name">
                {currentUser.name}
              </h1>
              <p className="profile-display-role">
                {currentUser.role}
              </p>
              
              <div className="profile-status-badges">
                <span className="status-badge-active">
                  {t('✓ Active Member')}
                </span>
                <span className="status-badge-licence">
                  {t('⚖️ Verified Account')}
                </span>
              </div>
            </div>

            {/* Toggle View / Edit */}
            <div>
              {!isEditMode ? (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsEditMode(true)}
                  style={{ width: 'auto', padding: '8px 18px', fontSize: '13px' }}
                >
                  {t('✏️ Edit Profile')}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handleCancel}
                    style={{ width: 'auto', padding: '8px 18px', fontSize: '13px' }}
                  >
                    {t('Cancel')}
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    style={{ width: 'auto', padding: '8px 18px', fontSize: '13px' }}
                  >
                    {loading ? t('Saving...') : t('💾 Save')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ margin: '16px 0' }}>
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="success-message" style={{ margin: '16px 0' }}>
          <span>✅</span> {success}
        </div>
      )}

      {/* Main Details Panel */}
      <div className="profile-details-grid">
        {/* Info Column */}
        <div className="profile-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="profile-section-header" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>📋</span>
            <div>
              <h4 className="profile-section-title">{t('Personal Details')}</h4>
              <p className="profile-section-subtitle">{t('Account information details')}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('Full Name')}</label>
              {isEditMode ? (
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                  <span className="input-icon">👤</span>
                </div>
              ) : (
                <div className="profile-static-value">{currentUser.name}</div>
              )}
            </div>

            {/* Email (Always Read-only) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('Email Address')}</label>
              <div className="profile-static-value text-muted-value">{currentUser.email || 'N/A'}</div>
            </div>

            {/* Phone Number */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('Phone Number')}</label>
              {isEditMode ? (
                <div className="input-wrapper">
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                  <span className="input-icon">📱</span>
                </div>
              ) : (
                <div className="profile-static-value">{currentUser.phone || t('Not Specified')}</div>
              )}
            </div>

            {/* Account Role */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('Security Role')}</label>
              <div className="profile-static-value text-muted-value">{t(currentUser.role) || currentUser.role}</div>
            </div>
          </form>
        </div>

        {/* Licence Column */}
        <div className="profile-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="profile-section-header">
            <span style={{ fontSize: '20px' }}>🪪</span>
            <div>
              <h4 className="profile-section-title">{t('Licence Verification')}</h4>
              <p className="profile-section-subtitle">{t('Registered Bar Council identification image')}</p>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
            {licencePreview ? (
              <div className="profile-licence-preview-container">
                <img 
                  src={licencePreview} 
                  alt="Licence ID Card" 
                  className="profile-licence-card-img" 
                />
              </div>
            ) : (
              <div className="profile-licence-placeholder">
                <span>🪪</span>
                <p>{t('No licence card uploaded')}</p>
              </div>
            )}

            {isEditMode && (
              <div>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => fileInputRef.current.click()}
                  style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                >
                  {t('📷 Upload New Image')}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Block */}
      <ChangePasswordSection />
    </div>
  );
}
