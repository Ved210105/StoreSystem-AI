import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterForm.css';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: any = { name, email, password, role };
      if (role === 'store') payload.storeName = storeName;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
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
    <div className="registerform-container">
      <form onSubmit={handleSubmit} className="registerform-form">
        <h2 className="registerform-title">Register</h2>
        {error && <div className="registerform-error">{error}</div>}
        <div className="registerform-group">
          <label className="registerform-label">Name</label>
          <input type="text" className="registerform-input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="registerform-group">
          <label className="registerform-label">Email</label>
          <input type="email" className="registerform-input" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="registerform-group">
          <label className="registerform-label">Password</label>
          <input type="password" className="registerform-input" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="registerform-group">
          <label className="registerform-label">Role</label>
          <select className="registerform-input" value={role} onChange={e => setRole(e.target.value)} required>
            <option value="user">User</option>
            <option value="store">Store</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {role === 'store' && (
          <div className="registerform-group">
            <label className="registerform-label">Store Name</label>
            <input type="text" className="registerform-input" value={storeName} onChange={e => setStoreName(e.target.value)} required={role === 'store'} />
          </div>
        )}
        <button type="submit" className="registerform-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className="registerform-footer">
          <a href="/login" className="registerform-link">Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm; 