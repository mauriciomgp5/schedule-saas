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

    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isLogin) {
                // Login com telefone e senha
                const response = await fetch(`http://localhost:8080/api/public/store/${slug}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: formData.phone.replace(/\D/g, ''),
                        password: formData.password
                    })
                })

                const data = await response.json()

                if (response.ok) {
                    // Salvar dados no localStorage
                    localStorage.setItem('customerName', data.customer.name)
                    localStorage.setItem('customerPhone', data.customer.phone)
                    localStorage.setItem('customerAuthenticated', 'true')

                    onSuccess({
                        name: data.customer.name,
                        phone: data.customer.phone
                    })
                } else {
                    setError(data.message || 'Erro ao fazer login')
                }
            } else {
                // Registro com telefone e senha
                const response = await fetch(`http://localhost:8080/api/public/store/${slug}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        phone: formData.phone.replace(/\D/g, ''),
                        password: formData.password
                    })
                })

                const data = await response.json()

                if (response.ok) {
                    // Salvar dados no localStorage
                    localStorage.setItem('customerName', data.customer.name)
                    localStorage.setItem('customerPhone', data.customer.phone)
                    localStorage.setItem('customerAuthenticated', 'true')

                    onSuccess({
                        name: data.customer.name,
                        phone: data.customer.phone
                    })
                } else {
                    setError(data.message || 'Erro ao criar conta')
                }
            }
        } catch (error) {
            console.error('Erro:', error)
            setError('Erro de conexão. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ name: '', phone: '', password: '' })
        setError('')
    }

    const toggleMode = () => {
        setIsLogin(!isLogin)
        resetForm()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className={`${getCardClasses()} max-w-md w-full`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isLogin ? 'Entrar' : 'Criar Conta'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isLogin ? 'Digite seu telefone e senha' : 'Preencha os dados para criar sua conta'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <div className="flex">
                                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Nome (apenas no registro) */}
                    {!isLogin && (
                        <div>
                            <label className={getLabelClasses()}>Nome Completo</label>
                            <input
                                type="text"
                                required={!isLogin}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={getInputClasses()}
                                placeholder="Seu nome completo"
                            />
                        </div>
                    )}

                    {/* Telefone */}
                    <div>
                        <label className={getLabelClasses()}>Telefone</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className={getInputClasses()}
                            placeholder="(11) 99999-9999"
                            maxLength={15}
                        />
                    </div>

                    {/* Senha */}
                    <div>
                        <label className={getLabelClasses()}>Senha</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={getInputClasses()}
                            placeholder={isLogin ? "Sua senha" : "Crie uma senha (mín. 6 caracteres)"}
                            minLength={6}
                        />
                    </div>

                    {/* Botão Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                    >
                        {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                    </button>
                </form>

                {/* Toggle entre Login/Registro */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                            {isLogin ? 'Criar conta' : 'Fazer login'}
                        </button>
                    </p>
                </div>

                {/* Info adicional */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 <strong>Dica:</strong> Use o mesmo telefone que você usou para criar a conta.
                        A senha é a que você definiu no cadastro.
                    </p>
                </div>
            </div>
        </div>
    )
}