import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <section className="login-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div
              className="login-card p-4 p-md-5 shadow-sm"
              style={{ borderRadius: '20px', background: '#fff', border: '1px solid var(--border)' }}
            >
              <div className="text-center mb-4">
                <span className="hero-tag">Welcome Back</span>
                <h1 className="login-title fw-bold" style={{ color: 'var(--green-dark)' }}>
                  Sign In
                </h1>
                <p className="login-text small text-muted">
                  Access your skin health history, customized regimens, and biomarker timeline.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
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
                  <label className="form-label small fw-bold text-muted">Password</label>
                  <div className="password-toggle-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="loginPassword"
                      className="form-control custom-input"
                      placeholder="••••••••"
                      autoComplete="current-password"
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
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                      name="remember"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <label className="form-check-label small text-muted" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <span
                    className="small text-muted"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setEmail('user@skinai.com');
                      setPassword('password123');
                    }}
                  >
                    <i className="fa-solid fa-key me-1 text-warning"></i> Demo: user@skinai.com / password123
                  </span>
                </div>

                <button type="submit" className="hero-btn w-100 justify-content-center">
                  <i className="fa-solid fa-right-to-bracket me-2"></i>
                  Sign In
                </button>

                <div className="text-center mt-4">
                  <p className="mb-0 small text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="fw-bold" style={{ color: 'var(--green)' }}>
                      Create one now
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
