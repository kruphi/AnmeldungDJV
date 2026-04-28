import { Outlet, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

const navObmann = [
  { to: '/',           label: 'Dashboard',   end: true },
  { to: '/mannschaft', label: 'Mannschaft' },
  { to: '/zeitplan',   label: 'Zeitplan' },
  { to: '/helfer',     label: 'Helfer' },
  { to: '/ergebnisse', label: 'Ergebnisse' },
]

const navAdmin = [
  { to: '/admin',                label: 'Übersicht',        end: true },
  { to: '/admin/veranstaltung',  label: 'Veranstaltung' },
  { to: '/admin/gruppen',        label: 'Gruppen & Zeitplan' },
  { to: '/admin/jaegerschaften', label: 'Jägerschaften' },
  { to: '/admin/benutzer',       label: 'Benutzer' },
]

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all mb-0.5 border-l-2 ${
          isActive
            ? 'bg-jagd-50 text-jagd-700 font-semibold border-jagd-500'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent'
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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const appTitle = import.meta.env.VITE_APP_TITLE || 'JagdSchießen'

  return (
    <div className="min-h-screen bg-[#F4F8F0] flex flex-col">

      {/* Header */}
      <header className="bg-jagd-800 text-white flex items-center justify-between px-6 h-[60px] shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-jagd-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
              <line x1="12" y1="4" x2="12" y2="7" />
              <line x1="12" y1="17" x2="12" y2="20" />
              <line x1="4" y1="12" x2="7" y2="12" />
              <line x1="17" y1="12" x2="20" y2="12" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide">{appTitle}</div>
            <div className="text-[10px] text-jagd-300 tracking-wider uppercase">Anmeldeplattform · DJV-Richtlinien</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium leading-tight">{user?.name}</div>
            <div className="text-[11px] text-jagd-300 leading-tight">
              {isAdmin ? 'Kreisschießwart' : user?.jaegerschaft?.name}
            </div>
          </div>
          {isAdmin && (
            <span className="bg-gold-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              Admin
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-jagd-300 hover:text-white border border-jagd-600 hover:border-jagd-400 rounded-md px-3 py-1.5 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <nav className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm">
          <div className="px-3 pt-5 pb-2">
            <p className="text-[10px] font-bold text-jagd-600 uppercase tracking-widest px-3 mb-2">
              Schießobmann
            </p>
            {navObmann.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          {isAdmin && (
            <div className="px-3 pt-4 pb-2 mt-2 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest px-3 mb-2">
                Kreisschießwart
              </p>
              {navAdmin.map(item => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          )}

          <div className="mt-auto px-5 py-4 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 leading-tight">
              {user?.jaegerschaft?.name || 'Alle Jägerschaften'}
            </p>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-auto p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
