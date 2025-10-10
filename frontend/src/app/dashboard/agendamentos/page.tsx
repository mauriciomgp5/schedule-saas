'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getUser } from "@/services/auth"
import {
  getBookings,
  cancelBooking,
  completeBooking,
  confirmBooking,
  Booking,
  BookingFilters
} from "@/services/bookings"
import { getServices, Service } from "@/services/services"
import { ThemeToggle } from "@/components/ThemeToggle"
import CalendarView from "@/components/CalendarView"

export default function AgendamentosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  // Filtros
  const [filters, setFilters] = useState<BookingFilters>({
    sort_by: 'booking_date',
    sort_order: 'desc',
    per_page: 15,
  })

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push('/')
      return
    }
    setUser(userData)
    loadServices()
    loadBookings()
  }, [router])

  useEffect(() => {
    loadBookings()
  }, [filters, currentPage])

  const loadServices = async () => {
    try {
      const data = await getServices()
      setServices(data)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await getBookings({ ...filters, page: currentPage })
      setBookings(response.data || [])
      setTotalPages(response.last_page || 1)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowCancelModal(true)
    setCancellationReason('')
  }

  const handleCancelConfirm = async () => {
    if (!selectedBooking || !cancellationReason.trim()) {
      alert('Por favor, informe o motivo do cancelamento')
      return
    }

    try {
      await cancelBooking(selectedBooking.id, cancellationReason)
      setShowCancelModal(false)
      setSelectedBooking(null)
      setCancellationReason('')
      loadBookings()
    } catch (error: any) {
      alert(error.message || 'Erro ao cancelar agendamento')
    }
  }

  const handleComplete = async (booking: Booking) => {
    if (!confirm('Marcar este agendamento como concluído?')) return

    try {
      await completeBooking(booking.id)
      loadBookings()
    } catch (error: any) {
      alert(error.message || 'Erro ao concluir agendamento')
    }
  }

  const handleConfirm = async (booking: Booking) => {
    try {
      await confirmBooking(booking.id)
      loadBookings()
    } catch (error: any) {
      alert(error.message || 'Erro ao confirmar agendamento')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pendente' },
      confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Confirmado' },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Concluído' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelado' },
    }

    const badge = badges[status] || badges.pending
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agendamentos</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie seus agendamentos</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar</label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Cliente, telefone..."
                className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Serviço</label>
              <select
                value={filters.service_id || ''}
                onChange={(e) => setFilters({ ...filters, service_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              >
                <option value="">Todos os serviços</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data</label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Alternador de visualização */}
        <div className="flex justify-center sm:justify-end mb-6">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-2 rounded-md text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-2 rounded-md text-sm font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Agenda</span>
            </button>
          </div>
        </div>

        {/* Visualização de Calendário */}
        {viewMode === 'calendar' ? (
          <CalendarView bookings={bookings} onBookingClick={handleViewDetails} />
        ) : (
          /* Visualização de Lista */
          bookings.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600 dark:text-gray-400">Não há agendamentos com os filtros selecionados</p>
            </div>
          ) : (
          <>
            {/* Desktop - Tabela */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.customer?.name || 'Cliente sem nome'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {booking.customer?.phone || 'Sem telefone'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: booking.service?.color || '#3B82F6' }}
                            ></div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {booking.service?.name || 'Serviço não encontrado'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(booking.booking_date)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(booking.booking_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(booking.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Ver detalhes"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleConfirm(booking)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Confirmar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}

                            {(booking.status === 'confirmed' || booking.status === 'pending') && (
                              <button
                                onClick={() => handleComplete(booking)}
                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                title="Marcar como concluído"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}

                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => handleCancelClick(booking)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Cancelar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile - Cards */}
            <div className="md:hidden space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4"
                  style={{ borderLeftColor: booking.service?.color || '#3B82F6' }}
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {booking.customer?.name || 'Cliente sem nome'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.customer?.phone || 'Sem telefone'}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Informações */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {booking.service?.name || 'Serviço não encontrado'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDate(booking.booking_date)} às {formatTime(booking.booking_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(booking.price)}
                      </span>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Detalhes
                    </button>

                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(booking)}
                        className="flex-1 min-w-[120px] px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar
                      </button>
                    )}

                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      <button
                        onClick={() => handleComplete(booking)}
                        className="flex-1 min-w-[120px] px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-medium flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Concluir
                      </button>
                    )}

                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        className="flex-1 min-w-[120px] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
          )
        )}
      </main>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalhes do Agendamento
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Número do Agendamento</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedBooking.booking_number}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Cliente</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Nome</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedBooking.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Telefone</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedBooking.customer?.phone || 'N/A'}</span>
                  </div>
                  {selectedBooking.customer?.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedBooking.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Serviço</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Nome</span>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: selectedBooking.service?.color || '#3B82F6' }}
                      ></div>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedBooking.service?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Duração</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedBooking.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Valor</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(selectedBooking.price)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Data e Hora</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Data</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedBooking.booking_date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Horário</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatTime(selectedBooking.booking_date)}</span>
                  </div>
                </div>
              </div>

              {selectedBooking.customer_notes && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Observações do Cliente</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedBooking.customer_notes}</p>
                </div>
              )}

              {selectedBooking.internal_notes && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Notas Internas</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedBooking.internal_notes}</p>
                </div>
              )}

              {selectedBooking.status === 'cancelled' && selectedBooking.cancellation_reason && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Motivo do Cancelamento</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedBooking.cancellation_reason}</p>
                  {selectedBooking.cancelled_at && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Cancelado em: {formatDate(selectedBooking.cancelled_at)} às {formatTime(selectedBooking.cancelled_at)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cancelar Agendamento
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Tem certeza que deseja cancelar este agendamento?
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cliente</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedBooking.customer?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Serviço</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedBooking.service?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Data/Hora</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedBooking.booking_date)} - {formatTime(selectedBooking.booking_date)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo do Cancelamento *
                </label>
                <textarea
                  rows={4}
                  required
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Informe o motivo do cancelamento..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-4">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedBooking(null)
                  setCancellationReason('')
                }}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
