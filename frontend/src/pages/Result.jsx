import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SUPABASE_CDN = 'https://poilovpcmuoqrxjeicnf.supabase.co/storage/v1/object/public/product-images';

const PRODUCT_IMAGE_MAP = {
  'Niacinamide 10% + Zinc 1%': `${SUPABASE_CDN}/the_ordinary_niacinamide_10_zinc_1.jpg`,
  '10% Niacinamide Booster': `${SUPABASE_CDN}/paulas_choice_10_niacinamide_booster.jpg`,
  'BHA Liquid Exfoliant 2%': `${SUPABASE_CDN}/paulas_choice_bha_liquid_exfoliant_2.jpg`,
  'Skin Perfecting 2% BHA Liquid': `${SUPABASE_CDN}/paulas_choice_bha_liquid_exfoliant_2.jpg`,
  'Salicylic Acid Cleanser': `${SUPABASE_CDN}/cerave_salicylic_acid_cleanser.jpg`,
  'Hyaluronic Acid 2% + B5': `${SUPABASE_CDN}/the_ordinary_hyaluronic_acid_2_b5.jpg`,
  'Hydra Power Essence': `${SUPABASE_CDN}/cosrx_hydra_power_essence.jpg`,
  'Moisturizing Cream': `${SUPABASE_CDN}/cerave_moisturizing_cream.jpg`,
  'Ceramide Ato Concentrate Cream': `${SUPABASE_CDN}/illiyoon_ceramide_ato_concentrate_cream.jpg`,
  'C E Ferulic Serum': `${SUPABASE_CDN}/skinceuticals_c_e_ferulic_serum.jpg`,
  'Vitamin C Suspension 23% + HA Spheres 2%': `${SUPABASE_CDN}/the_ordinary_vitamin_c_suspension_23.jpg`,
  '10% Vitamin C Serum': `${SUPABASE_CDN}/minimalist_10_vitamin_c_serum.jpg`,
  'Anthelios UVMune 400 SPF 50+': `${SUPABASE_CDN}/la_roche_posay_anthelios_uvmune_400.jpg`,
  'Relief Sun Rice + Probiotics SPF 50+': `${SUPABASE_CDN}/beauty_of_joseon_relief_sun_spf_50.jpg`,
  'UV Aqua Rich Watery Essence SPF 50+': `${SUPABASE_CDN}/biore_uv_aqua_rich_watery_essence.jpg`,
  'Madagascar Centella Ampoule': `${SUPABASE_CDN}/skin1004_madagascar_centella_ampoule.jpg`,
  'Centella Unscented Serum': `${SUPABASE_CDN}/purito_centella_unscented_serum.jpg`,
  '92% Aloe Vera Soothing Gel': `${SUPABASE_CDN}/nature_republic_aloe_vera_gel.jpg`,
  'Lactic Acid 10% + HA': `${SUPABASE_CDN}/the_ordinary_lactic_acid_10_ha.jpg`,
  'BHA Blackhead Power Liquid': `${SUPABASE_CDN}/cosrx_bha_blackhead_power_liquid.jpg`,
};

