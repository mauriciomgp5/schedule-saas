'use client'

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoreBySlug, getStoreServices, getStoreCategories, Store, Service, Category } from "@/services/publicStore"
import Link from "next/link"
import { CustomerHeader } from "@/components/CustomerHeader"

export default function CustomerStorePage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const [store, setStore] = useState<Store | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Verificar autenticação
        const customerPhone = localStorage.getItem('customerPhone')
        const customerAuthenticated = localStorage.getItem('customerAuthenticated')

        if (!customerPhone || !customerAuthenticated) {
            router.push(`/${slug}/customer/login`)
            return
        }

        setIsAuthenticated(true)
        loadStoreData()
    }, [slug, router])

    const loadStoreData = async () => {
        try {
            setLoading(true)
            setError('')

            const [storeData, servicesData, categoriesData] = await Promise.all([
                getStoreBySlug(slug),
                getStoreServices(slug),
                getStoreCategories(slug)
            ])

            setStore(storeData)
            setServices(servicesData)
            setCategories(categoriesData)
        } catch (error: any) {
            console.error('Erro ao carregar dados da loja:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredServices = selectedCategory
        ? services.filter(service => service.category_id === selectedCategory)
        : services

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadStoreData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <CustomerHeader slug={slug} storeName={store?.name} />

            <div className="container mx-auto px-4 py-8">
                {/* Header da Página */}
                <div className="mb-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{store?.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {store?.description || 'Escolha um serviço para agendar'}
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === null
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Serviços */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {service.name}
                                        </h3>
                                        {service.category && (
                                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                                                {service.category.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {service.description && (
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                        {service.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(service.price)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDuration(service.duration)}
                                    </div>
                                </div>

                                <Link
                                    href={`/${slug}/customer/agendar/${service.id}`}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Agendar
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredServices.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Nenhum serviço encontrado
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {selectedCategory
                                ? 'Não há serviços nesta categoria no momento.'
                                : 'Não há serviços disponíveis no momento.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}