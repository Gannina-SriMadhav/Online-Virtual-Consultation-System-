import React, { useState, useEffect } from 'react';
import { getNotifications, markAllAsRead, clearNotifications } from '../utils/notifications';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(getNotifications());
  const [isOpen, setIsOpen] = useState(false);

  const updateNotifications = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    window.addEventListener('medconnect_notification_update', updateNotifications);
    return () => {
      window.removeEventListener('medconnect_notification_update', updateNotifications);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark as read after opening
      setTimeout(() => {
        markAllAsRead();
      }, 500);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Icon Bell */}
      <button 
        onClick={handleToggle}
        style={{ 
          background: 'var(--white)', 
          border: '1.5px solid var(--border)', 
          color: 'var(--ink-soft)', 
          padding: '8px 12px', 
          borderRadius: '20px', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          height: '38px',
          fontSize: '13px',
          fontWeight: '600',
          position: 'relative'
        }}
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '-5px', 
            right: '-5px', 
            background: 'var(--coral)', 
            color: 'white', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            padding: '2px 6px', 
            borderRadius: '50%',
            boxShadow: '0 2px 5px rgba(249,115,22,0.4)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="glass-card" style={{ 
          position: 'absolute', 
          top: '45px', 
          right: 0, 
          width: '320px', 
          maxHeight: '360px', 
          overflowY: 'auto', 
          background: 'var(--white)', 
          border: '1px solid var(--border)', 
          borderRadius: '16px',
          boxShadow: 'var(--card-shadow)',
          zIndex: 1000,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--ink)' }}>Alerts Notification Center</span>
            <button 
              onClick={clearNotifications}
              style={{ background: 'transparent', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
            >
              Clear All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '250px' }}>
            {notifications.length === 0 ? (
              <div style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '20px 0', fontSize: '12px' }}>
                No notifications to display.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  style={{ 
                    padding: '10px', 
                    background: n.read ? 'var(--surface)' : 'var(--sky-pale)', 
                    borderRadius: '8px', 
                    border: '1.5px solid',
                    borderColor: n.read ? 'var(--border)' : 'var(--sky)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--ink)' }}>{n.title}</span>
                    <span style={{ fontSize: '9px', color: 'var(--ink-muted)' }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--ink-soft)', lineHeight: '1.4' }}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
