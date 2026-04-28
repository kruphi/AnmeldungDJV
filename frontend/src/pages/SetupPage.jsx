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
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #122503 0%, #1C3905 40%, #2C5609 100%)' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-jagd-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-jagd-200">
            <svg className="w-8 h-8 text-jagd-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Einrichtung abgeschlossen</h1>
          <p className="text-sm text-gray-500 mb-7">
            Der Administrator-Account wurde erfolgreich angelegt. Sie können sich jetzt anmelden.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-jagd-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-jagd-700 transition-colors shadow-sm"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #122503 0%, #1C3905 40%, #2C5609 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-jagd-600 shadow-lg mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
              <line x1="12" y1="4" x2="12" y2="7" />
              <line x1="12" y1="17" x2="12" y2="20" />
              <line x1="4" y1="12" x2="7" y2="12" />
              <line x1="17" y1="12" x2="20" y2="12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">{appTitle}</h1>
          <p className="text-jagd-300 text-sm mt-1">Ersteinrichtung</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Administrator-Account anlegen</h2>
            <p className="text-sm text-gray-500 mt-1">
              Legen Sie den ersten Kreisschießwart-Account an. Dieser Schritt ist nur einmal möglich.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-1.5 rounded-full bg-jagd-500" />
            <span className="text-xs text-gray-400 whitespace-nowrap">Schritt 1 von 1</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-5 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name des Kreisschießwarts
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Vorname Nachname"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail-Adresse</label>
              <input
                type="email"
                required
                placeholder="admin@jaegerschaft.de"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Passwort</label>
              <input
                type="password"
                required
                placeholder="Mindestens 8 Zeichen"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Passwort bestätigen</label>
              <input
                type="password"
                required
                placeholder="Passwort wiederholen"
                value={form.passwordConfirm}
                onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-jagd-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-jagd-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2 shadow-sm"
            >
              {loading ? 'Wird eingerichtet…' : 'Administrator-Account anlegen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
