import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ImageOff,
  PlusCircle,
  Trash2,
  X,
} from 'lucide-react'
import { getCategoriesApi } from '../api/categories'
import { createListingApi, getListingDetailApi, updateListingApi } from '../api/listings'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from '../features/auth/useAuth'
import { formatRupiah } from '../lib/format'
import { zodResolver } from '../lib/zodResolver'
import type { ListingImage } from '../types/listing'

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const MAX_TOTAL_IMAGES = 5

// ─── Validation Schema ────────────────────────────────────────────────────────

const listingSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul barang wajib diisi.')
    .max(255, 'Judul maksimal 255 karakter.'),
  category_id: z
    .number({ invalid_type_error: 'Kategori barang wajib dipilih.' })
    .int()
    .positive('Kategori barang wajib dipilih.'),
  price: z
    .number({ invalid_type_error: 'Harga wajib diisi.' })
    .int('Harga harus berupa angka bulat Rupiah.')
    .min(0, 'Harga tidak boleh kurang dari Rp 0.'),
  condition: z.enum(['new', 'like_new', 'good', 'fair'], {
    errorMap: () => ({ message: 'Kondisi barang wajib dipilih.' }),
  }),
  description: z.string().min(1, 'Deskripsi barang wajib diisi.'),
  location: z
    .string()
    .min(1, 'Lokasi COD / barang wajib diisi.')
    .max(255, 'Lokasi maksimal 255 karakter.'),
})

type ListingFormValues = z.infer<typeof listingSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONDITION_OPTIONS: { value: ListingFormValues['condition']; label: string }[] = [
  { value: 'new', label: 'Baru' },
  { value: 'like_new', label: 'Seperti Baru' },
  { value: 'good', label: 'Bekas – Baik' },
  { value: 'fair', label: 'Bekas – Cukup' },
]

function formatPriceInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('id-ID').format(Number(digits))
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastState {
  type: 'success' | 'error'
  message: string
}

