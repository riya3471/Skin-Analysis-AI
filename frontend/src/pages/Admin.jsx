import React, { useState, useEffect } from 'react';
import api from '../api/client';

export default function Admin() {
  const [stats, setStats] = useState({
    users: 5,
    scans: 12,
    score: '91.5%',
    feedback: 8,
  });

  const [activities, setActivities] = useState([
    {
      user: 'Aastha Sharma',
      skin: 'Combination',
      condition: 'Healthy Skin Barrier',
      overall_score: 91.5,
      date: '17 Aug 2026, 10:30 PM',
    },
    {
      user: 'David Chen',
      skin: 'Oily',
      condition: 'Excess Sebum & Shine',
      overall_score: 88.5,
      date: '15 Aug 2026, 02:15 PM',
    },
    {
      user: 'Elena Rostova',
      skin: 'Normal',
      condition: 'Balanced Biomarkers',
      overall_score: 95.0,
      date: '12 Aug 2026, 11:00 AM',
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
    <div className="admin-page py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="hero-tag">System Administration</span>
            <h1 className="fw-bold mt-1 mb-0" style={{ color: 'var(--green-dark, #1b3326)' }}>
              Admin Metrics & Activity
            </h1>
          </div>
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
            <i className="fa-solid fa-shield-halved me-1"></i> Admin Privileges
          </span>
        </div>

        {/* Counter Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="p-4 bg-white rounded-4 shadow-sm border">
              <span className="small text-muted fw-bold text-uppercase">Total Users</span>
              <h2 className="fw-bold mb-0 text-success mt-2">{stats.users}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-4 bg-white rounded-4 shadow-sm border">
              <span className="small text-muted fw-bold text-uppercase">Total AI Scans</span>
              <h2 className="fw-bold mb-0 text-primary mt-2">{stats.scans}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-4 bg-white rounded-4 shadow-sm border">
              <span className="small text-muted fw-bold text-uppercase">Avg Health Score</span>
              <h2 className="fw-bold mb-0 text-dark mt-2">{stats.score}</h2>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-4 bg-white rounded-4 shadow-sm border">
              <span className="small text-muted fw-bold text-uppercase">User Reviews</span>
              <h2 className="fw-bold mb-0 text-warning mt-2">{stats.feedback}</h2>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-4 shadow-sm border p-4">
          <h5 className="fw-bold mb-3" style={{ color: 'var(--green-dark, #1b3326)' }}>
            Recent Scan Invocations
          </h5>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="small fw-bold text-muted">USER</th>
                  <th scope="col" className="small fw-bold text-muted">CLASSIFICATION</th>
                  <th scope="col" className="small fw-bold text-muted">CONDITION</th>
                  <th scope="col" className="small fw-bold text-muted text-center">SCORE</th>
                  <th scope="col" className="small fw-bold text-muted text-end">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold small">{act.user}</td>
                    <td>
                      <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small">
                        {act.skin}
                      </span>
                    </td>
                    <td className="small text-muted">{act.condition}</td>
                    <td className="text-center fw-bold text-success">{act.overall_score}%</td>
                    <td className="text-end small text-muted">{act.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
