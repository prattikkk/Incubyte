import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../state/ToastContext';

export const RegisterPage: React.FC = () => {
  const nav = useNavigate();
  const { notify } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/register', { username, email, password });
      notify('Account created! Please login.', 'success');
      nav('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <Card padded>
        <h2>Create account</h2>
        <form onSubmit={submit} className="grid" style={{ gap: '0.75rem' }}>
          <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={50} />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <Input label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
          <div className="muted">Password must be at least 8 characters. Use a mix of letters, numbers and symbols.</div>
          <Button disabled={loading}>{loading ? 'Registering…' : 'Register'}</Button>
        </form>
        {error && <div className="card padded" style={{ marginTop: '0.75rem', borderColor: 'rgba(239,68,68,0.5)' }}>{error}</div>}
        <p style={{ marginTop: '1rem' }}>Already have an account? <Link to="/login">Login</Link></p>
      </Card>
    </div>
  );
};
