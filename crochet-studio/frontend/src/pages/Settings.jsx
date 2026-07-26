import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'

export default function Settings() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data))
  }, [])

  async function addCategory() {
    if (!newCategory.trim()) return
    const res = await api.post('/categories', { name: newCategory.trim() })
    setCategories((c) => [...c, res.data])
    setNewCategory('')
  }

  async function deleteCategory(id) {
    await api.delete(`/categories/${id}`)
    setCategories((c) => c.filter((cat) => cat.id !== id))
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwMsg('')
    setPwErr('')
    try {
      await api.post('/auth/change-password', pwForm)
      setPwMsg('Password updated.')
      setPwForm({ current_password: '', new_password: '' })
    } catch (err) {
      setPwErr(err.response?.data?.detail || 'Could not update password.')
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and product categories.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="section-title">Account</div>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 14 }}>Signed in as <strong>{user?.username}</strong></p>
          <form onSubmit={handlePasswordChange}>
            {pwMsg && <div style={{ background: 'var(--sage-light)', color: 'var(--sage)', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{pwMsg}</div>}
            {pwErr && <div className="error-msg">{pwErr}</div>}
            <div className="field">
              <label>Current password</label>
              <input type="password" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} required minLength={6} />
            </div>
            <button className="btn btn-primary" type="submit">Update password</button>
          </form>
        </div>

        <div className="card">
          <div className="section-title">Product categories</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input placeholder="e.g. Amigurumi, Bags, Blankets" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            <button className="btn btn-secondary" onClick={addCategory}>Add</button>
          </div>
          {categories.length === 0 ? (
            <div className="empty-state">No categories yet.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((c) => (
                <span key={c.id} className="badge badge-in_progress" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.name}
                  <button onClick={() => deleteCategory(c.id)} style={{ border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
