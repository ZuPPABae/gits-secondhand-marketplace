export interface User {
  id: number
  name: string
  email?: string
  phone: string
  location: string
  created_at?: string
}

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone: string
  location: string
}

export interface AuthResponse {
  message: string
  user: User
}

export interface ApiValidationError {
  message: string
  errors?: Record<string, string[]>
}

