'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CustomerHeader } from '@/components/CustomerHeader'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { getCustomerBookings, cancelBooking } from '@/services/publicStore'
import { ConfirmModal } from '@/components/ConfirmModal'

interface Booking {
    id: number
    service_name: string
    booking_date: string
    customer_name: string
    status: string
    whatsapp_reminders?: boolean
}

export default function MeusAgendamentos() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const { getCardClasses, getTextClasses } = useThemeClasses()

    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cancellingId, setCancellingId] = useState<number | null>(null)
    const [successMessage, setSuccessMessage] = useState('')
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'cancelled'>('active')

    useEffect(() => {
        // Verificar autenticação
        const customerPhone = localStorage.getItem('customerPhone')
        const customerAuthenticated = localStorage.getItem('customerAuthenticated')

        if (!customerPhone || !customerAuthenticated) {
            router.push(`/${slug}`)
            return
        }

        // Verificar se há um novo agendamento no localStorage PRIMEIRO
        const newBooking = localStorage.getItem('newBooking')
        if (newBooking) {
            try {
                const booking = JSON.parse(newBooking)
                console.log('Novo agendamento encontrado:', booking)
                // Carregar dados simulados e adicionar o novo agendamento
                loadBookingsWithNewBooking(booking)
                localStorage.removeItem('newBooking')
            } catch (error) {
                console.error('Erro ao processar novo agendamento:', error)
                loadBookings()
            }
        } else {
            loadBookings()
        }
    }, [slug, router])

    const loadBookings = async () => {
        try {
            setLoading(true)
            setError('')

            // Buscar agendamentos reais da API usando telefone do localStorage
            const storedPhone = localStorage.getItem('customerPhone')

            if (!storedPhone) {
                setError('Telefone do cliente não encontrado. Faça um agendamento primeiro.')
                setLoading(false)
                return
            }

            const bookings = await getCustomerBookings(slug, storedPhone)
            setBookings(bookings)
            setLoading(false)
        } catch (error: any) {
            setError(error.message)
            setLoading(false)
        }
    }

    const loadBookingsWithNewBooking = async (newBooking: Booking) => {
        try {
            setLoading(true)
            setError('')

            // Buscar agendamentos reais da API e adicionar o novo
            const storedPhone = localStorage.getItem('customerPhone')

            if (!storedPhone) {
                setError('Telefone do cliente não encontrado.')
                setLoading(false)
                return
            }

            const existingBookings = await getCustomerBookings(slug, storedPhone)

            // Adicionar o novo agendamento no início da lista
            setBookings([newBooking, ...existingBookings])
            setLoading(false)
        } catch (error: any) {
            setError(error.message)
            setLoading(false)
        }
    }

    const handleCancelBooking = (booking: Booking) => {
        setBookingToCancel(booking)
        setShowCancelModal(true)
    }

    const confirmCancelBooking = async () => {
        if (!bookingToCancel) return

        try {
            setCancellingId(bookingToCancel.id)
            setError('')
            setShowCancelModal(false)

            await cancelBooking(slug, bookingToCancel.id)

            // Atualizar o status do agendamento localmente
            setBookings(prev => prev.map(booking =>
                booking.id === bookingToCancel.id
                    ? { ...booking, status: 'cancelled' }
                    : booking
            ))

            setSuccessMessage('Agendamento cancelado com sucesso!')
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setCancellingId(null)
            setBookingToCancel(null)
        }
    }

    const closeCancelModal = () => {
        setShowCancelModal(false)
        setBookingToCancel(null)
    }

    // Filtrar agendamentos baseado no filtro ativo
    const filteredBookings = bookings.filter(booking => {
        switch (activeFilter) {
            case 'active':
                return booking.status === 'pending' || booking.status === 'confirmed'
            case 'cancelled':
                return booking.status === 'cancelled'
            case 'all':
            default:
                return true
        }
    })

    // Contar agendamentos por status
    const activeCount = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmado'
            case 'pending':
                return 'Pendente'
            case 'cancelled':
                return 'Cancelado'
            default:
                return status
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Agendamentos</h1>
                    </div>

                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <CustomerHeader slug={slug} storeName="Meus Agendamentos" />

            <div className="container mx-auto px-4 py-8">
                {/* Header da Página */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Agendamentos</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Acompanhe seus agendamentos e histórico
                    </p>
                </div>

                {/* Botão Voltar */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push(`/${slug}`)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar para Serviços
                    </button>
                </div>

                {/* Filtros */}
                <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveFilter('active')}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition ${activeFilter === 'active'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Ativos ({activeCount})
                        </button>
                        <button
                            onClick={() => setActiveFilter('cancelled')}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition ${activeFilter === 'cancelled'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Cancelados ({cancelledCount})
                        </button>
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition ${activeFilter === 'all'
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Todos ({bookings.length})
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {error.includes('Telefone do cliente não encontrado') ? 'Nenhum agendamento encontrado' : 'Erro ao carregar agendamentos'}
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    {error.includes('Telefone do cliente não encontrado')
                                        ? 'Você precisa fazer um agendamento primeiro para visualizar seus agendamentos.'
                                        : error
                                    }
                                </div>
                                {error.includes('Telefone do cliente não encontrado') && (
                                    <div className="mt-3">
                                        <Link
                                            href={`/${slug}`}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Fazer Agendamento
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                        <p className="text-green-800 dark:text-green-200">{successMessage}</p>
                    </div>
                )}

                {/* Lista de Agendamentos */}
                {filteredBookings.length === 0 ? (
                    <div className={getCardClasses()}>
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                {activeFilter === 'active' && 'Nenhum agendamento ativo'}
                                {activeFilter === 'cancelled' && 'Nenhum agendamento cancelado'}
                                {activeFilter === 'all' && 'Nenhum agendamento encontrado'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {activeFilter === 'active' && 'Você não possui agendamentos ativos no momento.'}
                                {activeFilter === 'cancelled' && 'Você não possui agendamentos cancelados.'}
                                {activeFilter === 'all' && 'Você ainda não possui agendamentos. Que tal agendar um serviço?'}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push(`/${slug}`)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Agendar Serviço
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className={getCardClasses()}>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {booking.service_name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(booking.booking_date)}
                                                </p>
                                                {booking.whatsapp_reminders && (
                                                    <div className="flex items-center mt-1">
                                                        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs text-green-600 dark:text-green-400">
                                                            Lembretes via WhatsApp ativados
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                            <button
                                                onClick={() => handleCancelBooking(booking)}
                                                disabled={cancellingId === booking.id}
                                                className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {cancellingId === booking.id ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Cancelando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Cancelar
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Confirmação */}
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={closeCancelModal}
                onConfirm={confirmCancelBooking}
                title="Cancelar Agendamento"
                message={`Tem certeza que deseja cancelar o agendamento de "${bookingToCancel?.service_name}"? ${bookingToCancel?.status === 'confirmed' ? 'Este agendamento já estava confirmado.' : ''} Esta ação não pode ser desfeita.`}
                confirmText="Sim, Cancelar"
                cancelText="Não, Manter"
                type="danger"
                loading={cancellingId === bookingToCancel?.id}
            />
        </div>
    )
}
