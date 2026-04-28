import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { apiFetch } from '../../lib/api'

export default function AdminDashboardPage() {
  const [veranstaltungen, setVeranstaltungen] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/veranstaltungen')
      .then(setVeranstaltungen)
      .finally(() => setLoading(false))
  }, [])

  const STATUS_CLS = {
    PLANUNG:        'bg-gray-100 text-gray-600',
    ANMELDUNG:      'bg-blue-100 text-blue-700',
    AKTIV:          'bg-green-100 text-green-700',
    ABGESCHLOSSEN:  'bg-amber-100 text-amber-700',
  }
  const STATUS_LABEL = { PLANUNG: 'Planung', ANMELDUNG: 'Anmeldung', AKTIV: 'Aktiv', ABGESCHLOSSEN: 'Abgeschlossen' }

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Kreisschießwart – Übersicht</h1>

      {/* Schnellzugriff */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { to: '/admin/veranstaltung', title: 'Veranstaltung', desc: 'Erstellen & verwalten' },
          { to: '/admin/gruppen', title: 'Gruppen & Zeitplan', desc: 'Stände & Zeiten festlegen' },
          { to: '/admin/jaegerschaften', title: 'Jägerschaften', desc: 'Gruppen zuweisen' },
          { to: '/admin/benutzer', title: 'Benutzer', desc: 'Schießobmänner verwalten' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-jagd-300 transition-colors">
            <p className="font-medium text-sm text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Veranstaltungen */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Veranstaltungen</h2>
          <Link to="/admin/veranstaltung" className="text-xs text-jagd-600 hover:text-jagd-700">+ Neue Veranstaltung</Link>
        </div>
        {veranstaltungen.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-8 text-center">Keine Veranstaltungen angelegt.</p>
          : veranstaltungen.map(v => (
            <div key={v.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{v.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(v.datum).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {v.ort}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{v.jaegerschaften?.length ?? 0} Jägerschaften</span>
                <span>{v.gruppen?.length ?? 0} Gruppen</span>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CLS[v.status]}`}>
                {STATUS_LABEL[v.status]}
              </span>
            </div>
          ))
        }
      </div>
    </div>
  )
}
