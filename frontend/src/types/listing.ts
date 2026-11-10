export interface Category {
  id: number
  name: string
  slug: string
}

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair'
export type ListingStatus = 'available' | 'sold'

export interface ListingUser {
  id: number
  name: string
  location: string
  phone?: string
  whatsapp_url?: string
}

export interface ListingImage {
  id: number
  url: string
  position: number
}

export interface Listing {
  id: number
  title: string
  description: string
  price: number
  condition: ListingCondition
  condition_label: string
  location: string
  status: ListingStatus
  status_label: string
  category: Category
  user: ListingUser
  images: ListingImage[]
  primary_image_url: string | null
  created_at: string
  updated_at: string
}

export interface ListingFilters {
  q?: string
  category?: string
  condition?: string
  status?: string
  sort?: string
  page?: number
  per_page?: number
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface PaginatedListingsResponse {
  data: Listing[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface SingleListingResponse {
  data: Listing
}

export interface CategoriesResponse {
  data: Category[]
}

