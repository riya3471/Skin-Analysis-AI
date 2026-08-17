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
                  💧
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
                  🌊
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
                  🫧
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
                  ☀️
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
                    📷
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
                    ✨
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
                    📄
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
                  <li>✔ Skin concern detection</li>
                  <li>✔ Personalized skincare tips</li>
                  <li>✔ Easy-to-read report</li>
                  <li>✔ Track your progress</li>
                  <li>✔ AI confidence score</li>
                </ul>

                <div className="face-icon">
                  😊
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-lg-4">
              <div className="info-card">
                <h3>Skin Concerns We Check</h3>

                <div className="concern">
                  <span>🌸</span>
                  <div>
                    <strong>Acne</strong>
                    <p>Detects pimples and breakouts.</p>
                  </div>
                </div>

                <div className="concern">
                  <span>☀️</span>
                  <div>
                    <strong>Dark Spots</strong>
                    <p>Identifies pigmentation issues.</p>
                  </div>
                </div>

                <div className="concern">
                  <span>🧴</span>
                  <div>
                    <strong>Uneven Tone</strong>
                    <p>Analyzes skin tone consistency.</p>
                  </div>
                </div>

                <div className="concern">
                  <span>🌿</span>
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
                  🤖
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
                  🔒
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
                  🌿
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
                  ⚡
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
