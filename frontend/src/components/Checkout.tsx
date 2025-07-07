import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

// interface for cart items
interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
}

const Checkout = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [paymentMode, setPaymentMode] = useState<'card' | 'cash'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    setCart(stored ? JSON.parse(stored) : []);
  }, []);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    setError('');
    setSuccess('');
    if (paymentMode !== 'card') setClientSecret(null);
  }, [paymentMode]);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map(({ productId, qty }) => ({ productId, qty })),
          address,
          paymentMode,
        }),
      });
      let data;
      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text();
        throw new Error(text || 'Invalid server response');
      }
      if (!res.ok) throw new Error(data.message || 'Order failed');
      if (paymentMode === 'card') {
        setClientSecret(data.clientSecret);
        if (!stripe || !elements) {
          setError('Stripe is not loaded.');
          return;
        }
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setError('Card element not found.');
          return;
        }
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: { card: cardElement },
        });
        if (stripeError) {
          setError(stripeError.message || 'Stripe payment failed');
          return;
        }
        setSuccess(`Payment successful! Order placed. Order ID: ${data.orderId}`);
        localStorage.removeItem('cart');
        setTimeout(() => navigate('/orders'), 1500);
      } else {
        setSuccess(`Order placed successfully! Order ID: ${data.orderId}`);
        localStorage.removeItem('cart');
        setTimeout(() => navigate('/orders'), 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>
      {/* Cart Summary */}
      <div className="checkout-table">
        <h3>Order Summary</h3>
        {cart.length === 0 ? <p>Your cart is empty.</p> : (
          <table className="checkout-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.qty}</td>
                  <td>${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="checkout-total"><strong>Total: ${total.toFixed(2)}</strong></div>
      </div>
      {/* Address Form */}
      <form className="checkout-form" onSubmit={handleOrder}>
        <h3>Shipping Address</h3>
        <input name="fullName" placeholder="Full Name" value={address.fullName} onChange={handleAddressChange} required disabled={loading} />
        <input name="street" placeholder="Street Address" value={address.street} onChange={handleAddressChange} required disabled={loading} />
        <input name="city" placeholder="City" value={address.city} onChange={handleAddressChange} required disabled={loading} />
        <input name="state" placeholder="State" value={address.state} onChange={handleAddressChange} required disabled={loading} />
        <input name="zip" placeholder="ZIP Code" value={address.zip} onChange={handleAddressChange} required disabled={loading} />
        <input name="country" placeholder="Country" value={address.country} onChange={handleAddressChange} required disabled={loading} />
        {/* Payment Method */}
        <h3>Payment Method</h3>
        <label>
          <input type="radio" name="paymentMode" value="card" checked={paymentMode === 'card'} onChange={() => setPaymentMode('card')} disabled={loading} />
          Credit/Debit Card
        </label>
        <label>
          <input type="radio" name="paymentMode" value="cash" checked={paymentMode === 'cash'} onChange={() => setPaymentMode('cash')} disabled={loading} />
          Cash on Delivery
        </label>
        {/* Stripe Elements UI for card payment */}
        {paymentMode === 'card' && (
          <div className="stripe-placeholder">
            <CardElement options={{hidePostalCode: true}} />
          </div>
        )}
        <button type="submit" className="checkout-checkout-btn" disabled={loading || cart.length === 0}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
        {error && <div className="checkout-error-msg">{error}</div>}
        {success && <div className="checkout-success-msg">{success}</div>}
        {loading && <div style={{textAlign:'center',marginTop:8}}>Processing...</div>}
      </form>
    </div>
  );
};

export default Checkout; 