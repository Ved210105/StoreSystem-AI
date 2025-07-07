import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginform-container">
      <form onSubmit={handleSubmit} className="loginform-form">
        <h2 className="loginform-title">Login</h2>
        {error && <div className="loginform-error">{error}</div>}
        <div className="loginform-group">
          <label className="loginform-label">Email</label>
          <input type="email" className="loginform-input" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="loginform-group">
          <label className="loginform-label">Password</label>
          <input type="password" className="loginform-input" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="loginform-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="loginform-footer">
          <a href="/register" className="loginform-link">Don't have an account? Register</a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm; 