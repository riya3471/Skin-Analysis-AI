import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: 'fa-solid fa-camera',
      title: 'Skin Analysis Completed',
      message: 'Your latest skin analysis report (Oily Skin, 88.5% health score) is ready.',
      time_ago: 'Just now',
      is_read: false,
    },
    {
      id: 2,
      icon: 'fa-solid fa-sun',
      title: 'Sunscreen Reminder',
      message: 'Remember to apply broad-spectrum SPF 50 sunscreen before going outdoors.',
      time_ago: '2 hours ago',
      is_read: false,
    },
    {
      id: 3,
      icon: 'fa-solid fa-droplet',
      title: 'Hydration Tip',
      message: 'Drink plenty of water today to keep your skin hydrated and balanced.',
      time_ago: 'Yesterday',
      is_read: true,
    },
  ]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/api/notifications');
        if (res.data && res.data.notifications) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {}
    };
    fetchNotifs();
  }, []);

  return (
    <section className="notification-section">
      <div className="container">
        {/* Heading */}
        <div className="text-center mb-5">
          <span className="hero-tag">System Updates</span>
          <h1 className="notification-title">Your Skin Alerts & Reminders</h1>
          <p className="notification-text">
            Stay updated with recent AI scan completions, skincare routines, and personalized sun-protection tips.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px', background: '#fff' }}>
              {notifications && notifications.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className="notification-card p-3 d-flex align-items-start gap-3 border rounded"
                      style={{
                        background: !item.is_read ? 'rgba(112, 123, 87, 0.05)' : '#fff',
                        borderLeft: '4px solid var(--green) !important',
                      }}
                    >
                      <div
                        className="notification-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: '48px',
                          height: '48px',
                          background: '#f2ece1',
                          color: 'var(--green-dark)',
                          fontSize: '20px',
                        }}
                      >
                        <i className={item.icon || 'fa-solid fa-bell'}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h5 className="mb-0 fw-bold" style={{ fontSize: '1.05rem', color: 'var(--green-dark)' }}>
                            {item.title}
                            {!item.is_read && (
                              <span className="badge bg-danger rounded-pill ms-2" style={{ fontSize: '0.65rem' }}>
                                New
                              </span>
                            )}
                          </h5>
                          <span className="notification-time small text-muted">
                            <i className="fa-regular fa-clock me-1"></i> {item.time_ago || item.time || 'Today'}
                          </span>
                        </div>
                        <p className="mb-0 text-muted small">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fa-regular fa-bell-slash text-muted fs-1 mb-3"></i>
                  <h5 className="fw-bold text-muted">No Notifications Yet</h5>
                  <p className="small text-muted">
                    When you run new skin scans, your report alerts and daily tips will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/scanner" className="hero-btn">
            <i className="fa-solid fa-camera me-2"></i>
            Start New Analysis
          </Link>
        </div>
      </div>
    </section>
  );
}
