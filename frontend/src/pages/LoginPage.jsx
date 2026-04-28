import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

const appTitle = import.meta.env.VITE_APP_TITLE || 'JagdSchießen'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Linke Branding-Seite ── */}
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
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Digitale Anmeldung<br />für Jagdschießen
          </h1>
          <p className="text-jagd-200 text-lg leading-relaxed">
            Verwalten Sie Mannschaften, Helfer und Ergebnisse — konform mit den DJV-Richtlinien.
          </p>
        </div>

        <div className="text-jagd-400 text-sm">
          Landesjägerschaft · Kreisgruppe · DJV-Richtlinien
        </div>
      </div>

      {/* ── Rechte Login-Seite ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-jagd-600 flex items-center justify-center">
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
            <span className="font-bold text-xl text-gray-900">{appTitle}</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Willkommen</h2>
            <p className="text-gray-500 mb-8">Bitte melden Sie sich an.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent text-sm"
                  placeholder="name@jaegerschaft.de"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent text-sm"
                  placeholder="Ihr Passwort"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-jagd-600 hover:bg-jagd-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Anmeldung läuft…' : 'Anmelden'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
