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
      <div className="min-h-screen bg-gradient-to-br from-jagd-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-jagd-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-jagd-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Einrichtung abgeschlossen</h1>
          <p className="text-sm text-gray-500 mb-6">
            Der Admin-Account wurde angelegt. Du kannst dich jetzt anmelden.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-jagd-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-jagd-600 transition-colors"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jagd-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-jagd-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-jagd-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{appTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">Ersteinrichtung — Admin-Account anlegen</p>
        </div>

        {/* Schritt-Indikator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1 rounded-full bg-jagd-500" />
          <span className="text-xs text-gray-400 whitespace-nowrap">Schritt 1 von 1</span>
          <div className="flex-1 h-1 rounded-full bg-gray-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Name des Kreisschießwarts
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Vorname Nachname"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              type="email"
              required
              placeholder="admin@example.de"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Passwort</label>
            <input
              type="password"
              required
              placeholder="Mindestens 8 Zeichen"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Passwort bestätigen</label>
            <input
              type="password"
              required
              placeholder="Passwort wiederholen"
              value={form.passwordConfirm}
              onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-jagd-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-jagd-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? 'Wird eingerichtet…' : 'Admin-Account anlegen'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Dieser Schritt kann nur einmal ausgeführt werden.
        </p>
      </div>
    </div>
  )
}
