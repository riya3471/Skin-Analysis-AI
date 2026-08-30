import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            {/* Left */}
            <div className="col-lg-5">
              <span className="hero-tag">
                AI Skin Analysis
              </span>

              <h1>
                Understand <br />
                your skin.
              </h1>

              <h2>
                Care Better.
              </h2>

              <p className="hero-text">
                Our AI technology analyzes your skin and helps you discover
                what it needs to stay healthy, radiant and naturally glowing.
              </p>

              <Link to="/login" className="hero-btn">
                <i className="fa-solid fa-right-to-bracket"></i>
                {" Let's Start "}
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            {/* Right */}
            <div className="col-lg-7 text-center">
              <img
                src="/images/hero.png"
                className="hero-img"
                alt="Skin Analysis"
                onError={(e) => {
                  e.target.src = '/static/images/hero.png';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK SKIN CHECK ================= */}
      <section className="quick-check">
        <div className="container">
          <div className="section-title">
            <span>Quick Skin Check</span>
            <h2>Get an overview of your skin in seconds.</h2>
            <p>
              AI instantly analyzes your skin and checks for common concerns.
            </p>
          </div>

          <div className="row text-center">
            <div className="col-md-3">
              <div className="analysis-card">
                <div className="analysis-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                </div>
                <h4>Hydration</h4>
                <p>
                  Checks your skin moisture level.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="analysis-card">
                <div className="analysis-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 6h20M2 18h20"></path></svg>
                </div>
                <h4>Texture</h4>
                <p>
                  Detects roughness and smoothness.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="analysis-card">
                <div className="analysis-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
                </div>
                <h4>Pores</h4>
                <p>
                  Finds enlarged or clogged pores.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="analysis-card">
                <div className="analysis-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                </div>
                <h4>Dark Spots</h4>
                <p>
                  Detects pigmentation and dark spots.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INFO CARDS ================= */}
      <section className="info-section">
        <div className="container">
          <div className="row g-4">
            {/* Card 1 */}
            <div className="col-lg-4">
              <div className="info-card">
                <h3>How It Works</h3>

                <div className="info-item">
                  <div className="icon-circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </div>
                  <div>
                    <h5>Take a Selfie</h5>
                    <p>
                      Capture a clear photo using your webcam or upload an image.
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  </div>
                  <div>
                    <h5>AI Analysis</h5>
                    <p>
                      Our AI scans your skin for acne, pores, pigmentation and more.
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div>
                    <h5>View Results</h5>
                    <p>
                      Receive easy-to-understand skin reports instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-lg-4">
              <div className="info-card">
                <h3>What You'll Get</h3>

                <ul className="benefits">
                  <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-success"><polyline points="20 6 9 17 4 12"></polyline></svg>Skin concern detection</li>
                  <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-success"><polyline points="20 6 9 17 4 12"></polyline></svg>Personalized skincare tips</li>
                  <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-success"><polyline points="20 6 9 17 4 12"></polyline></svg>Easy-to-read report</li>
                  <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-success"><polyline points="20 6 9 17 4 12"></polyline></svg>Track your progress</li>
                  <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-success"><polyline points="20 6 9 17 4 12"></polyline></svg>AI confidence score</li>
                </ul>

                <div className="face-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-lg-4">
              <div className="info-card">
                <h3>Skin Concerns We Check</h3>

                <div className="concern">
                  <span className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(112,123,87,0.12)', color: 'var(--green-dark)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg></span>
                  <div>
                    <strong>Acne</strong>
                    <p>Detects pimples and breakouts.</p>
                  </div>
                </div>

                <div className="concern">
                  <span className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(112,123,87,0.12)', color: 'var(--green-dark)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line></svg></span>
                  <div>
                    <strong>Dark Spots</strong>
                    <p>Identifies pigmentation issues.</p>
                  </div>
                </div>

                <div className="concern">
                  <span className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(112,123,87,0.12)', color: 'var(--green-dark)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg></span>
                  <div>
                    <strong>Uneven Tone</strong>
                    <p>Analyzes skin tone consistency.</p>
                  </div>
                </div>

                <div className="concern">
                  <span className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(112,123,87,0.12)', color: 'var(--green-dark)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 6h20M2 18h20"></path></svg></span>
                  <div>
                    <strong>Fine Lines</strong>
                    <p>Detects early signs of aging.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY SKINÉ ================= */}
      <section className="why-section">
        <div className="container">
          <div className="section-title">
            <span>Why Skiné?</span>
            <h2>Simple, Private & AI Powered</h2>
            <p>
              Built to make skincare analysis easy, accurate and accessible.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-3">
              <div className="why-card">
                <div className="why-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
                </div>
                <h4>AI Powered</h4>
                <p>
                  Advanced AI detects skin concerns with high accuracy.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="why-card">
                <div className="why-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h4>Private & Secure</h4>
                <p>
                  Your photos are processed securely and never shared.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="why-card">
                <div className="why-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h4>Natural Care</h4>
                <p>
                  Personalized skincare suggestions for healthier skin.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="why-card">
                <div className="why-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <h4>Fast Results</h4>
                <p>
                  Get your complete skin report within seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to discover your skin?</h2>
            <p>
              Start your AI skin analysis today and receive personalized skincare insights.
            </p>
            <Link to="/login" className="hero-btn">
              Let's Start
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
