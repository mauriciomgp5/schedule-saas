import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Shield,
  Award,
} from 'lucide-react'
import type { Service } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import Hero from '@/components/ui/Hero'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Footer from '@/components/ui/Footer'
import { cn } from '@/utils/cn'

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

  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Fetch tenant
  const { data: tenant } = useQuery({
    queryKey: ['public-tenant', domain],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/public/${domain}`)
      if (!response.ok) throw new Error('Negócio não encontrado')
      return response.json()
    },
    enabled: !!domain,
  })

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['public-services', domain],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/public/${domain}/services`)
      if (!response.ok) throw new Error('Erro ao carregar serviços')
      return response.json()
    },
    enabled: !!domain,
  })

  // Fetch availability
  const { data: availability } = useQuery({
    queryKey: ['availability', domain, selectedService?.id, selectedDate, selectedProfessionalId],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/public/${domain}/availability?date=${selectedDate}&service_id=${selectedService?.id}${
          selectedProfessionalId ? `&professional_id=${selectedProfessionalId}` : ''
        }`
      )
      if (!response.ok) throw new Error('Erro ao verificar disponibilidade')
      return response.json()
    },
    enabled: !!selectedService && !!selectedDate,
  })

  // Create booking
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="text-center">
          <p className="text-gray-600">Domínio não encontrado</p>
        </Card>
      </div>
    )
  }

  const primaryColor = tenant?.theme?.primary_color || '#667eea'
  const logo = tenant?.theme?.logo
  const businessName = tenant?.name || 'Agendamento Online'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Success Screen */}
      {bookingMutation.isSuccess ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card padding="xl" className="max-w-2xl w-full text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Agendamento Confirmado!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Seu agendamento foi criado com sucesso. Você receberá um email de confirmação em breve.
            </p>
            <Button
              size="lg"
              onClick={() => window.location.reload()}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Fazer Novo Agendamento
            </Button>
          </Card>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          {step === 1 && (
            <Hero
              title={
                <>
                  Agende seu <span className="gradient-text">horário</span>
                  <br />
                  de forma rápida e fácil
                </>
              }
              subtitle="Bem-vindo!"
              description="Escolha o serviço desejado, selecione data e horário, e confirme seu agendamento em poucos cliques."
              backgroundColor={primaryColor}
              logo={logo}
              businessName={businessName}
              badges={
                <>
                  <Badge variant="success" size="lg" icon={<Clock className="w-4 h-4" />}>
                    Agendamento Rápido
                  </Badge>
                  <Badge variant="purple" size="lg" icon={<Zap className="w-4 h-4" />}>
                    Sem Cadastro
                  </Badge>
                  <Badge variant="info" size="lg" icon={<Shield className="w-4 h-4" />}>
                    100% Seguro
                  </Badge>
                </>
              }
            >
              <div className="flex flex-wrap items-center justify-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">Avaliação 4.9/5</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">+1000 clientes satisfeitos</span>
                </div>
              </div>
            </Hero>
          )}

          {/* Content */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Steps */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3, 4].map((s) => {
                    const status = step === s ? 'current' : step > s ? 'done' : 'todo'
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div
                          className={cn(
                            'flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all border-2',
                            status === 'current' &&
                              'bg-primary text-primary-foreground scale-110 shadow-xl border-primary',
                            status === 'done' &&
                              'bg-primary/20 text-primary border-primary shadow-lg',
                            status === 'todo' && 'bg-gray-100 text-gray-500 border-gray-300'
                          )}
                        >
                          {status === 'done' ? <CheckCircle className="w-6 h-6" /> : s}
                        </div>
                        {s < 4 && (
                          <div
                            className={cn(
                              'flex-1 h-2 mx-3 rounded-full transition-all',
                              step > s ? 'bg-primary' : 'bg-gray-200'
                            )}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className={step >= 1 ? 'text-primary' : 'text-gray-500'}>Serviço</span>
                  <span className={step >= 2 ? 'text-primary' : 'text-gray-500'}>Data</span>
                  <span className={step >= 3 ? 'text-primary' : 'text-gray-500'}>Horário</span>
                  <span className={step >= 4 ? 'text-primary' : 'text-gray-500'}>Dados</span>
                </div>
              </Card>

              {/* Step 1: Service Selection */}
              {step >= 1 && (
                <Card padding="lg" hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Sparkles className="w-7 h-7 text-primary" />
                      Escolha o Serviço
                    </CardTitle>
                    <CardDescription>
                      {services.length} serviço{services.length !== 1 ? 's' : ''} disponível
                      {services.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                          className={cn(
                            'group relative p-6 border-2 rounded-2xl text-left transition-all duration-200',
                            selectedService?.id === service.id
                              ? 'border-primary bg-primary/5 shadow-xl scale-105 ring-4 ring-primary/20'
                              : 'border-gray-200 hover:border-primary/50 hover:shadow-lg bg-white'
                          )}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                {service.name}
                              </h3>
                              {service.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            {service.color && (
                              <div
                                className="w-10 h-10 rounded-xl border-2 border-gray-200 shadow-sm flex-shrink-0"
                                style={{ backgroundColor: service.color }}
                              />
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration} min</span>
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
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-5 h-5 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Professional & Date */}
              {step >= 2 && selectedService && (
                <Card padding="lg" hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <User className="w-7 h-7 text-primary" />
                      Profissional (opcional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedService.professionals && selectedService.professionals.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                        <button
                          type="button"
                          onClick={() => setSelectedProfessionalId(null)}
                          className={cn(
                            'p-4 border-2 rounded-xl text-left transition-all',
                            selectedProfessionalId === null
                              ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                              : 'border-gray-200 hover:border-primary/50'
                          )}
                        >
                          <span className="font-medium">Qualquer profissional disponível</span>
                        </button>
                        {selectedService.professionals.map((pro) => (
                          <button
                            key={pro.id}
                            type="button"
                            onClick={() => setSelectedProfessionalId(pro.id)}
                            className={cn(
                              'p-4 border-2 rounded-xl text-left transition-all flex items-center gap-3',
                              selectedProfessionalId === pro.id
                                ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                                : 'border-gray-200 hover:border-primary/50'
                            )}
                          >
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                              style={{ backgroundColor: pro.color || '#667eea' }}
                            >
                              {pro.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{pro.name}</p>
                              {pro.email && (
                                <p className="text-sm text-gray-600">{pro.email}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mb-8">
                        Nenhum profissional vinculado; usaremos qualquer disponível.
                      </p>
                    )}

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary" />
                        Escolha a Data
                      </h3>
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
                          <span className="font-semibold text-primary">
                            {format(new Date(selectedDate + 'T00:00:00'), "EEEE, dd 'de' MMMM", {
                              locale: ptBR,
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Time Selection */}
              {step >= 3 && selectedDate && availability && (
                <Card padding="lg" hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Clock className="w-7 h-7 text-primary" />
                      Escolha o Horário
                    </CardTitle>
                    <CardDescription>
                      {availability.available_slots?.length || 0} horário
                      {(availability.available_slots?.length || 0) !== 1 ? 's' : ''} disponível
                      {(availability.available_slots?.length || 0) !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {availability.available_slots?.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {availability.available_slots.map((slot: { start: string; end: string }) => (
                          <button
                            key={slot.start}
                            type="button"
                            onClick={() => {
                              setSelectedTime(slot.start)
                              setStep(4)
                            }}
                            className={cn(
                              'p-4 border-2 rounded-xl font-semibold transition-all',
                              selectedTime === slot.start
                                ? 'border-primary bg-primary text-primary-foreground shadow-xl scale-110 ring-4 ring-primary/30'
                                : 'border-gray-200 hover:border-primary/50 hover:shadow-lg bg-white text-gray-900 hover:scale-105'
                            )}
                          >
                            {slot.start}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-4">Nenhum horário disponível para esta data.</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedDate('')
                            setStep(2)
                          }}
                        >
                          Escolher outra data
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Customer Data */}
              {step >= 4 && selectedTime && (
                <Card padding="lg" hover>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <User className="w-7 h-7 text-primary" />
                      Seus Dados
                    </CardTitle>
                    <CardDescription>Preencha suas informações para confirmar</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}

              {/* Summary & Submit */}
              {step >= 4 && selectedTime && (
                <Card
                  padding="lg"
                  className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Resumo do Agendamento</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-gray-600 font-medium">Serviço:</span>
                      <span className="font-bold text-gray-900">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-gray-600 font-medium">Data:</span>
                      <span className="font-bold text-gray-900">
                        {selectedDate &&
                          format(
                            new Date(selectedDate + 'T00:00:00'),
                            "dd 'de' MMMM 'de' yyyy",
                            {
                              locale: ptBR,
                            }
                          )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-gray-600 font-medium">Horário:</span>
                      <span className="font-bold text-gray-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                      <span className="text-gray-600 font-medium">Profissional:</span>
                      <span className="font-bold text-gray-900">
                        {selectedProfessionalId
                          ? selectedService?.professionals?.find(
                              (p) => p.id === selectedProfessionalId
                            )?.name || 'Profissional selecionado'
                          : 'Qualquer disponível'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-3xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(selectedService?.price || 0))}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="xl"
                    className="w-full"
                    isLoading={bookingMutation.isPending}
                    disabled={
                      bookingMutation.isPending || !formData.customer_name || !formData.customer_email
                    }
                    rightIcon={<ArrowRight className="w-6 h-6" />}
                  >
                    Confirmar Agendamento
                  </Button>
                  {bookingMutation.isError && (
                    <p className="mt-4 text-red-600 text-sm text-center font-medium">
                      {bookingMutation.error instanceof Error
                        ? bookingMutation.error.message
                        : 'Erro ao criar agendamento'}
                    </p>
                  )}
                </Card>
              )}
            </form>
          </div>

          {/* Footer */}
          <Footer
            businessName={businessName}
            email={tenant?.email}
            phone={tenant?.phone}
            address={tenant?.address}
            businessHours="Seg - Sex: 9h às 18h
Sáb: 9h às 13h"
            social={{
              instagram: 'https://instagram.com',
              facebook: 'https://facebook.com',
            }}
          />
        </>
      )}
    </div>
  )
}
