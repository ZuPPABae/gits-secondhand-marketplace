import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { getListingsApi } from '../api/listings'
import { getCategoriesApi } from '../api/categories'
import { ListingCard } from '../components/ListingCard'
import { ListingCardSkeleton } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { useDebounce } from '../lib/useDebounce'

const CONDITIONS = [
  { value: '', label: 'Semua Kondisi' },
  { value: 'new', label: 'Baru' },
  { value: 'like_new', label: 'Seperti Baru' },
  { value: 'good', label: 'Bagus / Mulus' },
  { value: 'fair', label: 'Cukup / Wajar' },
]

const SORT_OPTIONS = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
  { value: 'oldest', label: 'Terlama' },
]

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    document.title = 'PasarWarga — Marketplace Barang Bekas Komunitas'
  }, [])

  // Ambil state dari URL query string
  const urlQ = searchParams.get('q') || ''
  const selectedCategory = searchParams.get('category') || ''
  const selectedCondition = searchParams.get('condition') || ''
  const selectedSort = searchParams.get('sort') || 'latest'
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // Local state untuk input search agar responsif saat mengetik
  const [searchInput, setSearchInput] = useState(urlQ)
  const debouncedSearch = useDebounce(searchInput, 400)

  // Sinkronisasi debounced search ke URL query params
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedSearch.trim()) {
          next.set('q', debouncedSearch.trim())
        } else {
          next.delete('q')
        }
        // Reset page ke 1 setiap kali query pencarian berubah
        if (prev.get('q') !== (debouncedSearch.trim() || null)) {
          next.delete('page')
        }
        return next
      },
      { replace: true }
    )
  }, [debouncedSearch, setSearchParams])

  // Sinkronisasi jika URL berubah dari luar (misal tombol back browser)
  useEffect(() => {
    setSearchInput(urlQ)
  }, [urlQ])

  // Fetch daftar kategori (cache Redis di backend)
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesApi,
    staleTime: 1000 * 60 * 10, // 10 menit di client
  })

  // Fetch listings berdasarkan filter saat ini
  const {
    data: listingsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      'listings',
      {
        q: urlQ,
        category: selectedCategory,
        condition: selectedCondition,
        sort: selectedSort,
        page: currentPage,
      },
    ],
    queryFn: () =>
      getListingsApi({
        q: urlQ,
        category: selectedCategory,
        condition: selectedCondition,
        sort: selectedSort,
        page: currentPage,
      }),
  })

  const listings = listingsResponse?.data || []
  const meta = listingsResponse?.meta

  // Helper untuk update parameter URL
  const updateParam = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value && value !== '' && !(key === 'sort' && value === 'latest')) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      next.delete('page') // Reset pagination ke halaman 1
      return next
    })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newPage > 1) {
        next.set('page', newPage.toString())
      } else {
        next.delete('page')
      }
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters = !!(
    urlQ ||
    selectedCategory ||
    selectedCondition ||
    (selectedSort && selectedSort !== 'latest')
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Search Bar & Header Kontrol */}
      <div className="mb-6 space-y-4">
        {/* Search Input Box */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari sepeda, perkakas, elektronik, hobi..."
            aria-label="Cari barang bekas"
            className="w-full h-11 pl-11 pr-10 bg-white text-zinc-900 text-sm sm:text-base rounded-lg border border-zinc-200 hover:border-zinc-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 shadow-xs transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                updateParam('q', null)
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
              title="Hapus pencarian"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Kategori Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => updateParam('category', null)}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              !selectedCategory
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParam('category', isSelected ? null : cat.slug)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Filter Baris Kedua: Kondisi, Pengurutan, dan Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-100">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {/* Filter Kondisi */}
            <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={selectedCondition}
                onChange={(e) => updateParam('condition', e.target.value)}
                aria-label="Filter kondisi barang"
                className="bg-transparent text-zinc-700 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pengurutan (Sort) */}
            <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={selectedSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                aria-label="Urutkan daftar barang"
                className="bg-transparent text-zinc-700 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Reset jika ada filter aktif */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Indikator Status & Total */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1 text-indigo-600">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Memperbarui...</span>
              </span>
            )}
            {meta && !isLoading && (
              <span>
                Total <strong className="text-zinc-900">{meta.total}</strong> barang
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Konten Utama: Loading Skeleton / Error / Empty / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 12 }).map((_, idx) => (
            <ListingCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <div className="border border-red-200 bg-red-50/50 rounded-xl p-8 text-center max-w-md mx-auto my-12">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-900">
            Gagal Memuat Daftar Barang
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 mb-5">
            {error instanceof Error
              ? error.message
              : 'Terjadi gangguan koneksi ke server. Silakan coba kembali.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          title={
            urlQ
              ? `Tidak ditemukan hasil untuk "${urlQ}"`
              : 'Belum ada barang pada kategori ini'
          }
          description="Coba ubah kata kunci pencarian atau sesuaikan filter untuk melihat barang yang tersedia."
          actionLabel={hasActiveFilters ? 'Reset Semua Filter' : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
          className="my-8"
        />
      ) : (
        <>
          {/* Grid Barang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>

          {/* Kontrol Paginasi */}
          {meta && meta.last_page > 1 && (
            <div className="mt-10 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-zinc-500 text-center sm:text-left">
                Menampilkan <strong>{meta.from || 0}</strong> -{' '}
                <strong>{meta.to || 0}</strong> dari{' '}
                <strong>{meta.total}</strong> barang
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Sebelumnya
                </Button>

                {/* Halaman Paginasi */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: meta.last_page }).map((_, i) => {
                    const pageNum = i + 1
                    // Tampilkan maksimal 5 tombol halaman di sekitar halaman aktif
                    if (
                      pageNum === 1 ||
                      pageNum === meta.last_page ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      const isActive = pageNum === currentPage
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    }
                    if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="text-zinc-400 px-1 text-xs">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= meta.last_page}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
