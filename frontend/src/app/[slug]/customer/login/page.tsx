'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

interface LoginPageProps {
    params: Promise<{
        slug: string
    }>
}

export default function LoginPage({ params }: LoginPageProps) {
    const { slug } = use(params)
    const [phone, setPhone] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isFirstTime, setIsFirstTime] = useState(false)
    const router = useRouter()

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
        setPhone(formatted)

        // Verificar se é primeira vez baseado no telefone
        if (formatted.length >= 14) {
            // Simular verificação se já existe cliente com este telefone
            // Por enquanto, vamos assumir que é primeira vez se não tem dados salvos
            const savedName = localStorage.getItem('customerName')
            const savedPhone = localStorage.getItem('customerPhone')

            if (!savedName || savedPhone !== formatted) {
                setIsFirstTime(true)
            } else {
                setIsFirstTime(false)
            }
        }
    }

    useEffect(() => {
        // Verificar se já tem dados salvos
        const savedPhone = localStorage.getItem('customerPhone')
        const savedName = localStorage.getItem('customerName')
        const firstTime = localStorage.getItem('customerFirstTime')

        if (savedPhone && savedName && firstTime === 'false') {
            // Cliente já cadastrado, redirecionar direto
            router.push(`/${slug}/customer`)
        }
    }, [slug, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!phone || phone.length < 14) {
            setError('Por favor, digite um telefone válido')
            return
        }

        if (isFirstTime && (!name || name.trim().length < 2)) {
            setError('Por favor, digite seu nome completo')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Salvar dados no localStorage
            localStorage.setItem('customerPhone', phone)
            localStorage.setItem('customerAuthenticated', 'true')

            if (isFirstTime) {
                localStorage.setItem('customerName', name.trim())
                localStorage.setItem('customerFirstTime', 'false')
            }

            // Redirecionar para a página principal
            router.push(`/${slug}/customer`)
        } catch (error: any) {
            setError('Erro ao fazer login. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isFirstTime ? 'Cadastro do Cliente' : 'Acesso do Cliente'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {isFirstTime
                            ? 'Preencha seus dados para criar sua conta'
                            : 'Digite seu telefone para acessar seus agendamentos'
                        }
                    </p>
                </div>

                {/* Theme Toggle */}
                <div className="flex justify-end">
                    <ThemeToggle />
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-transparent dark:border-gray-600">
                        <div className="space-y-6">
                            {isFirstTime && (
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nome Completo
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required={isFirstTime}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Telefone
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Entrando...
                                    </>
                                ) : (
                                    isFirstTime ? 'Criar Conta' : 'Entrar'
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isFirstTime
                            ? 'Seus dados serão salvos para futuros agendamentos.'
                            : 'Primeira vez? Seus dados serão criados automaticamente no primeiro agendamento.'
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}
