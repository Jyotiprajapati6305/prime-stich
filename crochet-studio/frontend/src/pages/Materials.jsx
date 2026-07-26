import { useEffect, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal.jsx'

const emptyForm = () => ({ name: '', unit: 'g', quantity_in_stock: 0, cost_per_unit: 0, reorder_level: 0, supplier: '' })

export default function Materials() {
  const [materials, setMaterials] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [adjustFor, setAdjustFor] = useState(null)
  const [adjustAmount, setAdjustAmount] = useState('')

  function load() {
    api.get('/materials').then((res) => setMaterials(res.data))
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setModalOpen(true)
  }
  function openEdit(m) {
    setEditing(m)
    setForm({ name: m.name, unit: m.unit, quantity_in_stock: m.quantity_in_stock, cost_per_unit: m.cost_per_unit, reorder_level: m.reorder_level, supplier: m.supplier })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      quantity_in_stock: Number(form.quantity_in_stock) || 0,
      cost_per_unit: Number(form.cost_per_unit) || 0,
      reorder_level: Number(form.reorder_level) || 0,
    }
    try {
      if (editing) await api.put(`/materials/${editing.id}`, payload)
      else await api.post('/materials', payload)
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm('Delete this material?')) return
    await api.delete(`/materials/${editing.id}`)
    setModalOpen(false)
    load()
  }

  async function handleAdjust(e) {
    e.preventDefault()
    if (!adjustFor || !adjustAmount) return
    await api.post(`/materials/${adjustFor.id}/adjust`, { quantity_change: Number(adjustAmount) })
    setAdjustFor(null)
    setAdjustAmount('')
    load()
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Materials</h1>
          <p>Yarn, stuffing, eyes &amp; everything else — track stock and reorder points.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Material</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>In stock</th><th>Cost/unit</th><th>Reorder level</th><th>Supplier</th><th></th></tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const low = m.quantity_in_stock <= m.reorder_level
                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td className={low ? 'low-stock' : ''}>{m.quantity_in_stock} {m.unit} {low && '⚠️'}</td>
                    <td>₹{m.cost_per_unit}</td>
                    <td>{m.reorder_level} {m.unit}</td>
                    <td>{m.supplier || '—'}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setAdjustFor(m)}>Adjust</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Edit</button>
                    </td>
                  </tr>
                )
              })}
              {materials.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state">No materials tracked yet.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit material' : 'New material'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="g">grams</option>
                  <option value="kg">kg</option>
                  <option value="pcs">pieces</option>
                  <option value="m">meters</option>
                  <option value="ball">balls</option>
                </select>
              </div>
              <div className="field">
                <label>Current stock</label>
                <input type="number" value={form.quantity_in_stock} onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Cost per unit (₹)</label>
                <input type="number" value={form.cost_per_unit} onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })} />
              </div>
              <div className="field">
                <label>Reorder level</label>
                <input type="number" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Supplier</label>
              <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
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

      {adjustFor && (
        <Modal title={`Adjust stock — ${adjustFor.name}`} onClose={() => setAdjustFor(null)} width={380}>
          <form onSubmit={handleAdjust}>
            <div className="field">
              <label>Change ({adjustFor.unit}) — use negative for usage, positive for restock</label>
              <input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} autoFocus required />
            </div>
            <button className="btn btn-primary btn-block" type="submit">Apply</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
