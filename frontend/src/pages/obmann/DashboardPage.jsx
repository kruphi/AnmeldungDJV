import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

const STATUS_LABEL = {
  AUSSTEHEND: { label: 'Ausstehend', cls: 'bg-amber-100 text-amber-700' },
  BESTAETIGT: { label: 'Bestätigt',  cls: 'bg-green-100 text-green-700' },
  ABGESAGT:   { label: 'Abgesagt',   cls: 'bg-red-100 text-red-700'   },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [jaegerschaft, setJaegerschaft] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.jaegerschaft?.id) { setLoading(false); return }
    apiFetch(`/jaegerschaften/${user.jaegerschaft.id}`)
      .then(setJaegerschaft)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  const schuetzenVollst = jaegerschaft?.schuetzen?.filter(s => s.disziplin && s.djvGruppe) ?? []
  const helferBestaetigt = jaegerschaft?.helfer?.filter(h => h.status === 'BESTAETIGT') ?? []
  const offeneHelfer = jaegerschaft?.helfer?.filter(h => h.status === 'AUSSTEHEND') ?? []

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        {jaegerschaft?.gruppe && (
          <span className="bg-jagd-50 text-jagd-700 text-sm font-medium px-3 py-1 rounded-full border border-jagd-200">
            {jaegerschaft.gruppe.name} · {new Date(jaegerschaft.gruppe.startzeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
          </span>
        )}
      </div>

      {/* Metriken */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { val: jaegerschaft?.schuetzen?.length ?? 0, lbl: 'Schützen angemeldet' },
          { val: `${schuetzenVollst.length}/${jaegerschaft?.schuetzen?.length ?? 0}`, lbl: 'Vollständig erfasst' },
          { val: `${helferBestaetigt.length}/3`, lbl: 'Helfer bestätigt' },
        ].map(m => (
          <div key={m.lbl} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-semibold text-gray-900">{m.val}</div>
            <div className="text-xs text-gray-500 mt-1">{m.lbl}</div>
          </div>
        ))}
      </div>

      {/* Nächster Termin */}
      {jaegerschaft?.gruppe && (
        <div className="bg-jagd-50 border border-jagd-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-jagd-600 uppercase tracking-wide mb-1">Ihr nächster Schießtermin</p>
          <p className="text-jagd-700 font-medium">
            {jaegerschaft.gruppe.name} · {jaegerschaft.gruppe.stand}
          </p>
          <p className="text-sm text-jagd-600 mt-0.5">
            {new Date(jaegerschaft.gruppe.startzeit).toLocaleString('de-DE', {
              weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
            })} – {new Date(jaegerschaft.gruppe.endzeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
          </p>
        </div>
      )}

      {/* Offene Aufgaben */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Offene Aufgaben</h2>
        {offeneHelfer.length === 0 && schuetzenVollst.length === (jaegerschaft?.schuetzen?.length ?? 0)
          ? <p className="text-sm text-green-600">Alles vollständig – keine offenen Aufgaben.</p>
          : (
            <ul className="space-y-2">
              {offeneHelfer.map(h => (
                <li key={h.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-amber-400 rounded-full shrink-0"></span>
                  Helfer für {h.aufgabe.replace('_', ' & ')} noch nicht bestätigt
                </li>
              ))}
              {jaegerschaft?.schuetzen?.filter(s => !s.disziplin || !s.djvGruppe).map(s => (
                <li key={s.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-red-400 rounded-full shrink-0"></span>
                  {s.name}: Angaben unvollständig
                </li>
              ))}
            </ul>
          )
        }
      </div>

      {/* Schnellzugriffe */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/mannschaft" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-jagd-300 transition-colors">
          <p className="font-medium text-sm text-gray-900">Mannschaft bearbeiten</p>
          <p className="text-xs text-gray-400 mt-0.5">Schützen eintragen & Disziplinen zuweisen</p>
        </Link>
        <Link to="/helfer" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-jagd-300 transition-colors">
          <p className="font-medium text-sm text-gray-900">Helfer eintragen</p>
          <p className="text-xs text-gray-400 mt-0.5">Pflichthelfer für Ihre Jägerschaft</p>
        </Link>
      </div>
    </div>
  )
}
