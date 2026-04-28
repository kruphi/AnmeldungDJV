import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

const STATUS_CLS = {
  BESTAETIGT: 'bg-green-100 text-green-700',
  AUSSTEHEND:  'bg-amber-100 text-amber-700',
  ABGESAGT:    'bg-red-100 text-red-700',
}
const STATUS_LABEL = { BESTAETIGT: 'Bestätigt', AUSSTEHEND: 'Ausstehend', ABGESAGT: 'Abgesagt' }

export default function HelferPage() {
  const { user } = useAuth()
  const jaegerschaftId = user?.jaegerschaft?.id
  const [helfer, setHelfer] = useState([])
  const [kategorien, setKategorien] = useState([])
  const [form, setForm] = useState({ name: '', kategorieId: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    if (!jaegerschaftId) { setLoading(false); return }
    Promise.all([
      apiFetch(`/helfer?jaegerschaftId=${jaegerschaftId}`),
      apiFetch('/helfer-kategorien'),
    ]).then(([h, k]) => { setHelfer(h); setKategorien(k) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [jaegerschaftId])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/helfer', {
        method: 'POST',
        body: { ...form, kategorieId: parseInt(form.kategorieId), jaegerschaftId },
      })
      setForm({ name: '', kategorieId: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  const handleStatus = async (id, status) => {
    await apiFetch(`/helfer/${id}`, { method: 'PATCH', body: { status } })
    load()
  }

  const handleDelete = async (id) => {
    await apiFetch(`/helfer/${id}`, { method: 'DELETE' })
    load()
  }

  const besetzt = (kategorieId) => helfer.find(h => h.kategorieId === kategorieId && h.status !== 'ABGESAGT')

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>
  if (!jaegerschaftId) return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Helferplanung</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
        Ihrem Account ist noch keine Jägerschaft zugewiesen. Bitte wenden Sie sich an den Kreisschießwart.
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Helferplanung</h1>

      {/* Pflichtübersicht */}
      {kategorien.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Pflichthelfer Ihrer Jägerschaft</h2>
          <div className="space-y-2">
            {kategorien.map(k => {
              const h = besetzt(k.id)
              return (
                <div key={k.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{k.name}</span>
                  {h
                    ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[h.status]}`}>
                        {h.name} – {STATUS_LABEL[h.status]}
                      </span>
                    : <span className="text-xs text-red-500 font-medium">Nicht besetzt</span>
                  }
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Formular */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Helfer eintragen</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {kategorien.length === 0
          ? (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-3">
              Noch keine Helfer-Kategorien konfiguriert. Bitte beim Kreisschießwart anfragen.
            </p>
          )
          : (
            <form onSubmit={handleAdd} className="flex gap-3">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Name des Helfers"
                required
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
                value={form.kategorieId}
                onChange={e => setForm(f => ({ ...f, kategorieId: e.target.value }))}
                required
              >
                <option value="">– Aufgabe –</option>
                {kategorien.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <button type="submit"
                className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600 whitespace-nowrap">
                Hinzufügen
              </button>
            </form>
          )
        }
      </div>

      {/* Helferliste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Eingetragene Helfer ({helfer.length})</h2>
        </div>
        {helfer.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-8 text-center">Noch keine Helfer eingetragen.</p>
          : helfer.map(h => (
            <div key={h.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{h.name}</p>
                <p className="text-xs text-gray-400">{h.kategorie.name}</p>
              </div>
              <select
                value={h.status}
                onChange={e => handleStatus(h.id, e.target.value)}
                className={`text-xs rounded-full px-2 py-0.5 border-0 font-medium cursor-pointer ${STATUS_CLS[h.status]}`}
              >
                {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button onClick={() => handleDelete(h.id)}
                className="text-xs text-gray-400 hover:text-red-600 px-2 py-1">Löschen</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
