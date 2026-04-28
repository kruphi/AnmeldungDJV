import { Outlet, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

const navObmann = [
  { to: '/',           label: 'Dashboard' },
  { to: '/mannschaft', label: 'Mannschaft' },
  { to: '/zeitplan',   label: 'Zeitplan' },
  { to: '/helfer',     label: 'Helfer' },
  { to: '/ergebnisse', label: 'Ergebnisse' },
]

const navAdmin = [
  { to: '/admin',                label: 'Admin-Übersicht' },
  { to: '/admin/veranstaltung',  label: 'Veranstaltung' },
  { to: '/admin/gruppen',        label: 'Gruppen & Zeitplan' },
  { to: '/admin/jaegerschaften', label: 'Jägerschaften' },
  { to: '/admin/benutzer',       label: 'Benutzer' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = isAdmin ? [...navObmann, ...navAdmin] : navObmann

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-jagd-600 text-white px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-jagd-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">JS</div>
          <div>
            <div className="font-semibold text-sm">JagdSchießen</div>
            <div className="text-xs text-jagd-200">DJV-Richtlinien</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-jagd-200">{user?.name}</span>
            {isAdmin && <span className="ml-2 bg-jagd-500 text-white text-xs px-2 py-0.5 rounded">Admin</span>}
          </div>
          <button onClick={handleLogout} className="text-xs text-jagd-200 hover:text-white transition-colors">
            Abmelden
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-52 bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
          <div className="px-3 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
              {isAdmin ? 'Schießobmann' : 'Meine Jägerschaft'}
            </p>
            {navObmann.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                    isActive ? 'bg-jagd-50 text-jagd-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {isAdmin && (
            <div className="px-3 mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
                Kreisschießwart
              </p>
              {navAdmin.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                      isActive ? 'bg-jagd-50 text-jagd-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          <div className="mt-auto px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">{user?.jaegerschaft?.name || 'Alle Jägerschaften'}</p>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
