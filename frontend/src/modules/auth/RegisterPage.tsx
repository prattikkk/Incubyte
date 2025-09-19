import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

export const RegisterPage: React.FC = () => {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/register', { username, email, password });
      nav('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <label>Username<br />
          <input value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={50} />
        </label>
        <br /><br />
        <label>Email<br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <br /><br />
        <label>Password<br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </label>
        <br /><br />
        <label>Confirm Password<br />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
        </label>
        <br /><br />
        <button disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: '1rem' }}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};
