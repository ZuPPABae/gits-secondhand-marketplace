import { api } from './axios'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth'

export async function getCsrfCookie(): Promise<void> {
  await api.get('/sanctum/csrf-cookie')
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  await getCsrfCookie()
  const res = await api.post<AuthResponse>('/api/v1/auth/login', payload)
  return res.data
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  await getCsrfCookie()
  const res = await api.post<AuthResponse>('/api/v1/auth/register', payload)
  return res.data
}

export async function logoutApi(): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/api/v1/auth/logout')
  return res.data
}

export async function getMeApi(): Promise<{ user: User }> {
  const res = await api.get<{ user: User }>('/api/v1/me')
  return res.data
}

