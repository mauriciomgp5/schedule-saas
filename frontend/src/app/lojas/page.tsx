'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"

// Mock data para demonstração - em produção isso viria de uma API
const mockStores = [
    {
        id: 3,
        name: "Spa Relaxamento",
        slug: "spa-relaxamento",
        description: "Spa completo com massagens, tratamentos faciais e corporais",
        address: "Rua da Paz, 789",
        city: "Rio de Janeiro",
        state: "RJ",
        logo: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=100&h=100&fit=crop&crop=face"
    }
]

export default function LojasPage() {
    const [stores, setStores] = useState(mockStores)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Botão de Toggle de Tema */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Sistema de Agendamento</h1>
                        <p className="text-gray-600 dark:text-gray-400">Escolha uma loja para agendar seus serviços</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lojas Disponíveis</h2>
                    <p className="text-gray-600 dark:text-gray-400">Clique em uma loja para ver os serviços disponíveis</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map(store => (
                        <Link
                            key={store.id}
                            href={`/${store.slug}`}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group"
                        >
                            <div className="p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <img
                                        src={store.logo}
                                        alt={store.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                                            {store.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            📍 {store.address}, {store.city} - {store.state}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 mb-4">{store.description}</p>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Clique para ver serviços</span>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Informações adicionais */}
                <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Como Funciona?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Escolha a Loja</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Selecione a loja que oferece os serviços que você precisa</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">2</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Selecione o Serviço</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Veja todos os serviços disponíveis e escolha o que deseja</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">3</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Agende</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Escolha data, horário e confirme seu agendamento</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
