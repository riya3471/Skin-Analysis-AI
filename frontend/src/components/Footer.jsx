import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row g-4 mb-5">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="brand-icon">
                <i className="fa-solid fa-leaf"></i>
              </div>
              <span className="brand-name fs-4">Skiné</span>
            </div>
            <p className="footer-text small text-muted pe-lg-4">
              Pioneering deep computer vision for non-invasive dermatological assessment, biomarker tracking, and personalized regimens.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="social-icon" aria-label="Twitter"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" className="social-icon" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-icon" aria-label="GitHub"><i className="fa-brands fa-github"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="footer-heading fw-bold mb-3">Platform</h6>
            <ul className="list-unstyled footer-links small">
              <li className="mb-2"><Link to="/scanner">AI Scanner</Link></li>
              <li className="mb-2"><Link to="/dashboard">Dashboard</Link></li>
              <li className="mb-2"><Link to="/history">Scan History</Link></li>
              <li className="mb-2"><Link to="/feedback">Community Reviews</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="footer-heading fw-bold mb-3">Biomarkers</h6>
            <ul className="list-unstyled footer-links small">
              <li className="mb-2"><span className="text-muted">Sebum & Oiliness</span></li>
              <li className="mb-2"><span className="text-muted">Texture Variance</span></li>
              <li className="mb-2"><span className="text-muted">Erythema / Redness</span></li>
              <li className="mb-2"><span className="text-muted">Melanin & Pigment</span></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="footer-heading fw-bold mb-3">Skincare Intelligence</h6>
            <p className="small text-muted mb-3">
              Receive weekly dermatological insights and tailored routine optimizations directly to your inbox.
            </p>
            <div className="newsletter-box d-flex gap-2">
              <input
                type="email"
                className="form-control form-control-sm custom-input"
                placeholder="Enter your email"
                aria-label="Newsletter email"
              />
              <button className="hero-btn btn-sm px-3" type="button">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom border-top pt-4 text-center small text-muted">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Skiné AI Analysis Inc. All rights reserved. Not intended for clinical diagnosis.
          </p>
        </div>
      </div>
    </footer>
  );
}
