import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, unreadCount } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className="logo-text">
            <h2>Skiné</h2>
            <p>AI SKIN ANALYSIS</p>
          </div>
        </Link>

        {/* Mobile Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="menu">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/scanner') ? 'active' : ''}`} to="/scanner" onClick={() => setMenuOpen(false)}>
                <i className="fa-solid fa-camera me-1"></i> Scanner
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/history') ? 'active' : ''}`} to="/history" onClick={() => setMenuOpen(false)}>
                History
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link position-relative ${isActive('/notifications') ? 'active' : ''}`} to="/notifications" onClick={() => setMenuOpen(false)}>
                <i className="fa-regular fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/feedback') ? 'active' : ''}`} to="/feedback" onClick={() => setMenuOpen(false)}>
                Feedback
              </Link>
            </li>

            {isAuthenticated && user ? (
              <>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className={`nav-link text-warning fw-semibold ${isActive('/admin') ? 'active' : ''}`} to="/admin" onClick={() => setMenuOpen(false)}>
                      <i className="fa-solid fa-shield-halved me-1"></i> Admin
                    </Link>
                  </li>
                )}

                <li className="nav-item dropdown ms-lg-3 position-relative">
                  <button
                    className={`btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 ${isActive('/profile') ? 'active' : ''}`}
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ borderRadius: '30px' }}
                  >
                    <i className="fa-solid fa-user-circle"></i>
                    <span>{user.full_name ? user.full_name.split(' ')[0] : 'Profile'}</span>
                  </button>
                  {dropdownOpen && (
                    <ul
                      className="dropdown-menu dropdown-menu-end shadow border-0 show"
                      style={{
                        borderRadius: '14px',
                        marginTop: '10px',
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        zIndex: 1000,
                        display: 'block',
                      }}
                    >
                      <li>
                        <Link
                          className="dropdown-item py-2"
                          to="/profile"
                          onClick={() => {
                            setDropdownOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <i className="fa-regular fa-user me-2"></i> My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item py-2"
                          to="/dashboard"
                          onClick={() => {
                            setDropdownOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-chart-pie me-2"></i> Skin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item py-2"
                          to="/history"
                          onClick={() => {
                            setDropdownOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-clock-rotate-left me-2"></i> Scan History
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item py-2 text-danger border-0 bg-transparent"
                          onClick={() => {
                            setDropdownOpen(false);
                            setMenuOpen(false);
                            logout();
                          }}
                        >
                          <i className="fa-solid fa-right-from-bracket me-2"></i> Log Out
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-lg-2">
                  <Link className={`nav-link fw-semibold ${isActive('/login') ? 'active' : ''}`} to="/login" onClick={() => setMenuOpen(false)}>
                    Log In
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link to="/register" className="btn btn-primary px-4 py-2" style={{ borderRadius: '25px' }} onClick={() => setMenuOpen(false)}>
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
