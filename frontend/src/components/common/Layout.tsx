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
  ExternalLink,
  Menu,
  X,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useState } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Agendamentos', href: '/bookings', icon: Clock },
  { name: 'Serviços', href: '/services', icon: Briefcase },
  { name: 'Profissionais', href: '/professionals', icon: Users },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Link Público', href: '/public-link', icon: ExternalLink },
  { name: 'Tema', href: '/theme', icon: Palette },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Logo and close button */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Booking System</h1>
                {user?.tenant && (
                  <p className="text-xs text-gray-600 truncate max-w-[150px]">{user.tenant.name}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
            <ThemeToggle className="w-full" />
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-200"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-gray-900">Booking System</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
