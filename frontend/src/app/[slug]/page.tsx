'use client'

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoreBySlug, getStoreServices, Store, Service } from "@/services/publicStore"
import { BookingCalendar } from "@/components/BookingCalendar"
import { CustomerHeader } from "@/components/CustomerHeader"
import { ExpandableText } from "@/components/ExpandableText"
import { useThemeClasses } from "@/hooks/useThemeClasses"
import Link from "next/link"

export default function StorePage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string
    const { getInputClasses, getLabelClasses, getCardClasses, getTextClasses } = useThemeClasses()

    const [store, setStore] = useState<Store | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [showCalendar, setShowCalendar] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [customerData, setCustomerData] = useState<{ name: string, phone: string } | null>(null)

    useEffect(() => {
        loadStoreData()
        checkAuthentication()
    }, [slug])

    const checkAuthentication = () => {
        const customerPhone = localStorage.getItem('customerPhone')
        const customerAuthenticated = localStorage.getItem('customerAuthenticated')
        const customerName = localStorage.getItem('customerName')

        if (customerPhone && customerAuthenticated && customerName) {
            setIsAuthenticated(true)
            setCustomerData({
                name: customerName,
                phone: customerPhone
            })
        } else {
            setIsAuthenticated(false)
            setCustomerData(null)
        }
    }

    const loadStoreData = async () => {
        try {
            setLoading(true)
            setError('')

            const [storeData, servicesData] = await Promise.all([
                getStoreBySlug(slug),
                getStoreServices(slug)
            ])

            setStore(storeData)
            setServices(servicesData)
        } catch (error: any) {
            console.error('Erro ao carregar dados da loja:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleServiceClick = (service: Service) => {
        setSelectedService(service)
        setShowCalendar(true)
    }

    const handleAuthSuccess = (customerData: { name: string; phone: string }) => {
        setIsAuthenticated(true)
        setCustomerData(customerData)
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        )
    }

    if (!store) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header - CustomerHeader se autenticado, senão header simples */}
            {isAuthenticated && customerData ? (
                <CustomerHeader
                    slug={slug}
                    storeName={store?.name || 'Loja'}
                />
            ) : (
                <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {store?.name || 'Loja'}
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Agende seu serviço</p>
                                </div>
                            </div>
                            <Link
                                href="/lojas"
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                ← Voltar às Lojas
                            </Link>
                        </div>
                    </div>
                </header>
            )}

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header da Loja */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {store.name}
                    </h1>
                    {store.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            {store.description}
                        </p>
                    )}
                </div>

                {/* Lista de Serviços */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Nossos Serviços
                    </h2>

                    {services.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                Nenhum serviço disponível no momento
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <div
                                    key={service.id}
                                    className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animation: 'fadeInUp 0.6s ease-out forwards'
                                    }}
                                >
                                    {/* Imagem do Serviço */}
                                    <div className="relative h-48 overflow-hidden">
                                        {service.image ? (
                                            <img
                                                src={service.image}
                                                alt={service.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center"
                                                style={{ backgroundColor: service.color + '20' }}
                                            >
                                                <div
                                                    className="w-20 h-20 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: service.color }}
                                                >
                                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}

                                        {/* Overlay com gradiente */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Badge de Aprovação */}
                                        {service.requires_approval && (
                                            <div className="absolute top-4 right-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 shadow-lg">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Requer Aprovação
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Conteúdo do Card */}
                                    <div className="p-6">
                                        {/* Título */}
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {service.name}
                                        </h3>

                                        {/* Descrição */}
                                        {service.description && (
                                            <ExpandableText
                                                text={service.description}
                                                maxLength={120}
                                                className="mb-4"
                                            />
                                        )}

                                        {/* Informações do Serviço */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium">{formatDuration(service.duration)}</span>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {formatPrice(service.price)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    por sessão
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botão de Agendamento */}
                                        <button
                                            onClick={() => handleServiceClick(service)}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                        >
                                            <span className="flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Agendar Agora
                                            </span>
                                        </button>
                                    </div>

                                    {/* Efeito de brilho no hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Informações Adicionais */}
                {store.settings && (
                    <div className={`${getCardClasses()} p-6`}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Informações da Loja
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Timezone:</span>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {store.settings.timezone || 'UTC'}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Política de Cancelamento:</span>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {store.settings.allow_cancellation ? `Cancelamento até ${store.settings.cancellation_notice}h antes` : 'Cancelamento não permitido'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal do Calendário */}
            {showCalendar && selectedService && (
                <BookingCalendar
                    isOpen={showCalendar}
                    onClose={() => setShowCalendar(false)}
                    service={selectedService}
                    slug={slug}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}
        </div>
    )
}
