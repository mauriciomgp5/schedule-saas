import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { Professional, Service } from '@/types'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function ProfessionalsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Professional | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    color: '#0ea5e9',
    is_active: true,
    service_ids: [] as number[],
  })

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => api.getProfessionals(),
  })

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? api.updateProfessional(editing.id, form)
        : api.createProfessional(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
      setIsModalOpen(false)
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProfessional(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['professionals'] }),
  })

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        email: editing.email || '',
        phone: editing.phone || '',
        bio: editing.bio || '',
        color: editing.color || '#0ea5e9',
        is_active: editing.is_active,
        service_ids: editing.services?.map((s) => s.id) || [],
      })
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        bio: '',
        color: '#0ea5e9',
        is_active: true,
        service_ids: [],
      })
    }
  }, [editing, isModalOpen])

  const toggleService = (id: number) => {
    setForm((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(id)
        ? prev.service_ids.filter((s) => s !== id)
        : [...prev.service_ids, id],
    }))
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600 mt-2">Cadastre e vincule serviços aos profissionais</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Profissional
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((pro) => (
            <div key={pro.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: pro.color || '#0ea5e9' }}
                  >
                    {pro.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{pro.name}</h3>
                    {pro.email && <p className="text-sm text-gray-600">{pro.email}</p>}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    pro.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {pro.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {pro.phone && <p className="text-sm text-gray-600 mb-2">{pro.phone}</p>}
              {pro.bio && <p className="text-sm text-gray-700 mb-3">{pro.bio}</p>}

              {pro.services && pro.services.length > 0 && (
                <div className="text-sm text-gray-700 mb-4">
                  <p className="font-medium mb-1">Serviços:</p>
                  <div className="flex flex-wrap gap-2">
                    {pro.services.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs border border-gray-200"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditing(pro)
                    setIsModalOpen(true)
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(pro.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {professionals.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">Nenhum profissional cadastrado.</div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditing(null)
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="opcional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="h-10 w-16 p-1 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio/Observações</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Experiência, especialidades..."
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Serviços atendidos</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {services.map((s: Service) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.service_ids.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                />
                Ativo
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditing(null)
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !form.name}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

