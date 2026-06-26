import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login({ onNavigateToForgot }) {
  const { login, signUp, isSupabaseConfigured } = useApp();
  
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenceImage, setLicenceImage] = useState(null);
  const [licencePreview, setLicencePreview] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicencePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setLicenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicencePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setLicenceImage(null);
    setLicencePreview('');
  };

  const handleToggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
    setSuccess('');
    // Clear inputs
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setLicenceImage(null);
    setLicencePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isSignUpMode) {
      // Signup Validation
      if (!name || !email || !password || !phone) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (!licenceImage) {
        setError('Please upload your Bar Licence Image.');
        return;
      }

      setLoading(true);
      const res = await signUp(name, email, password, phone, licenceImage);
      setLoading(false);

      if (res.success) {
        setSuccess(res.message || 'Account created successfully! Logging you in...');
        if (!isSupabaseConfigured) {
          // Mock signUp logs user in immediately
          setTimeout(() => {
            // Already logged in in AppContext
          }, 1000);
        } else {
          // Supabase signup might require login
          setTimeout(() => {
            setIsSignUpMode(false);
            setSuccess('Please log in with your registered credentials.');
          }, 2000);
        }
      } else {
        setError(res.message || 'Registration failed.');
      }

    } else {
      // Login Validation
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }

      setLoading(true);
      const res = await login(email, password);
      setLoading(false);

      if (!res.success) {
        setError(res.message || 'Invalid email or password.');
      }
    }
  };

  return (
    <div className="auth-container animated-fade">
      <div className="auth-card glass-panel" style={{ maxWidth: isSignUpMode ? '520px' : '440px' }}>
        <div className="auth-header">
          <div className="auth-logo">⚖️</div>
          <h1 className="auth-title">LEXJURIS CHAMBERS</h1>
          <p className="auth-subtitle">
            {isSignUpMode ? 'Advocate Registration Portal' : 'Advocate Management & Administrative Portal'}
          </p>
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

        <form onSubmit={handleSubmit} noValidate>
          {isSignUpMode && (
            <>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Adv. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="signup-name"
                    required
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    id="signup-phone"
                    required
                  />
                  <span className="input-icon">📱</span>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="input-wrapper">
              <input
                type="email"
                className="form-input"
                placeholder="name@lexjuris.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="auth-email"
                required
              />
              <span className="input-icon">✉️</span>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="input-wrapper">
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="auth-password"
                required
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>

          {isSignUpMode && (
            /* Licence Image Upload Area */
            <div className="form-group">
              <label className="form-label">Bar Licence Image *</label>
              {!licencePreview ? (
                <div 
                  className="licence-dropzone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('licence-file-input').click()}
                >
                  <span style={{ fontSize: '24px' }}>📤</span>
                  <p className="dropzone-text">Drag & drop your Licence photo here, or <span>browse</span></p>
                  <span className="dropzone-sub">Supports PNG, JPG, JPEG (Max 5MB)</span>
                  <input 
                    type="file" 
                    id="licence-file-input" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="licence-preview-card">
                  <img src={licencePreview} alt="Licence preview" className="licence-preview-img" />
                  <div className="licence-preview-details">
                    <span className="licence-file-name">{licenceImage?.name || 'licence-image.png'}</span>
                    <button type="button" className="licence-remove-btn" onClick={handleRemoveImage}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isSignUpMode && (
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
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isSignUpMode ? 'Register & Sign In' : 'Sign In')}
            {!loading && <span>➔</span>}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isSignUpMode ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button 
            type="button" 
            className="auth-link" 
            onClick={handleToggleMode}
            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUpMode ? 'Log In' : 'Sign Up'}
          </button>
        </div>


      </div>
    </div>
  );
}
