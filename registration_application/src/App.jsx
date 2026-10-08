/* ==========================================================================
   REACT APP COMPONENT (src/App.jsx)
   Handles Controlled Form States, Real-Time Validation, Password Strength,
   Auth Module Calls, and Dashboard Rendering.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  getCurrentSession,
  logoutUser
} from './auth';

export default function App() {
  // Application State
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Controlled Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation Error States
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [serverMessage, setServerMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check existing session on component mount
  useEffect(() => {
    const existingSession = getCurrentSession();
    if (existingSession) {
      setSession(existingSession);
    }
  }, []);

  // Calculate Password Strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', colorClass: '' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', colorClass: 'strength-Weak' };
      case 2:
        return { score: 50, label: 'Fair', colorClass: 'strength-Fair' };
      case 3:
        return { score: 75, label: 'Good', colorClass: 'strength-Good' };
      case 4:
        return { score: 100, label: 'Strong', colorClass: 'strength-Strong' };
      default:
        return { score: 10, label: 'Weak', colorClass: 'strength-Weak' };
    }
  };

  const passwordStrength = getPasswordStrength(registerForm.password);

  // Clear messages on tab switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setServerMessage({ type: '', text: '' });
    setLoginErrors({});
    setRegisterErrors({});
  };

  // ==========================================================================
  // REGISTRATION HANDLERS
  // ==========================================================================
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    if (registerErrors[name]) {
      setRegisterErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateRegisterForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!registerForm.username.trim()) {
      errors.username = 'Username is required.';
    } else if (!usernameRegex.test(registerForm.username.trim())) {
      errors.username = 'Username must be 3-20 characters (letters, numbers, underscores).';
    }

    if (!registerForm.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(registerForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!registerForm.password) {
      errors.password = 'Password is required.';
    } else if (registerForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerMessage({ type: '', text: '' });

    if (!validateRegisterForm()) return;

    setIsSubmitting(true);
    const result = await registerUser({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    });
    setIsSubmitting(false);

    if (result.success) {
      setServerMessage({ type: 'success', text: result.message });
      // Pre-fill login email and switch tabs after 1.5s
      setTimeout(() => {
        setLoginForm(prev => ({ ...prev, email: registerForm.email }));
        setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
        handleTabSwitch('login');
      }, 1500);
    } else {
      setServerMessage({ type: 'error', text: result.message });
    }
  };

  // ==========================================================================
  // LOGIN HANDLERS
  // ==========================================================================
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    if (loginErrors[name]) {
      setLoginErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginForm.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(loginForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!loginForm.password) {
      errors.password = 'Password is required.';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerMessage({ type: '', text: '' });

    if (!validateLoginForm()) return;

    setIsSubmitting(true);
    const result = await loginUser({
      email: loginForm.email,
      password: loginForm.password
    });
    setIsSubmitting(false);

    if (result.success) {
      setSession(result.user);
      setLoginForm({ email: '', password: '' });
    } else {
      setServerMessage({ type: 'error', text: result.message });
    }
  };

  // Logout Handler
  const handleLogout = () => {
    logoutUser();
    setSession(null);
    setServerMessage({ type: '', text: '' });
  };

  // ==========================================================================
  // VIEW RENDERER
  // ==========================================================================

  // 1. DASHBOARD VIEW (If Logged In)
  if (session) {
    return (
      <div className="app-viewport">
        <div className="glow-shape-1"></div>
        <div className="glow-shape-2"></div>

        <div className="auth-card dashboard-card">
          <div className="dashboard-header">
            <div>
              <span className="welcome-badge">Active Session</span>
              <h1 className="user-title">Welcome, {session.username}!</h1>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Log Out
            </button>
          </div>

          <div className="dashboard-grid">
            <div className="info-box">
              <span className="info-label">Username</span>
              <p className="info-val">@{session.username}</p>
            </div>

            <div className="info-box">
              <span className="info-label">Email Address</span>
              <p className="info-val">{session.email}</p>
            </div>

            <div className="info-box">
              <span className="info-label">Account Security</span>
              <div>
                <span className="session-badge">⚡ Authenticated (WebCrypto SHA-256)</span>
              </div>
            </div>

            <div className="info-box">
              <span className="info-label">Login Session Time</span>
              <p className="info-val" style={{ fontSize: '0.9rem' }}>{session.loggedInAt}</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Session stored in <code>sessionStorage</code> | Users database persisted in <code>localStorage</code>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTH VIEW (Login & Registration Forms)
  return (
    <div className="app-viewport">
      <div className="glow-shape-1"></div>
      <div className="glow-shape-2"></div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="brand-badge">🔐 AuthVault Security</div>
          <h1 className="auth-title">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="auth-subtitle">
            {activeTab === 'login'
              ? 'Enter your email and password to sign in'
              : 'Register your details with Web Crypto hashing'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('register')}
          >
            Register
          </button>
        </div>

        {/* Server Message Alerts */}
        {serverMessage.text && (
          <div className={`alert-box ${serverMessage.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {serverMessage.type === 'error' ? '❌' : '🎉'} {serverMessage.text}
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-container">
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="name@example.com"
                  className={loginErrors.email ? 'input-error' : ''}
                />
              </div>
              {loginErrors.email && <span className="field-error">{loginErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  className={loginErrors.password ? 'input-error' : ''}
                />
              </div>
              {loginErrors.password && <span className="field-error">{loginErrors.password}</span>}
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>

            <p className="switch-auth-text">
              Don't have an account?
              <button type="button" className="link-btn" onClick={() => handleTabSwitch('register')}>
                Register here
              </button>
            </p>
          </form>
        )}

        {/* REGISTRATION FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <div className="input-container">
                <input
                  type="text"
                  id="reg-username"
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  placeholder="e.g. rohith_m"
                  className={registerErrors.username ? 'input-error' : ''}
                />
              </div>
              {registerErrors.username && <span className="field-error">{registerErrors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-container">
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="name@example.com"
                  className={registerErrors.email ? 'input-error' : ''}
                />
              </div>
              {registerErrors.email && <span className="field-error">{registerErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Min. 8 characters"
                  className={registerErrors.password ? 'input-error' : ''}
                />
              </div>
              {registerErrors.password && <span className="field-error">{registerErrors.password}</span>}

              {/* Password Strength Meter */}
              {registerForm.password.length > 0 && (
                <div className="strength-meter">
                  <div className="strength-bar-bg">
                    <div
                      className="strength-bar-fill"
                      style={{
                        width: `${passwordStrength.score}%`,
                        backgroundColor:
                          passwordStrength.label === 'Weak'
                            ? '#ef4444'
                            : passwordStrength.label === 'Fair'
                            ? '#f59e0b'
                            : passwordStrength.label === 'Good'
                            ? '#06b6d4'
                            : '#10b981'
                      }}
                    ></div>
                  </div>
                  <div className="strength-text">
                    <span>Password Strength:</span>
                    <span className={passwordStrength.colorClass}>{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirmPassword">Confirm Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="reg-confirmPassword"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Re-enter password"
                  className={registerErrors.confirmPassword ? 'input-error' : ''}
                />
              </div>
              {registerErrors.confirmPassword && (
                <span className="field-error">{registerErrors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="switch-auth-text">
              Already have an account?
              <button type="button" className="link-btn" onClick={() => handleTabSwitch('login')}>
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
