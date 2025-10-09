const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface Store {
    id: number
    name: string
    slug: string
    email: string
    phone?: string
    description?: string
    logo?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
    country: string
    is_active: boolean
    settings?: StoreSettings
}

export interface StoreSettings {
    id: number
    tenant_id: number
    slot_duration: number
    advance_booking_days: number
    min_booking_notice: number
    max_bookings_per_day?: number
    auto_confirm_bookings: boolean
    allow_cancellation: boolean
    cancellation_notice: number
    notify_new_booking: boolean
    notify_cancellation: boolean
    notify_reminder: boolean
    reminder_hours: number
    primary_color: string
    secondary_color: string
    timezone: string
    locale: string
    currency: string
    social_links?: any
    extra_settings?: any
}

export interface Service {
    id: number
    tenant_id: number
    category_id?: number
    name: string
    description?: string
    price: number
    duration: number
    color: string
    is_active: boolean
    requires_approval: boolean
    max_bookings_per_slot: number
    buffer_time: number
    category?: Category
}

export interface Category {
    id: number
    tenant_id: number
    name: string
    description?: string
    color?: string
    is_active: boolean
}

export interface Availability {
    id: number
    tenant_id: number
    service_id?: number
    day_of_week: string
    start_time: string
    end_time: string
    type: string
    exception_date?: string
    is_available: boolean
    service?: Service
}

export interface TimeSlot {
    start_time: string
    end_time: string
    date: string
    available: boolean
}

export interface BookingRequest {
    service_id: number
    booking_date: string
    customer_name: string
    customer_email: string
    customer_phone: string
    customer_notes?: string
}

export interface Booking {
    id: number
    service_name: string
    booking_date: string
    customer_name: string
    status: string
}

// Buscar loja pelo slug
export const getStoreBySlug = async (slug: string): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${slug}`)

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Loja não encontrada')
        }
        throw new Error('Erro ao buscar loja')
    }

    return response.json()
}

// Buscar serviços da loja
export const getStoreServices = async (slug: string): Promise<Service[]> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${slug}/services`)

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Loja não encontrada')
        }
        throw new Error('Erro ao buscar serviços')
    }

    return response.json()
}

// Buscar categorias da loja
export const getStoreCategories = async (slug: string): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${slug}/categories`)

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Loja não encontrada')
        }
        throw new Error('Erro ao buscar categorias')
    }

    return response.json()
}

// Buscar disponibilidade da loja
export const getStoreAvailability = async (slug: string): Promise<Availability[]> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${slug}/availability`)

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Loja não encontrada')
        }
        throw new Error('Erro ao buscar disponibilidade')
    }

    return response.json()
}

// Buscar horários disponíveis para um serviço
export const getAvailableSlots = async (slug: string, serviceId: number, date: string): Promise<{ service: Service, date: string, slots: TimeSlot[] }> => {
    const params = new URLSearchParams({
        service_id: serviceId.toString(),
        date: date
    })

    const response = await fetch(`${API_BASE_URL}/public/store/${slug}/slots?${params}`)

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Serviço ou loja não encontrados')
        }
        throw new Error('Erro ao buscar horários disponíveis')
    }

    return response.json()
}

// Criar agendamento
export const createBooking = async (slug: string, bookingData: BookingRequest): Promise<{ message: string, booking: Booking }> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${slug}/booking`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar agendamento')
    }

    return response.json()
}
