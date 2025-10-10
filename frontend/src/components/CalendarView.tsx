'use client'

import { useState } from 'react'
import { Booking } from '@/services/bookings'

interface CalendarViewProps {
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
}

export default function CalendarView({ bookings, onBookingClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day') // Começa com dia no mobile

  // Horários do dia (7h às 20h)
  const hours = Array.from({ length: 14 }, (_, i) => i + 7)

  // Dias da semana
  const getDaysOfWeek = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para segunda-feira
    startOfWeek.setDate(diff)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      return d
    })
  }

  const daysOfWeek = viewMode === 'week' ? getDaysOfWeek(currentDate) : [currentDate]

  // Filtrar agendamentos por dia
  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date)
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Obter agendamentos em um horário específico
  const getBookingsAtHour = (date: Date, hour: number) => {
    const dayBookings = getBookingsForDay(date)
    return dayBookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date)
      const bookingHour = bookingDate.getHours()
      return bookingHour === hour
    })
  }

  // Formatar data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  // Navegação
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7)
    } else {
      newDate.setDate(currentDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7)
    } else {
      newDate.setDate(currentDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Cores por status
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300',
      confirmed: 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-300',
      completed: 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300',
      cancelled: 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300',
    }
    return colors[status] || colors.pending
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header com controles */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3">
          {/* Linha 1: Navegação e Data */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={goToToday}
                className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-xs sm:text-sm font-medium"
              >
                Hoje
              </button>
              <button
                onClick={goToPrevious}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <span className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
              {viewMode === 'day'
                ? currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
              }
            </span>
          </div>

          {/* Linha 2: Alternador de visualização (oculto no mobile se estiver no modo dia) */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`flex-1 sm:flex-none sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 sm:flex-none sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition hidden sm:block ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Grid do calendário */}
      <div className="overflow-x-auto">
        <div className={viewMode === 'day' ? '' : 'min-w-[600px]'}>
          {/* Cabeçalho com dias */}
          <div className="grid border-b border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: `60px repeat(${daysOfWeek.length}, 1fr)` }}>
            <div className="p-3 border-r border-gray-200 dark:border-gray-700"></div>
            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className={`p-3 text-center border-r border-gray-200 dark:border-gray-700 ${
                  isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div
                  className={`text-lg font-semibold mt-1 ${
                    isToday(day)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {formatDate(day)}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horários */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-gray-200 dark:border-gray-700"
                style={{ gridTemplateColumns: `60px repeat(${daysOfWeek.length}, 1fr)`, minHeight: '80px' }}
              >
                {/* Coluna de horário */}
                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-right border-r border-gray-200 dark:border-gray-700">
                  {hour}:00
                </div>

                {/* Colunas dos dias */}
                {daysOfWeek.map((day, dayIndex) => {
                  const bookingsAtHour = getBookingsAtHour(day, hour)
                  return (
                    <div
                      key={dayIndex}
                      className={`p-1 border-r border-gray-200 dark:border-gray-700 relative ${
                        isToday(day) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      {bookingsAtHour.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => onBookingClick(booking)}
                          className={`p-2 rounded-md border-l-4 mb-1 cursor-pointer hover:opacity-80 transition active:scale-95 ${getStatusColor(
                            booking.status
                          )}`}
                          style={{ fontSize: viewMode === 'day' ? '12px' : '11px', minHeight: '60px' }}
                        >
                          <div className="font-semibold truncate">
                            {formatTime(booking.booking_date)}
                          </div>
                          <div className="truncate font-medium">
                            {booking.customer?.name || 'Cliente'}
                          </div>
                          <div className="truncate text-xs opacity-75">
                            {booking.service?.name || 'Serviço'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Pendente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Confirmado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Concluído</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
