import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../Login'
import { useAuthStore } from '@/store/authStore'

// Mock do store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock do useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  const mockLogin = vi.fn()
  const mockRegister = vi.fn()

  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      fetchUser: vi.fn(),
    })
    mockNavigate.mockClear()
    mockLogin.mockClear()
    mockRegister.mockClear()
  })

  it('deve renderizar o formulário de login', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Booking System')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Registrar')).toBeInTheDocument()
  })

  it('deve alternar entre login e registro', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const registerButton = screen.getByText('Registrar')
    fireEvent.click(registerButton)

    expect(screen.getByLabelText(/Nome do Negócio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Domínio/i)).toBeInTheDocument()
  })

  it('deve validar campos obrigatórios no login', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument()
    })
  })

  it('deve chamar login quando formulário é submetido', async () => {
    mockLogin.mockResolvedValue({})

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/Email/i)
    const passwordInput = screen.getByLabelText(/Senha/i)
    const submitButton = screen.getByRole('button', { name: /Entrar/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('deve exibir erro quando login falha', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciais inválidas'))

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/Email/i)
    const passwordInput = screen.getByLabelText(/Senha/i)
    const submitButton = screen.getByRole('button', { name: /Entrar/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Erro ao fazer login/i)).toBeInTheDocument()
    })
  })
})

