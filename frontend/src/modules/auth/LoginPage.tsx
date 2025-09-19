import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      nav('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Username<br />
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </label>
        <br /><br />
        <label>Password<br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <br /><br />
        <button disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: '1rem' }}>New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
};
