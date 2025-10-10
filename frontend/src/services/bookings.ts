import { apiRequest } from '@/lib/api'

export interface Customer {
  id: number
  name: string
  phone: string
  email?: string
}

export interface Service {
  id: number
  name: string
  price: number
  duration: number
  color?: string
}

export interface Booking {
  id: number
  tenant_id: number
  service_id: number
  customer_id?: number
  booking_number: string
  booking_date: string
  duration: number
  price: number | string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  customer_notes?: string
  internal_notes?: string
  cancellation_reason?: string
  cancelled_at?: string
  cancelled_by?: number
  created_at?: string
  updated_at?: string
  service?: Service
  customer?: Customer
}

export interface BookingFilters {
  status?: string
  date_from?: string
  date_to?: string
  service_id?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface BookingStats {
  today: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  month_total: number
  month_revenue: number
}

export async function getBookings(filters?: BookingFilters) {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      // Não enviar valores vazios, undefined ou null
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
  }

  const url = `/bookings${params.toString() ? `?${params.toString()}` : ''}`
  return await apiRequest(url, { method: 'GET' })
}

export async function getBooking(id: number) {
  return await apiRequest(`/bookings/${id}`, { method: 'GET' })
}

export async function updateBooking(id: number, data: Partial<Booking>) {
  return await apiRequest(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function cancelBooking(id: number, reason: string) {
  return await apiRequest(`/bookings/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ cancellation_reason: reason }),
  })
}

export async function completeBooking(id: number) {
  return await apiRequest(`/bookings/${id}/complete`, {
    method: 'POST',
  })
}

export async function confirmBooking(id: number) {
  return await apiRequest(`/bookings/${id}/confirm`, {
    method: 'POST',
  })
}

export async function getBookingStats(): Promise<BookingStats> {
  return await apiRequest('/bookings/stats', { method: 'GET' })
}
