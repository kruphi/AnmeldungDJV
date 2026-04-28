// GruppenPage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export default function GruppenPage() {
  const [veranstaltungen, setVeranstaltungen] = useState([])
  const [selectedV, setSelectedV] = useState('')
  const [gruppen, setGruppen] = useState([])
  const [form, setForm] = useState({ name: '', stand: '', startzeit: '', endzeit: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/veranstaltungen').then(data => {
      setVeranstaltungen(data)
      if (data.length > 0) setSelectedV(String(data[0].id))
    })
  }, [])

  useEffect(() => {
    if (selectedV) apiFetch(`/gruppen?veranstaltungId=${selectedV}`).then(setGruppen)
  }, [selectedV])

  const load = () => apiFetch(`/gruppen?veranstaltungId=${selectedV}`).then(setGruppen)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/gruppen', { method: 'POST', body: { ...form, veranstaltungId: parseInt(selectedV) } })
      setForm({ name: '', stand: '', startzeit: '', endzeit: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Gruppe wirklich löschen?')) return
    await apiFetch(`/gruppen/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Gruppen & Zeitplan</h1>

      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">Veranstaltung</label>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={selectedV} onChange={e => setSelectedV(e.target.value)}>
          {veranstaltungen.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Neue Gruppe</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Gruppenname</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Gruppe 1" required /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Stand</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.stand} onChange={e => setForm(f => ({...f, stand: e.target.value}))} placeholder="Stand A – Büchse 100m" required /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Startzeit</label>
            <input type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.startzeit} onChange={e => setForm(f => ({...f, startzeit: e.target.value}))} required /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Endzeit</label>
            <input type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.endzeit} onChange={e => setForm(f => ({...f, endzeit: e.target.value}))} required /></div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">Erstellen</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-700">Gruppen ({gruppen.length})</h2></div>
        {gruppen.map(g => (
          <div key={g.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{g.name}</p>
              <p className="text-xs text-gray-400">{g.stand} · {fmt(g.startzeit)} – {fmt(g.endzeit)} Uhr</p>
              {g.jaegerschaften?.length > 0 && (
                <p className="text-xs text-jagd-600 mt-0.5">{g.jaegerschaften.map(j => j.name).join(', ')}</p>
              )}
            </div>
            <button onClick={() => handleDelete(g.id)} className="text-xs text-gray-400 hover:text-red-600">Löschen</button>
          </div>
        ))}
      </div>
    </div>
  )
}
