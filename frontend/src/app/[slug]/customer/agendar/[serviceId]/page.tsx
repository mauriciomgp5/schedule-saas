'use client'

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoreBySlug, getStoreServices, getAvailableSlots, createBooking, Store, Service, TimeSlot, BookingRequest } from "@/services/publicStore"
import { CustomerHeader } from "@/components/CustomerHeader"
import { AuthModal } from "@/components/AuthModal"
import { useThemeClasses } from "@/hooks/useThemeClasses"

export default function BookingPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const serviceId = parseInt(params.serviceId as string)
    const { getInputClasses, getLabelClasses, getCardClasses, getTextClasses } = useThemeClasses()

    const [store, setStore] = useState<Store | null>(null)
    const [service, setService] = useState<Service | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedTime, setSelectedTime] = useState<string>('')
    const [slots, setSlots] = useState<TimeSlot[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_notes: '',
        accept_whatsapp_reminders: true
    })

    // Função para formatar telefone
    const formatPhone = (value: string) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '')

        // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        if (numbers.length <= 2) {
            return numbers
        } else if (numbers.length <= 6) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
        } else if (numbers.length <= 10) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
        } else {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
        }
    }

    const handlePhoneChange = (value: string) => {
        const formatted = formatPhone(value)
        setFormData({ ...formData, customer_phone: formatted })
    }

    useEffect(() => {
        // Verificar autenticação
        const customerPhone = localStorage.getItem('customerPhone')
        const customerAuthenticated = localStorage.getItem('customerAuthenticated')

        if (!customerPhone || !customerAuthenticated) {
            setShowAuthModal(true)
            return
        }

        // Auto-preencher dados do cliente
        const customerName = localStorage.getItem('customerName')
        if (customerName) {
            setFormData(prev => ({
                ...prev,
                customer_name: customerName,
                customer_phone: customerPhone
            }))
        }

        setIsAuthenticated(true)
        loadStoreAndService()
    }, [slug, serviceId, router])

    useEffect(() => {
        if (selectedDate) {
            loadAvailableSlots()
        }
    }, [selectedDate])

    const loadStoreAndService = async () => {
        try {
            setLoading(true)
            setError('')

            const [storeData, servicesData] = await Promise.all([
                getStoreBySlug(slug),
                getStoreServices(slug)
            ])

            setStore(storeData)

            const foundService = servicesData.find(s => s.id === serviceId)
            if (!foundService) {
                throw new Error('Serviço não encontrado')
            }
            setService(foundService)
        } catch (error: any) {
            console.error('Erro ao carregar dados:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const loadAvailableSlots = async () => {
        if (!selectedDate) return

        try {
            setLoadingSlots(true)
            const data = await getAvailableSlots(slug, serviceId, selectedDate)
            setSlots(data.slots)
        } catch (error: any) {
            console.error('Erro ao carregar horários:', error)
            setError(error.message)
        } finally {
            setLoadingSlots(false)
        }
    }

    const handleAuthSuccess = (customerData: { name: string; phone: string }) => {
        setFormData(prev => ({
            ...prev,
            customer_name: customerData.name,
            customer_phone: customerData.phone
        }))
        setIsAuthenticated(true)
        setShowAuthModal(false)
        loadStoreAndService()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isAuthenticated) {
            setShowAuthModal(true)
            return
        }

        if (!selectedDate || !selectedTime) {
            setError('Por favor, selecione uma data e horário')
            return
        }

        // Validação adicional no frontend
        const bookingDateTime = new Date(`${selectedDate} ${selectedTime}`)
        const now = new Date()

        if (bookingDateTime <= now) {
            setError('Não é possível agendar para uma data/hora no passado')
            return
        }

        // Se for para um dia diferente (futuro), sempre permitir
        const isSameDay = bookingDateTime.toDateString() === now.toDateString()

        if (isSameDay) {
            // Para o mesmo dia, verificar se é pelo menos 1 hora no futuro
            const diffInMinutes = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60)
            if (diffInMinutes < 60) {
                const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const bookingTime = bookingDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const bookingDate = bookingDateTime.toLocaleDateString('pt-BR')
                setError(`O agendamento deve ser feito com pelo menos 1 hora de antecedência. Horário atual: ${currentTime}, Agendamento solicitado: ${bookingTime} do dia ${bookingDate}`)
                return
            }
        }
        // Se for para dia futuro, não precisa validar horário

        try {
            setSubmitting(true)
            setError('')

            // Criar data no timezone local
            const bookingDateTime = new Date(`${selectedDate}T${selectedTime}`)

            const bookingData: BookingRequest = {
                service_id: serviceId,
                booking_date: bookingDateTime.toISOString(),
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                customer_notes: formData.customer_notes,
                accept_whatsapp_reminders: formData.accept_whatsapp_reminders
            }

            console.log('Submitting booking:', bookingData)
            const result = await createBooking(slug, bookingData)

            // Salvar o novo agendamento no localStorage para a página de agendamentos
            const newBooking = {
                id: result.booking.id,
                service_name: result.booking.service_name,
                booking_date: result.booking.booking_date,
                customer_name: result.booking.customer_name,
                status: result.booking.status,
                whatsapp_reminders: result.booking.whatsapp_reminders
            }
            console.log('Salvando novo agendamento no localStorage:', newBooking)
            localStorage.setItem('newBooking', JSON.stringify(newBooking))

            // Salvar telefone do cliente para futuras consultas
            localStorage.setItem('customerPhone', formData.customer_phone)

            setSuccess(true)
        } catch (error: any) {
            console.error('Erro ao criar agendamento:', error)
            setError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60

        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
        }
        return `${mins}min`
    }

    const getMinDate = () => {
        const today = new Date()
        // Adicionar 1 hora para garantir que não seja no passado
        today.setHours(today.getHours() + 1)
        return today.toISOString().split('T')[0]
    }

    const getMaxDate = () => {
        const maxDate = new Date()
        maxDate.setDate(maxDate.getDate() + 30) // 30 dias no futuro
        return maxDate.toISOString().split('T')[0]
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }


    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
                    <p className="text-gray-600 mb-4">
                        Seu agendamento foi criado com sucesso. Você receberá um email de confirmação em breve.
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => router.push(`/${slug}/customer/agendamentos`)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            Ver Meus Agendamentos
                        </button>
                        <button
                            onClick={() => router.push(`/${slug}/customer`)}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                        >
                            Voltar para Serviços
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!store || !service) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <CustomerHeader slug={slug} storeName={store?.name} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Informações do Serviço */}
                    <div className={getCardClasses()}>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Detalhes do Serviço</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                                {service.description && (
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{service.description}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-300">Preço:</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(service.price)}</span>
                            </div>

                            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-300">Duração:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatDuration(service.duration)}</span>
                            </div>

                            {service.requires_approval && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-sm text-yellow-800">Este serviço requer aprovação</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulário de Agendamento */}
                    <div className={getCardClasses()}>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agendar</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                                Erro no Agendamento
                                            </h3>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Seleção de Data */}
                            <div>
                                <label className={getLabelClasses()}>Data</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Agendamentos devem ser feitos com pelo menos 1 hora de antecedência
                                </p>
                                <input
                                    type="date"
                                    required
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value)
                                        setSelectedTime('')
                                        setSlots([])
                                    }}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    className={getInputClasses()}
                                />
                            </div>

                            {/* Seleção de Horário */}
                            {selectedDate && (
                                <div>
                                    <label className={getLabelClasses()}>Horário</label>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Nenhum horário disponível para esta data
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                            {slots.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => setSelectedTime(slot.start_time)}
                                                    disabled={!slot.available}
                                                    className={`p-3 rounded-lg border text-sm font-medium transition ${selectedTime === slot.start_time
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : slot.available
                                                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {slot.start_time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dados do Cliente */}
                            <div className="space-y-4">
                                {/* Mostrar dados salvos */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Seus Dados</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-blue-700 dark:text-blue-300">Nome:</span>
                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{formData.customer_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-blue-700 dark:text-blue-300">Telefone:</span>
                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{formData.customer_phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Campo de email (opcional) */}
                                <div>
                                    <label className={getLabelClasses()}>Email (opcional)</label>
                                    <input
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        className={getInputClasses()}
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={getLabelClasses()}>Observações</label>
                                <textarea
                                    value={formData.customer_notes}
                                    onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                                    rows={3}
                                    className={getInputClasses()}
                                    placeholder="Alguma observação especial?"
                                />
                            </div>

                            {/* Checkbox para lembretes via WhatsApp */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={formData.accept_whatsapp_reminders}
                                            onChange={(e) => setFormData({ ...formData, accept_whatsapp_reminders: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            📱 Receber lembretes via WhatsApp
                                        </label>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            Receba lembretes automáticos minutos antes do seu agendamento
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !selectedDate || !selectedTime}
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                            >
                                {submitting ? 'Agendando...' : !isAuthenticated ? 'Fazer Login para Agendar' : 'Confirmar Agendamento'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
                slug={slug}
            />
        </div>
    )
}
