import React, { useEffect, useState } from 'react';
import ProductManager from './ProductManager';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="dashboard-loading-container">
        <div className="dashboard-loading-text">Loading dashboard...</div>
      </div>
    );
  }

  if (user.role === 'user') {
    return (
      <div className="dashboard-user-container">
        <div className="dashboard-card dashboard-card-user">
          <h2 className="dashboard-title dashboard-title-user">User Dashboard</h2>
          <p className="dashboard-welcome">Welcome, {user.name}!</p>
          <div className="dashboard-grid">
            <div className="dashboard-feature dashboard-feature-user">
              <h3 className="dashboard-feature-title">Browse Products</h3>
              <p>Explore and shop products, try AR previews, add to cart or wishlist.</p>
            </div>
            <div className="dashboard-feature dashboard-feature-user">
              <h3 className="dashboard-feature-title">Orders & Recommendations</h3>
              <p>View your orders and get smart recommendations powered by AI.</p>
            </div>
          </div>
        </div>
        <ProductManager user={user} />
      </div>
    );
  }

  if (user.role === 'store') {
    return (
      <div className="dashboard-store-container">
        <div className="dashboard-card dashboard-card-store">
          <h2 className="dashboard-title dashboard-title-store">Store Dashboard</h2>
          <p className="dashboard-welcome">Welcome, {user.storeName || user.name}!</p>
          <div className="dashboard-grid">
            <div className="dashboard-feature dashboard-feature-store">
              <h3 className="dashboard-feature-title">Inventory Management</h3>
              <p>Add, edit, or remove products. Track your inventory in real time.</p>
            </div>
            <div className="dashboard-feature dashboard-feature-store">
              <h3 className="dashboard-feature-title">Order Analytics</h3>
              <p>View sales stats, order trends, and performance analytics.</p>
            </div>
          </div>
        </div>
        <ProductManager user={user} />
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="dashboard-admin-container">
        <div className="dashboard-card dashboard-card-admin">
          <h2 className="dashboard-title dashboard-title-admin">Admin Dashboard</h2>
          <p className="dashboard-welcome">Welcome, {user.name}!</p>
          <div className="dashboard-grid">
            <div className="dashboard-feature dashboard-feature-admin">
              <h3 className="dashboard-feature-title">User & Product Management</h3>
              <p>Manage all users, stores, and products on the platform.</p>
            </div>
            <div className="dashboard-feature dashboard-feature-admin">
              <h3 className="dashboard-feature-title">Analytics & Chat Logs</h3>
              <p>View platform analytics and moderate chat assistant logs.</p>
            </div>
          </div>
        </div>
        <ProductManager user={user} />
      </div>
    );
  }

  return null;
};

export default Dashboard; 