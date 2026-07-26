import { useEffect, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal.jsx'

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const emptyForm = () => ({ name: '', phone: '', instagram_handle: '', address: '', notes: '' })

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [history, setHistory] = useState(null)

  function load() {
    api.get('/customers', { params: q ? { q } : {} }).then((res) => setCustomers(res.data))
  }

  useEffect(() => { load() }, [q])

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setHistory(null)
    setModalOpen(true)
  }

  async function openEdit(c) {
    setEditing(c)
    setForm({ name: c.name, phone: c.phone, instagram_handle: c.instagram_handle, address: c.address, notes: c.notes })
    setModalOpen(true)
    const res = await api.get(`/customers/${c.id}/orders`)
    setHistory(res.data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, form)
      } else {
        await api.post('/customers', form)
      }
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm('Delete this customer and their record? Existing orders will remain but lose this link.')) return
    await api.delete(`/customers/${editing.id}`)
    setModalOpen(false)
    load()
  }

  function waLink(phone, name) {
    if (!phone) return null
    const clean = phone.replace(/[^0-9]/g, '')
    return `https://wa.me/${clean}?text=${encodeURIComponent(`Hi ${name}, `)}`
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Customers</h1>
          <p>Everyone who has ordered from your WhatsApp or Instagram shop.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Customer</button>
      </div>

      <div className="toolbar">
        <input placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 220 }} />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Instagram</th><th>Orders</th><th>Total spent</th><th></th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.instagram_handle || '—'}</td>
                  <td>{c.total_orders}</td>
                  <td>{money(c.total_spent)}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>View</button>
                    {waLink(c.phone, c.name) && (
                      <a className="btn btn-secondary btn-sm" href={waLink(c.phone, c.name)} target="_blank" rel="noreferrer">WhatsApp</a>
                    )}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state">No customers found.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title={editing ? editing.name : 'New customer'} onClose={() => setModalOpen(false)} width={600}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Phone (with country code)</label>
                <input placeholder="e.g. 919876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label>Instagram handle</label>
                <input placeholder="@handle" value={form.instagram_handle} onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Address</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="field">
              <label>Notes (preferences, sizes, etc.)</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            {editing && history && (
              <div className="field">
                <label>Order history</label>
                {history.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No orders yet.</div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Order #</th><th>Status</th><th>Amount</th></tr></thead>
                      <tbody>
                        {history.map((o) => (
                          <tr key={o.id}>
                            <td>{o.order_number}</td>
                            <td><span className={`badge badge-${o.status}`}>{o.status.replace('_', ' ')}</span></td>
                            <td>{money(o.total_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 8 }}>
              <div>
                {editing && <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
