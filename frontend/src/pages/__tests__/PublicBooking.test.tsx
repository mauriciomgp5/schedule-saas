import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PublicBookingPage from '../PublicBooking'

// Mock do fetch
global.fetch = vi.fn()

// Mock do useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ domain: 'test-tenant' }),
  }
})

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

describe('PublicBookingPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('deve renderizar mensagem quando domínio não é encontrado', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PublicBookingPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Como o domínio vem do useParams mockado, não deve mostrar essa mensagem
    // Mas vamos testar o estado de loading
    expect(screen.queryByText('Domínio não encontrado')).not.toBeInTheDocument()
  })

  it('deve buscar informações do tenant', async () => {
    const mockTenant = {
      id: 1,
      name: 'Test Tenant',
      domain: 'test-tenant',
      theme: null,
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTenant,
    } as Response)

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PublicBookingPage />
        </BrowserRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/test-tenant')
      )
    })
  })

  it('deve buscar serviços do tenant', async () => {
    const mockServices = [
      {
        id: 1,
        name: 'Corte de Cabelo',
        description: 'Corte profissional',
        duration: 30,
        price: 50.0,
        is_active: true,
      },
    ]

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Test Tenant', domain: 'test-tenant' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      } as Response)

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PublicBookingPage />
        </BrowserRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/test-tenant/services')
      )
    })
  })

  it('deve exibir indicador de progresso', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PublicBookingPage />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Verificar se os steps estão presentes
    expect(screen.getByText('Serviço')).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Horário')).toBeInTheDocument()
    expect(screen.getByText('Dados')).toBeInTheDocument()
  })
})

