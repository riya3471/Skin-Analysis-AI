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
                <i className="fa-solid fa-calendar-days"></i>
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
                <i className="fa-solid fa-camera"></i>
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
                <i className="fa-solid fa-droplet"></i>
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
                <i className="fa-solid fa-heart-pulse"></i>
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
              <i className="fa-solid fa-dna me-2"></i> Current Skin Characteristics
            </h3>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-droplet text-warning"></i>
              </div>
              <h4>Oiliness</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.oiliness_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-water text-info"></i>
              </div>
              <h4>Dryness</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.dryness_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-gem text-secondary"></i>
              </div>
              <h4>Texture</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.texture_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-heart text-danger"></i>
              </div>
              <h4>Redness</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.redness_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-circle text-dark"></i>
              </div>
              <h4>Pigmentation</h4>
              <h3 className="fw-bold">{latestScan ? latestScan.pigmentation_level : '--'}</h3>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <div className="dashboard-card small-card text-center p-3 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="dashboard-icon mx-auto mb-2" style={{ width: '45px', height: '45px', fontSize: '20px' }}>
                <i className="fa-solid fa-sparkles text-success"></i>
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
                    <i className="fa-solid fa-chart-line me-2"></i> Skin Health Trajectory
                  </h3>
                  <span className="small text-muted">Biomarker score progression over time</span>
                </div>
                {totalScans > 0 ? (
                  <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small">
                    <i className="fa-solid fa-arrow-trend-up me-1"></i> Active Tracking
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
                    <i className="fa-solid fa-chart-area"></i>
                  </div>
                  <h5 className="fw-bold text-muted mb-1">No Scan Progression Recorded Yet</h5>
                  <p className="small text-muted mb-3" style={{ maxWidth: '380px' }}>
                    Complete your first AI facial scan to visualize your health score, hydration, and lipid balance trajectory over time.
                  </p>
                  <Link to="/scanner" className="hero-btn py-2 px-4" style={{ fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-camera me-1"></i> Start First Scan
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
                  <i className="fa-solid fa-sun-plant-wilt me-2"></i> Daily Habits
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
                  <i className="fa-solid fa-file-waveform me-2"></i> Latest Diagnostic Summary
                </h3>
                {latestScan && (
                  <Link to={`/result?id=${latestScan.id}`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: '20px' }}>
                    View Full Diagnostic Report <i className="fa-solid fa-arrow-right ms-1"></i>
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
                    <i className="fa-solid fa-camera me-2"></i> Quick Scan
                  </Link>
                </div>
              )}

              {latestScan && (
                <div className="mt-4 d-flex gap-2 flex-wrap">
                  <Link to="/scanner" className="hero-btn">
                    <i className="fa-solid fa-camera me-2"></i> Quick Scan
                  </Link>
                  <Link to="/history" className="btn btn-outline-primary px-4 py-2" style={{ borderRadius: '30px' }}>
                    <i className="fa-solid fa-clock-rotate-left me-1"></i> View Scan History
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
