import React, { useState, useEffect } from 'react';
import api from '../api/client';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: 'fa-solid fa-camera',
      title: 'Skin Analysis Ready',
      message: 'Your latest biomarker report (Combination Skin, 91.5% health score) is ready.',
      time_ago: 'Just now',
      is_read: false,
    },
    {
      id: 2,
      icon: 'fa-solid fa-sun',
      title: 'Morning SPF Reminder',
      message: 'UV index is projected to reach High (7+) today. Apply broad-spectrum SPF 50.',
      time_ago: '2 hours ago',
      is_read: false,
    },
    {
      id: 3,
      icon: 'fa-solid fa-droplet',
      title: 'Hydration Target',
      message: 'Drink 2.5L of water today to support healthy skin elasticity and moisture balance.',
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

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    try {
      api.post('/api/notifications/read');
    } catch {}
  };

  return (
    <div className="notifications-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span className="hero-tag">Alerts & Reminders</span>
                <h1 className="fw-bold mt-1 mb-0" style={{ color: 'var(--green-dark, #1b3326)' }}>
                  Notifications
                </h1>
              </div>
              <button onClick={markAllRead} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                <i className="fa-solid fa-check-double me-1"></i> Mark All as Read
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 bg-white rounded-4 shadow-sm border d-flex gap-3 align-items-start ${
                    !notif.is_read ? 'border-start border-4 border-success' : ''
                  }`}
                >
                  <div
                    className="p-3 rounded-circle"
                    style={{
                      background: !notif.is_read ? 'rgba(38, 70, 53, 0.1)' : '#f8f9fa',
                      color: 'var(--green, #264635)',
                    }}
                  >
                    <i className={notif.icon || 'fa-solid fa-bell'}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="fw-bold mb-0 text-dark">{notif.title}</h6>
                      <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        {notif.time_ago}
                      </span>
                    </div>
                    <p className="small text-muted mb-0">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
