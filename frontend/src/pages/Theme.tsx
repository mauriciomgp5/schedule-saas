import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useThemeStore } from '@/store/themeStore'
import { api } from '@/services/api'
import { Upload } from 'lucide-react'

export default function ThemePage() {
  const [colors, setColors] = useState({
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    background_color: '',
    text_color: '',
  })
  const queryClient = useQueryClient()
  const { theme, updateTheme } = useThemeStore()

  useQuery({
    queryKey: ['theme'],
    queryFn: () => api.getTheme(),
    onSuccess: (data) => {
      setColors({
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        accent_color: data.accent_color,
        background_color: data.background_color,
        text_color: data.text_color,
      })
    },
  })

  const mutation = useMutation({
    mutationFn: (data: Partial<typeof colors>) => updateTheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme'] })
    },
  })

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    mutation.mutate(colors)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await api.uploadLogo(file)
        queryClient.invalidateQueries({ queryKey: ['theme'] })
      } catch (error) {
        console.error('Erro ao fazer upload do logo:', error)
      }
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await api.uploadFavicon(file)
        queryClient.invalidateQueries({ queryKey: ['theme'] })
      } catch (error) {
        console.error('Erro ao fazer upload do favicon:', error)
      }
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Personalização de Tema</h1>
        <p className="text-gray-600 mt-2">Personalize as cores e identidade visual</p>
      </div>

      <div className="space-y-6">
        {/* Cores */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Primária
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.primary_color}
                  onChange={(e) => handleColorChange('primary_color', e.target.value)}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primary_color}
                  onChange={(e) => handleColorChange('primary_color', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Secundária
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.secondary_color}
                  onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.secondary_color}
                  onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="#8b5cf6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Destaque
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.accent_color}
                  onChange={(e) => handleColorChange('accent_color', e.target.value)}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.accent_color}
                  onChange={(e) => handleColorChange('accent_color', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="#10b981"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Fundo
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.background_color}
                  onChange={(e) => handleColorChange('background_color', e.target.value)}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.background_color}
                  onChange={(e) => handleColorChange('background_color', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor do Texto
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.text_color}
                  onChange={(e) => handleColorChange('text_color', e.target.value)}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.text_color}
                  onChange={(e) => handleColorChange('text_color', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="#1f2937"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar Cores'}
          </button>
        </div>

        {/* Logo e Favicon */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Identidade Visual</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Fazer upload do logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {theme?.logo && (
                <img
                  src={theme.logo}
                  alt="Logo"
                  className="mt-2 h-16 object-contain"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Fazer upload do favicon</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
              </label>
              {theme?.favicon && (
                <img
                  src={theme.favicon}
                  alt="Favicon"
                  className="mt-2 h-8 w-8 object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

