// JaegerschaftenPage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../../hooks/useApi'

export default function JaegerschaftenPage() {
  const [veranstaltungen, setVeranstaltungen] = useState([])
  const [selectedV, setSelectedV] = useState('')
  const [jaegerschaften, setJaegerschaften] = useState([])
  const [gruppen, setGruppen] = useState([])
  const [form, setForm] = useState({ name: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/veranstaltungen').then(data => {
      setVeranstaltungen(data)
      if (data.length > 0) setSelectedV(String(data[0].id))
    })
  }, [])

  useEffect(() => {
    if (!selectedV) return
    Promise.all([
      apiFetch(`/jaegerschaften?veranstaltungId=${selectedV}`),
      apiFetch(`/gruppen?veranstaltungId=${selectedV}`)
    ]).then(([j, g]) => { setJaegerschaften(j); setGruppen(g) })
  }, [selectedV])

  const load = () => Promise.all([
    apiFetch(`/jaegerschaften?veranstaltungId=${selectedV}`),
    apiFetch(`/gruppen?veranstaltungId=${selectedV}`)
  ]).then(([j, g]) => { setJaegerschaften(j); setGruppen(g) })

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/jaegerschaften', { method: 'POST', body: { name: form.name, veranstaltungId: parseInt(selectedV) } })
      setForm({ name: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  const handleGruppeZuweisung = async (jaegerschaftId, gruppeId) => {
    await apiFetch(`/gruppen/${gruppeId}/zuweisung`, { method: 'PATCH', body: { jaegerschaftId } })
    load()
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Jägerschaften verwalten</h1>

      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">Veranstaltung</label>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={selectedV} onChange={e => setSelectedV(e.target.value)}>
          {veranstaltungen.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Jägerschaft hinzufügen</h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={handleCreate} className="flex gap-3">
          <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
            value={form.name} onChange={e => setForm({ name: e.target.value })} placeholder="z.B. Hegering Altmühltal" required />
          <button type="submit" className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">Hinzufügen</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Jägerschaften & Gruppenzuweisung</h2>
        </div>
        {jaegerschaften.map(j => (
          <div key={j.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{j.name}</p>
              <p className="text-xs text-gray-400">{j._count?.schuetzen ?? 0} Schützen · {j._count?.helfer ?? 0} Helfer</p>
            </div>
            <select
              value={j.gruppeId || ''}
              onChange={e => e.target.value && handleGruppeZuweisung(j.id, parseInt(e.target.value))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600">
              <option value="">Gruppe zuweisen</option>
              {gruppen.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            {j.gruppe && <span className="text-xs bg-jagd-50 text-jagd-700 px-2 py-0.5 rounded-full">{j.gruppe.name}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
