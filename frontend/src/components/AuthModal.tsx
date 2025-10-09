'use client'

import { useState } from 'react'
import { useThemeClasses } from '@/hooks/useThemeClasses'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (customerData: { name: string; phone: string }) => void
    slug: string
}

export function AuthModal({ isOpen, onClose, onSuccess, slug }: AuthModalProps) {
    const { getInputClasses, getLabelClasses, getCardClasses } = useThemeClasses()
    
    const [step, setStep] = useState<'login' | 'register' | 'verify'>('login')
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        smsCode: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [countdown, setCountdown] = useState(0)

    // Função para formatar telefone
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '')
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
        setFormData({ ...formData, phone: formatted })
    }

    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const sendSMS = async () => {
        if (!formData.phone || formData.phone.length < 14) {
            setError('Por favor, digite um telefone válido')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/stores/${slug}/send-sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: formData.phone,
                    name: formData.name
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao enviar SMS')
            }

            setStep('verify')
            startCountdown()
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const verifySMS = async () => {
        if (!formData.smsCode || formData.smsCode.length !== 6) {
            setError('Por favor, digite o código de 6 dígitos')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/stores/${slug}/verify-sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: formData.phone,
                    smsCode: formData.smsCode,
                    name: formData.name
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Código inválido')
            }

            // Salvar dados no localStorage
            localStorage.setItem('customerPhone', formData.phone)
            localStorage.setItem('customerName', formData.name)
            localStorage.setItem('customerAuthenticated', 'true')
            localStorage.setItem('customerSmsCode', formData.smsCode)

            onSuccess({ name: formData.name, phone: formData.phone })
            onClose()
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async () => {
        if (!formData.phone || formData.phone.length < 14) {
            setError('Por favor, digite um telefone válido')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/stores/${slug}/send-sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: formData.phone,
                    isLogin: true
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao enviar SMS')
            }

            setStep('verify')
            startCountdown()
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const resendSMS = async () => {
        if (countdown > 0) return
        await sendSMS()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${getCardClasses()} max-w-md w-full max-h-[90vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {step === 'login' && 'Entrar'}
                        {step === 'register' && 'Criar Conta'}
                        {step === 'verify' && 'Verificar Código'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
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

                {step === 'login' && (
                    <div className="space-y-4">
                        <div>
                            <label className={getLabelClasses()}>Telefone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                className={getInputClasses()}
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={handleLogin}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                            >
                                {loading ? 'Enviando...' : 'Enviar Código'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('register')}
                                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
                            >
                                Criar Conta
                            </button>
                        </div>
                    </div>
                )}

                {step === 'register' && (
                    <div className="space-y-4">
                        <div>
                            <label className={getLabelClasses()}>Nome Completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={getInputClasses()}
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div>
                            <label className={getLabelClasses()}>Telefone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                className={getInputClasses()}
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={sendSMS}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                            >
                                {loading ? 'Enviando...' : 'Enviar Código'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('login')}
                                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
                            >
                                Já tenho conta
                            </button>
                        </div>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Enviamos um código de 6 dígitos para o número<br />
                                <strong>{formData.phone}</strong>
                            </p>
                        </div>

                        <div>
                            <label className={getLabelClasses()}>Código SMS</label>
                            <input
                                type="text"
                                value={formData.smsCode}
                                onChange={(e) => setFormData({ ...formData, smsCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                className={getInputClasses()}
                                placeholder="123456"
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={verifySMS}
                            disabled={loading || formData.smsCode.length !== 6}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                        >
                            {loading ? 'Verificando...' : 'Verificar Código'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={resendSMS}
                                disabled={countdown > 0}
                                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                            >
                                {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
