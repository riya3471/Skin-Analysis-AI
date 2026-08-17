import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (val) => {
    if (!val) {
      return { width: '0%', label: 'Enter password', className: '' };
    }
    let score = 0;
    if (val.length >= 6) score += 25;
    if (val.length >= 10) score += 25;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 25;
    if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score += 25;

    if (score <= 25) {
      return { width: `${score}%`, label: 'Weak', className: 'text-danger', barClass: 'bg-danger' };
    } else if (score <= 75) {
      return { width: `${score}%`, label: 'Medium', className: 'text-warning', barClass: 'bg-warning' };
    } else {
      return { width: `${score}%`, label: 'Strong', className: 'text-success', barClass: 'bg-success' };
    }
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match. Please verify and try again.');
      return;
    }
    const res = await register(fullName, email, password, confirmPassword);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <section className="register-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div
              className="register-card p-4 p-md-5 shadow-sm"
              style={{ borderRadius: '20px', background: '#fff', border: '1px solid var(--border)' }}
            >
              <div className="text-center mb-4">
                <span className="hero-tag">Join Skiné</span>
                <h1 className="register-title fw-bold" style={{ color: 'var(--green-dark)' }}>
                  Create Account
                </h1>
                <p className="register-text small text-muted">
                  Start tracking your skin biomarkers and receiving customized AI skincare regimens.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-control custom-input"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control custom-input"
                    placeholder="name@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Password (min. 6 characters)</label>
                  <div className="password-toggle-wrapper mb-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="regPassword"
                      className="form-control custom-input"
                      placeholder="••••••••"
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>

                  {/* Real-time Password Strength Meter */}
                  <div className="progress" style={{ height: '4px', borderRadius: '10px', background: '#e8e3d8' }}>
                    <div
                      id="strengthBar"
                      className={`progress-bar ${strength.barClass || ''}`}
                      role="progressbar"
                      style={{ width: strength.width, transition: 'all 0.3s ease' }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                      Strength: <strong id="strengthLabel" className={strength.className}>{strength.label}</strong>
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Confirm Password</label>
                  <div className="password-toggle-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      id="regConfirmPassword"
                      className="form-control custom-input"
                      placeholder="••••••••"
                      minLength={6}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {!passwordsMatch && (
                    <span id="matchFeedback" className="small text-danger mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                      Passwords do not match.
                    </span>
                  )}
                </div>

                <button type="submit" className="hero-btn w-100 justify-content-center">
                  <i className="fa-solid fa-user-plus me-2"></i>
                  Register Account
                </button>

                <div className="text-center mt-4">
                  <p className="mb-0 small text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="fw-bold" style={{ color: 'var(--green)' }}>
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
