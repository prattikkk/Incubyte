import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../state/AuthContext';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { useToast } from '../../state/ToastContext';

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export const SweetsPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useToast();
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

  const skeletons = useMemo(() => Array.from({ length: 6 }), []);

  return (
    <div>
      <div className="card padded" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>Sweets</h2>
            <p className="muted" style={{ marginTop: 4 }}>Browse and buy your favorite sweets. Use filters to narrow down.</p>
          </div>
          <Input placeholder="Search name" value={search} onChange={e => setSearch(e.target.value)} />
          <Input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <Input type="number" step="0.01" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <Input type="number" step="0.01" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <Button onClick={load}>Search</Button>
          {user?.roles.includes('ROLE_ADMIN') && <Link to="/admin" className="btn secondary">Admin</Link>}
        </div>
      </div>

      {loading && (
        <div className="grid cards">
          {skeletons.map((_, i) => (
            <div key={i} className="card padded">
              <div className="skeleton" style={{ height: 18, width: '60%' }} />
              <div style={{ height: 6 }} />
              <div className="skeleton" style={{ height: 14, width: '40%' }} />
              <div style={{ height: 12 }} />
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ height: 36, width: 90 }} />
                <div className="skeleton" style={{ height: 36, width: 60 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && <div className="card padded" style={{ borderColor: 'rgba(239,68,68,0.5)' }}>{error}</div>}

      {!loading && !error && (
        <div className="grid cards">
          {sweets.map(s => (
            <Card key={s.id} padded>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: 0 }}>{s.name}</h3>
                <span className="chip">{s.category}</span>
              </div>
              <p className="muted" style={{ marginTop: 6 }}>Only {s.quantity} left</p>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>₹{s.price.toFixed(2)}</div>
                {user ? (
                  <Button disabled={s.quantity < 1} onClick={async () => {
                    try {
                      await api.post(`/api/sweets/${s.id}/purchase`, null, { params: { quantity: 1 } });
                      notify(`Purchased 1 ${s.name}`, 'success');
                      load();
                    } catch (e: any) {
                      notify(e?.response?.data?.message || 'Purchase failed', 'error');
                    }
                  }}>{s.quantity < 1 ? 'Sold out' : 'Buy'}</Button>
                ) : (
                  <Link to="/login" className="btn secondary">Login to buy</Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
