import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, unreadCount } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar sticky-top">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="brand-icon">
            <i className="fa-solid fa-leaf"></i>
          </div>
          <div className="brand-text">
            <span className="brand-name">Skiné</span>
            <span className="brand-tag">AI Skin Analysis</span>
          </div>
        </Link>

        {/* Mobile Toggler */}
        <button
          className="navbar-toggler custom-toggler"
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        {/* Links */}
        <div className={`collapse navbar-collapse ${mobileOpen ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/scanner" onClick={() => setMobileOpen(false)}>
                <i className="fa-solid fa-camera me-1"></i> Scanner
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard" onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/history" onClick={() => setMobileOpen(false)}>
                History
              </NavLink>
            </li>
            <li className="nav-item position-relative">
              <NavLink className="nav-link" to="/notifications" onClick={() => setMobileOpen(false)}>
                <i className="fa-regular fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-1 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                    <span className="visually-hidden">New alerts</span>
                  </span>
                )}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/feedback" onClick={() => setMobileOpen(false)}>
                Feedback
              </NavLink>
            </li>
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink className="nav-link text-warning" to="/admin" onClick={() => setMobileOpen(false)}>
                  <i className="fa-solid fa-shield-halved me-1"></i> Admin
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right CTAs / User Profile */}
          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <div className="position-relative">
                <button
                  className="btn d-flex align-items-center gap-2 user-avatar-btn p-1 px-2"
                  style={{
                    borderRadius: '50px',
                    border: '1px solid var(--border, #e2e8f0)',
                    background: 'rgba(255,255,255,0.8)',
                  }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div
                    className="avatar-circle"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--green, #264635)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="small fw-semibold d-none d-sm-inline" style={{ color: 'var(--green-dark, #1b3326)' }}>
                    {user?.full_name ? user.full_name.split(' ')[0] : 'Account'}
                  </span>
                  <i className="fa-solid fa-chevron-down small text-muted" style={{ fontSize: '0.7rem' }}></i>
                </button>

                {userMenuOpen && (
                  <div
                    className="position-absolute end-0 mt-2 p-2 shadow-lg"
                    style={{
                      minWidth: '200px',
                      background: '#fff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      zIndex: 1000,
                    }}
                  >
                    <div className="px-3 py-2 border-bottom mb-2">
                      <div className="fw-bold small">{user?.full_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {user?.email}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-dark"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="fa-regular fa-user text-muted"></i> My Skin Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-dark"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <i className="fa-solid fa-chart-line text-muted"></i> Biomarker Dashboard
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 rounded-2 small text-danger w-100 border-0 bg-transparent"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-link text-decoration-none fw-semibold" style={{ color: 'var(--green, #264635)' }}>
                  Log In
                </Link>
                <Link to="/register" className="hero-btn btn-sm py-2 px-3">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
