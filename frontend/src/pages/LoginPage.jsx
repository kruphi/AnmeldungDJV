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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #122503 0%, #1C3905 40%, #2C5609 100%)',
      }}
    >
      {/* Decorative pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo area */}
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
          <h1 className="text-2xl font-bold text-white tracking-wide">{appTitle}</h1>
          <p className="text-jagd-300 text-sm mt-1">DJV-konforme Anmeldeplattform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Anmelden</h2>
          <p className="text-sm text-gray-500 mb-6">Bitte melden Sie sich mit Ihren Zugangsdaten an.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent transition-shadow"
                placeholder="name@jaegerschaft.de"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jagd-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-jagd-600 hover:bg-jagd-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {loading ? 'Anmeldung läuft…' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="text-center text-jagd-400 text-xs mt-5">
          Landesjägerschaft · Kreisgruppe · DJV-Richtlinien
        </p>
      </div>
    </div>
  )
}
