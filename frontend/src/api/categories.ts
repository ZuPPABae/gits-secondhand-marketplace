import { api } from './axios'
import type { CategoriesResponse, Category } from '../types/listing'

export async function getCategoriesApi(): Promise<Category[]> {
  const response = await api.get<CategoriesResponse>('/api/v1/categories')
  return response.data.data
}

