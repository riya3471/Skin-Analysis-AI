import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const fillDemo = () => {
    setEmail('user@skinai.com');
    setPassword('password123');
  };

  return (
    <section className="login-section py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="p-4 p-md-5 bg-white rounded-4 shadow-sm border">
              <div className="text-center mb-4">
                <span className="hero-tag">Welcome Back</span>
                <h1 className="fw-bold mt-2" style={{ color: 'var(--green-dark, #1b3326)' }}>
                  Sign In
                </h1>
                <p className="small text-muted">
                  Access your skin health history, customized regimens, and biomarker timeline.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
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
                  <label className="form-label small fw-bold text-muted">Password</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control custom-input pe-5"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
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
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" />
                    <label className="form-check-label small text-muted" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="btn btn-sm btn-link p-0 text-decoration-none small text-muted"
                  >
                    <i className="fa-solid fa-key text-warning me-1"></i> Fill Demo Credentials
                  </button>
                </div>

                <button type="submit" disabled={isSubmitting} className="hero-btn w-100 justify-content-center py-3">
                  <i className="fa-solid fa-right-to-bracket me-2"></i>
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center mt-4">
                  <p className="mb-0 small text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="fw-bold text-success text-decoration-none">
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
