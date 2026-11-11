import { api } from './axios'
import type {
  Listing,
  ListingFilters,
  PaginatedListingsResponse,
  SingleListingResponse,
} from '../types/listing'

export async function getListingsApi(
  filters: ListingFilters = {}
): Promise<PaginatedListingsResponse> {
  const params: Record<string, string | number> = {}

  if (filters.q?.trim()) {
    params.q = filters.q.trim()
  }
  if (filters.category?.trim()) {
    params.category = filters.category.trim()
  }
  if (filters.condition?.trim()) {
    params.condition = filters.condition.trim()
  }
  if (filters.status?.trim()) {
    params.status = filters.status.trim()
  }
  if (filters.sort?.trim()) {
    params.sort = filters.sort.trim()
  }
  if (filters.page && filters.page > 1) {
    params.page = filters.page
  }
  if (filters.per_page) {
    params.per_page = filters.per_page
  }

  const response = await api.get<PaginatedListingsResponse>('/api/v1/listings', {
    params,
  })
  return response.data
}

export async function getListingDetailApi(id: number | string): Promise<Listing> {
  const response = await api.get<SingleListingResponse>(`/api/v1/listings/${id}`)
  return response.data.data
}

export interface CreateListingPayload {
  title: string
  category_id: number
  description: string
  price: number
  condition: string
  location: string
  images?: File[]
}

export interface UpdateListingPayload {
  title?: string
  category_id?: number
  description?: string
  price?: number
  condition?: string
  location?: string
  images?: File[]
  delete_image_ids?: number[]
}

export interface ListingMutationResponse {
  message: string
  data: Listing
}

export async function createListingApi(payload: CreateListingPayload): Promise<Listing> {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('category_id', String(payload.category_id))
  formData.append('description', payload.description)
  formData.append('price', String(payload.price))
  formData.append('condition', payload.condition)
  formData.append('location', payload.location)
  if (payload.images) {
    payload.images.forEach((file) => {
      formData.append('images[]', file)
    })
  }
  const response = await api.post<ListingMutationResponse>('/api/v1/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}

export async function updateListingApi(
  id: number | string,
  payload: UpdateListingPayload
): Promise<Listing> {
  const formData = new FormData()
  // Laravel does not accept files via PUT/PATCH; use POST + _method=PATCH
  formData.append('_method', 'PATCH')
  if (payload.title !== undefined) formData.append('title', payload.title)
  if (payload.category_id !== undefined)
    formData.append('category_id', String(payload.category_id))
  if (payload.description !== undefined) formData.append('description', payload.description)
  if (payload.price !== undefined) formData.append('price', String(payload.price))
  if (payload.condition !== undefined) formData.append('condition', payload.condition)
  if (payload.location !== undefined) formData.append('location', payload.location)
  if (payload.images) {
    payload.images.forEach((file) => {
      formData.append('images[]', file)
    })
  }
  if (payload.delete_image_ids) {
    payload.delete_image_ids.forEach((imgId) => {
      formData.append('delete_image_ids[]', String(imgId))
    })
  }
  const response = await api.post<ListingMutationResponse>(
    `/api/v1/listings/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data.data
}

export async function getMyListingsApi(
  page: number = 1,
  per_page: number = 12
): Promise<PaginatedListingsResponse> {
  const response = await api.get<PaginatedListingsResponse>('/api/v1/me/listings', {
    params: { page, per_page },
  })
  return response.data
}

export async function updateListingStatusApi(
  id: number | string,
  status: 'available' | 'sold'
): Promise<Listing> {
  const response = await api.patch<ListingMutationResponse>(
    `/api/v1/listings/${id}/status`,
    { status }
  )
  return response.data.data
}

export async function deleteListingApi(
  id: number | string
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/api/v1/listings/${id}`)
  return response.data
}


