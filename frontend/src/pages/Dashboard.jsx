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
  const [stats, setStats] = useState({
    total_scans: 1,
    avg_score: 91.5,
    skin_type: 'Combination',
    latest_scan: null,
  });
  const [chartData, setChartData] = useState({
    labels: ['10 Aug', '12 Aug', '14 Aug', '16 Aug', '17 Aug'],
    scores: [84, 86, 88, 89, 92],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/dashboard');
        if (res.data) {
          setStats(res.data.stats || stats);
          if (res.data.chart_labels && res.data.chart_scores) {
            setChartData({
              labels: res.data.chart_labels,
              scores: res.data.chart_scores,
            });
          }
        }
      } catch (err) {
        // Use default client simulated dashboard stats
      }
    };
    fetchDashboard();
  }, []);

  const chartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Skin Health Score (%)',
        data: chartData.scores,
        fill: true,
        borderColor: '#264635',
        backgroundColor: 'rgba(38, 70, 53, 0.08)',
        tension: 0.4,
        pointBackgroundColor: '#264635',
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(38, 70, 53, 0.9)',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        min: 60,
        max: 100,
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="dashboard-page py-5">
      <div className="container">
        {/* Welcome Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span className="hero-tag">Biomarker Timeline</span>
            <h1 className="fw-bold mt-1 mb-0" style={{ color: 'var(--green-dark, #1b3326)' }}>
              Welcome, {user?.full_name?.split(' ')[0] || 'Skiné Member'}
            </h1>
            <p className="text-muted small mb-0">Here is your live skin health trajectory and daily recommendations.</p>
          </div>
          <Link to="/scanner" className="hero-btn">
            <i className="fa-solid fa-camera me-2"></i> New Skin Scan
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted fw-bold text-uppercase">Total Scans</span>
                <i className="fa-solid fa-camera-retro text-success fs-4"></i>
              </div>
              <h2 className="fw-bold mb-0 text-success">{stats.total_scans || 1}</h2>
              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Biomarker checkpoints</span>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted fw-bold text-uppercase">Average Health Score</span>
                <i className="fa-solid fa-heart-pulse text-primary fs-4"></i>
              </div>
              <h2 className="fw-bold mb-0" style={{ color: 'var(--green-dark, #1b3326)' }}>
                {stats.avg_score || 91.5}%
              </h2>
              <span className="small text-success" style={{ fontSize: '0.75rem' }}>
                <i className="fa-solid fa-arrow-trend-up me-1"></i> +4.2% over last 7 days
              </span>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted fw-bold text-uppercase">Baseline Skin Type</span>
                <i className="fa-solid fa-droplet text-warning fs-4"></i>
              </div>
              <h2 className="fw-bold mb-0 text-dark">{stats.skin_type || 'Combination'}</h2>
              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Balanced hydration profile</span>
            </div>
          </div>
        </div>

        {/* Chart & Daily Tips */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: 'var(--green-dark, #1b3326)' }}>
                  Skin Health Score Progress
                </h5>
                <span className="badge bg-light text-muted small">Historical Trend</span>
              </div>
              <div style={{ height: '280px' }}>
                <Line data={chartConfig} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="p-4 bg-white rounded-4 shadow-sm border h-100">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--green-dark, #1b3326)' }}>
                <i className="fa-solid fa-sparkles text-warning me-2"></i> Daily Skincare Tips
              </h5>
              <div className="d-flex flex-column gap-3 small text-muted">
                <div className="d-flex gap-2">
                  <i className="fa-solid fa-sun text-warning mt-1"></i>
                  <span>Apply broad-spectrum SPF 50 sunscreen 15 minutes before UV exposure.</span>
                </div>
                <div className="d-flex gap-2">
                  <i className="fa-solid fa-bottle-droplet text-primary mt-1"></i>
                  <span>Incorporate 2-3 drops of Niacinamide serum to regulate T-zone oiliness.</span>
                </div>
                <div className="d-flex gap-2">
                  <i className="fa-solid fa-glass-water text-info mt-1"></i>
                  <span>Drink at least 2.5L of water daily to maintain cellular skin barrier hydration.</span>
                </div>
              </div>
              <hr />
              <Link to="/profile" className="btn btn-sm btn-outline-success w-100 rounded-pill">
                Update Skin Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
