// VeranstaltungPage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../../hooks/useApi'

export default function VeranstaltungPage() {
  const [veranstaltungen, setVeranstaltungen] = useState([])
  const [form, setForm] = useState({ name: '', datum: '', ort: '', beschreibung: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => apiFetch('/veranstaltungen').then(setVeranstaltungen).finally(() => setLoading(false))
  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/veranstaltungen', { method: 'POST', body: form })
      setForm({ name: '', datum: '', ort: '', beschreibung: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  const handleStatus = async (id, status) => {
    await apiFetch(`/veranstaltungen/${id}`, { method: 'PATCH', body: { status } })
    load()
  }

  const STATUS_OPTIONS = ['PLANUNG', 'ANMELDUNG', 'AKTIV', 'ABGESCHLOSSEN']
  const STATUS_LABEL = { PLANUNG: 'Planung', ANMELDUNG: 'Anmeldung', AKTIV: 'Aktiv', ABGESCHLOSSEN: 'Abgeschlossen' }

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Veranstaltungen verwalten</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Neue Veranstaltung</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="z.B. Kreisschießen 2025" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Datum</label>
            <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.datum} onChange={e => setForm(f => ({...f, datum: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ort / Schießstand</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.ort} onChange={e => setForm(f => ({...f, ort: e.target.value}))} placeholder="Schießstand Musterbach" required />
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
              Erstellen
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {veranstaltungen.map(v => (
          <div key={v.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{v.name}</p>
              <p className="text-xs text-gray-400">{new Date(v.datum).toLocaleDateString('de-DE')} · {v.ort}</p>
            </div>
            <select value={v.status}
              onChange={e => handleStatus(v.id, e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
