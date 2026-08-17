import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function History() {
  const [history, setHistory] = useState([
    {
      id: 1,
      display_date: '17 Aug 2026',
      display_time: '10:30 PM',
      skin_type: 'Combination',
      overall_condition: 'Mild T-Zone Sebum & Healthy Texture',
      overall_score: 91.5,
      oiliness_level: 'Moderate',
      dryness_level: 'Low',
      redness_level: 'Low',
      status: 'completed',
    },
    {
      id: 2,
      display_date: '14 Aug 2026',
      display_time: '04:15 PM',
      skin_type: 'Oily',
      overall_condition: 'Excess Sebum on Forehead',
      overall_score: 88.5,
      oiliness_level: 'High',
      dryness_level: 'Low',
      redness_level: 'Low',
      status: 'completed',
    },
    {
      id: 3,
      display_date: '10 Aug 2026',
      display_time: '09:00 AM',
      skin_type: 'Combination',
      overall_condition: 'Mild Dehydration & Redness',
      overall_score: 84.0,
      oiliness_level: 'Moderate',
      dryness_level: 'Moderate',
      redness_level: 'Moderate',
      status: 'completed',
    },
  ]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/history');
        if (res.data && res.data.history) {
          setHistory(res.data.history);
        }
      } catch (err) {}
    };
    fetchHistory();
  }, []);

  return (
    <div className="history-page py-5">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span className="hero-tag">Historical Records</span>
            <h1 className="fw-bold mt-1 mb-0" style={{ color: 'var(--green-dark, #1b3326)' }}>
              Scan History & Evolution
            </h1>
            <p className="text-muted small mb-0">Track how your biomarkers improve as you follow your recommended routines.</p>
          </div>
          <Link to="/scanner" className="hero-btn">
            <i className="fa-solid fa-camera me-2"></i> Perform New Scan
          </Link>
        </div>

        {/* Scans List / Table */}
        <div className="bg-white rounded-4 shadow-sm border p-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="small fw-bold text-muted">DATE & TIME</th>
                  <th scope="col" className="small fw-bold text-muted">SKIN TYPE</th>
                  <th scope="col" className="small fw-bold text-muted">CONDITION</th>
                  <th scope="col" className="small fw-bold text-muted text-center">SCORE</th>
                  <th scope="col" className="small fw-bold text-muted text-center">BIOMARKERS</th>
                  <th scope="col" className="small fw-bold text-muted text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {history.map((scan) => (
                  <tr key={scan.id}>
                    <td>
                      <div className="fw-bold small">{scan.display_date}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{scan.display_time || 'Recorded'}</div>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small">
                        {scan.skin_type}
                      </span>
                    </td>
                    <td>
                      <span className="small text-dark fw-medium">{scan.overall_condition}</span>
                    </td>
                    <td className="text-center">
                      <span className="fw-bold text-success fs-5">{Math.round(scan.overall_score || 90)}%</span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <span className="badge bg-light text-muted small" title="Oiliness">
                          Oil: {scan.oiliness_level || 'Low'}
                        </span>
                        <span className="badge bg-light text-muted small" title="Redness">
                          Red: {scan.redness_level || 'Low'}
                        </span>
                      </div>
                    </td>
                    <td className="text-end">
                      <Link to={`/result?id=${scan.id}`} className="btn btn-sm btn-outline-success rounded-pill px-3">
                        View Report <i className="fa-solid fa-arrow-right ms-1"></i>
                      </Link>
                    </td>
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
