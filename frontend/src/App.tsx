import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import CalendarPage from './pages/Calendar'
import BookingsPage from './pages/Bookings'
import ServicesPage from './pages/Services'
import CustomersPage from './pages/Customers'
import SettingsPage from './pages/Settings'
import ThemePage from './pages/Theme'
import PublicBookingPage from './pages/PublicBooking'
import PublicLinkPage from './pages/PublicLink'
import ProfessionalsPage from './pages/Professionals'
import Layout from './components/common/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchUser, user } = useAuthStore()

  // Busca o usuário apenas quando autenticado e ainda não carregado,
  // evitando loop de requisições quando isLoading muda.
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser()
    }
  }, [isAuthenticated, user, fetchUser])

  if (isAuthenticated && isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { fetchTheme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Só busca o tema se estiver autenticado (evita erro na tela de login)
    if (isAuthenticated) {
      fetchTheme().catch(() => {
        // Ignora erros silenciosamente
      })
    }
  }, [fetchTheme, isAuthenticated])

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/agendar/:domain" element={<PublicBookingPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="professionals" element={<ProfessionalsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="public-link" element={<PublicLinkPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="theme" element={<ThemePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

