import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import CalendarView from '@/components/calendar/CalendarView'
import type { Booking } from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const start = format(startOfMonth(selectedDate), 'yyyy-MM-dd')
  const end = format(endOfMonth(selectedDate), 'yyyy-MM-dd')

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['calendar', 'events', start, end],
    queryFn: () => api.getCalendarEvents(start, end),
  })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    // Aqui você pode abrir um modal para criar um novo agendamento
    console.log('Data selecionada:', date)
  }

  const handleEventClick = (booking: Booking) => {
    setSelectedBooking(booking)
    // Aqui você pode abrir um modal para ver/editar o agendamento
    console.log('Agendamento clicado:', booking)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
        <p className="text-gray-600 mt-2">Visualize e gerencie seus agendamentos</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Carregando calendário...</div>
        </div>
      ) : (
        <CalendarView
          events={bookings}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
        />
      )}

      {selectedBooking && (
        <div className="mt-4 bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Detalhes do Agendamento
          </h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Cliente:</span>{' '}
              {selectedBooking.customer?.name}
            </p>
            <p>
              <span className="font-medium">Serviço:</span>{' '}
              {selectedBooking.service?.name}
            </p>
            <p>
              <span className="font-medium">Data/Hora:</span>{' '}
              {new Date(selectedBooking.start_time).toLocaleString('pt-BR')}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              {selectedBooking.status}
            </p>
            {selectedBooking.notes && (
              <p>
                <span className="font-medium">Observações:</span>{' '}
                {selectedBooking.notes}
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedBooking(null)}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}

