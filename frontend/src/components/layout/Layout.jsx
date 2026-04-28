import { Outlet, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

const navObmann = [
  { to: '/',           label: 'Dashboard',        end: true },
  { to: '/mannschaft', label: 'Mannschaft' },
  { to: '/zeitplan',   label: 'Zeitplan' },
  { to: '/helfer',     label: 'Helfer' },
  { to: '/ergebnisse', label: 'Ergebnisse' },
]

const navAdmin = [
  { to: '/admin',                label: 'Übersicht',         end: true },
  { to: '/admin/veranstaltung',  label: 'Veranstaltung' },
  { to: '/admin/gruppen',        label: 'Gruppen & Zeitplan' },
  { to: '/admin/jaegerschaften', label: 'Jägerschaften' },
  { to: '/admin/benutzer',       label: 'Benutzer' },
]

function TabLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
          isActive
            ? 'border-jagd-600 text-jagd-700'
            : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const appTitle = import.meta.env.VITE_APP_TITLE || 'JagdSchießen'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Top Header ── */}
      <header className="bg-jagd-700 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-jagd-500 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="7.5" />
                <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
                <line x1="12" y1="4" x2="12" y2="8" />
                <line x1="12" y1="16" x2="12" y2="20" />
                <line x1="4" y1="12" x2="8" y2="12" />
                <line x1="16" y1="12" x2="20" y2="12" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">{appTitle}</div>
              <div className="text-jagd-300 text-xs leading-tight">DJV-konforme Anmeldeplattform</div>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="text-white text-sm font-medium leading-tight">{user?.name}</div>
              <div className="text-jagd-300 text-xs leading-tight">
                {isAdmin ? 'Kreisschießwart' : user?.jaegerschaft?.name ?? ''}
              </div>
            </div>
            {isAdmin && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                Admin
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-jagd-200 hover:text-white text-sm transition-colors border border-jagd-500 hover:border-jagd-300 rounded-md px-3 py-1.5"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <div className="bg-white border-b border-gray-200 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 -mb-px">
            {navObmann.map(item => <TabLink key={item.to} {...item} />)}
            {isAdmin && (
              <>
                <div className="w-px h-5 bg-gray-300 mx-2" />
                {navAdmin.map(item => <TabLink key={item.to} {...item} />)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 overflow-auto py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
