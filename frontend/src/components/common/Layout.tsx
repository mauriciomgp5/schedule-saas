import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Palette, 
  LayoutDashboard,
  LogOut,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Agendamentos', href: '/bookings', icon: Clock },
  { name: 'Serviços', href: '/services', icon: Settings },
  { name: 'Profissionais', href: '/professionals', icon: Users },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Link Público', href: '/public-link', icon: ExternalLink },
  { name: 'Tema', href: '/theme', icon: Palette },
]

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Booking System</h1>
            {user?.tenant && (
              <p className="text-sm text-gray-500 mt-1">{user.tenant.name}</p>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                    isActive
                      ? 'bg-primary/15 text-primary border-primary/40'
                      : 'text-gray-700 hover:bg-gray-100 border-transparent'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

