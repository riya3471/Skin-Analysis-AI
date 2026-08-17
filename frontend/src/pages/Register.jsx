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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { width: '0%', text: 'Enter password', color: 'bg-secondary', textColor: 'text-muted' };
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;

    if (score <= 25) return { width: '25%', text: 'Weak', color: 'bg-danger', textColor: 'text-danger' };
    if (score <= 75) return { width: '65%', text: 'Medium', color: 'bg-warning', textColor: 'text-warning' };
    return { width: '100%', text: 'Strong', color: 'bg-success', textColor: 'text-success' };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return;

    setIsSubmitting(true);
    const res = await register(fullName, email, password, confirmPassword);
    setIsSubmitting(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <section className="register-section py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="p-4 p-md-5 bg-white rounded-4 shadow-sm border">
              <div className="text-center mb-4">
                <span className="hero-tag">Join Skiné</span>
                <h1 className="fw-bold mt-2" style={{ color: 'var(--green-dark, #1b3326)' }}>
                  Create Account
                </h1>
                <p className="small text-muted">
                  Start tracking your skin biomarkers and receiving customized AI skincare regimens.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Full Name</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Email Address</label>
                  <input
                    type="email"
                    className="form-control custom-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Password (min. 6 characters)</label>
                  <div className="position-relative mb-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control custom-input pe-5"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                      tabIndex={-1}
                    >
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>

                  {/* Strength Meter */}
                  <div className="progress" style={{ height: '4px', borderRadius: '10px', background: '#e2e8f0' }}>
                    <div
                      className={`progress-bar ${strength.color}`}
                      style={{ width: strength.width, transition: 'all 0.3s ease' }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                      Strength: <strong className={strength.textColor}>{strength.text}</strong>
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Confirm Password</label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control custom-input pe-5"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                      tabIndex={-1}
                    >
                      <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {!passwordsMatch && (
                    <span className="small text-danger mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                      Passwords do not match.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !passwordsMatch}
                  className="hero-btn w-100 justify-content-center py-3"
                >
                  <i className="fa-solid fa-user-plus me-2"></i>
                  {isSubmitting ? 'Creating Account...' : 'Register Account'}
                </button>

                <div className="text-center mt-4">
                  <p className="mb-0 small text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="fw-bold text-success text-decoration-none">
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
