import React from 'react'
import { Link } from 'react-router'
import { ImageOff, MapPin } from 'lucide-react'
import type { Listing } from '../types/listing'
import { formatRupiah } from '../lib/format'
import { Badge } from './Badge'

export interface ListingCardProps {
  listing: Listing
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const isSold = listing.status === 'sold'
  const imageUrl = listing.primary_image_url

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex flex-col bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
    >
      {/* Container Foto Rasio 4:3 */}
      <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-95"
            onError={(e) => {
              // Sembunyikan gambar rusak dan tampilkan fallback
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback')
              if (fallback) {
                fallback.classList.remove('hidden')
                fallback.classList.add('flex')
              }
            }}
          />
        ) : null}

        {/* Fallback jika tidak ada gambar atau gambar gagal dimuat */}
        <div
          className={`image-fallback w-full h-full flex-col items-center justify-center text-zinc-400 bg-zinc-50 ${
            imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <ImageOff className="w-8 h-8 stroke-1 text-zinc-300 mb-1" />
          <span className="text-xs text-zinc-400">Tidak ada foto</span>
        </div>

        {/* Status Badge Overlays */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {isSold ? (
            <Badge variant="sold" size="sm">
              Terjual
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              {listing.condition_label}
            </Badge>
          )}
        </div>

        {/* Category Pill di kanan atas */}
        {listing.category?.name && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
              {listing.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Konten Kartu */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Judul 1-2 baris */}
          <h3
            className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors"
            title={listing.title}
          >
            {listing.title}
          </h3>

          {/* Harga Rupiah */}
          <p
            className={`text-base font-bold mt-1 tracking-tight ${
              isSold ? 'text-zinc-400 line-through' : 'text-zinc-900'
            }`}
          >
            {formatRupiah(listing.price)}
          </p>
        </div>

        {/* Footer: Lokasi & Penjual */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
            <span className="truncate">{listing.location}</span>
          </div>
          <span className="text-[11px] text-zinc-400 truncate ml-2">
            {listing.user?.name}
          </span>
        </div>
      </div>
    </Link>
  )
}

