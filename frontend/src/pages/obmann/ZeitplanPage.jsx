import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export default function ZeitplanPage() {
  const { user } = useAuth()
  const [gruppen, setGruppen] = useState([])
  const [veranstaltung, setVeranstaltung] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/veranstaltungen')
      .then(data => {
        const aktiv = data.find(v => v.status === 'AKTIV' || v.status === 'ANMELDUNG') || data[0]
        if (!aktiv) return
        setVeranstaltung(aktiv)
        return apiFetch(`/gruppen?veranstaltungId=${aktiv.id}`)
      })
      .then(g => g && setGruppen(g))
      .finally(() => setLoading(false))
  }, [])

  const meineGruppeId = user?.jaegerschaft ? gruppen.find(g =>
    g.jaegerschaften?.some(j => j.id === user.jaegerschaft.id)
  )?.id : null

  if (loading) return <p className="text-gray-400 text-sm">Laden…</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Schießzeiten</h1>
        {veranstaltung && (
          <span className="text-sm text-gray-500">
            {new Date(veranstaltung.datum).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* Meine Gruppe – Highlight */}
      {meineGruppeId && (() => {
        const mg = gruppen.find(g => g.id === meineGruppeId)
        return (
          <div className="bg-jagd-50 border border-jagd-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-jagd-600 uppercase tracking-wide mb-1">Ihre Gruppe ist dran</p>
            <p className="text-lg font-semibold text-jagd-700">{mg.name} · {fmt(mg.startzeit)} – {fmt(mg.endzeit)} Uhr</p>
            <p className="text-sm text-jagd-600 mt-0.5">{mg.stand}</p>
          </div>
        )
      })()}

      {/* Alle Gruppen */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Tagesplan – alle Gruppen</h2>
        </div>
        {gruppen.length === 0
          ? <p className="text-sm text-gray-400 px-5 py-8 text-center">Kein Zeitplan vorhanden.</p>
          : gruppen.map(g => {
            const meine = g.id === meineGruppeId
            return (
              <div key={g.id} className={`flex items-start gap-4 px-5 py-4 border-b border-gray-50 last:border-0 ${meine ? 'bg-jagd-50' : ''}`}>
                <div className="text-right shrink-0 w-20">
                  <p className={`text-sm font-medium ${meine ? 'text-jagd-700' : 'text-gray-500'}`}>{fmt(g.startzeit)}</p>
                  <p className="text-xs text-gray-400">{fmt(g.endzeit)}</p>
                </div>
                <div className={`w-1 self-stretch rounded-full ${meine ? 'bg-jagd-500' : 'bg-gray-200'}`}></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${meine ? 'text-jagd-700' : 'text-gray-900'}`}>{g.name}</p>
                    {meine && <span className="text-xs bg-jagd-500 text-white px-2 py-0.5 rounded-full">Meine Gruppe</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{g.stand}</p>
                  {g.jaegerschaften?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{g.jaegerschaften.map(j => j.name).join(', ')}</p>
                  )}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
