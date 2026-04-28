import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'

export default function EinstellungenPage() {
  const [kategorien, setKategorien] = useState([])
  const [form, setForm] = useState({ name: '', nurBSchuetzen: false })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () =>
    apiFetch('/mannschaft-kategorien')
      .then(setKategorien)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

  useEffect(load, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/mannschaft-kategorien', { method: 'POST', body: form })
      setForm({ name: '', nurBSchuetzen: false })
      load()
    } catch (err) { setError(err.message) }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch(`/mannschaft-kategorien/${editing.id}`, { method: 'PATCH', body: editing })
      setEditing(null)
      load()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await apiFetch(`/mannschaft-kategorien/${id}`, { method: 'DELETE' })
      load()
    } catch (err) { setError(err.message) }
  }

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Einstellungen</h1>

      {/* Mannschafts-Kategorien */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Mannschafts-Kategorien</h2>
        <p className="text-xs text-gray-400 mb-4">
          Legen Sie fest, welche Mannschaftstypen die Schießobleute verwenden können.
          Aktivieren Sie „Nur B-Schützen", um A-Schützen (Gold/SonderGold) aus dieser Kategorie auszuschließen.
        </p>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {/* Neue Kategorie */}
        <form onSubmit={handleAdd} className="flex gap-3 items-end mb-5 pb-5 border-b border-gray-100">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="z.B. A-Mannschaft"
              required
            />
          </div>
          <div className="flex-shrink-0 pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox"
                checked={form.nurBSchuetzen}
                onChange={e => setForm(f => ({ ...f, nurBSchuetzen: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-jagd-600 focus:ring-jagd-500" />
              <span className="text-sm text-gray-700 whitespace-nowrap">Nur B-Schützen</span>
            </label>
          </div>
          <button type="submit"
            className="flex-shrink-0 px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
            Hinzufügen
          </button>
        </form>

        {/* Liste */}
        {kategorien.length === 0
          ? <p className="text-sm text-gray-400 text-center py-4">Noch keine Kategorien angelegt.</p>
          : kategorien.map(k => (
            <div key={k.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              {editing?.id === k.id
                ? (
                  <form onSubmit={handleEdit} className="flex gap-3 items-center flex-1">
                    <input
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
                      value={editing.name}
                      onChange={e => setEditing(ed => ({ ...ed, name: e.target.value }))}
                      required
                    />
                    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                      <input type="checkbox"
                        checked={editing.nurBSchuetzen}
                        onChange={e => setEditing(ed => ({ ...ed, nurBSchuetzen: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-jagd-600" />
                      <span className="text-xs text-gray-600">Nur B-Schützen</span>
                    </label>
                    <button type="submit"
                      className="text-xs px-3 py-1.5 bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
                      Speichern
                    </button>
                    <button type="button" onClick={() => setEditing(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2">Abbrechen</button>
                  </form>
                )
                : (
                  <>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{k.name}</span>
                      {k.nurBSchuetzen && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          Nur B-Schützen
                        </span>
                      )}
                    </div>
                    <button onClick={() => setEditing({ ...k })}
                      className="text-xs text-gray-400 hover:text-jagd-600 px-2 py-1">Bearbeiten</button>
                    <button onClick={() => handleDelete(k.id)}
                      className="text-xs text-gray-400 hover:text-red-600 px-2 py-1">Löschen</button>
                  </>
                )
              }
            </div>
          ))
        }
      </div>
    </div>
  )
}
