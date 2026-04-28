import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'

const ROLE_LABEL = { ADMIN: 'Kreisschießwart', OBMANN: 'Schießobmann' }
const EMPTY_FORM = { name: '', email: '', password: '', role: 'OBMANN', jaegerschaftId: '' }

export default function BenutzerPage() {
  const [users, setUsers] = useState([])
  const [jaegerschaften, setJaegerschaften] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    Promise.all([
      apiFetch('/users'),
      apiFetch('/jaegerschaften'),
    ]).then(([u, j]) => {
      setUsers(u)
      setJaegerschaften(j)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const body = { ...form, jaegerschaftId: form.jaegerschaftId ? parseInt(form.jaegerschaftId) : null }
      if (!body.password) delete body.password

      if (editId) {
        await apiFetch(`/users/${editId}`, { method: 'PATCH', body })
      } else {
        await apiFetch('/users', { method: 'POST', body })
      }
      setForm(EMPTY_FORM)
      setEditId(null)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (u) => {
    setEditId(u.id)
    setForm({ name: u.name, email: u.email, password: '', role: u.role, jaegerschaftId: u.jaegerschaft?.id ?? '' })
    setShowForm(true)
  }

  const handleDelete = async (u) => {
    if (!confirm(`Benutzer „${u.name}" wirklich löschen?`)) return
    try {
      await apiFetch(`/users/${u.id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCancel = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(false)
    setError('')
  }

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Benutzerverwaltung</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600"
          >
            + Benutzer anlegen
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            {editId ? 'Benutzer bearbeiten' : 'Neuen Benutzer anlegen'}
          </h2>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Vorname Nachname"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">E-Mail</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="name@example.de"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Passwort {editId && <span className="text-gray-400">(leer = unverändert)</span>}
              </label>
              <input
                type="password"
                required={!editId}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Mindestens 8 Zeichen"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Rolle</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              >
                <option value="OBMANN">Schießobmann</option>
                <option value="ADMIN">Kreisschießwart (Admin)</option>
              </select>
            </div>
            {form.role === 'OBMANN' && (
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Jägerschaft</label>
                <select
                  value={form.jaegerschaftId}
                  onChange={e => setForm(f => ({ ...f, jaegerschaftId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
                >
                  <option value="">– keine –</option>
                  {jaegerschaften.map(j => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                Abbrechen
              </button>
              <button type="submit"
                className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
                {editId ? 'Speichern' : 'Anlegen'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Benutzer ({users.length})</h2>
        </div>
        {users.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-8 text-center">Keine Benutzer vorhanden.</p>
          : users.map(u => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-jagd-100 text-jagd-700 flex items-center justify-center text-xs font-semibold shrink-0">
                {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}{u.jaegerschaft ? ` · ${u.jaegerschaft.name}` : ''}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                u.role === 'ADMIN' ? 'bg-jagd-100 text-jagd-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {ROLE_LABEL[u.role]}
              </span>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(u)}
                  className="text-xs text-gray-400 hover:text-jagd-600 px-2 py-1">Bearbeiten</button>
                <button onClick={() => handleDelete(u)}
                  className="text-xs text-gray-400 hover:text-red-600 px-2 py-1">Löschen</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
