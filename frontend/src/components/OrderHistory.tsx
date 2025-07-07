import React, { useEffect, useState } from 'react';
import './Cart.css';
import './OrderHistory.css';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface OrderItem {
  productId: string;
  qty: number;
  priceAtPurchase: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  paymentMode: string;
  paymentStatus: string;
  status: string;
  address: any;
  orderedAt?: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="orderhistory-container">
      <h2 className="orderhistory-title">Order History</h2>
      {loading && <p>Loading...</p>}
      {error && <div className="orderhistory-error-msg">{error}</div>}
      {!loading && !error && orders.length === 0 && <p>No orders found.</p>}
      {!loading && !error && orders.length > 0 && (
        <table className="orderhistory-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id.slice(-6)}</td>
                <td>{order.orderedAt ? new Date(order.orderedAt).toLocaleString() : '-'}</td>
                <td>
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.qty} x {item.productId} @ ${item.priceAtPurchase.toFixed(2)}
                    </div>
                  ))}
                </td>
                <td>${order.total.toFixed(2)}</td>
                <td>{order.paymentMode} ({order.paymentStatus})</td>
                <td>{order.status}</td>
                <td>
                  {order.address.fullName}<br/>
                  {order.address.street}, {order.address.city}<br/>
                  {order.address.state}, {order.address.zip}<br/>
                  {order.address.country}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory; 