import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toasts, removeToast } = useAuth();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
      }}
    >
      {toasts.map((toast) => {
        let bg = 'rgba(38, 70, 53, 0.95)';
        let icon = 'fa-circle-info';
        if (toast.type === 'success') {
          bg = 'rgba(46, 125, 50, 0.95)';
          icon = 'fa-circle-check';
        } else if (toast.type === 'danger') {
          bg = 'rgba(198, 40, 40, 0.95)';
          icon = 'fa-triangle-exclamation';
        } else if (toast.type === 'warning') {
          bg = 'rgba(230, 81, 0, 0.95)';
          icon = 'fa-circle-exclamation';
        }

        return (
          <div
            key={toast.id}
            style={{
              background: bg,
              color: '#fff',
              padding: '12px 18px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '0.9rem',
              backdropFilter: 'blur(8px)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className={`fa-solid ${icon}`}></i>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                opacity: 0.8,
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}
