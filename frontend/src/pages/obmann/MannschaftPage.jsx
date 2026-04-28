import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

const DISZIPLIN_LABEL = { BUECHSE: 'Büchse', FLINTE: 'Flinte', PISTOLE: 'Pistole', KOMBINATION: 'Kombination' }
const DJV_GRUPPE_LABEL = { GRUPPE_A: 'Gruppe A', GRUPPE_B: 'Gruppe B', GRUPPE_C: 'Gruppe C' }
const EMPTY_FORM = { name: '', mitgliedsnummer: '', disziplin: '', djvGruppe: '' }

// ─── Admin-Ansicht: alle Jägerschaften gruppiert ────────────────────────────

function AdminMannschaftView() {
  const [schuetzen, setSchuetzen] = useState([])
  const [jaegerschaften, setJaegerschaften] = useState([])
  const [filterJsId, setFilterJsId] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...EMPTY_FORM, jaegerschaftId: '' })
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    Promise.all([
      apiFetch('/schuetzen'),
      apiFetch('/jaegerschaften'),
    ]).then(([s, j]) => { setSchuetzen(s); setJaegerschaften(j) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editId) {
        await apiFetch(`/schuetzen/${editId}`, { method: 'PATCH', body: form })
      } else {
        await apiFetch('/schuetzen', { method: 'POST', body: { ...form, jaegerschaftId: parseInt(form.jaegerschaftId) } })
      }
      setForm({ ...EMPTY_FORM, jaegerschaftId: '' })
      setEditId(null)
      load()
    } catch (err) { setError(err.message) }
  }

  const handleEdit = (s) => {
    setEditId(s.id)
    setForm({ name: s.name, mitgliedsnummer: s.mitgliedsnummer, disziplin: s.disziplin, djvGruppe: s.djvGruppe, jaegerschaftId: s.jaegerschaftId })
  }

  const handleDelete = async (id) => {
    if (!confirm('Schützen wirklich löschen?')) return
    await apiFetch(`/schuetzen/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  const filtered = filterJsId ? schuetzen.filter(s => s.jaegerschaft?.id === parseInt(filterJsId)) : schuetzen

  // Gruppieren nach Jägerschaft
  const gruppen = filtered.reduce((acc, s) => {
    const key = s.jaegerschaft?.name ?? 'Unbekannt'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Alle Mannschaften</h1>
        <span className="text-sm text-gray-500">{schuetzen.length} Schützen · {Object.keys(gruppen).length} Jägerschaften</span>
      </div>

      {/* Formular */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{editId ? 'Schützen bearbeiten' : 'Schützen hinzufügen'}</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Jägerschaft</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.jaegerschaftId} onChange={e => setForm(f => ({ ...f, jaegerschaftId: e.target.value }))} required={!editId} disabled={!!editId}>
              <option value="">– wählen –</option>
              {jaegerschaften.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Vorname Nachname" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mitgliedsnummer</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.mitgliedsnummer} onChange={e => setForm(f => ({ ...f, mitgliedsnummer: e.target.value }))} placeholder="DJV-000000" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Disziplin</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.disziplin} onChange={e => setForm(f => ({ ...f, disziplin: e.target.value }))} required>
              <option value="">– wählen –</option>
              {Object.entries(DISZIPLIN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">DJV-Gruppe</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.djvGruppe} onChange={e => setForm(f => ({ ...f, djvGruppe: e.target.value }))} required>
              <option value="">– wählen –</option>
              {Object.entries(DJV_GRUPPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ ...EMPTY_FORM, jaegerschaftId: '' }) }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Abbrechen</button>}
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
              {editId ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-500">Filtern:</label>
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
          value={filterJsId} onChange={e => setFilterJsId(e.target.value)}>
          <option value="">Alle Jägerschaften</option>
          {jaegerschaften.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} Schützen</span>
      </div>

      {/* Gruppen */}
      {Object.entries(gruppen).length === 0
        ? <div className="bg-white rounded-xl border border-gray-200 px-5 py-10 text-center text-sm text-gray-400">Keine Schützen vorhanden.</div>
        : Object.entries(gruppen).map(([jsName, liste]) => (
          <div key={jsName} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">{jsName}</h2>
              <span className="text-xs text-gray-400">
                {liste.length} Schützen · {liste.filter(s => s.disziplin && s.djvGruppe).length} vollständig
              </span>
            </div>
            {liste.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-jagd-100 text-jagd-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.mitgliedsnummer} · {DISZIPLIN_LABEL[s.disziplin] ?? '–'} · {DJV_GRUPPE_LABEL[s.djvGruppe] ?? '–'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.disziplin && s.djvGruppe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {s.disziplin && s.djvGruppe ? 'Vollst.' : 'Unvollst.'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="text-xs text-gray-400 hover:text-jagd-600 px-2 py-1">Bearbeiten</button>
                  <button onClick={() => handleDelete(s.id)} className="text-xs text-gray-400 hover:text-red-600 px-2 py-1">Löschen</button>
                </div>
              </div>
            ))}
          </div>
        ))
      }
    </div>
  )
}

// ─── Obmann-Ansicht: eigene Jägerschaft ────────────────────────────────────

export default function MannschaftPage() {
  const { user, isAdmin } = useAuth()

  if (isAdmin) return <AdminMannschaftView />

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
    } catch (err) { setError(err.message) }
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

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {editId ? 'Schützen bearbeiten' : 'Neuen Schützen hinzufügen'}
        </h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Vorname Nachname" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mitgliedsnummer</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.mitgliedsnummer} onChange={e => setForm(f => ({ ...f, mitgliedsnummer: e.target.value }))} placeholder="DJV-000000" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Disziplin (DJV)</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.disziplin} onChange={e => setForm(f => ({ ...f, disziplin: e.target.value }))} required>
              <option value="">– wählen –</option>
              {Object.entries(DISZIPLIN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">DJV-Gruppe</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.djvGruppe} onChange={e => setForm(f => ({ ...f, djvGruppe: e.target.value }))} required>
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
                {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                <p className="text-xs text-gray-400">{s.mitgliedsnummer} · {DISZIPLIN_LABEL[s.disziplin] ?? '–'}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.djvGruppe ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'}`}>
                {s.djvGruppe ? DJV_GRUPPE_LABEL[s.djvGruppe] : 'Gruppe fehlt'}
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
