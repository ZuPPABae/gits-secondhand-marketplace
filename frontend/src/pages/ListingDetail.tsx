import React, { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ImageOff,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Tag,
  User as UserIcon,
} from 'lucide-react'
import { getListingDetailApi } from '../api/listings'
import { formatRupiah, formatDate, formatRelativeTime } from '../lib/format'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'

export const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const {
    data: listing,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingDetailApi(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 menit di client
  })

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <Skeleton className="h-6 w-36 mb-6 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-16 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-40 w-full rounded-2xl mt-6" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">
          Barang Tidak Ditemukan
        </h2>
        <p className="text-sm text-zinc-500 mt-1.5 mb-6">
          {error instanceof Error
            ? error.message
            : 'Barang yang Anda cari mungkin sudah dihapus atau tidak tersedia lagi.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="h-10 px-4 inline-flex items-center justify-center text-sm font-medium rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors"
          >
            Kembali ke Beranda
          </Link>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  const isSold = listing.status === 'sold'
  const images = listing.images && listing.images.length > 0 ? listing.images : []
  const currentImage = images[activeImageIndex] || (listing.primary_image_url ? { url: listing.primary_image_url } : null)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Back Button Link */}
      <div className="mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Daftar Barang</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Galeri Foto & Deskripsi */}
        <div className="lg:col-span-7 space-y-6">
          {/* Foto Utama */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            <div className="relative aspect-[4/3] w-full bg-zinc-100 flex items-center justify-center">
              {currentImage?.url ? (
                <img
                  src={currentImage.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400">
                  <ImageOff className="w-12 h-12 stroke-1 mb-2 text-zinc-300" />
                  <span className="text-sm">Foto tidak tersedia</span>
                </div>
              )}

              {/* Status Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                {isSold ? (
                  <Badge variant="sold" size="md">
                    Terjual
                  </Badge>
                ) : (
                  <Badge variant="available" size="md">
                    Tersedia
                  </Badge>
                )}
                <Badge variant="neutral" size="md">
                  {listing.condition_label}
                </Badge>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-3 bg-zinc-50/80 border-t border-zinc-100 flex items-center gap-2 overflow-x-auto">
                {images.map((img, idx) => {
                  const isActive = idx === activeImageIndex
                  return (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                          : 'border-transparent hover:border-zinc-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${listing.title} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Deskripsi Barang */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-2xs">
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight mb-4">
              Deskripsi Barang
            </h2>
            <div className="text-sm sm:text-base text-zinc-700 whitespace-pre-line leading-relaxed">
              {listing.description || 'Tidak ada deskripsi detail untuk barang ini.'}
            </div>

            <div className="mt-8 pt-5 border-t border-zinc-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-zinc-500">
              <div>
                <span className="block text-zinc-400 mb-0.5">Kategori</span>
                <span className="font-medium text-zinc-800">
                  {listing.category?.name}
                </span>
              </div>
              <div>
                <span className="block text-zinc-400 mb-0.5">Kondisi</span>
                <span className="font-medium text-zinc-800">
                  {listing.condition_label}
                </span>
              </div>
              <div>
                <span className="block text-zinc-400 mb-0.5">Dipasang Pada</span>
                <span className="font-medium text-zinc-800">
                  {formatDate(listing.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Harga, Penjual & Tombol WhatsApp */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          {/* Kartu Harga & Judul */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-2xs">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                <Tag className="w-3 h-3" />
                <span>{listing.category?.name}</span>
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatRelativeTime(listing.created_at)}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
              {listing.title}
            </h1>

            <div className="mt-4 pb-4 border-b border-zinc-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-500 block mb-0.5">Harga</span>
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isSold ? 'text-zinc-400 line-through' : 'text-indigo-600'
                  }`}
                >
                  {formatRupiah(listing.price)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-zinc-500 block mb-1">Status</span>
                {isSold ? (
                  <Badge variant="sold" size="md">
                    Terjual
                  </Badge>
                ) : (
                  <Badge variant="available" size="md">
                    Tersedia
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600">
              <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span>Lokasi COD: <strong>{listing.location}</strong></span>
            </div>
          </div>

          {/* Kartu Informasi Penjual & Hubungi WhatsApp */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-2xs">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">
              Informasi Penjual
            </h3>

            <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-zinc-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                {listing.user?.name ? listing.user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-zinc-900 truncate">
                  {listing.user?.name}
                </h4>
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span className="truncate">{listing.user?.location || listing.location}</span>
                </p>
              </div>
            </div>

            {/* Tombol Hubungi via WhatsApp */}
            {isSold ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full h-12 rounded-xl bg-zinc-100 text-zinc-400 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed select-none"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Barang Sudah Terjual</span>
                </button>
                <p className="text-xs text-zinc-400 text-center">
                  Barang ini telah laku dan kontak penjual dinonaktifkan.
                </p>
              </div>
            ) : listing.user?.whatsapp_url ? (
              <div className="space-y-2.5">
                <a
                  href={listing.user.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Hubungi via WhatsApp</span>
                </a>
                <p className="text-xs text-zinc-500 text-center leading-normal">
                  Terhubung langsung dengan pesan format otomatis ke penjual.
                </p>
              </div>
            ) : (
              <div className="text-center p-3 rounded-lg bg-zinc-50 text-xs text-zinc-500">
                Kontak penjual tidak tersedia.
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Transaksi aman langsung dengan warga sekitar (COD).</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

