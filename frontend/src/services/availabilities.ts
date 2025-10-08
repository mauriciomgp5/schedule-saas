import { apiRequest } from '@/lib/api'

export interface Availability {
  id?: number
  tenant_id?: number
  service_id?: number | null
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  start_time: string
  end_time: string
  type: 'regular' | 'exception'
  exception_date?: string | null
  is_available?: boolean
  service?: {
    id: number
    name: string
  }
}

export async function getAvailabilities() {
  return await apiRequest('/availabilities', { method: 'GET' })
}

export async function getAvailability(id: number) {
  return await apiRequest(`/availabilities/${id}`, { method: 'GET' })
}

export async function createAvailability(data: Availability) {
  return await apiRequest('/availabilities', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAvailability(id: number, data: Partial<Availability>) {
  return await apiRequest(`/availabilities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteAvailability(id: number) {
  return await apiRequest(`/availabilities/${id}`, { method: 'DELETE' })
}
