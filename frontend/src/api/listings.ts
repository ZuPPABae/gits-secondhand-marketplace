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

