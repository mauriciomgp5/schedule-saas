import { apiRequest } from '@/lib/api'

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  store_name: string
  store_slug: string
  description?: string
  address?: string
  city?: string
  state?: string
}

export interface LoginData {
  email: string
  password: string
}

export async function register(data: RegisterData) {
  const response = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  
  if (response.token) {
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }
  
  return response
}

export async function login(data: LoginData) {
  const response = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  
  if (response.token) {
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }
  
  return response
}

export async function logout() {
  try {
    await apiRequest('/logout', { method: 'POST' })
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export function getUser() {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export function isAuthenticated() {
  return !!localStorage.getItem('token')
}
