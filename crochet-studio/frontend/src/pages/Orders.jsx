import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal.jsx'

const STATUSES = ['new', 'in_progress', 'ready', 'delivered', 'cancelled']
const STATUS_LABEL = { new: 'New', in_progress: 'In Progress', ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled' }
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const emptyForm = () => ({
  customer_id: '',
  status: 'new',
  order_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  advance_paid: 0,
  payment_status: 'unpaid',
  source: 'whatsapp',
  notes: '',
  items: [{ product_id: '', item_name: '', quantity: 1, unit_price: 0 }],
})

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [view, setView] = useState('kanban')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  function loadOrders() {
    api.get('/orders').then((res) => setOrders(res.data))
  }

  useEffect(() => {
    loadOrders()
    api.get('/customers').then((res) => setCustomers(res.data))
    api.get('/products').then((res) => setProducts(res.data))
  }, [])

  const filtered = useMemo(
    () => (statusFilter ? orders.filter((o) => o.status === statusFilter) : orders),
    [orders, statusFilter]
  )

  const columns = useMemo(() => {
    const map = {}
    STATUSES.forEach((s) => (map[s] = []))
    orders.forEach((o) => map[o.status]?.push(o))
    return map
  }, [orders])

  function openNew() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(order) {
    setEditingId(order.id)
    setForm({
      customer_id: order.customer_id,
      status: order.status,
      order_date: order.order_date,
      due_date: order.due_date || '',
      advance_paid: order.advance_paid,
      payment_status: order.payment_status,
      source: order.source,
      notes: order.notes || '',
      items: order.items.map((i) => ({
        product_id: i.product_id || '',
        item_name: i.item_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    })
    setModalOpen(true)
  }

  function updateItem(idx, field, value) {
    setForm((f) => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [field]: value }
      if (field === 'product_id' && value) {
        const p = products.find((p) => p.id === Number(value))
        if (p) {
          items[idx].item_name = p.name
          items[idx].unit_price = p.price
        }
      }
      return { ...f, items }
    })
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { product_id: '', item_name: '', quantity: 1, unit_price: 0 }] }))
  }

  function removeItem(idx) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  const formTotal = form.items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.customer_id) return
    setSaving(true)
    const payload = {
      ...form,
      customer_id: Number(form.customer_id),
      advance_paid: Number(form.advance_paid) || 0,
      due_date: form.due_date || null,
      items: form.items
        .filter((i) => i.item_name)
        .map((i) => ({
          product_id: i.product_id ? Number(i.product_id) : null,
          item_name: i.item_name,
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
        })),
    }
    try {
      if (editingId) {
        await api.put(`/orders/${editingId}`, payload)
      } else {
        await api.post('/orders', payload)
      }
      setModalOpen(false)
      loadOrders()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingId) return
    if (!confirm('Delete this order? This cannot be undone.')) return
    await api.delete(`/orders/${editingId}`)
    setModalOpen(false)
    loadOrders()
  }

  async function changeStatus(order, status) {
    await api.patch(`/orders/${order.id}/status`, { status })
    loadOrders()
  }

  function whatsappLink(order) {
    const customer = customers.find((c) => c.id === order.customer_id)
    if (!customer?.phone) return null
    const phone = customer.phone.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Hi ${customer.name}, this is regarding your order ${order.order_number} (${STATUS_LABEL[order.status]}). Total: ${money(order.total_amount)}.`
    )
    return `https://wa.me/${phone}?text=${msg}`
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <p>Track every WhatsApp &amp; Instagram order from request to delivery.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Order</button>
      </div>

      <div className="toolbar">
        <div className="tabs" style={{ marginBottom: 0, border: 'none' }}>
          <div className={`tab ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>Board</div>
          <div className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</div>
        </div>
        {view === 'list' && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        )}
      </div>

      {view === 'kanban' ? (
        <div className="kanban">
          {STATUSES.map((status) => (
            <div className="kanban-col" key={status}>
              <h4>{STATUS_LABEL[status]} · {columns[status].length}</h4>
              {columns[status].map((o) => (
                <div className="stitch-card" key={o.id} onClick={() => openEdit(o)}>
                  <div className="order-no">{o.order_number}</div>
                  <div className="cust-name">{o.customer?.name}</div>
                  <div className="amount">{money(o.total_amount)}</div>
                  <select
                    value={o.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => changeStatus(o, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Payment</th><th>Amount</th><th>Due</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>{o.order_number}</td>
                    <td>{o.customer?.name}</td>
                    <td><span className={`badge badge-${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
                    <td><span className={`badge badge-${o.payment_status}`}>{o.payment_status}</span></td>
                    <td>{money(o.total_amount)}</td>
                    <td>{o.due_date || '—'}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(o)}>Edit</button>
                      {whatsappLink(o) && (
                        <a className="btn btn-secondary btn-sm" href={whatsappLink(o)} target="_blank" rel="noreferrer">WhatsApp</a>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7}><div className="empty-state">No orders match this filter.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title={editingId ? 'Edit order' : 'New order'} onClose={() => setModalOpen(false)} width={640}>
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label>Customer</label>
                <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
                  <option value="">Select customer…</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Source</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Order date</label>
                <input type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
              </div>
              <div className="field">
                <label>Due date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
            </div>

            <div className="field">
              <label>Items</label>
              <div className="item-row item-row-head">
                <span>Item</span><span>Qty</span><span>Price</span><span></span>
              </div>
              {form.items.map((item, idx) => (
                <div className="item-row" key={idx}>
                  <input
                    placeholder="Item name"
                    value={item.item_name}
                    onChange={(e) => updateItem(idx, 'item_name', e.target.value)}
                  />
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
                  <input type="number" min="0" value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(idx)}>✕</button>
                </div>
              ))}
              <select
                onChange={(e) => { if (e.target.value) updateItem(form.items.length - 1, 'product_id', e.target.value); e.target.value = '' }}
                style={{ marginBottom: 8 }}
              >
                <option value="">Fill last row from product…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
              </select>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add item</button>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Payment status</label>
                <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Advance / amount paid</label>
              <input type="number" min="0" value={form.advance_paid} onChange={(e) => setForm({ ...form, advance_paid: e.target.value })} />
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="card" style={{ background: 'var(--plum-light)', border: 'none', marginBottom: 16 }}>
              <strong>Order total: {money(formTotal)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div>
                {editingId && <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete order</button>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save order'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
