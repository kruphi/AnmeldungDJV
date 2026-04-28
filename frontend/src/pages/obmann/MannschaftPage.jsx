import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

const NADEL_LABEL = { BRONZE: 'Bronze', SILBER: 'Silber', GOLD: 'Gold', SONDERGOLD: 'SonderGold' }
const NADEL_CLS = {
  BRONZE: 'bg-amber-100 text-amber-800',
  SILBER: 'bg-gray-100 text-gray-700',
  GOLD: 'bg-yellow-100 text-yellow-800',
  SONDERGOLD: 'bg-yellow-200 text-yellow-900',
}
const DISZIPLIN_LABEL = { BUECHSE: 'Büchse', FLINTE: 'Flinte', PISTOLE: 'Pistole', KOMBINATION: 'Kombination' }

const isASchuetze = (s) => s.nadel === 'GOLD' || s.nadel === 'SONDERGOLD'
const schuetzeName = (s) => `${s.vorname} ${s.nachname}`
const currentYear = new Date().getFullYear()

// ── Schützen-Badges ───────────────────────────────────────────────────────────
function SchuetzeBadges({ s }) {
  return (
    <div className="flex flex-wrap gap-1 mt-0.5">
      {s.nadel && (
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${NADEL_CLS[s.nadel]}`}>
          {NADEL_LABEL[s.nadel]}
        </span>
      )}
      {isASchuetze(s) && (
        <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-jagd-100 text-jagd-800">A-Schütze</span>
      )}
      {!isASchuetze(s) && s.nadel && (
        <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-50 text-blue-700">B-Schütze</span>
      )}
      {s.dame && (
        <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-pink-50 text-pink-700">Dame</span>
      )}
      {s.jungjaeger && (
        <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700">
          JungJäger{s.jungjaegerSeit ? ` (seit ${s.jungjaegerSeit})` : ''}
        </span>
      )}
    </div>
  )
}

// ── Admin-Ansicht ─────────────────────────────────────────────────────────────
function AdminMannschaftView() {
  const [schuetzen, setSchuetzen] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/schuetzen')
      .then(setSchuetzen)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  const grouped = schuetzen.reduce((acc, s) => {
    const key = s.jaegerschaft?.name ?? 'Unbekannt'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const keys = Object.keys(grouped).filter(k => !filter || k === filter).sort()

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Alle Schützen</h1>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
        >
          <option value="">Alle Jägerschaften</option>
          {Object.keys(grouped).sort().map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      {keys.map(k => (
        <div key={k} className="mb-5 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">{k} ({grouped[k].length})</h2>
          </div>
          {grouped[k].map(s => (
            <div key={s.id} className="flex items-start gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{schuetzeName(s)}</p>
                <SchuetzeBadges s={s} />
                {s.jahrgang && <p className="text-xs text-gray-400 mt-0.5">Jg. {s.jahrgang}</p>}
              </div>
              {s.disziplin && <span className="text-xs text-gray-400 mt-0.5">{DISZIPLIN_LABEL[s.disziplin]}</span>}
            </div>
          ))}
        </div>
      ))}
      {keys.length === 0 && <p className="text-sm text-gray-400 text-center py-12">Keine Schützen vorhanden.</p>}
    </div>
  )
}

// ── Schütze-Formular ──────────────────────────────────────────────────────────
const emptyForm = {
  vorname: '', nachname: '', mitgliedsnummer: '', jahrgang: '',
  jungjaeger: false, jungjaegerSeit: '', dame: false,
  nadel: '', disziplin: '', djvGruppe: '',
}

function SchuetzeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? emptyForm)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Vorname *</label>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
          value={form.vorname} onChange={e => set('vorname', e.target.value)} required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Nachname *</label>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
          value={form.nachname} onChange={e => set('nachname', e.target.value)} required />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Jahrgang</label>
        <input type="number" min="1920" max={currentYear}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
          value={form.jahrgang} onChange={e => set('jahrgang', e.target.value)} placeholder="z.B. 1975" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Mitgliedsnummer</label>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
          value={form.mitgliedsnummer} onChange={e => set('mitgliedsnummer', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Nadel</label>
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
          value={form.nadel} onChange={e => set('nadel', e.target.value)}>
          <option value="">– keine –</option>
          {Object.entries(NADEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Disziplin</label>
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
          value={form.disziplin} onChange={e => set('disziplin', e.target.value)}>
          <option value="">– keine –</option>
          {Object.entries(DISZIPLIN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="col-span-2 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.dame} onChange={e => set('dame', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-jagd-600 focus:ring-jagd-500" />
          <span className="text-sm text-gray-700">Dame</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.jungjaeger} onChange={e => set('jungjaeger', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-jagd-600 focus:ring-jagd-500" />
          <span className="text-sm text-gray-700">JungJäger</span>
          <span className="text-xs text-gray-400">(Jagdschein noch keine 4 Jahre)</span>
        </label>
        {form.jungjaeger && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Jagdschein seit</label>
            <input type="number" min="2000" max={currentYear}
              className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.jungjaegerSeit} onChange={e => set('jungjaegerSeit', e.target.value)}
              placeholder={String(currentYear)} />
          </div>
        )}
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
            Abbrechen
          </button>
        )}
        <button type="submit"
          className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
          {initial ? 'Speichern' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  )
}

// ── Schützen-Tab ──────────────────────────────────────────────────────────────
function SchuetzenTab({ jaegerschaftId, schuetzen, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const handleAdd = async (form) => {
    setError('')
    try {
      await apiFetch('/schuetzen', { method: 'POST', body: { ...form, jaegerschaftId } })
      setShowForm(false)
      onRefresh()
    } catch (err) { setError(err.message) }
  }

  const handleEdit = async (form) => {
    setError('')
    try {
      await apiFetch(`/schuetzen/${editing.id}`, { method: 'PATCH', body: form })
      setEditing(null)
      onRefresh()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Schützen wirklich löschen?')) return
    try {
      await apiFetch(`/schuetzen/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (err) { setError(err.message) }
  }

  return (
    <div>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Schützen anlegen</h2>
          {!showForm && !editing && (
            <button onClick={() => setShowForm(true)}
              className="text-xs px-3 py-1.5 bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
              + Neu
            </button>
          )}
        </div>
        {showForm && <SchuetzeForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Schützen ({schuetzen.length})</h2>
        </div>
        {schuetzen.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-10 text-center">Noch keine Schützen angelegt.</p>
          : schuetzen.map(s => (
            <div key={s.id}>
              {editing?.id === s.id
                ? (
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50">
                    <SchuetzeForm
                      initial={{
                        vorname: s.vorname, nachname: s.nachname,
                        mitgliedsnummer: s.mitgliedsnummer ?? '',
                        jahrgang: s.jahrgang ?? '', jungjaeger: s.jungjaeger,
                        jungjaegerSeit: s.jungjaegerSeit ?? '', dame: s.dame,
                        nadel: s.nadel ?? '', disziplin: s.disziplin ?? '', djvGruppe: s.djvGruppe ?? '',
                      }}
                      onSave={handleEdit}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                )
                : (
                  <div className="flex items-start gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{schuetzeName(s)}</p>
                      <SchuetzeBadges s={s} />
                      {s.jahrgang && <p className="text-xs text-gray-400 mt-0.5">Jg. {s.jahrgang}</p>}
                    </div>
                    {s.disziplin && <span className="text-xs text-gray-400 mt-0.5">{DISZIPLIN_LABEL[s.disziplin]}</span>}
                    <button onClick={() => { setEditing(s); setShowForm(false) }}
                      className="text-xs text-gray-400 hover:text-jagd-600 px-2 py-1">Bearbeiten</button>
                    <button onClick={() => handleDelete(s.id)}
                      className="text-xs text-gray-400 hover:text-red-600 px-2 py-1">Löschen</button>
                  </div>
                )
              }
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Mannschaft-Drag-and-Drop-Builder ──────────────────────────────────────────
function MannschaftBuilder({ mannschaft, alleSchuetzen, onClose, onRefresh }) {
  const [error, setError] = useState('')
  const dragId = useRef(null)

  const mitglieder = mannschaft.schuetzen.map(ms => ms.schuetze)
  const mitgliederIds = new Set(mitglieder.map(s => s.id))
  const verfuegbar = alleSchuetzen.filter(s => !mitgliederIds.has(s.id))

  const handleDropAdd = async (e) => {
    e.preventDefault()
    setError('')
    const id = dragId.current
    if (!id || mitgliederIds.has(id)) return
    const schuetze = alleSchuetzen.find(s => s.id === id)
    if (mannschaft.typ === 'B' && isASchuetze(schuetze)) {
      setError('A-Schützen (Gold/SonderGold) können nicht in eine B-Mannschaft.')
      return
    }
    try {
      await apiFetch(`/mannschaften/${mannschaft.id}/schuetzen`, { method: 'POST', body: { schuetzeId: id } })
      onRefresh()
    } catch (err) { setError(err.message) }
  }

  const handleRemove = async (schuetzeId) => {
    try {
      await apiFetch(`/mannschaften/${mannschaft.id}/schuetzen/${schuetzeId}`, { method: 'DELETE' })
      onRefresh()
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="bg-white rounded-xl border border-jagd-200 overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-jagd-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">{mannschaft.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mannschaft.typ === 'A' ? 'bg-jagd-200 text-jagd-900' : 'bg-blue-100 text-blue-800'}`}>
            {mannschaft.typ}-Mannschaft
          </span>
        </div>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-700">✕ Schließen</button>
      </div>

      {error && <p className="text-red-600 text-sm px-5 py-2 bg-red-50 border-b border-red-100">{error}</p>}

      <div className="grid grid-cols-2 divide-x divide-gray-100">
        {/* Verfügbare Schützen (links) */}
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Verfügbar</p>
          <div className="space-y-1.5 min-h-20">
            {verfuegbar.length === 0
              ? <p className="text-xs text-gray-400 text-center py-4">Alle Schützen bereits zugeordnet.</p>
              : verfuegbar.map(s => {
                  const blocked = mannschaft.typ === 'B' && isASchuetze(s)
                  return (
                    <div
                      key={s.id}
                      draggable={!blocked}
                      onDragStart={() => { dragId.current = s.id }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border select-none ${
                        blocked
                          ? 'border-red-100 bg-red-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 bg-gray-50 hover:border-jagd-300 hover:bg-jagd-50 cursor-grab active:cursor-grabbing'
                      }`}
                      title={blocked ? 'A-Schütze kann nicht in B-Mannschaft' : 'Ziehen um hinzuzufügen'}
                    >
                      {!blocked && <span className="text-gray-300 text-xs">⠿</span>}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{schuetzeName(s)}</p>
                        <div className="flex gap-1 flex-wrap">
                          {s.nadel && <span className={`text-xs px-1 rounded ${NADEL_CLS[s.nadel]}`}>{NADEL_LABEL[s.nadel]}</span>}
                          {s.dame && <span className="text-xs px-1 rounded bg-pink-50 text-pink-700">Dame</span>}
                        </div>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Mannschaft-Mitglieder / Drop-Zone (rechts) */}
        <div
          className="p-4"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDropAdd}
        >
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            In der Mannschaft ({mitglieder.length})
          </p>
          <div className="space-y-1.5 min-h-20 border-2 border-dashed border-jagd-200 rounded-lg p-2 bg-jagd-50/30">
            {mitglieder.length === 0
              ? <p className="text-xs text-gray-400 text-center py-4">Schützen von links hierher ziehen</p>
              : mitglieder.map(s => (
                <div key={s.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-jagd-200 bg-white">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{schuetzeName(s)}</p>
                    <div className="flex gap-1 flex-wrap">
                      {s.nadel && <span className={`text-xs px-1 rounded ${NADEL_CLS[s.nadel]}`}>{NADEL_LABEL[s.nadel]}</span>}
                      {s.dame && <span className="text-xs px-1 rounded bg-pink-50 text-pink-700">Dame</span>}
                    </div>
                  </div>
                  <button onClick={() => handleRemove(s.id)}
                    className="text-gray-300 hover:text-red-500 text-sm ml-1 flex-shrink-0">✕</button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mannschaften-Tab ──────────────────────────────────────────────────────────
function MannschaftenTab({ jaegerschaftId, schuetzen, mannschaften, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', typ: 'B' })
  const [activeMannschaftId, setActiveMannschaftId] = useState(null)
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const created = await apiFetch('/mannschaften', { method: 'POST', body: { ...newForm, jaegerschaftId } })
      setNewForm({ name: '', typ: 'B' })
      setShowForm(false)
      setActiveMannschaftId(created.id)
      onRefresh()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Mannschaft wirklich löschen?')) return
    if (activeMannschaftId === id) setActiveMannschaftId(null)
    try {
      await apiFetch(`/mannschaften/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (err) { setError(err.message) }
  }

  const activeM = mannschaften.find(m => m.id === activeMannschaftId)

  return (
    <div>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {activeM && (
        <MannschaftBuilder
          mannschaft={activeM}
          alleSchuetzen={schuetzen}
          onClose={() => setActiveMannschaftId(null)}
          onRefresh={onRefresh}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Mannschaft anlegen</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="text-xs px-3 py-1.5 bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
              + Neu
            </button>
          )}
        </div>
        {showForm && (
          <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
                value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                placeholder="z.B. Mannschaft 1" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Typ</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
                value={newForm.typ} onChange={e => setNewForm(f => ({ ...f, typ: e.target.value }))}>
                <option value="A">A-Mannschaft</option>
                <option value="B">B-Mannschaft</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Abbrechen</button>
              <button type="submit"
                className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
                Anlegen
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Mannschaften ({mannschaften.length})</h2>
        </div>
        {mannschaften.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-10 text-center">Noch keine Mannschaften angelegt.</p>
          : mannschaften.map(m => (
            <div key={m.id}
              className={`flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 ${activeMannschaftId === m.id ? 'bg-jagd-50' : ''}`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{m.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${m.typ === 'A' ? 'bg-jagd-100 text-jagd-800' : 'bg-blue-50 text-blue-700'}`}>
                    {m.typ}-Mannschaft
                  </span>
                  <span className="text-xs text-gray-400">{m.schuetzen.length} Schützen</span>
                </div>
              </div>
              <button
                onClick={() => setActiveMannschaftId(activeMannschaftId === m.id ? null : m.id)}
                className="text-xs px-3 py-1.5 border border-jagd-300 text-jagd-700 rounded-lg hover:bg-jagd-50">
                {activeMannschaftId === m.id ? 'Schließen' : 'Bearbeiten'}
              </button>
              <button onClick={() => handleDelete(m.id)}
                className="text-xs text-gray-400 hover:text-red-600 px-2 py-1">Löschen</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Haupt-Seite ───────────────────────────────────────────────────────────────
export default function MannschaftPage() {
  const { user } = useAuth()
  const jaegerschaftId = user?.jaegerschaft?.id
  const [tab, setTab] = useState('schuetzen')
  const [schuetzen, setSchuetzen] = useState([])
  const [mannschaften, setMannschaften] = useState([])
  const [loading, setLoading] = useState(true)

  if (user?.role === 'ADMIN') return <AdminMannschaftView />

  const load = () => {
    if (!jaegerschaftId) { setLoading(false); return }
    Promise.all([
      apiFetch(`/schuetzen?jaegerschaftId=${jaegerschaftId}`),
      apiFetch(`/mannschaften?jaegerschaftId=${jaegerschaftId}`),
    ]).then(([s, m]) => { setSchuetzen(s); setMannschaften(m) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [jaegerschaftId])

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  if (!jaegerschaftId) return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Mannschaft</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
        Ihrem Account ist noch keine Jägerschaft zugewiesen. Bitte wenden Sie sich an den Kreisschießwart.
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-5">Mannschaft</h1>

      <div className="flex border-b border-gray-200 mb-6">
        {[['schuetzen', 'Schützen'], ['mannschaften', 'Mannschaften']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-jagd-600 text-jagd-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'schuetzen'
        ? <SchuetzenTab jaegerschaftId={jaegerschaftId} schuetzen={schuetzen} onRefresh={load} />
        : <MannschaftenTab jaegerschaftId={jaegerschaftId} schuetzen={schuetzen} mannschaften={mannschaften} onRefresh={load} />
      }
    </div>
  )
}
