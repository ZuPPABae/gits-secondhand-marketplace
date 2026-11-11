import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  ExternalLink,
  ImageOff,
  Package,
  PlusCircle,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'
import {
  deleteListingApi,
  getMyListingsApi,
  updateListingStatusApi,
} from '../api/listings'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'
import { formatRupiah } from '../lib/format'
import type { Listing } from '../types/listing'

// ─── Toast Component ──────────────────────────────────────────────────────────

interface ToastState {
  type: 'success' | 'error'
  message: string
}

const Toast: React.FC<{ toast: ToastState; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-4 z-50 flex items-start gap-3 max-w-sm w-full rounded-xl border shadow-lg px-4 py-3.5 text-sm transition-all ${
        toast.type === 'success'
          ? 'bg-white border-emerald-200 text-emerald-800'
          : 'bg-white border-red-200 text-red-800'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      )}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-zinc-400 hover:text-zinc-600 ml-1 flex-shrink-0 cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const MyListings: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)

  // Set document title
  React.useEffect(() => {
    document.title = 'Listing Saya — PasarWarga'
  }, [])

  // State
  const [toast, setToast] = useState<ToastState | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Listing | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  // Fetch data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-listings', currentPage],
    queryFn: () => getMyListingsApi(currentPage, 12),
  })

  const listings = data?.data ?? []
  const meta = data?.meta

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Aksi: Ubah status (tersedia / terjual)
  const handleToggleStatus = async (item: Listing) => {
    const nextStatus = item.status === 'available' ? 'sold' : 'available'
    const statusLabel = nextStatus === 'sold' ? 'Terjual' : 'Tersedia'

    setStatusUpdatingId(item.id)
    try {
      await updateListingStatusApi(item.id, nextStatus)

      await queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      await queryClient.invalidateQueries({ queryKey: ['listings'] })
      await queryClient.invalidateQueries({
        queryKey: ['listing', String(item.id)],
      })

      setToast({
        type: 'success',
        message: `Status "${item.title}" diubah menjadi ${statusLabel}.`,
      })
    } catch {
      setToast({
        type: 'error',
        message: 'Gagal mengubah status barang. Silakan coba lagi.',
      })
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // Aksi: Hapus listing
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      await deleteListingApi(itemToDelete.id)

      await queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      await queryClient.invalidateQueries({ queryKey: ['listings'] })
      await queryClient.invalidateQueries({
        queryKey: ['listing', String(itemToDelete.id)],
      })

      setToast({
        type: 'success',
        message: `Barang "${itemToDelete.title}" berhasil dihapus.`,
      })
      setItemToDelete(null)
    } catch {
      setToast({
        type: 'error',
        message: 'Gagal menghapus barang. Silakan coba lagi.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {/* Modal Dialog Konfirmasi Hapus */}
      {itemToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-md border border-zinc-200">
            <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3
              id="delete-dialog-title"
              className="text-lg font-bold text-zinc-900 tracking-tight"
            >
              Hapus Listing Barang?
            </h3>

            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              Apakah kamu yakin ingin menghapus barang{' '}
              <strong className="text-zinc-900">"{itemToDelete.title}"</strong>?
              Tindakan ini permanen dan foto barang akan dihapus dari sistem.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                isLoading={isDeleting}
                onClick={handleConfirmDelete}
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-zinc-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Listing Saya
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Kelola barang yang kamu pasang di marketplace komunitas.
            </p>
          </div>

          <Link to="/pasang">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Pasang Barang Baru</span>
            </Button>
          </Link>
        </div>

        {/* State: Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
              >
                <Skeleton className="w-full sm:w-32 h-32 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3 rounded" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-6 w-1/4 rounded" />
                </div>
                <div className="flex sm:flex-col justify-end gap-2 sm:w-36">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* State: Error */}
        {isError && (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              Gagal Memuat Listing
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {error instanceof Error
                ? error.message
                : 'Terjadi kesalahan saat mengambil daftar barang.'}
            </p>
            <div className="mt-5">
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Coba Lagi
              </Button>
            </div>
          </div>
        )}

        {/* State: Kosong */}
        {!isLoading && !isError && listings.length === 0 && (
          <EmptyState
            title="Belum ada barang yang dipasang"
            description="Kamu belum memasang barang apapun untuk dijual di komunitas. Pasang barang pertamamu sekarang!"
            icon={<Package className="w-6 h-6 text-zinc-400" />}
            actionLabel="Pasang Barang"
            onAction={() => navigate('/pasang')}
            className="my-4"
          />
        )}

        {/* State: Daftar Listing */}
        {!isLoading && !isError && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map((item) => {
              const isSold = item.status === 'sold'
              const imageUrl = item.primary_image_url
              const isUpdatingStatus = statusUpdatingId === item.id

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 p-4 sm:p-5 shadow-2xs transition-all flex flex-col sm:flex-row gap-4 sm:items-center"
                >
                  {/* Foto Thumbnail */}
                  <div className="relative w-full sm:w-28 sm:h-28 aspect-4/3 sm:aspect-square rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 bg-zinc-50">
                        <ImageOff className="w-6 h-6 stroke-1 mb-0.5" />
                        <span className="text-[10px]">Tanpa foto</span>
                      </div>
                    )}

                    {/* Status Badge di atas foto (mobile) */}
                    <div className="absolute top-2 left-2 sm:hidden">
                      <Badge variant={isSold ? 'sold' : 'available'} size="sm">
                        {isSold ? 'Terjual' : 'Tersedia'}
                      </Badge>
                    </div>
                  </div>

                  {/* Konten Utama */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Status Badge (desktop) */}
                      <div className="hidden sm:inline-flex">
                        <Badge variant={isSold ? 'sold' : 'available'} size="sm">
                          {isSold ? 'Terjual' : 'Tersedia'}
                        </Badge>
                      </div>

                      {item.category?.name && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                          {item.category.name}
                        </span>
                      )}

                      <span className="text-xs text-zinc-500">
                        Kondisi: <strong>{item.condition_label}</strong>
                      </span>
                    </div>

                    <Link
                      to={`/listings/${item.id}`}
                      className="group inline-flex items-center gap-1.5 text-base font-semibold text-zinc-900 hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
                    </Link>

                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                      <span
                        className={`text-lg font-bold tracking-tight ${
                          isSold ? 'text-zinc-400 line-through' : 'text-indigo-600'
                        }`}
                      >
                        {formatRupiah(item.price)}
                      </span>
                      <span className="text-xs text-zinc-400">
                        • Lokasi: {item.location}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 flex flex-col items-stretch justify-end gap-2 w-full sm:w-36 flex-shrink-0">
                    {/* Ubah Status */}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      isLoading={isUpdatingStatus}
                      onClick={() => handleToggleStatus(item)}
                      title={
                        isSold
                          ? 'Tandai barang kembali tersedia'
                          : 'Tandai barang sudah laku terjual'
                      }
                      className="w-full"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      <span>{isSold ? 'Tandai Tersedia' : 'Tandai Terjual'}</span>
                    </Button>

                    <div className="flex items-center gap-2 w-full">
                      {/* Edit */}
                      <Link
                        to={`/listings/${item.id}/edit`}
                        className="flex-1"
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="w-full"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>
                      </Link>

                      {/* Hapus */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setItemToDelete(item)}
                        title="Hapus listing barang"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 px-2.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Paginasi */}
        {!isLoading && meta && meta.last_page > 1 && (
          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <span className="text-xs text-zinc-500">
              Menampilkan {meta.from ?? 0}–{meta.to ?? 0} dari {meta.total} barang
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-xs font-medium text-zinc-700 px-2">
                Halaman {currentPage} dari {meta.last_page}
              </span>
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
      </div>
    </>
  )
}
