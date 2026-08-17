import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="hero-tag mb-3 d-inline-block">
                <i className="fa-solid fa-sparkles me-2"></i> Computer Vision Skincare AI
              </span>
              <h1 className="hero-title fw-bold">
                Clinical-Grade Facial Biomarkers. Personalized Regimens.
              </h1>
              <p className="hero-subtitle text-muted mt-3 mb-4">
                Analyze your skin's oiliness, texture roughness, redness variance, and pigmentation in under 5 seconds using real-time computer vision algorithms.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/scanner" className="hero-btn">
                  <i className="fa-solid fa-camera me-2"></i> Start Live AI Scan
                </Link>
                <Link to="/dashboard" className="hero-btn hero-btn-outline">
                  <i className="fa-solid fa-chart-line me-2"></i> Explore Dashboard
                </Link>
              </div>

              {/* Biomarker Badges */}
              <div className="row g-3 mt-4 pt-2">
                <div className="col-4">
                  <div className="stat-pill">
                    <div className="fw-bold fs-5 text-success">5.0s</div>
                    <div className="small text-muted">Analysis Speed</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="stat-pill">
                    <div className="fw-bold fs-5 text-success">4+</div>
                    <div className="small text-muted">Core Biomarkers</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="stat-pill">
                    <div className="fw-bold fs-5 text-success">100%</div>
                    <div className="small text-muted">Tailored Routines</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-image-wrapper position-relative">
                <img
                  src="/images/hero.png"
                  alt="Skiné AI Analysis Interface"
                  className="img-fluid rounded-4 shadow-lg hero-img"
                  onError={(e) => {
                    e.target.src = '/static/images/hero.png';
                  }}
                />
                <div className="floating-badge badge-1">
                  <i className="fa-solid fa-droplet text-primary me-2"></i>
                  <span>Sebum Balance: <strong>Optimized</strong></span>
                </div>
                <div className="floating-badge badge-2">
                  <i className="fa-solid fa-shield-halved text-success me-2"></i>
                  <span>Barrier Health: <strong>92.5%</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biomarker Features Grid */}
      <section className="features-section py-5">
        <div className="container">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="hero-tag">Precision Metrics</span>
            <h2 className="fw-bold mt-2" style={{ color: 'var(--green-dark, #1b3326)' }}>
              Non-Invasive Computer Vision Biomarkers
            </h2>
            <p className="text-muted small">
              Our proprietary facial analysis segments your forehead, left cheek, and right cheek to evaluate primary dermato-cosmetic markers.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="feature-card h-100 p-4 rounded-4 shadow-sm bg-white border">
                <div className="feature-icon mb-3 text-warning fs-3">
                  <i className="fa-solid fa-sun"></i>
                </div>
                <h5 className="fw-bold">Oiliness & Sebum</h5>
                <p className="small text-muted">
                  HSV color-space specular reflection and forehead-to-cheek saturation differentials detect overactive sebaceous activity.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="feature-card h-100 p-4 rounded-4 shadow-sm bg-white border">
                <div className="feature-icon mb-3 text-info fs-3">
                  <i className="fa-solid fa-fingerprint"></i>
                </div>
                <h5 className="fw-bold">Texture & Pores</h5>
                <p className="small text-muted">
                  Laplacian variance and Gray-Level Co-occurrence matrices identify micro-roughness, texture irregularities, and congested pores.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="feature-card h-100 p-4 rounded-4 shadow-sm bg-white border">
                <div className="feature-icon mb-3 text-danger fs-3">
                  <i className="fa-solid fa-heart-pulse"></i>
                </div>
                <h5 className="fw-bold">Redness & Erythema</h5>
                <p className="small text-muted">
                  Green-red channel dispersion isolates vascular inflammation, flushing, and localized micro-capillary reactivity.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="feature-card h-100 p-4 rounded-4 shadow-sm bg-white border">
                <div className="feature-icon mb-3 text-primary fs-3">
                  <i className="fa-solid fa-circle-half-stroke"></i>
                </div>
                <h5 className="fw-bold">Pigment & Tone</h5>
                <p className="small text-muted">
                  Multi-scale luminosity variance identifies hyperpigmentation spots, UV damage patches, and skin tone uniformity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works py-5 bg-light">
        <div className="container">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="hero-tag">Simple 3-Step Protocol</span>
            <h2 className="fw-bold mt-2" style={{ color: 'var(--green-dark, #1b3326)' }}>
              How Skiné Delivers Actionable Results
            </h2>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="step-box p-4 bg-white rounded-4 shadow-sm h-100">
                <div className="step-num mb-3">1</div>
                <h5 className="fw-bold">Capture or Upload</h5>
                <p className="small text-muted">
                  Position your face in front of your camera in natural lighting or upload a high-resolution selfie.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="step-box p-4 bg-white rounded-4 shadow-sm h-100">
                <div className="step-num mb-3">2</div>
                <h5 className="fw-bold">Deep Vision Analysis</h5>
                <p className="small text-muted">
                  Algorithms instantly segment facial zones, compute regional biomarker scores, and classify your skin type.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="step-box p-4 bg-white rounded-4 shadow-sm h-100">
                <div className="step-num mb-3">3</div>
                <h5 className="fw-bold">Receive Regimen</h5>
                <p className="small text-muted">
                  Get morning and evening skincare steps, active ingredients (Niacinamide, BHA), things to avoid, and product matches.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <Link to="/scanner" className="hero-btn px-5 py-3">
              <i className="fa-solid fa-bolt me-2"></i> Try Free Scan Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
