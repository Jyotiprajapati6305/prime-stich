import { useEffect, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal.jsx'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)

  function load() {
    api.get('/notes').then((res) => setNotes(res.data))
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ title: '', content: '' })
    setModalOpen(true)
  }
  function openEdit(n) {
    setEditing(n)
    setForm({ title: n.title, content: n.content })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await api.put(`/notes/${editing.id}`, form)
      else await api.post('/notes', form)
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return
    await api.delete(`/notes/${id}`)
    load()
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Notes</h1>
          <p>Quick reminders — custom requests, ideas, things to follow up on.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Note</button>
      </div>

      {notes.length === 0 ? (
        <div className="card"><div className="empty-state"><h3>No notes yet</h3><p>Jot down anything you don't want to forget.</p></div></div>
      ) : (
        <div className="notes-grid">
          {notes.map((n) => (
            <div className="note-card" key={n.id}>
              {n.title && <div className="note-title">{n.title}</div>}
              <div className="note-content">{n.content}</div>
              <div className="note-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(n)}>Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(n.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit note' : 'New note'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Title (optional)</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            </div>
            <div className="field">
              <label>Note</label>
              <textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
