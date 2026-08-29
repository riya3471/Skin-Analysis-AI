import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Admin() {
  const [stats, setStats] = useState({
    users: 3,
    scans: 1,
    score: '91.5%',
    feedback: 5,
  });

  const [activities, setActivities] = useState([
    {
      user: 'Aastha Sharma',
      skin: 'Oily',
      condition: 'Mild Acne & Excess Sebum',
      date: '17 Aug 2026, 10:30 PM',
    },
  ]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/api/admin');
        if (res.data) {
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.activities) setActivities(res.data.activities);
        }
      } catch (err) {}
    };
    fetchAdminData();
  }, []);

  return (
    <section className="admin-section">
      <div className="container">
        {/* Heading */}
        <div className="text-center mb-5">
          <span className="hero-tag">System Operations</span>
          <h1 className="admin-title">Skiné Administration Console</h1>
          <p className="admin-text">
            Real-time diagnostics, active user metrics, and platform computer vision scan telemetry.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-lg-3 col-md-6">
            <div className="admin-card text-center p-4 shadow-sm" style={{ borderRadius: '18px' }}>
              <div
                className="admin-icon mx-auto mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(13, 110, 253, 0.1)',
                  color: '#0d6efd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                <i className="fa-solid fa-users"></i>
              </div>
              <h5 className="text-muted small mb-1">Total Users</h5>
              <h2 className="fw-bold mb-0" style={{ color: 'var(--green-dark)' }}>
                {stats.users}
              </h2>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="admin-card text-center p-4 shadow-sm" style={{ borderRadius: '18px' }}>
              <div
                className="admin-icon mx-auto mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(25, 135, 84, 0.1)',
                  color: '#198754',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                <i className="fa-solid fa-camera"></i>
              </div>
              <h5 className="text-muted small mb-1">Total Scans</h5>
              <h2 className="fw-bold mb-0" style={{ color: 'var(--green-dark)' }}>
                {stats.scans}
              </h2>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="admin-card text-center p-4 shadow-sm" style={{ borderRadius: '18px' }}>
              <div
                className="admin-icon mx-auto mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255, 193, 7, 0.15)',
                  color: '#b78103',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <h5 className="text-muted small mb-1">Avg Skin Score</h5>
              <h2 className="fw-bold mb-0" style={{ color: 'var(--green-dark)' }}>
                {stats.score}
              </h2>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="admin-card text-center p-4 shadow-sm" style={{ borderRadius: '18px' }}>
              <div
                className="admin-icon mx-auto mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                <i className="fa-solid fa-star"></i>
              </div>
              <h5 className="text-muted small mb-1">User Feedbacks</h5>
              <h2 className="fw-bold mb-0" style={{ color: 'var(--green-dark)' }}>
                {stats.feedback}
              </h2>
            </div>
          </div>
        </div>

        {/* Recent Scan Activity */}
        <div className="admin-table-card p-4 p-md-5 shadow-sm" style={{ borderRadius: '20px', background: '#fff' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0 fw-bold" style={{ color: 'var(--green-dark)' }}>
              <i className="fa-solid fa-clock-rotate-left me-2"></i> Recent Skin Analysis Pipeline Activity
            </h3>
            <span className="badge bg-light text-muted border px-3 py-2">Live Telemetry</span>
          </div>

          <div className="table-responsive">
            <table className="table admin-table align-middle mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Skin Type</th>
                  <th>Diagnosed Condition</th>
                  <th>Date / Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities && activities.length > 0 ? (
                  activities.map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', background: '#e8e3d8', color: 'var(--green)' }}
                          >
                            <i className="fa-solid fa-user small"></i>
                          </div>
                          <span>{item.user}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge px-3 py-1"
                          style={{
                            background: 'rgba(112, 123, 87, 0.12)',
                            color: 'var(--green-dark)',
                            borderRadius: '20px',
                          }}
                        >
                          {item.skin}
                        </span>
                      </td>
                      <td>{item.condition}</td>
                      <td className="text-muted small">{item.date}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill small">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No scan activities logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/dashboard" className="hero-btn">
            <i className="fa-solid fa-house me-2"></i>
            Back To Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
