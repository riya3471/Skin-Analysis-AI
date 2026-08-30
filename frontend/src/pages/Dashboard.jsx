import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../api/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user } = useAuth();
  const [totalScans, setTotalScans] = useState(1);
  const [skinType, setSkinType] = useState('Combination');
  const [latestScan, setLatestScan] = useState({
    id: 1,
    skin_type: 'Combination',
    overall_condition: 'Mild T-Zone Sebum & Healthy Texture',
    overall_score: 91.5,
    oiliness_level: 'Moderate',
    dryness_level: 'Low',
    texture_level: 'Smooth',
    redness_level: 'Low',
    pigmentation_level: 'Low',
    display_date: '17 Aug 2026',
  });

  const [chartLabels, setChartLabels] = useState(['10 Aug', '12 Aug', '14 Aug', '16 Aug', '17 Aug']);
  const [chartScores, setChartScores] = useState([84, 86, 88, 89, 92]);

  const [tips, setTips] = useState([
    'Apply broad-spectrum SPF 50 sunscreen 15 minutes before UV exposure.',
    'Incorporate 2-3 drops of Niacinamide serum to regulate T-zone oiliness.',
    'Drink at least 2.5L of water daily to maintain cellular skin barrier hydration.',
    'Double cleanse at night to gently dissolve sunscreen and environmental micro-pollutants.',
  ]);

  const [checkedHabits, setCheckedHabits] = useState({});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/dashboard');
        if (res.data) {
          if (res.data.total_scans !== undefined) setTotalScans(res.data.total_scans);
          if (res.data.skin_type) setSkinType(res.data.skin_type);
          if (res.data.latest_scan) setLatestScan(res.data.latest_scan);
          if (res.data.chart_labels) setChartLabels(res.data.chart_labels);
          if (res.data.chart_scores) setChartScores(res.data.chart_scores);
          if (res.data.tips) setTips(res.data.tips);
        }
      } catch (err) {}
    };
    fetchDashboard();
  }, []);

  const toggleHabit = (idx) => {
    setCheckedHabits((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const completedHabitsCount = Object.values(checkedHabits).filter(Boolean).length;
  const habitPct = tips.length > 0 ? (completedHabitsCount / tips.length) * 100 : 0;

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Skin Health Score (%)',
        data: chartScores,
        borderColor: '#707B57',
        backgroundColor: 'rgba(112, 123, 87, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#596547',
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 40,
        max: 100,
        ticks: { stepSize: 10 },
      },
    },
  };

  return (
    <section className="dashboard-section">
      <div className="container">
        {/* Heading */}
        <div className="text-center mb-5">
          <span className="hero-tag">AI Skin Intelligence</span>
          <h1 className="dashboard-title">Your Skin Dashboard</h1>
          <p className="dashboard-text">
            Track your skin biomarkers, routine adherence, and long-term health progression.
          </p>
        </div>

        {/* Top Overview Cards */}
        <div className="row g-4 mb-4">
          {/* Last Scan */}
          <div className="col-lg-3 col-md-6">
            <div className="dashboard-card h-100 shadow-sm" style={{ borderRadius: '18px' }}>
              <div className="dashboard-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <h3>Last Scan Date</h3>
              <h2 style={{ fontSize: '1.6rem' }}>{latestScan ? latestScan.display_date : 'Not Scanned'}</h2>
              <p>{latestScan ? 'Analysis completed' : 'Run your first scan today'}</p>
            </div>
          </div>

          {/* Total Scans */}
          <div className="col-lg-3 col-md-6">
            <div className="dashboard-card h-100 shadow-sm" style={{ borderRadius: '18px' }}>
              <div className="dashboard-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </div>
              <h3>Total Scans</h3>
              <h2 style={{ fontSize: '1.6rem' }}>{totalScans}</h2>
              <p>AI computer vision scans recorded.</p>
            </div>
          </div>

          {/* Current Skin Type */}
          <div className="col-lg-3 col-md-6">
            <div className="dashboard-card h-100 shadow-sm" style={{ borderRadius: '18px' }}>
              <div className="dashboard-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
              </div>
              <h3>Current Skin Type</h3>
              <h2 style={{ fontSize: '1.5rem' }} className={latestScan ? 'text-success' : 'text-muted'}>
                {skinType}
              </h2>
              <p>{latestScan ? 'Based on facial biomarker analysis.' : 'Awaiting initial scan.'}</p>
            </div>
          </div>

          {/* Skin Health Score */}
          <div className="col-lg-3 col-md-6">
            <div className="dashboard-card h-100 shadow-sm" style={{ borderRadius: '18px' }}>
              <div className="dashboard-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <h3>Health Score</h3>
              <h2 style={{ fontSize: '1.6rem' }}>
                {latestScan && latestScan.overall_score ? `${latestScan.overall_score}%` : '--'}
              </h2>
              <p>{latestScan ? latestScan.overall_condition : 'Scan required'}</p>
            </div>
          </div>
        </div>

        {/* Skin Characteristics Section */}
        <div className="row g-4 mt-2 mb-4">
          <div className="col-lg-12">
            <h3 className="mb-3 fw-bold" style={{ color: 'var(--green-dark)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: '-3px' }}><path d="M2 15c6.667-6 13.333 0 20-6"></path><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"></path><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"></path><path d="M17 6l-2.5-2.5"></path><path d="M14 8l-1-1"></path><path d="M7 18l2.5 2.5"></path><path d="M3.5 14.5l.5.5"></path><path d="M20 9.5l.5.5"></path><path d="M10 16l1 1"></path></svg> Current Skin Characteristics
            </h3>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2 text-warning" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
              </div>
              <h4>Oiliness</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.oiliness_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2 text-info" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 6h20M2 18h20"></path></svg>
              </div>
              <h4>Dryness</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.dryness_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2 text-secondary" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h4>Texture</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.texture_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2 text-danger" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              </div>
              <h4>Redness</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.redness_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2 text-dark" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"></path></svg>
              </div>
              <h4>Pigmentation</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.pigmentation_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2 text-success" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <h4>Overall</h4>
              <h3 className={`fw-bold ${latestScan ? 'text-success' : 'text-muted'}`}>
                {latestScan ? latestScan.skin_type : 'Pending'}
              </h3>
            </div>
          </div>
        </div>

        {/* Progress Chart & Tips Row */}
        <div className="row g-4 mt-2 mb-4">
          {/* Health Trajectory Chart */}
          <div className="col-lg-8">
            <div className="dashboard-card p-4 h-100 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: 'var(--green-dark)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: '-3px' }}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> Skin Health Trajectory
                  </h3>
                  <span className="small text-muted">Biomarker score progression over time</span>
                </div>
                {totalScans > 0 ? (
                  <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small">
                    Active Tracking
                  </span>
                ) : (
                  <span className="badge bg-light text-muted border px-3 py-1 rounded-pill small">Awaiting Scans</span>
                )}
              </div>

              {totalScans > 0 ? (
                <div style={{ position: 'relative', height: '260px', width: '100%' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div
                  className="text-center py-5 d-flex flex-column align-items-center justify-content-center"
                  style={{ minHeight: '240px', background: 'rgba(112, 123, 87, 0.04)', borderRadius: '16px' }}
                >
                  <div className="mb-3 text-muted" style={{ fontSize: '40px', opacity: 0.6 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  </div>
                  <h5 className="fw-bold text-muted mb-1">No Scan Progression Recorded Yet</h5>
                  <p className="small text-muted mb-3" style={{ maxWidth: '380px' }}>
                    Complete your first AI facial scan to visualize your health score, hydration, and lipid balance trajectory over time.
                  </p>
                  <Link to="/scanner" className="hero-btn py-2 px-4" style={{ fontSize: '0.9rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1" style={{ verticalAlign: '-2px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> Start First Scan
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Personalized Daily Tips with Interactive Habit Tracker */}
          <div className="col-lg-4">
            <div className="dashboard-card p-4 h-100 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0 fw-bold" style={{ color: 'var(--green-dark)', fontSize: '20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: '-3px' }}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> Daily Habits
                </h3>
                <span
                  id="habitProgressBadge"
                  className="badge px-2 py-1"
                  style={{ background: 'rgba(112, 123, 87, 0.15)', color: 'var(--green-dark)' }}
                >
                  {completedHabitsCount}/{tips.length} Done
                </span>
              </div>

              {/* Progress bar */}
              <div className="progress mb-3" style={{ height: '6px', background: '#e8e3d8', borderRadius: '10px' }}>
                <div
                  id="habitProgressBar"
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${habitPct}%`, background: 'var(--green)', transition: 'width 0.3s ease' }}
                ></div>
              </div>

              <ul className="tips-list ps-0 mb-3" style={{ listStyle: 'none' }}>
                {tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className={`py-2 d-flex align-items-start gap-2 border-bottom routine-check-item ${
                      checkedHabits[idx] ? 'completed' : ''
                    }`}
                    onClick={() => toggleHabit(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input mt-1 habit-checkbox"
                      checked={!!checkedHabits[idx]}
                      onChange={() => toggleHabit(idx)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span className={`small text-muted habit-text ${checkedHabits[idx] ? 'text-decoration-line-through' : ''}`}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="p-3 rounded" style={{ background: 'rgba(112, 123, 87, 0.08)' }}>
                <p className="small text-muted mb-0">
                  <strong>Consistency Note:</strong> Re-scan every 2-3 weeks to measure the cellular renewal response.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Report Details Card */}
        <div className="row g-4 mt-2">
          <div className="col-12">
            <div className="dashboard-card p-4 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="mb-0 fw-bold" style={{ color: 'var(--green-dark)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: '-3px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Latest Diagnostic Summary
                </h3>
                {latestScan && (
                  <Link to={`/result?id=${latestScan.id}`} className="hero-btn-outline" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
                    View Full Diagnostic Report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ms-1" style={{ verticalAlign: '-1px' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </Link>
                )}
              </div>

              {latestScan ? (
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="p-3 rounded border bg-light h-100">
                      <span className="text-muted small d-block mb-1">Skin Type</span>
                      <h5 className="fw-bold mb-0 text-success">{latestScan.skin_type}</h5>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 rounded border bg-light h-100">
                      <span className="text-muted small d-block mb-1">Barrier Condition</span>
                      <h5 className="fw-bold mb-0">{latestScan.overall_condition || 'Healthy & Balanced'}</h5>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 rounded border bg-light h-100">
                      <span className="text-muted small d-block mb-1">Scan Timestamp</span>
                      <h5 className="fw-bold mb-0 text-muted">{latestScan.display_date}</h5>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded border text-center bg-light">
                  <p className="text-muted mb-3">No scans have been performed for your profile yet.</p>
                  <Link to="/scanner" className="hero-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: '-2px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> Quick Scan
                  </Link>
                </div>
              )}

              {latestScan && (
                <div className="mt-4 d-flex gap-2 flex-wrap">
                  <Link to="/scanner" className="hero-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ verticalAlign: '-2px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> Quick Scan
                  </Link>
                  <Link to="/history" className="hero-btn-outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1" style={{ verticalAlign: '-2px' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> View Scan History
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
