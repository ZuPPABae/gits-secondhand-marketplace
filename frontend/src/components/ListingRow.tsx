import React from 'react'
import { Link } from 'react-router'
import { ImageOff, MapPin } from 'lucide-react'
import type { Listing } from '../types/listing'
import { formatRupiah } from '../lib/format'
import { Badge } from './Badge'

export interface ListingRowProps {
  listing: Listing
}

export const ListingRow: React.FC<ListingRowProps> = ({ listing }) => {
  const isSold = listing.status === 'sold'
  const imageUrl = listing.primary_image_url

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group flex items-center gap-3 sm:gap-4 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all p-3 sm:p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
    >
      {/* Foto Thumbnail */}
      <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-95"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback')
              if (fallback) {
                fallback.classList.remove('hidden')
                fallback.classList.add('flex')
              }
            }}
          />
        ) : null}
        <div
          className={`image-fallback w-full h-full flex-col items-center justify-center text-zinc-400 bg-zinc-50 ${
            imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <ImageOff className="w-5 h-5 stroke-1 text-zinc-300 mb-0.5" />
          <span className="text-[9px] text-zinc-400">Tanpa foto</span>
        </div>
      </div>

      {/* Konten */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Judul */}
        <h3
          className="text-sm font-medium text-zinc-900 line-clamp-1 leading-snug group-hover:text-indigo-600 transition-colors"
          title={listing.title}
        >
          {listing.title}
        </h3>

        {/* Harga */}
        <p
          className={`text-sm font-bold tracking-tight ${
            isSold ? 'text-zinc-400 line-through' : 'text-zinc-900'
          }`}
        >
          {formatRupiah(listing.price)}
        </p>

        {/* Meta: kondisi, lokasi, badge */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          {isSold ? (
            <Badge variant="sold" size="sm">
              Terjual
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              {listing.condition_label}
            </Badge>
          )}

          {listing.category?.name && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 hidden sm:inline-flex">
              {listing.category.name}
            </span>
          )}

          <span className="inline-flex items-center gap-0.5 text-zinc-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-xs">{listing.location}</span>
          </span>
        </div>
      </div>

      {/* Nama penjual - hanya di desktop */}
      <div className="hidden sm:block flex-shrink-0 text-xs text-zinc-400 text-right max-w-[100px] truncate">
        {listing.user?.name}
      </div>
    </Link>
  )
}
