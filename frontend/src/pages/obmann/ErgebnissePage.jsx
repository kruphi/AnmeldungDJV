import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

const DISZIPLIN_LABEL = { BUECHSE: 'Büchse', FLINTE: 'Flinte', PISTOLE: 'Pistole', KOMBINATION: 'Kombination' }

export default function ErgebnissePage() {
  const { user } = useAuth()
  const jaegerschaftId = user?.jaegerschaft?.id
  const [ergebnisse, setErgebnisse] = useState([])
  const [schuetzen, setSchuetzen] = useState([])
  const [form, setForm] = useState({ schuetzeId: '', punkte: '', disziplin: '', notizen: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    if (!jaegerschaftId) { setLoading(false); return }
    Promise.all([
      apiFetch(`/ergebnisse?jaegerschaftId=${jaegerschaftId}`),
      apiFetch(`/schuetzen?jaegerschaftId=${jaegerschaftId}`)
    ]).then(([e, s]) => { setErgebnisse(e); setSchuetzen(s) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [jaegerschaftId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiFetch('/ergebnisse', {
        method: 'POST',
        body: { ...form, schuetzeId: parseInt(form.schuetzeId), punkte: parseInt(form.punkte) }
      })
      setForm({ schuetzeId: '', punkte: '', disziplin: '', notizen: '' })
      load()
    } catch (err) { setError(err.message) }
  }

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>
  if (!jaegerschaftId) return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Ergebnisse</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
        Ihrem Account ist noch keine Jägerschaft zugewiesen. Bitte wenden Sie sich an den Kreisschießwart.
      </div>
    </div>
  )

  const avg = ergebnisse.length
    ? Math.round(ergebnisse.reduce((s, e) => s + e.punkte, 0) / ergebnisse.length)
    : 0

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Ergebnisse</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-semibold text-gray-900">{ergebnisse.length}</div>
          <div className="text-xs text-gray-500 mt-1">Gewertet</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-semibold text-gray-900">Ø {avg}</div>
          <div className="text-xs text-gray-500 mt-1">Punkte Schnitt</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-semibold text-gray-900">{ergebnisse[0]?.punkte ?? '–'}</div>
          <div className="text-xs text-gray-500 mt-1">Höchstpunktzahl</div>
        </div>
      </div>

      {/* Formular */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Ergebnis eintragen</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Schütze</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.schuetzeId} onChange={e => setForm(f => ({ ...f, schuetzeId: e.target.value }))} required>
              <option value="">– wählen –</option>
              {schuetzen.map(s => <option key={s.id} value={s.id}>{s.vorname} {s.nachname}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Punkte</label>
            <input type="number" min="0" max="200"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.punkte} onChange={e => setForm(f => ({...f, punkte: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Disziplin</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.disziplin} onChange={e => setForm(f => ({...f, disziplin: e.target.value}))} required>
              <option value="">– wählen –</option>
              {Object.entries(DISZIPLIN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notizen (optional)</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
              value={form.notizen} onChange={e => setForm(f => ({...f, notizen: e.target.value}))} />
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-jagd-500 text-white rounded-lg hover:bg-jagd-600">
              Eintragen
            </button>
          </div>
        </form>
      </div>

      {/* Rangliste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Rangliste</h2>
        </div>
        {ergebnisse.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-8 text-center">Noch keine Ergebnisse.</p>
          : ergebnisse.map((e, i) => (
            <div key={e.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
              <div className={`w-6 text-sm font-semibold ${i === 0 ? 'text-jagd-600' : 'text-gray-400'}`}>{i + 1}.</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{e.schuetze?.vorname} {e.schuetze?.nachname}</p>
                <p className="text-xs text-gray-400">{DISZIPLIN_LABEL[e.disziplin]}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">{e.punkte} Pkt</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}
