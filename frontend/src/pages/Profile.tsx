import React from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  PlusCircle,
  User as UserIcon,
} from 'lucide-react'
import { getUserProfileApi } from '../api/users'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { ListingCard } from '../components/ListingCard'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from '../features/auth/useAuth'

export const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)

  // Tentukan user id yang ditampilkan (bisa dari params /users/:id atau fallback user sendiri jika di /profile)
  const targetUserId = id ? String(id) : currentUser ? String(currentUser.id) : null

  const isOwnProfile =
    Boolean(currentUser && targetUserId && String(currentUser.id) === String(targetUserId))

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user-profile', targetUserId, currentPage],
    queryFn: () => getUserProfileApi(targetUserId!, currentPage),
    enabled: Boolean(targetUserId),
    retry: 1,
  })

  const profileUser = data?.user
  const listings = data?.listings?.data ?? []
  const meta = data?.listings?.meta

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Format tanggal bergabung (contoh: November 2026)
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return null
    }
  }

  // Jika tidak ada user ID dan tidak sedang login (akses langsung ke /profile saat logout)
  if (!targetUserId) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-500 mx-auto flex items-center justify-center mb-4">
          <UserIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Profil Tidak Tersedia</h2>
        <p className="text-sm text-zinc-500 mt-1.5 mb-6">
          Silakan masuk terlebih dahulu untuk melihat profil akun Anda.
        </p>
        <Link to="/login">
          <Button variant="primary" size="md">
            Masuk ke Akun
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Tombol Kembali ke Beranda */}
      <div className="mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* State: Loading Header */}
      {isLoading && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
              <div className="space-y-2.5 flex-1">
                <Skeleton className="h-7 w-48 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
            </div>
          </div>

          <div>
            <Skeleton className="h-6 w-44 rounded mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-zinc-200 p-3 space-y-3"
                >
                  <Skeleton className="aspect-4/3 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-5 w-1/2 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State: Error / Not Found */}
      {isError && (
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Pengguna Tidak Ditemukan</h2>
          <p className="text-sm text-zinc-500 mt-1.5 mb-6">
            {error instanceof Error
              ? error.message
              : 'Profil pengguna yang Anda cari tidak ditemukan atau telah dinonaktifkan.'}
          </p>
          <Link to="/">
            <Button variant="secondary" size="md">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      )}

      {/* State: Success Render */}
      {!isLoading && !isError && profileUser && (
        <div className="space-y-8">
          {/* Kartu Profil Pengguna */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                {/* Avatar Inisial */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-50 text-indigo-700 font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-indigo-100 flex-shrink-0">
                  {profileUser.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight truncate">
                      {profileUser.name}
                    </h1>
                    {isOwnProfile && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Profil Anda
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <span>{profileUser.location || 'Lokasi tidak ditentukan'}</span>
                    </div>

                    {profileUser.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <span>Bergabung sejak {formatJoinDate(profileUser.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tautan ke Listing Saya jika melihat profil sendiri */}
              {isOwnProfile && (
                <div className="pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100 flex items-center gap-2.5">
                  <Link to="/me/listings">
                    <Button variant="secondary" size="md">
                      <Package className="w-4 h-4 mr-1.5" />
                      <span>Listing Saya</span>
                    </Button>
                  </Link>
                  <Link to="/pasang">
                    <Button variant="primary" size="md">
                      <PlusCircle className="w-4 h-4 mr-1.5" />
                      <span>Pasang Barang</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bagian Grid Listing Tersedia */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                  Barang Tersedia {meta ? `(${meta.total})` : ''}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Daftar barang bekas yang sedang aktif dijual oleh {isOwnProfile ? 'Anda' : profileUser.name}.
                </p>
              </div>
            </div>

            {/* Empty State */}
            {listings.length === 0 ? (
              <EmptyState
                title="Belum ada barang yang dijual"
                description={
                  isOwnProfile
                    ? 'Anda belum memiliki barang yang sedang aktif dijual. Mulai pasang barang sekarang!'
                    : `Saat ini belum ada barang tersedia yang dijual oleh ${profileUser.name}.`
                }
                icon={<Package className="w-6 h-6 text-zinc-400" />}
                actionLabel={isOwnProfile ? 'Pasang Barang Sekarang' : undefined}
                onAction={isOwnProfile ? () => navigate('/pasang') : undefined}
                className="my-4"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="mt-8 pt-6 border-t border-zinc-200 flex items-center justify-between">
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
        </div>
      )}
    </div>
  )
}
