import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export const AdminPage: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [form, setForm] = useState({ name: '', category: '', price: '0', quantity: '0' });
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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Create failed');
    }
  };

  const restock = async (id: number) => {
    await api.post(`/api/sweets/${id}/restock`, null, { params: { quantity: 5 } });
    load();
  };

  const del = async (id: number) => {
    await api.delete(`/api/sweets/${id}`);
    load();
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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Admin</h2>
      <p><Link to="/">Back</Link></p>
      <form onSubmit={edit ? saveEdit : create} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
        <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
        <input type="number" placeholder="Qty" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
        <button>{edit ? 'Save' : 'Create'}</button>
        {edit && <button type="button" onClick={() => { setEdit(null); setForm({ name: '', category: '', price: '0', quantity: '0' }); }}>Cancel</button>}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Category</th>
            <th align="right">Price</th>
            <th align="right">Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sweets.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.category}</td>
              <td style={{ textAlign: 'right' }}>{s.price.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>{s.quantity}</td>
              <td style={{ display: 'flex', gap: '0.25rem' }}>
                <button type="button" onClick={() => restock(s.id)}>+5</button>
                <button type="button" onClick={() => startEdit(s)}>Edit</button>
                <button type="button" onClick={() => del(s.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
