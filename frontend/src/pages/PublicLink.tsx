import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Copy, Check, ExternalLink } from 'lucide-react'

export default function PublicLinkPage() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const publicUrl = `${window.location.origin}/agendar/${user?.tenant?.domain || 'seu-dominio'}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Link Público de Agendamento</h1>
        <p className="text-gray-600 mt-2">
          Compartilhe este link com seus clientes para que eles possam agendar diretamente
        </p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seu Link de Agendamento
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir
            </a>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Como usar:</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Copie o link acima</li>
            <li>Compartilhe nas redes sociais, WhatsApp ou email</li>
            <li>Seus clientes poderão agendar sem precisar fazer login</li>
            <li>Os agendamentos aparecerão automaticamente no seu painel</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Dica:</h3>
          <p className="text-sm text-yellow-800">
            Você pode personalizar as cores e logo do seu link público na página de{' '}
            <a href="/theme" className="underline font-medium">
              Personalização
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

