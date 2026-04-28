import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

const DISZIPLIN_LABEL = { BUECHSE: 'Büchse', FLINTE: 'Flinte', PISTOLE: 'Pistole', KOMBINATION: 'Kombination' }
const DJV_GRUPPE_LABEL = { GRUPPE_A: 'Gruppe A – Büchse Pflicht', GRUPPE_B: 'Gruppe B – Flinte Pflicht', GRUPPE_C: 'Gruppe C – Kombination' }
const STATUS_CLS = { vollst: 'bg-green-100 text-green-700', fehlt: 'bg-red-100 text-red-700' }

const EMPTY_FORM = { name: '', mitgliedsnummer: '', disziplin: '', djvGruppe: '' }

export default function MannschaftPage() {
  const { user } = useAuth()
  const jaegerschaftId = user?.jaegerschaft?.id
  const [schuetzen, setSchuetzen] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    if (!jaegerschaftId) { setLoading(false); return }
    apiFetch(`/schuetzen?jaegerschaftId=${jaegerschaftId}`)
      .then(setSchuetzen)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [jaegerschaftId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editId) {
        await apiFetch(`/schuetzen/${editId}`, { method: 'PATCH', body: form })
      } else {
        await apiFetch('/schuetzen', { method: 'POST', body: { ...form, jaegerschaftId } })
      }
      setForm(EMPTY_FORM)
      setEditId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (s) => {
    setEditId(s.id)
    setForm({ name: s.name, mitgliedsnummer: s.mitgliedsnummer, disziplin: s.disziplin, djvGruppe: s.djvGruppe })
  }

  const handleDelete = async (id) => {
    if (!confirm('Schützen wirklich löschen?')) return
    await apiFetch(`/schuetzen/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>
  if (!jaegerschaftId) return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Mannschaftsanmeldung</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
        Ihrem Account ist noch keine Jägerschaft zugewiesen. Bitte wenden Sie sich an den Kreisschießwart.
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mannschaftsanmeldung</h1>

      {/* Formular */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {editId ? 'Schützen bearbeiten' : 'Neuen Schützen hinzufügen'}
        </h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Vorname Nachname" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mitgliedsnummer</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.mitgliedsnummer} onChange={e => setForm(f => ({...f, mitgliedsnummer: e.target.value}))} placeholder="DJV-000000" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Disziplin (DJV)</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.disziplin} onChange={e => setForm(f => ({...f, disziplin: e.target.value}))} required>
              <option value="">– wählen –</option>
              {Object.entries(DISZIPLIN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">DJV-Gruppe (Richtlinie)</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.djvGruppe} onChange={e => setForm(f => ({...f, djvGruppe: e.target.value}))} required>
              <option value="">– wählen –</option>
              {Object.entries(DJV_GRUPPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            {editId && <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM) }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Abbrechen</button>}
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
              {editId ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Angemeldete Schützen ({schuetzen.length})</h2>
          <span className="text-xs text-gray-400">{schuetzen.filter(s => s.disziplin && s.djvGruppe).length} vollständig</span>
        </div>
        {schuetzen.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-8 text-center">Noch keine Schützen eingetragen.</p>
          : schuetzen.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-jagd-100 text-jagd-700 flex items-center justify-center text-xs font-semibold shrink-0">
                {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                <p className="text-xs text-gray-400">{s.mitgliedsnummer} · {DISZIPLIN_LABEL[s.disziplin] ?? '–'}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.djvGruppe ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'}`}>
                {s.djvGruppe ? DJV_GRUPPE_LABEL[s.djvGruppe].split(' – ')[0] : 'Gruppe fehlt'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.disziplin && s.djvGruppe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {s.disziplin && s.djvGruppe ? 'Vollst.' : 'Unvollst.'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(s)} className="text-xs text-gray-400 hover:text-jagd-600 px-2 py-1">Bearbeiten</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-gray-400 hover:text-red-600 px-2 py-1">Löschen</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
