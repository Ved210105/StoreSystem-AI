import React, { useEffect, useState } from 'react';
import './Notification.css';
import { FaInfoCircle, FaTag, FaBell } from 'react-icons/fa';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  discountCode?: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationListProps {
  onReadChange?: (unreadCount: number) => void;
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'discount':
      return <FaTag className="notif-icon discount" title="Discount" />;
    case 'info':
      return <FaInfoCircle className="notif-icon info" title="Info" />;
    default:
      return <FaBell className="notif-icon other" title="Notification" />;
  }
};

const NotificationList: React.FC<NotificationListProps> = ({ onReadChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError('You must be logged in to view notifications.');
        } else {
          setError('Failed to fetch notifications.');
        }
        setNotifications([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setNotifications(data);
      setError(null);
      setLoading(false);
      if (onReadChange) {
        onReadChange(data.filter((n: Notification) => !n.read).length);
      }
    } catch (e) {
      setError('Network error while fetching notifications.');
      setNotifications([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setNotifications(notifications => {
      const updated = notifications.map(n => n._id === id ? { ...n, read: true } : n);
      if (onReadChange) {
        onReadChange(updated.filter(n => !n.read).length);
      }
      return updated;
    });
  };

  if (loading) return <div className="notification-loading">Loading notifications...</div>;
  if (error) return <div className="notification-error">{error}</div>;

  return (
    <div className="notification-list">
      {notifications.length === 0 && <div className="notification-empty">No notifications.</div>}
      {notifications.map(n => (
        <div key={n._id} className={`notification-card${n.read ? ' read' : ''}`} tabIndex={0} aria-label={`Notification: ${n.title}`}>
          <div className="notification-header">
            {typeIcon(n.type)}
            <div className="notification-title-section">
              <h4 className="notification-title">{n.title}</h4>
              <span className={`notification-type ${n.type}`}>{n.type}</span>
            </div>
          </div>
          <p className="notification-message">{n.message}</p>
          {n.discountCode && (
            <div className="notification-discount">Discount Code: <b>{n.discountCode}</b></div>
          )}
          <small className="notification-date">{new Date(n.createdAt).toLocaleString()}</small>
          {!n.read && (
            <button className="notification-action-btn" onClick={() => markAsRead(n._id)} aria-label="Mark as read">Mark as read</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationList; 