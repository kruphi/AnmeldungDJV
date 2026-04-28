import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import SetupPage from './pages/SetupPage'
import Layout from './components/layout/Layout'

// Obmann-Seiten
import DashboardPage from './pages/obmann/DashboardPage'
import MannschaftPage from './pages/obmann/MannschaftPage'
import ZeitplanPage from './pages/obmann/ZeitplanPage'
import HelferPage from './pages/obmann/HelferPage'
import ErgebnissePage from './pages/obmann/ErgebnissePage'

// Admin-Seiten
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import VeranstaltungPage from './pages/admin/VeranstaltungPage'
import GruppenPage from './pages/admin/GruppenPage'
import JaegerschaftenPage from './pages/admin/JaegerschaftenPage'
import BenutzerPage from './pages/admin/BenutzerPage'
import EinstellungenPage from './pages/admin/EinstellungenPage'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, setupRequired } = useAuth()
  if (user === undefined) return <div className="flex items-center justify-center h-screen text-gray-400">Laden…</div>
  if (setupRequired) return <Navigate to="/setup" replace />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<SetupPage />} />

          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            {/* Obmann */}
            <Route index element={<DashboardPage />} />
            <Route path="mannschaft" element={<MannschaftPage />} />
            <Route path="zeitplan" element={<ZeitplanPage />} />
            <Route path="helfer" element={<HelferPage />} />
            <Route path="ergebnisse" element={<ErgebnissePage />} />

            {/* Admin */}
            <Route path="admin" element={<PrivateRoute adminOnly><AdminDashboardPage /></PrivateRoute>} />
            <Route path="admin/veranstaltung" element={<PrivateRoute adminOnly><VeranstaltungPage /></PrivateRoute>} />
            <Route path="admin/gruppen" element={<PrivateRoute adminOnly><GruppenPage /></PrivateRoute>} />
            <Route path="admin/jaegerschaften" element={<PrivateRoute adminOnly><JaegerschaftenPage /></PrivateRoute>} />
            <Route path="admin/benutzer" element={<PrivateRoute adminOnly><BenutzerPage /></PrivateRoute>} />
            <Route path="admin/einstellungen" element={<PrivateRoute adminOnly><EinstellungenPage /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