const PRODUCT_BUY_MAP = {
  'Niacinamide 10% + Zinc 1%': 'https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html',
  '10% Niacinamide Booster': 'https://www.paulaschoice.com/10-niacinamide-booster/798.html',
  'BHA Liquid Exfoliant 2%': 'https://www.paulaschoice.com/skin-perfecting-2-percent-bha-liquid-exfoliant/201.html',
  'Skin Perfecting 2% BHA Liquid': 'https://www.paulaschoice.com/skin-perfecting-2-percent-bha-liquid-exfoliant/201.html',
  'Salicylic Acid Cleanser': 'https://www.cerave.com/skincare/cleansers/renewing-sa-cleanser',
  'Hyaluronic Acid 2% + B5': 'https://theordinary.com/en-us/hyaluronic-acid-2-b5-serum-100398.html',
  'Hydra Power Essence': 'https://www.cosrx.com/products/hyaluronic-acid-hydra-power-essence',
  'Moisturizing Cream': 'https://www.cerave.com/skincare/moisturizers/moisturizing-cream',
  'Ceramide Ato Concentrate Cream': 'https://www.amazon.com/s?k=Illiyoon+Ceramide+Ato+Concentrate+Cream',
  'C E Ferulic Serum': 'https://www.skinceuticals.com/skincare/vitamin-c-serums/c-e-ferulic-with-15-l-ascorbic-acid/S24.html',
  'Vitamin C Suspension 23% + HA Spheres 2%': 'https://theordinary.com/en-us/vitamin-c-suspension-23-ha-spheres-2-vitamin-c-100451.html',
  '10% Vitamin C Serum': 'https://beminimalist.co/products/vitamin-c-serum-10',
  'Anthelios UVMune 400 SPF 50+': 'https://www.laroche-posay.us/our-products/sun/face-sunscreen/anthelios-melt-in-milk-sunscreen-spf-60-antheliosfaceandbodysunscreen.html',
  'Relief Sun Rice + Probiotics SPF 50+': 'https://beautyofjoseon.com/products/relief-sun-rice-probiotics-set',
  'UV Aqua Rich Watery Essence SPF 50+': 'https://www.amazon.com/s?k=Biore+UV+Aqua+Rich+Watery+Essence+SPF50',
  'Madagascar Centella Ampoule': 'https://www.amazon.com/s?k=SKIN1004+Madagascar+Centella+Ampoule',
  'Centella Unscented Serum': 'https://www.amazon.com/s?k=PURITO+Centella+Unscented+Serum',
  '92% Aloe Vera Soothing Gel': 'https://www.amazon.com/s?k=Nature+Republic+92+Aloe+Vera+Gel',
  'Lactic Acid 10% + HA': 'https://theordinary.com/en-us/lactic-acid-10-ha-2-exfoliator-100427.html',
  'BHA Blackhead Power Liquid': 'https://www.cosrx.com/products/bha-blackhead-power-liquid',
};

