import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useToast } from '../../state/ToastContext';

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export const AdminPage: React.FC = () => {
  const { notify } = useToast();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [form, setForm] = useState({ name: '', category: '', price: '0', quantity: '0' });
  const [restockQty, setRestockQty] = useState('5');
  const [edit, setEdit] = useState<Sweet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get('/api/sweets');
    setSweets(res.data);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/sweets', {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10)
      });
      setForm({ name: '', category: '', price: '0', quantity: '0' });
      load();
      notify('Sweet created', 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Create failed';
      setError(msg);
      notify(msg, 'error');
    }
  };

  const restock = async (id: number) => {
    try {
      await api.post(`/api/sweets/${id}/restock`, null, { params: { quantity: Math.max(1, parseInt(restockQty || '1', 10)) } });
      notify('Stock updated', 'success');
      load();
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Restock failed', 'error');
    }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this sweet?')) return;
    try {
      await api.delete(`/api/sweets/${id}`);
      notify('Deleted', 'success');
      load();
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const startEdit = (s: Sweet) => {
    setEdit(s);
    setForm({ name: s.name, category: s.category, price: String(s.price), quantity: String(s.quantity) });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setError(null);
    try {
      await api.put(`/api/sweets/${edit.id}`, {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10)
      });
      setEdit(null);
      setForm({ name: '', category: '', price: '0', quantity: '0' });
      load();
      notify('Sweet updated', 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Update failed';
      setError(msg);
      notify(msg, 'error');
    }
  };

  return (
    <div>
      <div className="card padded" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Admin</h2>
          <Link to="/" className="btn ghost">Back</Link>
        </div>
        <form onSubmit={edit ? saveEdit : create} className="row" style={{ marginTop: '1rem' }}>
          <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
          <Input type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          <Input type="number" placeholder="Qty" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
          <Button type="submit">{edit ? 'Save' : 'Create'}</Button>
          {edit && <Button type="button" variant="secondary" onClick={() => { setEdit(null); setForm({ name: '', category: '', price: '0', quantity: '0' }); }}>Cancel</Button>}
        </form>
        {error && <div className="card padded" style={{ marginTop: '0.75rem', borderColor: 'rgba(239,68,68,0.5)' }}>{error}</div>}
      </div>

      <Card padded>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Inventory</h3>
          <div className="row" style={{ alignItems: 'center' }}>
            <Input type="number" min={1} style={{ width: 120 }} value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder="Restock qty" />
          </div>
        </div>
        <table className="table" style={{ marginTop: '0.5rem' }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Category</th>
              <th align="right">Price</th>
              <th align="right">Qty</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td className="right">{s.price.toFixed(2)}</td>
                <td className="right">{s.quantity}</td>
                <td className="center" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <Button type="button" variant="secondary" onClick={() => restock(s.id)}>+{Math.max(1, parseInt(restockQty || '1', 10))}</Button>
                  <Button type="button" variant="ghost" onClick={() => startEdit(s)}>Edit</Button>
                  <Button type="button" variant="danger" onClick={() => del(s.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
