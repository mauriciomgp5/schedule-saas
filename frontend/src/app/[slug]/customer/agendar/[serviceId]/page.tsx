'use client'

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoreBySlug, getStoreServices, getAvailableSlots, createBooking, Store, Service, TimeSlot, BookingRequest } from "@/services/publicStore"
import { ThemeToggle } from "@/components/ThemeToggle"
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

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_notes: ''
    })

    useEffect(() => {
        loadStoreAndService()
    }, [slug, serviceId])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

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

        // Verificar se é pelo menos 1 hora no futuro
        const diffInMinutes = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60)
        if (diffInMinutes < 60) {
            setError('O agendamento deve ser feito com pelo menos 1 hora de antecedência')
            return
        }

        try {
            setSubmitting(true)
            setError('')

            const bookingData: BookingRequest = {
                service_id: serviceId,
                booking_date: `${selectedDate} ${selectedTime}`,
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                customer_notes: formData.customer_notes
            }

            await createBooking(slug, bookingData)
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

    if (error && !success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push(`/${slug}/customer`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Voltar para Serviços
                    </button>
                </div>
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
                    <button
                        onClick={() => router.push(`/${slug}/customer`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Voltar para Serviços
                    </button>
                </div>
            </div>
        )
    }

    if (!store || !service) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Botão de Toggle de Tema */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push(`/${slug}/customer`)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agendar Serviço</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{store.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

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
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={getLabelClasses()}>Nome *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        className={getInputClasses()}
                                    />
                                </div>

                                <div>
                                    <label className={getLabelClasses()}>Email</label>
                                    <input
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        className={getInputClasses()}
                                        placeholder="opcional"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={getLabelClasses()}>Telefone *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.customer_phone}
                                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                    className={getInputClasses()}
                                />
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

                            <button
                                type="submit"
                                disabled={submitting || !selectedDate || !selectedTime}
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                            >
                                {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
