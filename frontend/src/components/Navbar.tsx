import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import NotificationList from './Notification';
import type { Notification } from './Notification';

const Navbar: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  let bellTimeout: ReturnType<typeof setTimeout>;

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/notifications', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data: Notification[] = await res.json();
    setUnreadCount(data.filter(n => !n.read).length);
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBellEnter = () => {
    clearTimeout(bellTimeout);
    setShowNotifications(true);
  };
  const handleBellLeave = () => {
    bellTimeout = setTimeout(() => setShowNotifications(false), 120);
  };

  return (
    <nav className="navbar enhanced-navbar">
      <div className="navbar-container enhanced-navbar-container">
        <div className="navbar-left enhanced-navbar-left">
          <NavLink to="/" className="navbar-logo enhanced-navbar-logo">Adaptive Retail</NavLink>
          {user && (
            <NavLink to="/dashboard" className="navbar-link enhanced-navbar-link">Dashboard</NavLink>
          )}
          {/* Role-specific links */}
          {user?.role === 'store' && (
            <NavLink to="/dashboard/inventory" className="navbar-link navbar-link-store enhanced-navbar-link">Inventory</NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/dashboard/admin" className="navbar-link navbar-link-admin enhanced-navbar-link">Admin Panel</NavLink>
          )}
          {user && (
            <>
              <NavLink to="/cart" className="navbar-link enhanced-navbar-link">Cart</NavLink>
              <NavLink to="/orders" className="navbar-link enhanced-navbar-link">Order History</NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin/orders" className="navbar-link navbar-link-admin enhanced-navbar-link">Admin Orders</NavLink>
          )}
        </div>
        <div className="navbar-right enhanced-navbar-right">
          {!user ? (
            <>
              <NavLink to="/login" className="navbar-link enhanced-navbar-link">Login</NavLink>
              <NavLink to="/register" className="navbar-link navbar-link-register enhanced-navbar-link">Register</NavLink>
            </>
          ) : (
            <button onClick={handleLogout} className="navbar-logout enhanced-navbar-logout">Logout</button>
          )}
          <div
            className="notification-bell enhanced-notification-bell"
            style={{ position: 'relative', cursor: 'pointer', marginLeft: 24 }}
            onMouseEnter={handleBellEnter}
            onMouseLeave={handleBellLeave}
            onFocus={handleBellEnter}
            onBlur={handleBellLeave}
            tabIndex={0}
          >
            <span role="img" aria-label="Notifications" style={{ fontSize: '2.1em', filter: 'drop-shadow(0 0 6px #38bdf8)' }}>🔔</span>
            {unreadCount > 0 && (
              <span className="badge enhanced-badge" style={{ position: 'absolute', top: -18, right: -8, background: 'linear-gradient(90deg, #38bdf8, #c084fc)', color: 'white', borderRadius: '50%', padding: '6px 12px', fontSize: '1.1em', fontWeight: 700, boxShadow: '0 0 8px #38bdf8' }}>{unreadCount}</span>
            )}
            {showNotifications && (
              <div className="notifications-dropdown enhanced-notifications-dropdown" style={{ position: 'absolute', right: 0, top: '3.5em', zIndex: 1000 }}>
                <NotificationList onReadChange={setUnreadCount} />
              </div>
            )}
          </div>
          <NavLink to="/notifications" className="navbar-link enhanced-navbar-link" style={{ marginLeft: 16, fontWeight: 700, fontSize: '1.1em' }}>Notifications</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