export default function Result() {
  const { analysisResult } = useAuth();

  const result = analysisResult || {
    skin_type: 'Oily',
    overall_condition: 'Mild Acne & Excess Sebum',
    overall_score: 88.5,
    shiny_percentage: 18.5,
    dryness_score: 22.0,
    texture_score: 148.0,
    redness_score: 18.8,
    pigmentation_percentage: 12.4,
    forehead_brightness: 158.2,
    oiliness_level: 'High',
    dryness_level: 'Low',
    texture_level: 'Medium Detail',
    redness_level: 'Low',
    pigmentation_level: 'Low',
    morning_routine: [
      'Cleanse face with gentle gel cleanser',
      'Apply 2-3 drops of 10% Niacinamide Serum',
      'Apply lightweight oil-free gel moisturizer',
      'Finish with matte finish SPF 50 Sunscreen',
    ],
    night_routine: [
      'Double cleanse to remove sunscreen & daily pollution',
      'Apply Salicylic Acid BHA treatment (2-3 times/week)',
      'Seal with lightweight barrier repairing moisturizer',
    ],
    recommended_ingredients: [
      { ingredient: 'Niacinamide', reason: 'Regulates excess sebum production and minimizes appearance of pores.' },
      { ingredient: 'Salicylic Acid', reason: 'Gently exfoliates dead cells and unclogs congested pores.' },
      { ingredient: 'Hyaluronic Acid', reason: 'Provides lightweight hydration without adding surface oiliness.' },
    ],
    things_to_avoid: [
      'Heavy oil-based comedogenic creams and coconut oil formulations.',
      'Over-cleansing or harsh alcohol-based astringents that strip natural moisture.',
    ],
    possible_causes: [
      'Overactive sebaceous glands responding to hormonal or climate triggers.',
      'Humidity and warm environmental conditions increasing sebum secretion.',
    ],
    product_recommendations: [
      { category: 'Cleanser', brand: 'CeraVe', product: 'Salicylic Acid Cleanser', note: 'Gentle daily SA cleanser with ceramides for oily and combination skin.', ingredient: 'Salicylic Acid', image_url: '/static/products/cerave_salicylic_acid_cleanser.jpg', buy_url: 'https://www.cerave.com/skincare/cleansers/renewing-sa-cleanser' },
      { category: 'Exfoliant', brand: "Paula's Choice", product: 'Skin Perfecting 2% BHA Liquid', note: 'Gold-standard BHA exfoliant to unclog pores and smooth skin texture.', ingredient: 'Salicylic Acid', image_url: '/static/products/paulas_choice_bha_liquid_exfoliant_2.jpg', buy_url: 'https://www.paulaschoice.com/skin-perfecting-2-percent-bha-liquid-exfoliant/201.html' },
      { category: 'Serum', brand: 'The Ordinary', product: 'Niacinamide 10% + Zinc 1%', note: 'Balances sebum production, calms redness, and visibly tightens pores.', ingredient: 'Niacinamide', image_url: '/static/products/the_ordinary_niacinamide_10_zinc_1.jpg', buy_url: 'https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html' },
      { category: 'Serum', brand: 'Minimalist', product: '10% Vitamin C Serum', note: 'Ethyl Ascorbic Acid for stable brightening and antioxidant defense.', ingredient: 'Vitamin C', image_url: '/static/products/minimalist_10_vitamin_c_serum.jpg', buy_url: 'https://beminimalist.co/products/vitamin-c-serum-10' },
      { category: 'Moisturizer', brand: 'CeraVe', product: 'Moisturizing Cream', note: 'Essential barrier repair ceramides in an oil-free, non-comedogenic base.', ingredient: 'Ceramides', image_url: '/static/products/cerave_moisturizing_cream.jpg', buy_url: 'https://www.cerave.com/skincare/moisturizers/moisturizing-cream' },
      { category: 'Sunscreen', brand: 'La Roche-Posay', product: 'Anthelios UVMune 400 SPF 50+', note: 'Ultra broad-spectrum UV shield with a non-greasy matte finish.', ingredient: 'SPF 50 Sunscreen', image_url: '/static/products/la_roche_posay_anthelios_uvmune_400.jpg', buy_url: 'https://www.laroche-posay.us/our-products/sun/face-sunscreen/anthelios-melt-in-milk-sunscreen-spf-60-antheliosfaceandbodysunscreen.html' },
    ],
    display_date: 'Today',
  };

  const productRecommendations =
    result.product_recommendations && result.product_recommendations.length > 0
      ? result.product_recommendations
      : [
          { category: 'Cleanser', brand: 'CeraVe', product: 'Salicylic Acid Cleanser', note: 'Gentle daily SA cleanser with ceramides for oily and combination skin.', ingredient: 'Salicylic Acid', image_url: '/static/products/cerave_salicylic_acid_cleanser.jpg', buy_url: 'https://www.cerave.com/skincare/cleansers/renewing-sa-cleanser' },
          { category: 'Exfoliant', brand: "Paula's Choice", product: 'Skin Perfecting 2% BHA Liquid', note: 'Gold-standard BHA exfoliant to unclog pores and smooth skin texture.', ingredient: 'Salicylic Acid', image_url: '/static/products/paulas_choice_bha_liquid_exfoliant_2.jpg', buy_url: 'https://www.paulaschoice.com/skin-perfecting-2-percent-bha-liquid-exfoliant/201.html' },
          { category: 'Serum', brand: 'The Ordinary', product: 'Niacinamide 10% + Zinc 1%', note: 'Balances sebum production, calms redness, and visibly tightens pores.', ingredient: 'Niacinamide', image_url: '/static/products/the_ordinary_niacinamide_10_zinc_1.jpg', buy_url: 'https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html' },
          { category: 'Serum', brand: 'Minimalist', product: '10% Vitamin C Serum', note: 'Ethyl Ascorbic Acid for stable brightening and antioxidant defense.', ingredient: 'Vitamin C', image_url: '/static/products/minimalist_10_vitamin_c_serum.jpg', buy_url: 'https://beminimalist.co/products/vitamin-c-serum-10' },
          { category: 'Moisturizer', brand: 'CeraVe', product: 'Moisturizing Cream', note: 'Essential barrier repair ceramides in an oil-free, non-comedogenic base.', ingredient: 'Ceramides', image_url: '/static/products/cerave_moisturizing_cream.jpg', buy_url: 'https://www.cerave.com/skincare/moisturizers/moisturizing-cream' },
          { category: 'Sunscreen', brand: 'La Roche-Posay', product: 'Anthelios UVMune 400 SPF 50+', note: 'Ultra broad-spectrum UV shield with a non-greasy matte finish.', ingredient: 'SPF 50 Sunscreen', image_url: '/static/products/la_roche_posay_anthelios_uvmune_400.jpg', buy_url: 'https://www.laroche-posay.us/our-products/sun/face-sunscreen/anthelios-melt-in-milk-sunscreen-spf-60-antheliosfaceandbodysunscreen.html' },
        ];

  // Group and arrange products strictly by active ingredient
  const sortedProducts = [...productRecommendations].sort((a, b) =>
    (a.ingredient || '').localeCompare(b.ingredient || '') ||
    (a.brand || '').localeCompare(b.brand || '') ||
    (a.product || '').localeCompare(b.product || '')
  );

  const scoreNum = Math.round(result.overall_score || 88);
  const strokeColor = scoreNum >= 80 ? '#2b7a4b' : scoreNum >= 65 ? '#b78103' : '#dc3545';
  const circumference = 339.29;
  const offset = circumference - (scoreNum / 100.0) * circumference;

  return (
    <section className="result-section">
      <div className="container">
        {/* Heading & Top Actions */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <span className="hero-tag">Diagnostic Assessment</span>
            <h1 className="result-title mb-1">Your AI Skin Health Report</h1>
            <p className="result-text mb-0">
              Generated using calibrated Computer Vision feature extraction and dermatological biomarker rules.
              {(result.display_date || result.formatted_date) && (
                <span className="badge bg-light text-muted border ms-2 px-2 py-1">
                  <i className="fa-regular fa-calendar-check me-1"></i> {result.formatted_date || result.display_date}
                </span>
              )}
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap d-print-none">
            <button onClick={() => window.print()} className="btn btn-outline-dark px-3 py-2" style={{ borderRadius: '25px' }}>
              <i className="fa-solid fa-file-pdf me-1 text-danger"></i> Download PDF / Print
            </button>
            <Link to="/scanner" className="hero-btn py-2 px-3" style={{ fontSize: '0.9rem' }}>
              <i className="fa-solid fa-camera me-1"></i> Retake Scan
            </Link>
          </div>
        </div>

        {/* TOP HEADLINE SUMMARY CARD WITH RADIAL SCORE GAUGE */}
        <div
          className="card border-0 shadow-sm mb-5 p-4 p-md-5"
          style={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ffffff, #fbf9f4)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="row align-items-center g-4">
            {/* Skin Type Badge & Condition */}
            <div className="col-lg-4 text-center border-end-lg">
              <span className="text-uppercase small fw-bold tracking-wider text-muted d-block mb-1">
                Primary Classification
              </span>
              <h2 className="display-5 fw-bold mb-2" style={{ color: 'var(--green-dark)' }}>
                {result.skin_type || 'Normal'}
              </h2>
              <span
                className="badge px-3 py-2"
                style={{
                  background: 'rgba(112, 123, 87, 0.15)',
                  color: 'var(--green-dark)',
                  fontSize: '0.95rem',
                  borderRadius: '20px',
                }}
              >
                <i className="fa-solid fa-sparkles me-1"></i> {result.overall_condition || 'Balanced Barrier'}
              </span>
            </div>

            {/* Animated Radial Score Gauge */}
            <div className="col-lg-4 text-center border-end-lg">
              <span className="text-uppercase small fw-bold tracking-wider text-muted d-block mb-2">
                Overall Skin Health Index
              </span>

              <div className="score-gauge-wrapper">
                <svg className="score-gauge-svg" viewBox="0 0 130 130">
                  <circle className="score-gauge-bg" cx="65" cy="65" r="54"></circle>
                  <circle
                    className="score-gauge-circle"
                    cx="65"
                    cy="65"
                    r="54"
                    style={{
                      stroke: strokeColor,
                      strokeDasharray: `${circumference}`,
                      strokeDashoffset: `${offset}`,
                    }}
                  ></circle>
                </svg>
                <div className="score-gauge-text">
                  <h3 className="fw-bold mb-0" style={{ color: strokeColor, fontSize: '2rem' }}>
                    {scoreNum}%
                  </h3>
                  <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    Quality Index
                  </span>
                </div>
              </div>
              <p className="small text-muted mt-2 mb-0">Multi-zone biometric composite score</p>
            </div>

            {/* Clinical Synthesis */}
            <div className="col-lg-4 text-center text-lg-start ps-lg-4">
              <h5 className="fw-bold mb-2" style={{ color: 'var(--green-dark)' }}>
                <i className="fa-solid fa-clipboard-check me-2"></i> Clinical Synthesis
              </h5>
              <p className="small text-muted mb-3" style={{ lineHeight: '1.7' }}>
                {result.skin_type === 'Oily' &&
                  'Elevated sebum reflection observed across the T-zone and forehead. Focus on gentle Salicylic Acid or Niacinamide balancing solutions.'}
                {result.skin_type === 'Dry' &&
                  'Reduced lipid reflectivity and surface tightness identified. Prioritize multi-weight Hyaluronic Acid and Ceramide barrier protection.'}
                {result.skin_type === 'Combination' &&
                  'Differential oil-moisture gradient detected between T-zone and outer cheek zones. Utilize targeted multi-zone hydration.'}
                {result.skin_type !== 'Oily' &&
                  result.skin_type !== 'Dry' &&
                  result.skin_type !== 'Combination' &&
                  'Balanced lipid-hydration equilibrium detected. Maintain consistent antioxidant protection and daily SPF 50+.'}
              </p>
              <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small">
                <i className="fa-solid fa-shield-halved me-1"></i> Barrier Integrity Verified
              </span>
            </div>
          </div>
        </div>

        {/* 6 BIOMARKER METRICS GRID */}
        <h3 className="mb-4 fw-bold" style={{ color: 'var(--green-dark)', fontSize: '22px' }}>
          <i className="fa-solid fa-chart-simple me-2"></i> Clinical Biomarker Breakdown
        </h3>
        <div className="row g-3 mb-5">
          {/* Oiliness */}
          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card text-center p-3 h-100 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-droplet text-warning"></i>
              </div>
              <h6 className="text-muted small mb-1">Oiliness</h6>
              <h4 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>
                {result.oiliness_level || result.oiliness || 'Moderate'}
              </h4>
              {result.shiny_percentage && (
                <span className="badge bg-light text-muted border small">{result.shiny_percentage}% shine</span>
              )}
            </div>
          </div>

          {/* Dryness */}
          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card text-center p-3 h-100 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-water text-info"></i>
              </div>
              <h6 className="text-muted small mb-1">Dryness</h6>
              <h4 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>
                {result.dryness_level || result.dryness || 'Low'}
              </h4>
              {result.dryness_score && (
                <span className="badge bg-light text-muted border small">Index {result.dryness_score}</span>
              )}
            </div>
          </div>

          {/* Texture */}
          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card text-center p-3 h-100 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-gem text-secondary"></i>
              </div>
              <h6 className="text-muted small mb-1">Texture</h6>
              <h4 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>
                {result.texture_level || result.texture || 'Smooth'}
              </h4>
              {result.texture_score && (
                <span className="badge bg-light text-muted border small">Var {result.texture_score}</span>
              )}
            </div>
          </div>

          {/* Redness */}
          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card text-center p-3 h-100 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-heart text-danger"></i>
              </div>
              <h6 className="text-muted small mb-1">Redness</h6>
              <h4 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>
                {result.redness_level || result.redness || 'Low'}
              </h4>
              {result.redness_score && (
                <span className="badge bg-light text-muted border small">Score {result.redness_score}</span>
              )}
            </div>
          </div>

          {/* Pigmentation */}
          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card text-center p-3 h-100 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-circle-half-stroke text-dark"></i>
              </div>
              <h6 className="text-muted small mb-1">Pigmentation</h6>
              <h4 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>
                {result.pigmentation_level || result.pigmentation || 'Low'}
              </h4>
              {result.pigmentation_percentage && (
                <span className="badge bg-light text-muted border small">{result.pigmentation_percentage}% area</span>
              )}
            </div>
          </div>

          {/* Brightness */}
          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card text-center p-3 h-100 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-sun text-warning"></i>
              </div>
              <h6 className="text-muted small mb-1">Luminance</h6>
              <h4 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>
                {result.forehead_brightness || 145}
              </h4>
              <span className="badge bg-light text-muted border small">HSV Scaled</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ROUTINES & INGREDIENTS SECTION */}
        <div className="row g-4 mb-5">
          {/* Morning Routine */}
          <div className="col-lg-6">
            <div className="result-card h-100 p-4 shadow-sm" style={{ borderRadius: '18px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <div className="me-3 p-2 rounded-circle" style={{ background: 'rgba(255, 193, 7, 0.15)', color: '#b78103' }}>
                    <i className="fa-solid fa-sun fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold" style={{ color: 'var(--green-dark)' }}>
                      Morning Skincare Routine
                    </h4>
                    <span className="text-muted small">Daytime environmental defense</span>
                  </div>
                </div>
                <span className="badge bg-light text-muted border small d-print-none">Click to check off</span>
              </div>
              <hr />
              <ul className="recommend-list ps-0 mb-0" style={{ listStyle: 'none' }}>
                {result.morning_routine ? (
                  result.morning_routine.map((step, idx) => (
                    <li
                      key={idx}
                      className="py-2 border-bottom d-flex align-items-center gap-3 routine-check-item"
                      onClick={(e) => {
                        e.currentTarget.classList.toggle('completed');
                        const cb = e.currentTarget.querySelector('input');
                        if (cb) cb.checked = !cb.checked;
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <input type="checkbox" className="form-check-input mt-0" style={{ cursor: 'pointer' }} />
                      <span className="text-dark">{step}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="py-2 border-bottom d-flex align-items-center gap-3 routine-check-item">
                      <input type="checkbox" className="form-check-input mt-0" />
                      <span className="text-dark">Gentle pH-Balanced Foaming Cleanser</span>
                    </li>
                    <li className="py-2 border-bottom d-flex align-items-center gap-3 routine-check-item">
                      <input type="checkbox" className="form-check-input mt-0" />
                      <span className="text-dark">Niacinamide (5%) Barrier Balancing Serum</span>
                    </li>
                    <li className="py-2 d-flex align-items-center gap-3 routine-check-item">
                      <input type="checkbox" className="form-check-input mt-0" />
                      <span className="text-dark">Broad-Spectrum SPF 50+ Mineral Sunscreen</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Night Routine */}
          <div className="col-lg-6">
            <div className="result-card h-100 p-4 shadow-sm" style={{ borderRadius: '18px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <div className="me-3 p-2 rounded-circle" style={{ background: 'rgba(13, 110, 253, 0.12)', color: '#0d6efd' }}>
                    <i className="fa-solid fa-moon fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold" style={{ color: 'var(--green-dark)' }}>
                      Night Skincare Routine
                    </h4>
                    <span className="text-muted small">Cellular renewal & barrier recovery</span>
                  </div>
                </div>
                <span className="badge bg-light text-muted border small d-print-none">Click to check off</span>
              </div>
              <hr />
              <ul className="recommend-list ps-0 mb-0" style={{ listStyle: 'none' }}>
                {result.night_routine ? (
                  result.night_routine.map((step, idx) => (
                    <li
                      key={idx}
                      className="py-2 border-bottom d-flex align-items-center gap-3 routine-check-item"
                      onClick={(e) => {
                        e.currentTarget.classList.toggle('completed');
                        const cb = e.currentTarget.querySelector('input');
                        if (cb) cb.checked = !cb.checked;
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <input type="checkbox" className="form-check-input mt-0" style={{ cursor: 'pointer' }} />
                      <span className="text-dark">{step}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="py-2 border-bottom d-flex align-items-center gap-3 routine-check-item">
                      <input type="checkbox" className="form-check-input mt-0" />
                      <span className="text-dark">Gentle Micellar Water / Double Cleanse</span>
                    </li>
                    <li className="py-2 border-bottom d-flex align-items-center gap-3 routine-check-item">
                      <input type="checkbox" className="form-check-input mt-0" />
                      <span className="text-dark">Ceramide & Peptide Restorative Cream</span>
                    </li>
                    <li className="py-2 d-flex align-items-center gap-3 routine-check-item">
                      <input type="checkbox" className="form-check-input mt-0" />
                      <span className="text-dark">Targeted Overnight Spot Treatment</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* RECOMMENDED ACTIVE INGREDIENTS & THINGS TO AVOID */}
        <div className="row g-4 mb-5">
          {/* Recommended Active Ingredients */}
          <div className="col-lg-7">
            <div className="analysis-card h-100 p-4 shadow-sm" style={{ borderRadius: '18px' }}>
              <h4 className="mb-3 fw-bold" style={{ color: 'var(--green-dark)' }}>
                <i className="fa-solid fa-flask-vial text-primary me-2"></i> Tailored Active Ingredients
              </h4>
              <p className="small text-muted mb-4">Key compounds suited to your skin's biometric characteristics:</p>

              <div className="row g-3">
                {result.recommended_ingredients && result.recommended_ingredients.length > 0 ? (
                  result.recommended_ingredients.map((item, idx) => (
                    <div key={idx} className="col-md-6">
                      <div
                        className="p-3 rounded h-100"
                        style={{
                          background: 'rgba(112, 123, 87, 0.08)',
                          border: '1px solid rgba(112, 123, 87, 0.2)',
                        }}
                      >
                        <h6 className="fw-bold text-success mb-1">
                          <i className="fa-solid fa-leaf me-1"></i>
                          {typeof item === 'object' ? item.ingredient : item}
                        </h6>
                        <p className="small text-muted mb-0">
                          {typeof item === 'object'
                            ? item.reason
                            : 'Provides targeted barrier support and improves overall texture.'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="col-md-6">
                      <div className="p-3 rounded" style={{ background: 'rgba(112, 123, 87, 0.08)' }}>
                        <h6 className="fw-bold text-success mb-1">Niacinamide (Vitamin B3)</h6>
                        <p className="small text-muted mb-0">Balances sebum excretion and calms visible skin inflammation.</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded" style={{ background: 'rgba(112, 123, 87, 0.08)' }}>
                        <h6 className="fw-bold text-success mb-1">Hyaluronic Acid</h6>
                        <p className="small text-muted mb-0">Draws moisture into dermal layers without leaving a greasy residue.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Things to Avoid & Causes */}
          <div className="col-lg-5">
            <div className="analysis-card h-100 p-4 shadow-sm" style={{ borderRadius: '18px' }}>
              <h4 className="mb-3 fw-bold text-danger">
                <i className="fa-solid fa-ban me-2"></i> Ingredients & Triggers to Avoid
              </h4>
              <ul className="ps-3 small text-muted mb-4">
                {result.things_to_avoid && result.things_to_avoid.length > 0 ? (
                  result.things_to_avoid.map((avoid, idx) => <li key={idx} className="mb-2">{avoid}</li>)
                ) : (
                  <>
                    <li className="mb-2">Over-cleansing with high-pH sulfate bar soaps.</li>
                    <li className="mb-2">Heavy pore-clogging comedogenic oils.</li>
                    <li className="mb-2">Direct sun exposure without UV protection.</li>
                  </>
                )}
              </ul>

              {result.possible_causes && result.possible_causes.length > 0 && (
                <>
                  <h5 className="fw-bold mb-2" style={{ color: 'var(--green-dark)' }}>
                    <i className="fa-solid fa-circle-question me-2"></i> Possible Contributing Factors
                  </h5>
                  <ul className="ps-3 small text-muted mb-0">
                    {result.possible_causes.map((cause, idx) => (
                      <li key={idx} className="mb-1">{cause}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RECOMMENDED PRODUCTS & BRANDS */}
        {productRecommendations && productRecommendations.length > 0 && (
          <div className="mb-5">
            <div className="mb-4">
              <h3 className="mb-1 fw-bold" style={{ color: 'var(--green-dark)', fontSize: '22px' }}>
                <i className="fa-solid fa-bag-shopping me-2"></i> Recommended Products & Brands
              </h3>
              <p className="small text-muted mb-0">
                Dermatologist-recommended products matched to your skin biomarkers.
              </p>
            </div>

            {/* Product Cards Grid */}
            <div className="row g-3">
              {sortedProducts.map((prod, idx) => {
                const imgSrc = prod.image_url || PRODUCT_IMAGE_MAP[prod.product] || '';
                const targetBuyUrl = prod.buy_url || PRODUCT_BUY_MAP[prod.product] || '#';
                return (
                  <div key={idx} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                    <div
                      className="product-card h-100 p-3 shadow-sm d-flex flex-column justify-content-between"
                      style={{
                        borderRadius: '16px',
                        background: '#fff',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      <div>
                        {/* Clickable Product Image Link */}
                        <a
                          href={targetBuyUrl}
                          target={targetBuyUrl !== '#' ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="product-image-link d-block mb-3 text-decoration-none"
                          title={targetBuyUrl !== '#' ? `View ${prod.product} on store` : 'Product Image'}
                          onClick={(e) => {
                            if (targetBuyUrl === '#') e.preventDefault();
                          }}
                          style={{ cursor: targetBuyUrl !== '#' ? 'pointer' : 'default' }}
                        >
                          <div
                            className="product-image-placeholder text-center d-flex align-items-center justify-content-center"
                            style={{
                              background: 'rgba(112, 123, 87, 0.05)',
                              borderRadius: '12px',
                              height: '110px',
                              border: '1px dashed rgba(0, 0, 0, 0.1)',
                              overflow: 'hidden',
                              transition: 'border-color 0.2s ease, transform 0.2s ease',
                            }}
                          >
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={prod.product}
                                style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <div className="text-muted d-flex flex-column align-items-center justify-content-center">
                                <i className="fa-solid fa-bottle-droplet fs-3 mb-1 text-secondary" style={{ opacity: 0.45 }}></i>
                                <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                                  Product Image
                                </span>
                              </div>
                            )}
                          </div>
                        </a>

                      {/* Brand & Category Badges */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span
                          className="badge px-2 py-1 rounded-pill"
                          style={{
                            background: 'rgba(112, 123, 87, 0.12)',
                            color: 'var(--green-dark)',
                            fontSize: '0.72rem',
                          }}
                        >
                          {prod.category}
                        </span>
                        <span className="badge bg-dark text-white px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                          {prod.brand}
                        </span>
                      </div>

                      {/* Product Title */}
                      <h6 className="fw-bold mb-1" style={{ color: 'var(--green-dark)', fontSize: '0.95rem' }}>
                        {prod.product}
                      </h6>

                      {/* Clinical Note */}
                      <p className="small text-muted mb-2" style={{ lineHeight: '1.45', fontSize: '0.8rem' }}>
                        {prod.note}
                      </p>
                    </div>

                    {/* Key Ingredient Tag */}
                    <div className="d-flex align-items-center gap-1 pt-2 border-top">
                      <i className="fa-solid fa-leaf text-success" style={{ fontSize: '0.7rem' }}></i>
                      <span className="small fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>
                        {prod.ingredient}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        {/* BOTTOM ACTIONS & NOTE */}
        <div className="analysis-note-card mb-4 p-4 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="analysis-note-icon">
            <i className="fa-solid fa-circle-info"></i>
          </div>
          <div>
            <h5 className="fw-bold mb-1">Diagnostic Advisory</h5>
            <p className="small text-muted mb-0">
              This skin assessment is powered by computer vision algorithms calibrated against facial regions. Individual
              environmental factors, lighting, and ambient humidity can affect real-time readings. For clinical dermatological
              disorders, please consult a healthcare professional.
            </p>
          </div>
        </div>

        <div className="text-center mt-5 mb-4 d-flex justify-content-center flex-wrap gap-3 d-print-none">
          <Link to="/scanner" className="hero-btn">
            <i className="fa-solid fa-camera me-2"></i>
            Start New Scan
          </Link>
          <Link to="/dashboard" className="hero-btn-outline">
            <i className="fa-solid fa-chart-pie me-2"></i>
            View Dashboard
          </Link>
          <Link to="/history" className="hero-btn-outline">
            <i className="fa-solid fa-clock-rotate-left me-2"></i>
            Scan History
          </Link>
        </div>
      </div>
    </section>
  );
}
