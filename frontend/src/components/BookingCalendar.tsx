'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAvailableSlots, createBooking, TimeSlot } from '@/services/publicStore'
import { AuthModal } from './AuthModal'
import { useThemeClasses } from '@/hooks/useThemeClasses'

interface BookingCalendarProps {
    isOpen: boolean
    onClose: () => void
    service: {
        id: number
        name: string
        price: number
        duration: number
        description?: string
        requires_approval?: boolean
    }
    slug: string
    onAuthSuccess?: (customerData: { name: string; phone: string }) => void
}

export function BookingCalendar({ isOpen, onClose, service, slug, onAuthSuccess }: BookingCalendarProps) {
    const { getInputClasses, getLabelClasses, getCardClasses } = useThemeClasses()
    const router = useRouter()

    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedTime, setSelectedTime] = useState<string>('')
    const [slots, setSlots] = useState<TimeSlot[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_notes: '',
        accept_whatsapp_reminders: true
    })

    // Verificar autenticação ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            const customerPhone = localStorage.getItem('customerPhone')
            const customerAuthenticated = localStorage.getItem('customerAuthenticated')

            if (customerPhone && customerAuthenticated) {
                setIsAuthenticated(true)
                // Auto-preencher dados do cliente
                const customerName = localStorage.getItem('customerName')
                if (customerName) {
                    setFormData(prev => ({
                        ...prev,
                        customer_name: customerName,
                        customer_phone: customerPhone
                    }))
                }
            } else {
                setIsAuthenticated(false)
            }
        }
    }, [isOpen])

    // Carregar slots quando uma data for selecionada
    useEffect(() => {
        if (selectedDate) {
            loadAvailableSlots()
        }
    }, [selectedDate])

    const loadAvailableSlots = async () => {
        if (!selectedDate) return

        try {
            setLoadingSlots(true)
            const data = await getAvailableSlots(slug, service.id, selectedDate)
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

        // Chamar callback se fornecido
        if (onAuthSuccess) {
            onAuthSuccess(customerData)
        }
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

        try {
            setSubmitting(true)
            setError('')

            // Criar data no timezone local
            const bookingDateTime = new Date(`${selectedDate}T${selectedTime}`)

            const bookingData = {
                service_id: service.id,
                booking_date: `${selectedDate} ${selectedTime}`,
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                customer_notes: formData.customer_notes,
                accept_whatsapp_reminders: formData.accept_whatsapp_reminders
            }

            const result = await createBooking(slug, bookingData)

            // Salvar o novo agendamento no localStorage
            const newBooking = {
                id: result.booking.id,
                service_name: result.booking.service_name,
                booking_date: result.booking.booking_date,
                customer_name: result.booking.customer_name,
                status: result.booking.status,
                whatsapp_reminders: result.booking.whatsapp_reminders
            }
            localStorage.setItem('newBooking', JSON.stringify(newBooking))

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

    const getAvailableDates = () => {
        const dates = []
        const today = new Date()

        for (let i = 0; i < 30; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            dates.push(date.toISOString().split('T')[0])
        }

        return dates
    }

    // Funções para o calendário moderno
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        // Dias do mês anterior (para preencher a primeira semana)
        const prevMonth = new Date(year, month - 1, 0)
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: prevMonth.getDate() - i,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isAvailable: false,
                fullDate: new Date(year, month - 1, prevMonth.getDate() - i).toISOString().split('T')[0]
            })
        }

        // Dias do mês atual
        const today = new Date()
        const availableDates = getAvailableDates()

        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = new Date(year, month, day).toISOString().split('T')[0]
            const isToday = fullDate === today.toISOString().split('T')[0]
            const isSelected = fullDate === selectedDate
            const isAvailable = availableDates.includes(fullDate)

            days.push({
                date: day,
                isCurrentMonth: true,
                isToday,
                isSelected,
                isAvailable,
                fullDate
            })
        }

        // Dias do próximo mês (para completar a última semana)
        const remainingDays = 42 - days.length // 6 semanas x 7 dias
        for (let day = 1; day <= remainingDays; day++) {
            days.push({
                date: day,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isAvailable: false,
                fullDate: new Date(year, month + 1, day).toISOString().split('T')[0]
            })
        }

        return days
    }

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        }).replace(/^\w/, c => c.toUpperCase())
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth)
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1)
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1)
        }
        setCurrentMonth(newMonth)
    }

    const handleDateSelect = (fullDate: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        const availableDates = getAvailableDates()
        if (availableDates.includes(fullDate)) {
            setSelectedDate(fullDate)
            setSelectedTime('')
            setSlots([])
        }
    }

    if (!isOpen) return null

    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`${getCardClasses()} max-w-md w-full text-center`}>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Agendamento Confirmado!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Seu agendamento foi criado com sucesso. Você receberá um email de confirmação em breve.
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                setSuccess(false)
                                onClose()
                                // Redirecionar para a página de agendamentos do cliente
                                router.push(`/${slug}/agendamentos`)
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            Ver Meus Agendamentos
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${getCardClasses()} max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Agendar: {service.name}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatPrice(service.price)} • {formatDuration(service.duration)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    {/* Calendário Moderno */}
                    <div>
                        <label className={getLabelClasses()}>Selecione uma Data</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Agendamentos devem ser feitos com pelo menos 1 hora de antecedência
                        </p>

                        {/* Calendário */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            {/* Header do Calendário */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={() => navigateMonth('prev')}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatMonthYear(currentMonth)}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => navigateMonth('next')}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Dias da Semana */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                    <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Dias do Mês */}
                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(currentMonth).map((day, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={(e) => handleDateSelect(day.fullDate, e)}
                                        disabled={!day.isAvailable || !day.isCurrentMonth}
                                        className={`
                                            relative p-2 text-sm rounded-lg transition-all duration-200
                                            ${!day.isCurrentMonth
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : day.isAvailable
                                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                                                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                            }
                                            ${day.isToday
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                                                : ''
                                            }
                                            ${day.isSelected
                                                ? 'bg-blue-600 text-white font-semibold shadow-lg'
                                                : ''
                                            }
                                        `}
                                    >
                                        {day.date}
                                        {day.isToday && !day.isSelected && (
                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Selecionada */}
                        {selectedDate && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <span className="font-medium">Data selecionada:</span>{' '}
                                    {new Date(selectedDate).toLocaleDateString('pt-BR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
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
                    {isAuthenticated && (
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
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !selectedDate || !selectedTime}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                    >
                        {submitting ? 'Agendando...' : !isAuthenticated ? 'Fazer Login para Agendar' : 'Confirmar Agendamento'}
                    </button>
                </form>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
                slug={slug}
            />
        </div>
    )
}