const Toast: React.FC<{ toast: ToastState; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
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

// ─── New-image preview item ───────────────────────────────────────────────────

interface NewImagePreview {
  id: string
  file: File
  previewUrl: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const ListingForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // ── State ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [newPreviews, setNewPreviews] = useState<NewImagePreview[]>([])
  const [existingImages, setExistingImages] = useState<ListingImage[]>([])
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([])
  const [priceDisplay, setPriceDisplay] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Form setup ─────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
  })

  // Watch selects so they stay in sync with setValue calls (edit mode)
  const watchedCategoryId = useWatch({ control, name: 'category_id' })
  const watchedCondition = useWatch({ control, name: 'condition' })

  // ── Fetch categories ───────────────────────────────────────────────────────
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesApi,
    staleTime: 1000 * 60 * 10,
  })

  // ── Fetch listing for edit ─────────────────────────────────────────────────
  const {
    data: existingListing,
    isLoading: listingLoading,
    isError: listingFetchError,
    error: listingFetchErrorObj,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingDetailApi(id!),
    enabled: isEditMode,
    staleTime: 0,
    retry: 1,
  })

  // Populate form when existing listing is loaded
  useEffect(() => {
    if (!existingListing) return

    reset({
      title: existingListing.title,
      category_id: existingListing.category.id,
      price: existingListing.price,
      condition: existingListing.condition,
      description: existingListing.description,
      location: existingListing.location,
    })
    setPriceDisplay(formatPriceInput(String(existingListing.price)))
    setExistingImages(existingListing.images ?? [])
  }, [existingListing, reset])

  // ── Image helpers ──────────────────────────────────────────────────────────

  const totalImageCount =
    existingImages.filter((img) => !deleteImageIds.includes(img.id)).length +
    newPreviews.length

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setImageError(null)
      const files = Array.from(e.target.files ?? [])
      if (!files.length) return

      const validationErrors: string[] = []
      const valid: File[] = []

      for (const file of files) {
        if (!ACCEPTED_MIME.includes(file.type)) {
          validationErrors.push(`${file.name}: format harus jpg, jpeg, png, atau webp.`)
          continue
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          validationErrors.push(`${file.name}: ukuran maksimal 2 MB.`)
          continue
        }
        valid.push(file)
      }

      const remaining = MAX_TOTAL_IMAGES - totalImageCount
      const toAdd = valid.slice(0, remaining)
      const overflow = valid.length - toAdd.length

      if (overflow > 0) {
        validationErrors.push(`Maks ${MAX_TOTAL_IMAGES} foto. ${overflow} file diabaikan.`)
      }

      if (validationErrors.length) setImageError(validationErrors.join(' '))

      const newItems: NewImagePreview[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      setNewPreviews((prev) => [...prev, ...newItems])

      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [totalImageCount]
  )

  const removeNewPreview = useCallback((previewId: string) => {
    setNewPreviews((prev) => {
      const item = prev.find((p) => p.id === previewId)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((p) => p.id !== previewId)
    })
  }, [])

  const toggleDeleteExisting = useCallback((imgId: number) => {
    setDeleteImageIds((prev) =>
      prev.includes(imgId) ? prev.filter((x) => x !== imgId) : [...prev, imgId]
    )
  }, [])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
  }, []) // intentionally empty: runs on unmount only

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: ListingFormValues) => {
    setGeneralError(null)
    setImageError(null)

    const finalCount =
      existingImages.filter((img) => !deleteImageIds.includes(img.id)).length +
      newPreviews.length

    if (finalCount > MAX_TOTAL_IMAGES) {
      setImageError(`Maksimal ${MAX_TOTAL_IMAGES} foto per listing.`)
      return
    }

    try {
      let result
      if (isEditMode) {
        result = await updateListingApi(id!, {
          title: data.title,
          category_id: data.category_id,
          description: data.description,
          price: data.price,
          condition: data.condition,
          location: data.location,
          images: newPreviews.map((p) => p.file),
          delete_image_ids: deleteImageIds,
        })
      } else {
        result = await createListingApi({
          title: data.title,
          category_id: data.category_id,
          description: data.description,
          price: data.price,
          condition: data.condition,
          location: data.location,
          images: newPreviews.map((p) => p.file),
        })
      }

      await queryClient.invalidateQueries({ queryKey: ['listings'] })
      await queryClient.invalidateQueries({ queryKey: ['listing', String(result.id)] })
      await queryClient.invalidateQueries({ queryKey: ['my-listings'] })

      setToast({
        type: 'success',
        message: isEditMode ? 'Barang berhasil diperbarui!' : 'Barang berhasil dipasang!',
      })

      setTimeout(() => {
        navigate(`/listings/${result.id}`)
      }, 800)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const responseData = err.response?.data as {
          message?: string
          errors?: Record<string, string[]>
        }

        if (status === 422 && responseData?.errors) {
          for (const [field, messages] of Object.entries(responseData.errors)) {
            if (field === 'images' || field === 'images.*') {
              setImageError(messages[0])
            } else {
              setError(field as keyof ListingFormValues, {
                type: 'server',
                message: messages[0],
              })
            }
          }
          setToast({ type: 'error', message: 'Ada kesalahan pada data yang dikirim.' })
        } else if (status === 403) {
          setGeneralError('Kamu tidak memiliki izin untuk melakukan aksi ini.')
          setToast({ type: 'error', message: 'Akses ditolak.' })
        } else {
          setGeneralError(
            responseData?.message || 'Terjadi kesalahan. Coba beberapa saat lagi.'
          )
          setToast({ type: 'error', message: 'Gagal menyimpan barang.' })
        }
      } else {
        setGeneralError('Terjadi kesalahan jaringan. Coba beberapa saat lagi.')
        setToast({ type: 'error', message: 'Kesalahan jaringan.' })
      }
    }
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (isEditMode && listingLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-6 w-36 rounded-md" />
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-5">
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (isEditMode && listingFetchError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Barang Tidak Ditemukan</h2>
        <p className="text-sm text-zinc-500 mt-1.5 mb-6">
          {listingFetchErrorObj instanceof Error
            ? listingFetchErrorObj.message
            : 'Barang yang ingin kamu edit tidak ditemukan atau telah dihapus.'}
        </p>
        <Link
          to="/"
          className="h-10 px-4 inline-flex items-center justify-center text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  // Ownership check: show blocker if logged-in user is not the owner
  const isNotOwner =
    isEditMode && existingListing && user && existingListing.user.id !== user.id

  if (isNotOwner) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-500 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Akses Ditolak</h2>
        <p className="text-sm text-zinc-500 mt-1.5 mb-6">
          Kamu hanya bisa mengedit barang milikmu sendiri.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="h-10 px-4 inline-flex items-center justify-center text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors"
          >
            Beranda
          </Link>
          <Link
            to="/my-listings"
            className="h-10 px-4 inline-flex items-center justify-center text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Barang Saya
          </Link>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const pageTitle = isEditMode ? 'Edit Barang' : 'Pasang Barang'
  const backHref = isEditMode ? `/listings/${id}` : '/'

  return (
    <>
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <div className="mb-5">
          <Link
            to={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>
              {isEditMode ? 'Kembali ke Detail Barang' : 'Kembali ke Beranda'}
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 mb-6">
            {pageTitle}
          </h1>

          {/* General error */}
          {generalError && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span className="leading-snug">{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* ── Judul ── */}
            <Input
              id="title"
              label="Nama Barang"
              placeholder="Contoh: Sepeda gunung Polygon Siskiu"
              required
              error={errors.title?.message}
              {...register('title')}
            />

            {/* ── Kategori ── */}
            <div className="w-full">
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-zinc-900 mb-1.5"
              >
                Kategori <span className="text-red-500 ml-1">*</span>
              </label>
              {categoriesLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : (
                <select
                  id="category_id"
                  value={
                    watchedCategoryId !== undefined && watchedCategoryId !== null
                      ? String(watchedCategoryId)
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value
                    setValue(
                      'category_id',
                      val === '' ? (undefined as unknown as number) : Number(val),
                      { shouldValidate: true }
                    )
                  }}
                  className={`w-full h-10 px-3 py-2 bg-white text-zinc-900 text-sm rounded-lg border transition-colors focus:outline-none ${
                    errors.category_id
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-zinc-300 hover:border-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
                  }`}
                >
                  <option value="">Pilih kategori...</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.category_id && (
                <p className="mt-1 text-xs text-red-600">{errors.category_id.message}</p>
              )}
            </div>

            {/* ── Harga ── */}
            <div className="w-full">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-zinc-900 mb-1.5"
              >
                Harga <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 select-none pointer-events-none">
                  Rp
                </span>
                <input
                  id="price"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={priceDisplay}
                  onChange={(e) => {
                    const formatted = formatPriceInput(e.target.value)
                    setPriceDisplay(formatted)
                    const numeric = Number(formatted.replace(/\D/g, ''))
                    setValue(
                      'price',
                      formatted === '' ? (undefined as unknown as number) : numeric,
                      { shouldValidate: true }
                    )
                  }}
                  className={`w-full h-10 pl-9 pr-3 py-2 bg-white text-zinc-900 text-sm rounded-lg border transition-colors placeholder:text-zinc-400 focus:outline-none ${
                    errors.price
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-zinc-300 hover:border-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
                  }`}
                />
              </div>
              {priceDisplay && !errors.price && (
                <p className="mt-1 text-xs text-zinc-500">
                  {formatRupiah(Number(priceDisplay.replace(/\D/g, '')))}
                </p>
              )}
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* ── Kondisi ── */}
            <div className="w-full">
              <label
                htmlFor="condition"
                className="block text-sm font-medium text-zinc-900 mb-1.5"
              >
                Kondisi <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="condition"
                value={watchedCondition ?? ''}
                onChange={(e) => {
                  const val = e.target.value as ListingFormValues['condition']
                  setValue('condition', val || (undefined as unknown as 'new'), {
                    shouldValidate: true,
                  })
                }}
                className={`w-full h-10 px-3 py-2 bg-white text-zinc-900 text-sm rounded-lg border transition-colors focus:outline-none ${
                  errors.condition
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-zinc-300 hover:border-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
                }`}
              >
                <option value="">Pilih kondisi...</option>
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="mt-1 text-xs text-red-600">{errors.condition.message}</p>
              )}
            </div>

            {/* ── Deskripsi ── */}
            <div className="w-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-900 mb-1.5"
              >
                Deskripsi <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                placeholder="Jelaskan kondisi barang, kelengkapan, alasan jual, dan detail lain yang relevan..."
                className={`w-full px-3 py-2 bg-white text-zinc-900 text-sm rounded-lg border transition-colors placeholder:text-zinc-400 focus:outline-none resize-y min-h-[100px] ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-zinc-300 hover:border-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
                }`}
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* ── Lokasi ── */}
            <Input
              id="location"
              label="Lokasi COD"
              placeholder="Contoh: Kelapa Gading, Jakarta Utara"
              required
              error={errors.location?.message}
              {...register('location')}
            />

            {/* ── Foto ── */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-zinc-900">
                  Foto Barang
                  <span className="ml-1.5 text-xs font-normal text-zinc-500">
                    (maks. 5, JPG/PNG/WebP, 2 MB/file)
                  </span>
                </label>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    totalImageCount >= MAX_TOTAL_IMAGES ? 'text-red-600' : 'text-zinc-500'
                  }`}
                >
                  {totalImageCount}/{MAX_TOTAL_IMAGES}
                </span>
              </div>

              {/* Existing images (edit mode) */}
              {existingImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-zinc-500 mb-2">Foto saat ini:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img) => {
                      const isMarkedDelete = deleteImageIds.includes(img.id)
                      return (
                        <div key={img.id} className="relative flex-shrink-0">
                          <div
                            className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                              isMarkedDelete
                                ? 'border-red-400 opacity-40'
                                : 'border-zinc-200'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt="Foto barang"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleDeleteExisting(img.id)}
                            title={isMarkedDelete ? 'Batalkan hapus' : 'Hapus foto ini'}
                            className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs cursor-pointer transition-colors shadow-sm ${
                              isMarkedDelete
                                ? 'bg-zinc-400 hover:bg-zinc-500'
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                          >
                            {isMarkedDelete ? (
                              <span className="text-[9px] font-bold leading-none">↩</span>
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </button>
                          {isMarkedDelete && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none">
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {deleteImageIds.length > 0 && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {deleteImageIds.length} foto akan dihapus saat menyimpan.
                    </p>
                  )}
                </div>
              )}

              {/* New preview grid */}
              {newPreviews.length > 0 && (
                <div className="mb-3">
                  {isEditMode && existingImages.length > 0 && (
                    <p className="text-xs text-zinc-500 mb-2">Foto baru yang dipilih:</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {newPreviews.map((preview) => (
                      <div key={preview.id} className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg border-2 border-indigo-200 overflow-hidden">
                          <img
                            src={preview.previewUrl}
                            alt="Preview foto baru"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewPreview(preview.id)}
                          title="Hapus foto ini"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-sm transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload area */}
              {totalImageCount < MAX_TOTAL_IMAGES && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="images"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center gap-1.5 w-full rounded-lg border-2 border-dashed border-zinc-300 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors px-4 py-6 cursor-pointer text-center"
                  >
                    <PlusCircle className="w-6 h-6 text-zinc-400" />
                    <span className="text-sm text-zinc-600 font-medium">Tambah foto</span>
                    <span className="text-xs text-zinc-400">Klik untuk memilih file</span>
                  </label>
                </>
              )}

              {/* No images state */}
              {totalImageCount === 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                  <ImageOff className="w-3.5 h-3.5" />
                  <span>Barang tanpa foto akan tampil dengan placeholder.</span>
                </div>
              )}

              {imageError && (
                <p className="mt-2 text-xs text-red-600">{imageError}</p>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(backHref)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isEditMode ? 'Simpan Perubahan' : 'Pasang Barang'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
