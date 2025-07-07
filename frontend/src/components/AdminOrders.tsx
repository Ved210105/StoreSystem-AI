import React, { useEffect, useState } from 'react';
import './AdminOrders.css';

interface OrderItem {
  productId: string;
  qty: number;
  priceAtPurchase: number;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  paymentMode: string;
  paymentStatus: string;
  status: string;
  address: string;
  orderedAt: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  // Notification form state
  const [notif, setNotif] = useState({
    userId: '',
    title: '',
    message: '',
    discountCode: '',
    type: 'info',
  });
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  // Add state for users, sent notifications, filters, and search
  const [users, setUsers] = useState<{_id: string, name: string, email: string}[]>([]);
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const [notifFilter, setNotifFilter] = useState('all');
  const [notifSearch, setNotifSearch] = useState('');
  const [sendToAll, setSendToAll] = useState(false);

  const handleNotifChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNotif({ ...notif, [e.target.name]: e.target.value });
  };

  const handleNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatus(null);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
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
      if (!res.ok) throw new Error('Failed to send notification');
      setNotifStatus('Notification sent!');
      setNotif({ userId: '', title: '', message: '', discountCode: '', type: 'info' });
      setSendToAll(false);
    } catch (err) {
      setNotifStatus('Failed to send notification');
    }
  };

  // Fetch users for dropdown
  useEffect(() => {
    fetch('/api/notifications/users/all', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [token]);

  // Fetch sent notifications
  useEffect(() => {
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setSentNotifications)
      .catch(() => setSentNotifications([]));
  }, [token, notifStatus]);

  useEffect(() => {
    fetch('/api/orders/admin/all', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err + 'Failed to fetch orders');
        setLoading(false);
      });
  }, [token]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updatedOrder = await res.json();
      setOrders(orders => orders.map(o => o._id === orderId ? updatedOrder : o));
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  // Mark notification as read/unread
  const markNotifRead = async (id: string, read: boolean) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setSentNotifications(notifs => notifs.map(n => n._id === id ? { ...n, read } : n));
  };

  // Delete notification
  const deleteNotif = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setSentNotifications(notifs => notifs.filter(n => n._id !== id));
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="adminorders-container">
      <h2 className="adminorders-title">Admin Order Management</h2>
      {/* Notification creation form */}
      <div className="anm-form-card" style={{marginBottom: 24}}>
        <h3 className="anm-form-title">Send Notification</h3>
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
          <button type="submit" className="anm-button">Send Notification</button>
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
      {/* Sent notifications list */}
      <div className="anm-list-section">
        <h3 className="anm-list-title">Sent Notifications</h3>
        {sentNotifications.filter(n =>
          (notifFilter === 'all' || n.type === notifFilter) &&
          (notifSearch === '' || n.title.toLowerCase().includes(notifSearch.toLowerCase()) || n.message.toLowerCase().includes(notifSearch.toLowerCase()))
        ).length === 0 && <div className="anm-empty">No notifications found.</div>}
        {sentNotifications.filter(n =>
          (notifFilter === 'all' || n.type === notifFilter) &&
          (notifSearch === '' || n.title.toLowerCase().includes(notifSearch.toLowerCase()) || n.message.toLowerCase().includes(notifSearch.toLowerCase()))
        ).map(n => (
          <div key={n._id} className={`anm-card${n.read ? ' read' : ''}`} tabIndex={0} aria-label={`Notification: ${n.title}`}>
            <div className="anm-card-header">
              <b className="anm-card-title">{n.title}</b> <span className="anm-card-type">({n.type})</span>
            </div>
            <p className="anm-card-message">{n.message}</p>
            {n.discountCode && <div className="anm-card-discount">Discount: <b>{n.discountCode}</b></div>}
            <small className="anm-card-date">{new Date(n.createdAt).toLocaleString()}</small>
            <div className="anm-card-actions">
              <button onClick={() => markNotifRead(n._id, !n.read)} className="anm-action-btn anm-action-toggle" aria-label={n.read ? 'Mark as unread' : 'Mark as read'}>{n.read ? 'Mark Unread' : 'Mark Read'}</button>
              <button onClick={() => deleteNotif(n._id)} className="anm-action-btn anm-action-delete" aria-label="Delete notification">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <table className="adminorders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Address</th>
            <th>Ordered At</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.userId}</td>
              <td>
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.productId} x {item.qty} (${item.priceAtPurchase})
                    </li>
                  ))}
                </ul>
              </td>
              <td>${order.total.toFixed(2)}</td>
              <td>{order.paymentMode} ({order.paymentStatus})</td>
              <td><span className={`adminorders-status ${order.status}`}>{order.status}</span></td>
              <td>{order.address}</td>
              <td>{new Date(order.orderedAt).toLocaleString()}</td>
              <td>
                <select
                  className="adminorders-select"
                  value={order.status}
                  onChange={e => handleStatusChange(order._id, e.target.value)}
                  disabled={updating === order._id}
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {updating === order._id && <span>Updating...</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders; 