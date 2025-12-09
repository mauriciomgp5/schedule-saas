import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  Booking,
  Service,
  Customer,
  Theme,
  User,
  Professional,
} from '@/types';

// URL da API - sempre usa caminho relativo que será proxyado pelo Vite
// O proxy do Vite redireciona /api para o backend (http://backend:8000)
// No navegador, não podemos acessar 'backend:8000' diretamente, então usamos /api
const API_URL = '/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor para adicionar token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para tratar erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: {
    tenant_name: string;
    tenant_domain: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    timezone?: string;
  }): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    localStorage.removeItem('auth_token');
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  // Bookings
  async getBookings(params?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    customer_id?: number;
  }): Promise<{ data: Booking[] }> {
    const response = await this.client.get<{ data: Booking[] }>('/bookings', { params });
    return response.data;
  }

  async getBooking(id: number): Promise<Booking> {
    const response = await this.client.get<Booking>(`/bookings/${id}`);
    return response.data;
  }

  async createBooking(data: {
    customer_id: number;
    service_id: number;
    professional_id?: number;
    user_id?: number;
    start_time: string;
    notes?: string;
  }): Promise<Booking> {
    const response = await this.client.post<Booking>('/bookings', data);
    return response.data;
  }

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
    const response = await this.client.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  }

  async deleteBooking(id: number): Promise<void> {
    await this.client.delete(`/bookings/${id}`);
  }

  async getCalendarEvents(start: string, end: string): Promise<Booking[]> {
    const response = await this.client.get<Booking[]>('/bookings/calendar/events', {
      params: { start, end },
    });
    return response.data;
  }

  // Services
  async getServices(params?: { is_active?: boolean; category?: string }): Promise<Service[]> {
    const response = await this.client.get<Service[]>('/services', { params });
    return response.data;
  }

  async getService(id: number): Promise<Service> {
    const response = await this.client.get<Service>(`/services/${id}`);
    return response.data;
  }

  async createService(data: Partial<Service>): Promise<Service> {
    const response = await this.client.post<Service>('/services', data);
    return response.data;
  }

  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    const response = await this.client.put<Service>(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: number): Promise<void> {
    await this.client.delete(`/services/${id}`);
  }

  // Professionals
  async getProfessionals(): Promise<Professional[]> {
    const response = await this.client.get<Professional[]>('/professionals');
    return response.data;
  }

  async createProfessional(data: Partial<Professional> & { service_ids?: number[] }): Promise<Professional> {
    const response = await this.client.post<Professional>('/professionals', data);
    return response.data;
  }

  async updateProfessional(
    id: number,
    data: Partial<Professional> & { service_ids?: number[] }
  ): Promise<Professional> {
    const response = await this.client.put<Professional>(`/professionals/${id}`, data);
    return response.data;
  }

  async deleteProfessional(id: number): Promise<void> {
    await this.client.delete(`/professionals/${id}`);
  }

  // Customers
  async getCustomers(params?: { search?: string }): Promise<{ data: Customer[] }> {
    const response = await this.client.get<{ data: Customer[] }>('/customers', { params });
    return response.data;
  }

  async getCustomer(id: number): Promise<Customer> {
    const response = await this.client.get<Customer>(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const response = await this.client.post<Customer>('/customers', data);
    return response.data;
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    const response = await this.client.put<Customer>(`/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.client.delete(`/customers/${id}`);
  }

  // Calendar
  async getCalendarAvailability(date: string, service_id: number, duration?: number): Promise<{
    date: string;
    available_slots: Array<{ start: string; end: string }>;
  }> {
    const response = await this.client.get('/calendar/availability', {
      params: { date, service_id, duration },
    });
    return response.data;
  }

  // Theme
  async getTheme(): Promise<Theme> {
    const response = await this.client.get<Theme>('/theme');
    return response.data;
  }

  async updateTheme(data: Partial<Theme>): Promise<Theme> {
    const response = await this.client.put<Theme>('/theme', data);
    return response.data;
  }

  async uploadLogo(file: File): Promise<{ logo: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await this.client.post<{ logo: string }>('/theme/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadFavicon(file: File): Promise<{ favicon: string }> {
    const formData = new FormData();
    formData.append('favicon', file);
    const response = await this.client.post<{ favicon: string }>('/theme/favicon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const api = new ApiService();

