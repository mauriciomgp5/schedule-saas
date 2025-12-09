import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Calendar, Clock, Users, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const { data: bookings } = useQuery({
    queryKey: ['bookings', 'dashboard'],
    queryFn: () => api.getBookings(),
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  })

  const stats = [
    {
      name: 'Agendamentos Hoje',
      value: bookings?.data?.filter((b) => {
        const today = new Date().toDateString()
        return new Date(b.start_time).toDateString() === today
      }).length || 0,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Agendamentos Pendentes',
      value: bookings?.data?.filter((b) => b.status === 'pending').length || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total de Clientes',
      value: customers?.data?.length || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Receita do Mês',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(
        bookings?.data
          ?.filter((b) => {
            const month = new Date().getMonth()
            return (
              new Date(b.start_time).getMonth() === month &&
              b.status === 'completed'
            )
          })
          .reduce((sum, b) => sum + Number(b.price), 0) || 0
      ),
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Próximos Agendamentos
        </h2>
        <div className="space-y-4">
          {bookings?.data
            ?.filter((b) => new Date(b.start_time) >= new Date())
            .slice(0, 5)
            .map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.customer?.name}
                  </p>
                  <p className="text-sm text-gray-600">{booking.service?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(booking.start_time).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status === 'confirmed'
                      ? 'Confirmado'
                      : booking.status === 'pending'
                      ? 'Pendente'
                      : booking.status}
                  </span>
                </div>
              </div>
            )) || (
            <p className="text-gray-500 text-center py-8">
              Nenhum agendamento próximo
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

