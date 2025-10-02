// API Request/Response Types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    user_uuid: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'locked' | 'unlocked';
  battery?: number;
  last_activity?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DevicesResponse {
  devices: Device[];
  total?: number;
}

export interface Link {
  id: string;
  device_id: string;
  code: string;
  password: string;
  active_until: string;
  is_active: boolean;
  created_at: string;
  used_at?: string;
  uses_count?: number;
}

export interface LinksResponse {
  links: Link[];
  total?: number;
}

export interface CreateLinkRequest {
  active_until: string; // ISO date string
}

export interface CreateLinkResponse {
  link: Link;
  message?: string;
}

export interface UnlockDeviceRequest {
  password: string;
}

export interface UnlockDeviceResponse {
  success: boolean;
  message: string;
  device?: Device;
}

export interface TestResponse {
  message: string;
  timestamp: string;
  user?: any;
}

// Generic API Response wrapper
export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Error response structure
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}
