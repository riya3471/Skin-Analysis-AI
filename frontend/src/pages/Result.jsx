import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Result() {
  const { analysisResult } = useAuth();

  // Fallback demo result if accessed directly without scanning
  const result = analysisResult || {
    skin_type: 'Combination',
    overall_score: 91.5,
    overall_condition: 'Mild T-Zone Sebum & Healthy Texture',
    oiliness_level: 'Moderate',
    oiliness_score: 32.0,
    texture_level: 'Smooth',
    texture_score: 135.0,
    redness_level: 'Low',
    redness_score: 14.5,
    pigmentation_level: 'Low',
    pigmentation_score: 16.0,
    dryness_level: 'Low',
    dryness_score: 18.0,
    recommendations: [
      'Use a gentle gel-based cleanser morning and night.',
      'Apply 10% Niacinamide serum to balance forehead and nose sebum.',
      'Always finish your morning routine with broad-spectrum SPF 50.',
    ],
    morning_routine: [
      'Cleanse with gentle non-stripping gel cleanser',
      'Apply 2-3 drops of 10% Niacinamide Serum',
      'Hydrate with lightweight oil-free moisturizer',
      'Protect with matte finish Broad Spectrum SPF 50',
    ],
    night_routine: [
      'Double cleanse to dissolve daily sunscreen & pollutants',
      'Apply 2% Salicylic Acid BHA treatment (3x weekly)',
      'Lock in barrier hydration with ceramide night moisturizer',
    ],
    recommended_ingredients: [
      { ingredient: 'Niacinamide (Vitamin B3)', reason: 'Regulates sebum secretion and refines pore appearance.' },
      { ingredient: 'Salicylic Acid (BHA)', reason: 'Unclogs congested pores and dissolves micro-comedones.' },
      { ingredient: 'Hyaluronic Acid', reason: 'Delivers deep moisture without adding surface lipid sheen.' },
    ],
    things_to_avoid: [
      'Heavy pore-clogging comedogenic oils (coconut oil, lanolin).',
      'Harsh alcohol-based astringents that trigger compensatory oil production.',
    ],
    possible_causes: [
      'Localized sebaceous gland density across the central T-zone.',
      'Mild climate humidity prompting elevated sebum production.',
    ],
    lifestyle_suggestions: [
      'Maintain hydration by drinking at least 2.5 liters of water daily.',
      'Wash pillowcases weekly to minimize bacterial contact on facial skin.',
    ],
    product_recommendations: [
      { name: 'The Ordinary Niacinamide 10% + Zinc 1%', type: 'Serum', match: '98% Match' },
      { name: 'CeraVe Foaming Facial Cleanser', type: 'Cleanser', match: '96% Match' },
      { name: 'La Roche-Posay Anthelios SPF 50', type: 'Sunscreen', match: '95% Match' },
    ],
    display_date: 'Today',
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-success';
    if (score >= 65) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="result-page py-5">
      <div className="container">
        {/* Top Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span className="hero-tag">AI Analysis Report</span>
            <h1 className="fw-bold mt-1 mb-0" style={{ color: 'var(--green-dark, #1b3326)' }}>
              Skin Health & Biomarkers
            </h1>
            <p className="text-muted small mb-0">Generated on {result.display_date || 'Today'}</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/scanner" className="hero-btn btn-sm">
              <i className="fa-solid fa-camera me-1"></i> Scan Again
            </Link>
            <Link to="/dashboard" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
              <i className="fa-solid fa-chart-line me-1"></i> View Dashboard
            </Link>
          </div>
        </div>

        {/* Headline Result Card */}
        <div className="result-card p-4 p-md-5 bg-white rounded-4 shadow-sm border mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-4 text-center border-end-lg">
              <div className="score-circle-wrapper mx-auto mb-3 position-relative" style={{ width: '150px', height: '150px' }}>
                <svg viewBox="0 0 36 36" className="circular-chart text-success" style={{ width: '100%', height: '100%' }}>
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${result.overall_score || 90}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--green, #264635)"
                    strokeWidth="3"
                  />
                </svg>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <span className="fs-2 fw-bold" style={{ color: 'var(--green-dark, #1b3326)' }}>
                    {Math.round(result.overall_score || 90)}
                  </span>
                  <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>/ 100</span>
                </div>
              </div>
              <h4 className="fw-bold mb-1">{result.skin_type} Skin</h4>
              <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill small">
                {result.overall_condition || 'Healthy Skin Barrier'}
              </span>
            </div>

            {/* Biomarker Breakdown Bars */}
            <div className="col-lg-8">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--green-dark, #1b3326)' }}>
                Dermato-Cosmetic Biomarkers
              </h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold">
                    <i className="fa-solid fa-sun text-warning me-2"></i> Oiliness / Sebum Level
                  </span>
                  <span className="fw-bold">{result.oiliness_level || 'Moderate'}</span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                  <div className="progress-bar bg-warning" style={{ width: `${result.oiliness_score || 35}%` }}></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold">
                    <i className="fa-solid fa-fingerprint text-info me-2"></i> Texture Smoothness
                  </span>
                  <span className="fw-bold">{result.texture_level || 'Smooth'}</span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                  <div className="progress-bar bg-info" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold">
                    <i className="fa-solid fa-heart-pulse text-danger me-2"></i> Redness / Erythema
                  </span>
                  <span className="fw-bold">{result.redness_level || 'Low'}</span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                  <div className="progress-bar bg-danger" style={{ width: `${result.redness_score || 15}%` }}></div>
                </div>
              </div>

              <div className="mb-0">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold">
                    <i className="fa-solid fa-circle-half-stroke text-primary me-2"></i> Pigmentation & Tone Uniformity
                  </span>
                  <span className="fw-bold">{result.pigmentation_level || 'Low'}</span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                  <div className="progress-bar bg-primary" style={{ width: `${result.pigmentation_score || 18}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Routines Grid */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="routine-card p-4 bg-white rounded-4 shadow-sm border h-100">
              <div className="d-flex align-items-center gap-2 mb-3 text-warning">
                <i className="fa-solid fa-sun fs-4"></i>
                <h5 className="fw-bold mb-0 text-dark">Morning Routine (AM)</h5>
              </div>
              <ul className="list-group list-group-flush small">
                {result.morning_routine?.map((step, idx) => (
                  <li key={idx} className="list-group-item px-0 py-2 d-flex align-items-center gap-2 border-0">
                    <span className="step-badge">{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="routine-card p-4 bg-white rounded-4 shadow-sm border h-100">
              <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                <i className="fa-solid fa-moon fs-4"></i>
                <h5 className="fw-bold mb-0 text-dark">Night Routine (PM)</h5>
              </div>
              <ul className="list-group list-group-flush small">
                {result.night_routine?.map((step, idx) => (
                  <li key={idx} className="list-group-item px-0 py-2 d-flex align-items-center gap-2 border-0">
                    <span className="step-badge">{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Active Ingredients & Avoidances */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--green-dark, #1b3326)' }}>
                <i className="fa-solid fa-flask text-success me-2"></i> Recommended Active Ingredients
              </h5>
              <div className="d-flex flex-column gap-3">
                {result.recommended_ingredients?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-light rounded-3">
                    <div className="fw-bold text-success small">{item.ingredient || item}</div>
                    {item.reason && <p className="small text-muted mb-0 mt-1">{item.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
              <h5 className="fw-bold mb-3 text-danger">
                <i className="fa-solid fa-ban me-2"></i> What to Avoid
              </h5>
              <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-4">
                {result.things_to_avoid?.map((item, idx) => (
                  <li key={idx} className="d-flex align-items-start gap-2">
                    <i className="fa-solid fa-xmark text-danger mt-1"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h6 className="fw-bold mb-2 small text-dark">
                <i className="fa-solid fa-heart me-1 text-success"></i> Lifestyle Tips
              </h6>
              <ul className="list-unstyled small text-muted d-flex flex-column gap-1 mb-0">
                {result.lifestyle_suggestions?.map((item, idx) => (
                  <li key={idx} className="d-flex align-items-start gap-2">
                    <i className="fa-solid fa-check text-success mt-1"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
