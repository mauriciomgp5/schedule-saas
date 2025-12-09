import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Calendar, Clock, User, Mail, Phone, CheckCircle, ArrowRight, Sparkles, Zap } from 'lucide-react'
import type { Service } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

export default function PublicBookingPage() {
  const { domain } = useParams<{ domain: string }>()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
  })
  const [step, setStep] = useState(1)

  // Usa o proxy do frontend por padrão (mesma origem), evitando erro de conexão ao backend em localhost:8000.
  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Buscar informações do tenant
  const { data: tenant } = useQuery({
    queryKey: ['public-tenant', domain],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/public/${domain}`)
      if (!response.ok) throw new Error('Negócio não encontrado')
      return response.json()
    },
    enabled: !!domain,
  })

  // Buscar serviços
  const { data: services = [] } = useQuery({
    queryKey: ['public-services', domain],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/public/${domain}/services`)
      if (!response.ok) throw new Error('Erro ao carregar serviços')
      return response.json()
    },
    enabled: !!domain,
  })

  // Buscar horários disponíveis
  const { data: availability } = useQuery({
    queryKey: ['availability', domain, selectedService?.id, selectedDate, selectedProfessionalId],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/public/${domain}/availability?date=${selectedDate}&service_id=${selectedService?.id}${selectedProfessionalId ? `&professional_id=${selectedProfessionalId}` : ''
        }`
      )
      if (!response.ok) throw new Error('Erro ao verificar disponibilidade')
      return response.json()
    },
    enabled: !!selectedService && !!selectedDate,
  })

  // Criar agendamento
  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_URL}/public/${domain}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar agendamento')
      }
      return response.json()
    },
    onSuccess: () => {
      setFormData({ customer_name: '', customer_email: '', customer_phone: '', notes: '' })
      setSelectedService(null)
      setSelectedDate('')
      setSelectedTime('')
      setStep(1)
    },
  })

  useEffect(() => {
    if (selectedService) setStep(2)
    if (selectedDate) setStep(3)
    if (selectedTime) setStep(4)
    if (!selectedService) {
      setSelectedProfessionalId(null)
    }
  }, [selectedService, selectedDate, selectedTime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Por favor, selecione um serviço, data e horário')
      return
    }

    const startTime = `${selectedDate}T${selectedTime}:00`

    bookingMutation.mutate({
      ...formData,
      service_id: selectedService.id,
      professional_id: selectedProfessionalId ?? undefined,
      start_time: startTime,
    })
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  if (!domain) {
    return <div className="min-h-screen flex items-center justify-center">Domínio não encontrado</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tenant?.theme?.logo ? (
                <img src={tenant.theme.logo} alt={tenant.name} className="h-10 w-10 rounded-lg object-contain" />
              ) : (
                // Fallback seguro em alto contraste para evitar desaparecer em temas claros
                <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {tenant?.name?.charAt(0).toUpperCase() || 'B'}
                  </span>
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">{tenant?.name || 'Agendamento Online'}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {step === 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="px-3 py-1 bg-green-100 rounded-full flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">Agendamento Rápido</span>
              </div>
              <div className="px-3 py-1 bg-pink-100 rounded-full flex items-center gap-2">
                <Zap className="w-4 h-4 text-pink-700" />
                <span className="text-sm font-medium text-pink-700">Sem Cadastro</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Agende seu{' '}
              <span className="text-primary">horário</span>
              <br />
              de forma rápida e fácil
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Escolha o serviço desejado, selecione data e horário, e confirme seu agendamento em poucos cliques.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-700">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                {tenant?.name || 'Agendamento Online'}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                Domínio público: {domain}
              </span>
              <span className="text-gray-500">Sem cadastro • Confirmação instantânea</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {bookingMutation.isSuccess ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Agendamento Confirmado!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Seu agendamento foi criado com sucesso. Você receberá um email de confirmação em breve.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Fazer Novo Agendamento
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((s) => {
                  const status = step === s ? 'current' : step > s ? 'done' : 'todo'
                  const circleClass =
                    status === 'current'
                      ? 'bg-primary text-white font-semibold shadow-lg border-primary'
                      : status === 'done'
                        ? 'bg-primary/15 text-primary font-semibold border-primary/60'
                        : 'bg-gray-100 text-gray-700 border-gray-300 shadow-sm'
                  const barClass = step > s ? 'bg-primary/70' : 'bg-gray-200'

                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all border ${circleClass}`}
                      >
                        {s}
                      </div>
                      {s < 4 && (
                        <div className={`flex-1 h-1 mx-2 rounded ${barClass}`} />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-4 text-xs text-gray-600">
                <span className={step >= 1 ? 'font-semibold text-primary' : ''}>Serviço</span>
                <span className={step >= 2 ? 'font-semibold text-primary' : ''}>Data</span>
                <span className={step >= 3 ? 'font-semibold text-primary' : ''}>Horário</span>
                <span className={step >= 4 ? 'font-semibold text-primary' : ''}>Dados</span>
              </div>
            </div>

            {/* Step 1: Seleção de Serviço */}
            {step >= 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  1. Escolha o Serviço
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Serviços disponíveis: {services.length || 0}. Escolha um para continuar.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service: Service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(service)
                        setSelectedProfessionalId(null)
                        setStep(2)
                      }}
                      className={`group relative p-6 border-2 rounded-2xl text-left transition-all hover:shadow-xl ${selectedService?.id === service.id
                        ? 'border-primary bg-primary/10 shadow-lg scale-105 ring-2 ring-primary/25'
                        : 'border-gray-200 hover:border-primary/50 bg-white'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                          )}
                        </div>
                        {service.color && (
                          <div
                            className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm"
                            style={{ backgroundColor: service.color }}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(Number(service.price))}
                        </span>
                      </div>
                      {selectedService?.id === service.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Profissional e Data */}
            {step >= 2 && selectedService && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <User className="w-6 h-6 text-primary" />
                    2. Escolha o Profissional (opcional)
                  </h2>
                  {selectedService.professionals && selectedService.professionals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedProfessionalId(null)}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${selectedProfessionalId === null
                          ? 'border-primary bg-primary/10 shadow ring-2 ring-primary/25'
                          : 'border-gray-200 hover:border-primary/50'
                          }`}
                      >
                        Qualquer profissional disponível
                      </button>
                      {selectedService.professionals.map((pro) => (
                        <button
                          key={pro.id}
                          type="button"
                          onClick={() => setSelectedProfessionalId(pro.id)}
                          className={`p-4 border-2 rounded-xl text-left transition-all flex items-center gap-3 ${selectedProfessionalId === pro.id
                            ? 'border-primary bg-primary/10 shadow ring-2 ring-primary/25'
                            : 'border-gray-200 hover:border-primary/50'
                            }`}
                        >
                          <div
                            className="w-10 h-10 rounded-full border flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: pro.color || '#0ea5e9' }}
                          >
                            {pro.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{pro.name}</p>
                            {pro.email && <p className="text-sm text-gray-600">{pro.email}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Nenhum profissional vinculado; usaremos qualquer disponível.</p>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    3. Escolha a Data
                  </h2>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedTime('')
                      setStep(3)
                    }}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-lg font-medium transition-all"
                    required
                  />
                  {selectedDate && (
                    <p className="mt-4 text-sm text-gray-600">
                      Data selecionada:{' '}
                      <span className="font-semibold">
                        {format(new Date(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Seleção de Horário */}
            {step >= 3 && selectedDate && availability && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  3. Escolha o Horário
                </h2>
                {availability.available_slots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {availability.available_slots.map((slot: { start: string; end: string }) => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => {
                          setSelectedTime(slot.start)
                          setStep(4)
                        }}
                        className={`p-4 border-2 rounded-xl font-semibold transition-all hover:scale-105 ${selectedTime === slot.start
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30'
                          : 'border-gray-200 hover:border-primary/50 bg-white text-gray-900'
                          }`}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Nenhum horário disponível para esta data.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate('')
                        setStep(2)
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Escolher outra data
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Dados do Cliente */}
            {step >= 4 && selectedTime && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-primary" />
                  4. Seus Dados
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) =>
                          setFormData({ ...formData, customer_email: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, customer_phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      rows={4}
                      placeholder="Alguma observação especial sobre o agendamento?"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Resumo e Botão de Confirmar */}
            {step >= 4 && selectedTime && (
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl shadow-xl p-6 md:p-8 border-2 border-primary/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo do Agendamento</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Serviço:</span>
                    <span className="font-semibold text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedDate &&
                        format(new Date(selectedDate), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profissional:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedProfessionalId
                        ? selectedService?.professionals?.find((p) => p.id === selectedProfessionalId)?.name ||
                        'Profissional selecionado'
                        : 'Qualquer disponível'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Horário:</span>
                    <span className="font-semibold text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(selectedService?.price || 0))}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={bookingMutation.isPending || !formData.customer_name || !formData.customer_email}
                  className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingMutation.isPending ? (
                    'Agendando...'
                  ) : (
                    <>
                      Confirmar Agendamento
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                {bookingMutation.isError && (
                  <p className="mt-4 text-red-600 text-sm text-center font-medium">
                    {bookingMutation.error instanceof Error
                      ? bookingMutation.error.message
                      : 'Erro ao criar agendamento'}
                  </p>
                )}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {tenant?.name || 'Booking System'}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
