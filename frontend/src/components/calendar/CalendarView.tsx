import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import type { Booking } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CalendarViewProps {
  events: Booking[]
  onDateSelect?: (start: Date) => void
  onEventClick?: (booking: Booking) => void
}

export default function CalendarView({
  events,
  onDateSelect,
  onEventClick,
}: CalendarViewProps) {
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>(
    'dayGridMonth'
  )

  const calendarEvents = events.map((booking) => ({
    id: String(booking.id),
    title: `${booking.customer?.name || 'Cliente'} - ${booking.service?.name || 'Serviço'}`,
    start: booking.start_time,
    end: booking.end_time,
    backgroundColor: booking.service?.color || '#3b82f6',
    borderColor: booking.service?.color || '#3b82f6',
    extendedProps: {
      booking,
    },
  }))

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView('dayGridMonth')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'dayGridMonth'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Mês
        </button>
        <button
          onClick={() => setView('timeGridWeek')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'timeGridWeek'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => setView('timeGridDay')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'timeGridDay'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Dia
        </button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        locale={ptBrLocale}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
        }}
        events={calendarEvents}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        select={(selectInfo) => {
          if (onDateSelect) {
            onDateSelect(selectInfo.start)
          }
        }}
        eventClick={(clickInfo) => {
          if (onEventClick && clickInfo.event.extendedProps.booking) {
            onEventClick(clickInfo.event.extendedProps.booking)
          }
        }}
        height="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
        }}
      />
    </div>
  )
}

