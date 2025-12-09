import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../common/Layout'
import { useAuthStore } from '@/store/authStore'

// Mock do store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock do useThemeStore
vi.mock('@/store/themeStore', () => ({
  useThemeStore: vi.fn(() => ({
    fetchTheme: vi.fn(),
  })),
}))

describe('Layout', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    tenant: {
      id: 1,
      name: 'Test Tenant',
      domain: 'test',
    },
  }

  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      token: 'test-token',
      login: vi.fn(),
      register: vi.fn(),
      fetchUser: vi.fn(),
    })
  })

  it('deve renderizar o header com o nome do sistema', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    )

    expect(screen.getByText('Booking System')).toBeInTheDocument()
  })

  it('deve renderizar o nome do tenant quando disponível', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    )

    expect(screen.getByText('Test Tenant')).toBeInTheDocument()
  })

  it('deve renderizar os links de navegação', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Calendário')).toBeInTheDocument()
    expect(screen.getByText('Agendamentos')).toBeInTheDocument()
    expect(screen.getByText('Serviços')).toBeInTheDocument()
    expect(screen.getByText('Clientes')).toBeInTheDocument()
    expect(screen.getByText('Link Público')).toBeInTheDocument()
    expect(screen.getByText('Tema')).toBeInTheDocument()
  })

  it('deve renderizar informações do usuário', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    )

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('deve renderizar botão de logout', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    )

    expect(screen.getByText('Sair')).toBeInTheDocument()
  })
})

