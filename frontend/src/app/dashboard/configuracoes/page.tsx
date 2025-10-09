'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getUser } from "@/services/auth"
import { ThemeToggle } from "@/components/ThemeToggle"

interface TenantSettings {
    id: number
    tenant_id: number
    slot_duration: number
    interval_between_slots: number
    advance_booking_days: number
    min_booking_notice: number
    max_bookings_per_day?: number
    auto_confirm_bookings: boolean
    allow_cancellation: boolean
    cancellation_notice: number
    notify_new_booking: boolean
    notify_cancellation: boolean
    notify_reminder: boolean
    reminder_hours: number
    primary_color: string
    secondary_color: string
    timezone: string
    locale: string
    currency: string
    social_links?: any
    extra_settings?: any
}

export default function ConfiguracoesPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<string>('')

    const [settings, setSettings] = useState<TenantSettings>({
        id: 0,
        tenant_id: 0,
        slot_duration: 30,
        interval_between_slots: 0,
        advance_booking_days: 30,
        min_booking_notice: 60,
        max_bookings_per_day: undefined,
        auto_confirm_bookings: false,
        allow_cancellation: true,
        cancellation_notice: 24,
        notify_new_booking: true,
        notify_cancellation: true,
        notify_reminder: true,
        reminder_hours: 24,
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        timezone: 'America/Sao_Paulo',
        locale: 'pt_BR',
        currency: 'BRL',
        social_links: null,
        extra_settings: null
    })

    useEffect(() => {
        const userData = getUser()
        if (!userData) {
            router.push('/')
            return
        }
        setUser(userData)
        loadSettings()
    }, [router])

    const loadSettings = async () => {
        try {
            // TODO: Implementar API para buscar configurações
            // Por enquanto, usando valores padrão
            setLoading(false)
        } catch (error: any) {
            console.error('Erro ao carregar configurações:', error)
            setError('Erro ao carregar configurações')
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            // TODO: Implementar API para salvar configurações
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simular salvamento
            setSuccess('Configurações salvas com sucesso!')
        } catch (error: any) {
            console.error('Erro ao salvar configurações:', error)
            setError('Erro ao salvar configurações')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Configure seu sistema de agendamento</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Mensagens */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Configurações de Agendamento */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Configurações de Agendamento</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duração Padrão dos Slots (minutos)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={settings.slot_duration}
                                    onChange={(e) => setSettings({ ...settings, slot_duration: parseInt(e.target.value) || 30 })}
                                    className="form-input"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Duração padrão de cada slot de agendamento
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Intervalo Entre Agendamentos (minutos)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.interval_between_slots}
                                    onChange={(e) => setSettings({ ...settings, interval_between_slots: parseInt(e.target.value) || 0 })}
                                    className="form-input"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Tempo de espera entre um agendamento e outro (0 = sem intervalo)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dias de Antecedência para Agendamento
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={settings.advance_booking_days}
                                    onChange={(e) => setSettings({ ...settings, advance_booking_days: parseInt(e.target.value) || 30 })}
                                    className="form-input"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Quantos dias no futuro os clientes podem agendar
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Aviso Mínimo para Agendamento (minutos)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.min_booking_notice}
                                    onChange={(e) => setSettings({ ...settings, min_booking_notice: parseInt(e.target.value) || 60 })}
                                    className="form-input"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Tempo mínimo de antecedência para fazer um agendamento
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Configurações de Confirmação */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Confirmação de Agendamentos</h2>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.auto_confirm_bookings}
                                    onChange={(e) => setSettings({ ...settings, auto_confirm_bookings: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Confirmar agendamentos automaticamente
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.allow_cancellation}
                                    onChange={(e) => setSettings({ ...settings, allow_cancellation: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Permitir cancelamento de agendamentos
                                </label>
                            </div>

                            {settings.allow_cancellation && (
                                <div className="ml-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Aviso Mínimo para Cancelamento (horas)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.cancellation_notice}
                                        onChange={(e) => setSettings({ ...settings, cancellation_notice: parseInt(e.target.value) || 24 })}
                                        className="form-input"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                        >
                            {saving ? 'Salvando...' : 'Salvar Configurações'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
