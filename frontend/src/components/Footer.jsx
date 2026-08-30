import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer mt-5">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-5">
            <h3>Skiné</h3>
            <p className="footer-text">
              Advanced AI skin analysis powered by Computer Vision. Discover your skin type, oiliness, hydration, and tailored skincare routines designed for optimal skin health.
            </p>
            <div className="mt-3">
              <a
                href="https://www.instagram.com/_skine05?igsh=eTV6eWx1YzNwZzk3&igsi=eTV6eWx1YzNwZzk3"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                title="Follow Skiné on Instagram"
              >
                <span className="footer-social-icon-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </span>
                <span className="ms-2">@_skine05</span>
              </a>
            </div>
          </div>

          <div className="col-md-3">
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/scanner">AI Skin Scan</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/history">Scan History</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/feedback">Feedback</Link></li>
            </ul>
          </div>

          <div className="col-md-4">
            <h5>Contact & Privacy</h5>
            <p><i className="bi bi-envelope me-2"></i> support@skinai.com</p>
            <p><i className="bi bi-geo-alt me-2"></i> Nepal</p>
            <p>
              <a
                href="https://www.instagram.com/_skine05?igsh=eTV6eWx1YzNwZzk3&igsi=eTV6eWx1YzNwZzk3"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Instagram: @_skine05
              </a>
            </p>
            <p><i className="bi bi-shield-check me-2"></i> 100% Private & Secure Skin Diagnostics</p>
          </div>
        </div>

        <hr />

        <div className="text-center copyright">
          © 2026 Skiné • AI Skin Analysis & Skincare Engine
        </div>
      </div>
    </footer>
  );
}
