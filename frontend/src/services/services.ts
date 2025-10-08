import { apiRequest } from '@/lib/api'

export interface Service {
  id?: number
  tenant_id?: number
  category_id?: number | null
  name: string
  description?: string
  price: number
  duration: number
  color?: string
  is_active?: boolean
  requires_approval?: boolean
  max_bookings_per_slot?: number
  buffer_time?: number
  category?: {
    id: number
    name: string
    color: string
  }
}

export async function getServices() {
  return await apiRequest('/services', { method: 'GET' })
}

export async function getService(id: number) {
  return await apiRequest(`/services/${id}`, { method: 'GET' })
}

export async function createService(data: Service) {
  return await apiRequest('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateService(id: number, data: Partial<Service>) {
  return await apiRequest(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteService(id: number) {
  return await apiRequest(`/services/${id}`, { method: 'DELETE' })
}
