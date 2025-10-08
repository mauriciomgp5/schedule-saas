'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getUser } from "@/services/auth"
import { getAvailabilities, createAvailability, updateAvailability, deleteAvailability, Availability } from "@/services/availabilities"

const daysOfWeek = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terca-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sabado' },
  { value: 'sunday', label: 'Domingo' },
]

export default function HorariosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null)
  const [formData, setFormData] = useState<Availability>({
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '18:00',
    type: 'regular',
    is_available: true,
  })

  useEffect(() => {
    const userData = getUser()
    if (!userData) {
      router.push('/')
      return
    }
    setUser(userData)
    loadAvailabilities()
  }, [router])

  const loadAvailabilities = async () => {
    try {
      const data = await getAvailabilities()
      setAvailabilities(data)
    } catch (error) {
      console.error('Erro ao carregar horarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (availability?: Availability) => {
    if (availability) {
      setEditingAvailability(availability)
      setFormData(availability)
    } else {
      setEditingAvailability(null)
      setFormData({
        day_of_week: 'monday',
        start_time: '09:00',
        end_time: '18:00',
        type: 'regular',
        is_available: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAvailability(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAvailability) {
        await updateAvailability(editingAvailability.id!, formData)
      } else {
        await createAvailability(formData)
      }
      handleCloseModal()
      loadAvailabilities()
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar horario')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este horario?')) return

    try {
      await deleteAvailability(id)
      loadAvailabilities()
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir horario')
    }
  }

  const getDayLabel = (day: string) => {
    return daysOfWeek.find(d => d.value === day)?.label || day
  }

  const groupedAvailabilities = availabilities.reduce((acc, avail) => {
    if (!acc[avail.day_of_week]) {
      acc[avail.day_of_week] = []
    }
    acc[avail.day_of_week].push(avail)
    return acc
  }, {} as Record<string, Availability[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Horarios</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure sua disponibilidade</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Horario</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {availabilities.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum horario configurado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Configure seus horarios de atendimento</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Criar Primeiro Horario
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {daysOfWeek.map(day => {
              const dayAvailabilities = groupedAvailabilities[day.value] || []

              return (
                <div key={day.value} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{day.label}</h3>

                  {dayAvailabilities.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sem horarios configurados</p>
                  ) : (
                    <div className="space-y-2">
                      {dayAvailabilities.map(availability => (
                        <div
                          key={availability.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{availability.start_time} - {availability.end_time}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${availability.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {availability.is_available ? 'Disponivel' : 'Indisponivel'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOpenModal(availability)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(availability.id!)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingAvailability ? 'Editar Horario' : 'Novo Horario'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dia da Semana</label>
                <select
                  required
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hora Fim</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Horario disponivel</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  {editingAvailability ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
