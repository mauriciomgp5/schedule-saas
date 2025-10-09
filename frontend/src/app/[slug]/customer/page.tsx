'use client'

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoreBySlug, getStoreServices, getStoreCategories, Store, Service, Category } from "@/services/publicStore"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function CustomerStorePage() {
    const params = useParams()
    const slug = params.slug as string

    const [store, setStore] = useState<Store | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

    useEffect(() => {
        loadStoreData()
    }, [slug])

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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Tentar Novamente
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
            {/* Botão de Toggle de Tema */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Header da Loja */}
            <header className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-4">
                        {store.logo && (
                            <img
                                src={store.logo}
                                alt={store.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
                            {store.description && (
                                <p className="text-gray-600 dark:text-gray-200 mt-1">{store.description}</p>
                            )}
                            {store.address && (
                                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                                    📍 {store.address}
                                    {store.city && `, ${store.city}`}
                                    {store.state && ` - ${store.state}`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros de Categoria */}
                {categories.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Categorias</h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-full transition ${selectedCategory === null
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Todas
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-full transition ${selectedCategory === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lista de Serviços */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nossos Serviços</h2>

                    {filteredServices.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum serviço encontrado</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {selectedCategory
                                    ? 'Não há serviços nesta categoria no momento.'
                                    : 'Esta loja ainda não possui serviços cadastrados.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map(service => (
                                <div key={service.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                    <div
                                        className="h-2 w-full"
                                        style={{ backgroundColor: service.color }}
                                    ></div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{service.name}</h3>
                                                {service.category && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{service.category.name}</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(service.price)}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{formatDuration(service.duration)}</div>
                                            </div>
                                        </div>

                                        {service.description && (
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{service.description}</p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                {service.requires_approval && (
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Requer aprovação
                                                    </span>
                                                )}
                                                {service.max_bookings_per_slot > 1 && (
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        Até {service.max_bookings_per_slot} pessoas
                                                    </span>
                                                )}
                                            </div>

                                            <Link
                                                href={`/${slug}/customer/agendar/${service.id}`}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                                            >
                                                Agendar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
