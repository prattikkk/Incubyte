import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../state/ToastContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const { notify } = useToast();
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
  notify('Welcome back!', 'success');
  nav('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <Card padded>
        <h2>Login</h2>
        <form onSubmit={submit} className="grid" style={{ gap: '0.75rem' }}>
          <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button disabled={loading}>{loading ? 'Logging in…' : 'Login'}</Button>
        </form>
        {error && <div className="card padded" style={{ marginTop: '0.75rem', borderColor: 'rgba(239,68,68,0.5)' }}>{error}</div>}
        <p style={{ marginTop: '1rem' }}>New here? <Link to="/register">Create an account</Link></p>
      </Card>
    </div>
  );
};
