import { useEffect, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal.jsx'

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const CATEGORIES = ['materials', 'packaging', 'shipping', 'marketing', 'tools', 'general']
const emptyForm = () => ({ category: 'general', description: '', amount: 0, expense_date: new Date().toISOString().slice(0, 10) })

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  function load() {
    api.get('/expenses', { params: { month } }).then((res) => setExpenses(res.data))
  }
  useEffect(() => { load() }, [month])

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setModalOpen(true)
  }
  function openEdit(x) {
    setEditing(x)
    setForm({ category: x.category, description: x.description, amount: x.amount, expense_date: x.expense_date })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, amount: Number(form.amount) || 0 }
    try {
      if (editing) await api.put(`/expenses/${editing.id}`, payload)
      else await api.post('/expenses', payload)
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm('Delete this expense?')) return
    await api.delete(`/expenses/${editing.id}`)
    setModalOpen(false)
    load()
  }

  const total = expenses.reduce((s, x) => s + x.amount, 0)

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Expenses</h1>
          <p>Materials, packaging, shipping — everything it costs to run your shop.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Expense</button>
      </div>

      <div className="toolbar">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <div className="stat-card" style={{ padding: '10px 16px' }}>
          <div className="stat-label">Total this month</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{money(total)}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              {expenses.map((x) => (
                <tr key={x.id}>
                  <td>{x.expense_date}</td>
                  <td><span className="badge badge-in_progress">{x.category}</span></td>
                  <td>{x.description || '—'}</td>
                  <td>{money(x.amount)}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => openEdit(x)}>Edit</button></td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state">No expenses logged for this month.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit expense' : 'New expense'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <label>Amount (₹)</label>
              <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div>{editing && <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>}</div>
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
