import { api } from './axios'
import type { PaginatedListingsResponse } from '../types/listing'

export interface PublicUser {
  id: number
  name: string
  location: string
  created_at?: string
}

export interface UserProfileResponse {
  user: PublicUser
  listings: PaginatedListingsResponse
}

export async function getUserProfileApi(
  id: number | string,
  page: number = 1
): Promise<UserProfileResponse> {
  const response = await api.get<UserProfileResponse>(`/api/v1/users/${id}`, {
    params: { page },
  })
  return response.data
}
