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
