import { useState } from 'react'
import { useNavigate } from 'react-router'

const appTitle = import.meta.env.VITE_APP_TITLE || 'JagdSchießen'

export default function SetupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.passwordConfirm) {
      setError('Passwörter stimmen nicht überein')
      return
    }
    if (form.password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler beim Setup')
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-jagd-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-jagd-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Einrichtung abgeschlossen</h1>
          <p className="text-gray-500 mb-8">
            Der Administrator-Account wurde angelegt. Sie können sich jetzt anmelden.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-jagd-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-jagd-700 transition-colors"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Linke Seite */}
      <div className="hidden lg:flex lg:w-1/2 bg-jagd-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-jagd-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="12" cy="12" r="7.5" />
              <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
              <line x1="12" y1="4" x2="12" y2="8" />
              <line x1="12" y1="16" x2="12" y2="20" />
              <line x1="4" y1="12" x2="8" y2="12" />
              <line x1="16" y1="12" x2="20" y2="12" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">{appTitle}</span>
        </div>
        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">Ersteinrichtung</h1>
          <p className="text-jagd-200 text-lg leading-relaxed">
            Richten Sie Ihre Instanz ein und legen Sie den ersten Kreisschießwart-Account an.
          </p>
        </div>
        <div className="text-jagd-400 text-sm">Dieser Schritt kann nur einmal ausgeführt werden.</div>
      </div>

      {/* Rechte Formular-Seite */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Administrator anlegen</h2>
            <p className="text-gray-500 mb-8">Legen Sie den ersten Kreisschießwart-Account an.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text" required autoFocus
                  placeholder="Vorname Nachname"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-Mail-Adresse</label>
                <input
                  type="email" required
                  placeholder="admin@jaegerschaft.de"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Passwort</label>
                <input
                  type="password" required
                  placeholder="Mindestens 8 Zeichen"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Passwort bestätigen</label>
                <input
                  type="password" required
                  placeholder="Passwort wiederholen"
                  value={form.passwordConfirm}
                  onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-jagd-600 hover:bg-jagd-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird eingerichtet…' : 'Administrator-Account anlegen'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
