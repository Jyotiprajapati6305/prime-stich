import { useEffect, useState } from 'react'
import api, { API_BASE } from '../services/api'
import Modal from '../components/Modal.jsx'

const emptyForm = () => ({ name: '', category_id: '', price: 0, cost_estimate: 0, description: '', is_active: true })

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [newCategory, setNewCategory] = useState('')
  const [saving, setSaving] = useState(false)

  function loadProducts() {
    api.get('/products').then((res) => setProducts(res.data))
  }
  function loadCategories() {
    api.get('/categories').then((res) => setCategories(res.data))
  }

  useEffect(() => { loadProducts(); loadCategories() }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({
      name: p.name,
      category_id: p.category_id || '',
      price: p.price,
      cost_estimate: p.cost_estimate,
      description: p.description || '',
      is_active: p.is_active,
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, category_id: form.category_id ? Number(form.category_id) : null, price: Number(form.price) || 0, cost_estimate: Number(form.cost_estimate) || 0 }
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      setModalOpen(false)
      loadProducts()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm('Delete this product? Its images will be removed too.')) return
    await api.delete(`/products/${editing.id}`)
    setModalOpen(false)
    loadProducts()
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file || !editing) return
    const fd = new FormData()
    fd.append('file', file)
    await api.post(`/products/${editing.id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    const res = await api.get(`/products/${editing.id}`)
    setEditing(res.data)
    loadProducts()
  }

  async function handleDeleteImage(imageId) {
    await api.delete(`/products/images/${imageId}`)
    const res = await api.get(`/products/${editing.id}`)
    setEditing(res.data)
    loadProducts()
  }

  async function handleSetPrimary(imageId) {
    await api.put(`/products/images/${imageId}/set-primary`)
    const res = await api.get(`/products/${editing.id}`)
    setEditing(res.data)
    loadProducts()
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return
    const res = await api.post('/categories', { name: newCategory.trim() })
    setCategories((c) => [...c, res.data])
    setForm((f) => ({ ...f, category_id: res.data.id }))
    setNewCategory('')
  }

  function primaryImage(p) {
    return p.images.find((i) => i.is_primary) || p.images[0]
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p>Your catalog of crochet items — with photos, pricing, and cost estimates.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Product</button>
      </div>

      {products.length === 0 ? (
        <div className="card"><div className="empty-state"><h3>No products yet</h3><p>Add the items you crochet so they're one click away when placing an order.</p></div></div>
      ) : (
        <div className="gallery-grid">
          {products.map((p) => (
            <div className="product-card" key={p.id} onClick={() => openEdit(p)} style={{ cursor: 'pointer' }}>
              <div className="product-thumb">
                {primaryImage(p) ? (
                  <img src={`${API_BASE}/uploads/${primaryImage(p).filename}`} alt={p.name} />
                ) : (
                  <span style={{ fontSize: 36 }}>🧸</span>
                )}
              </div>
              <div className="product-body">
                <div className="name">{p.name}</div>
                <div className="price">₹{p.price}</div>
                {!p.is_active && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>Inactive</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit product' : 'New product'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Selling price (₹)</label>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="field">
                <label>Cost estimate (₹)</label>
                <input type="number" min="0" value={form.cost_estimate} onChange={(e) => setForm({ ...form, cost_estimate: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Category</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input placeholder="New category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCategory}>Add</button>
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  style={{ width: 'auto', marginRight: 6 }}
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active (shown when creating new orders)
              </label>
            </div>

            {editing && (
              <div className="field">
                <label>Photos</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {editing.images?.map((img) => (
                    <div key={img.id} style={{ position: 'relative' }}>
                      <img
                        src={`${API_BASE}/uploads/${img.filename}`}
                        style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: img.is_primary ? '2px solid var(--plum)' : '1px solid var(--border)' }}
                      />
                      <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                        {!img.is_primary && <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleSetPrimary(img.id)}>★</button>}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDeleteImage(img.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" onChange={handleUpload} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 8 }}>
              <div>
                {editing && <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete product</button>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save product'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
