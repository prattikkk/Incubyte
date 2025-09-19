import React, { useEffect, useState } from 'react';
import { useAuth } from '../../state/AuthContext';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export const SweetsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
  const params: Record<string, string> = {};
  if (search) params.name = search;
  if (category) params.category = category;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  const res = await api.get('/api/sweets', { params: Object.keys(params).length ? params : undefined });
      setSweets(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <h2 style={{ flex: 1 }}>Sweets</h2>
  <input placeholder="Search name" value={search} onChange={e => setSearch(e.target.value)} />
  <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
  <input type="number" step="0.01" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
  <input type="number" step="0.01" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
  <button onClick={load}>Search</button>
        {user ? (
          <>
            <span>Hi {user.username}</span>
            {user.roles.includes('ROLE_ADMIN') && <Link to="/admin">Admin</Link>}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </header>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Category</th>
            <th align="right">Price</th>
            <th align="right">Qty</th>
            {user && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sweets.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.category}</td>
              <td style={{ textAlign: 'right' }}>{s.price.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>{s.quantity}</td>
              {user && (
                <td>
                  <button disabled={s.quantity < 1} onClick={async () => {
                    await api.post(`/api/sweets/${s.id}/purchase`, null, { params: { quantity: 1 } });
                    load();
                  }}>Buy</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
