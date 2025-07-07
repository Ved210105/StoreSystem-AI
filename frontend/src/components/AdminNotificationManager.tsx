import React, { useEffect, useState } from 'react';
import './AdminNotificationManager.css';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Notification {
  _id: string;
  userId: string | null;
  title: string;
  message: string;
  discountCode?: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const AdminNotificationManager: React.FC = () => {
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notif, setNotif] = useState({
    userId: '',
    title: '',
    message: '',
    discountCode: '',
    type: 'info',
  });
  const [notifStatus, setNotifStatus] = useState<string | null>(null);
  const [sendToAll, setSendToAll] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const [notifSearch, setNotifSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch users for dropdown
  useEffect(() => {
    fetch('/api/notifications/users/all', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [token]);

  // Fetch notifications
  useEffect(() => {
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [token, notifStatus]);

  // Handle form changes
  const handleNotifChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNotif({ ...notif, [e.target.name]: e.target.value });
  };

  // Create or update notification
  const handleNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatus(null);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/notifications/${editingId}` : '/api/notifications';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: sendToAll ? undefined : notif.userId || undefined,
          title: notif.title,
          message: notif.message,
          discountCode: notif.discountCode || undefined,
          type: notif.type,
        }),
      });
      if (!res.ok) throw new Error('Failed to save notification');
      setNotifStatus(editingId ? 'Notification updated!' : 'Notification sent!');
      setNotif({ userId: '', title: '', message: '', discountCode: '', type: 'info' });
      setSendToAll(false);
      setEditingId(null);
    } catch (err) {
      setNotifStatus('Failed to save notification');
    }
  };

  // Edit notification
  const editNotif = (n: Notification) => {
    setNotif({
      userId: n.userId || '',
      title: n.title,
      message: n.message,
      discountCode: n.discountCode || '',
      type: n.type,
    });
    setSendToAll(!n.userId);
    setEditingId(n._id);
  };

  // Mark notification as read/unread
  const markNotifRead = async (id: string, read: boolean) => {
    await fetch(`/api/notifications/${id}/${read ? 'read' : 'unread'}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifs => notifs.map(n => n._id === id ? { ...n, read } : n));
  };

  // Delete notification
  const deleteNotif = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifs => notifs.filter(n => n._id !== id));
  };

  // Filter and search notifications
  const filteredNotifications = notifications.filter(n =>
    (notifFilter === 'all' || n.type === notifFilter) &&
    (notifSearch === '' || n.title.toLowerCase().includes(notifSearch.toLowerCase()) || n.message.toLowerCase().includes(notifSearch.toLowerCase()))
  );

  return (
    <div className="anm-container">
      <div className="anm-form-card">
        <h2 className="anm-title">Admin Notification Manager</h2>
        {/* Notification creation/edit form */}
        <div className="anm-form-section">
          <h3 className="anm-form-title">{editingId ? 'Edit Notification' : 'Send Notification'}</h3>
          <form onSubmit={handleNotifSubmit} className="anm-form" autoComplete="off">
            <label className="anm-checkbox-label">
              <input type="checkbox" checked={sendToAll} onChange={e => setSendToAll(e.target.checked)} className="anm-checkbox" aria-label="Send to all users" /> Send to all users
            </label>
            {!sendToAll && (
              <select name="userId" value={notif.userId} onChange={handleNotifChange} className="anm-select" aria-label="Select user">
                <option value="">Select user...</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            )}
            <input name="title" placeholder="Title" value={notif.title} onChange={handleNotifChange} className="anm-input" required aria-label="Title" />
            <textarea name="message" placeholder="Message" value={notif.message} onChange={handleNotifChange} className="anm-textarea" required aria-label="Message" />
            <input name="discountCode" placeholder="Discount Code (optional)" value={notif.discountCode} onChange={handleNotifChange} className="anm-input" aria-label="Discount Code" />
            <select name="type" value={notif.type} onChange={handleNotifChange} className="anm-select" aria-label="Notification type">
              <option value="info">Info</option>
              <option value="discount">Discount</option>
              <option value="other">Other</option>
            </select>
            <button type="submit" className="anm-button">{editingId ? 'Update' : 'Send'} Notification</button>
            {notifStatus && <div className={notifStatus.includes('Failed') ? 'anm-error' : 'anm-success'}>{notifStatus}</div>}
          </form>
        </div>
        {/* Notification filter/search UI */}
        <div className="anm-filter-section">
          <input placeholder="Search notifications..." value={notifSearch} onChange={e => setNotifSearch(e.target.value)} className="anm-input" aria-label="Search notifications" />
          <select value={notifFilter} onChange={e => setNotifFilter(e.target.value)} className="anm-select" aria-label="Filter by type">
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="discount">Discount</option>
            <option value="other">Other</option>
          </select>
        </div>
        {/* Notifications list */}
        <div className="anm-list-section">
          <h3 className="anm-list-title">All Notifications</h3>
          {filteredNotifications.length === 0 && <div className="anm-empty">No notifications found.</div>}
          {filteredNotifications.map(n => (
            <div key={n._id} className={`anm-card${n.read ? ' read' : ''}`} tabIndex={0} aria-label={`Notification: ${n.title}`}>
              <div className="anm-card-header">
                <b className="anm-card-title">{n.title}</b> <span className="anm-card-type">({n.type})</span>
              </div>
              <p className="anm-card-message">{n.message}</p>
              {n.discountCode && <div className="anm-card-discount">Discount: <b>{n.discountCode}</b></div>}
              <small className="anm-card-date">{new Date(n.createdAt).toLocaleString()}</small>
              <div className="anm-card-actions">
                <button onClick={() => markNotifRead(n._id, !n.read)} className="anm-action-btn anm-action-toggle" aria-label={n.read ? 'Mark as unread' : 'Mark as read'}>{n.read ? 'Mark Unread' : 'Mark Read'}</button>
                <button onClick={() => editNotif(n)} className="anm-action-btn anm-action-edit" aria-label="Edit notification">Edit</button>
                <button onClick={() => deleteNotif(n._id)} className="anm-action-btn anm-action-delete" aria-label="Delete notification">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationManager; 