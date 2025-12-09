export interface User {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  is_active: boolean;
  tenant?: Tenant;
}

export interface Tenant {
  id: number;
  name: string;
  domain: string;
  email: string;
  phone?: string;
  address?: string;
  timezone: string;
  locale: string;
  is_active: boolean;
  subscription_status: string;
  trial_ends_at?: string;
  theme?: Theme;
}

export interface Booking {
  id: number;
  tenant_id: number;
  customer_id: number;
  service_id: number;
  professional_id?: number;
  user_id?: number;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  price: number;
  customer?: Customer;
  service?: Service;
  user?: User;
  professional?: Professional;
}

export interface Service {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  is_active: boolean;
  color?: string;
  professionals?: Professional[];
}

export interface Professional {
  id: number;
  tenant_id: number;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  color?: string;
  is_active: boolean;
  services?: Service[];
}

export interface Customer {
  id: number;
  tenant_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  birth_date?: string;
  bookings?: Booking[];
}

export interface Theme {
  id: number;
  tenant_id: number;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  logo?: string;
  favicon?: string;
  custom_css?: string;
}

export interface Subscription {
  id: number;
  tenant_id: number;
  plan: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'expired';
  starts_at: string;
  ends_at?: string;
  canceled_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  tenant?: Tenant;
}

