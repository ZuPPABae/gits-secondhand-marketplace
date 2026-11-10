import React from 'react'
import { Link } from 'react-router'
import { PlusCircle, Search, ShieldCheck } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Hero */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-10 shadow-sm mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pasar Warga Komunitas Terpercaya</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
            {isAuthenticated ? (
              <>
                Halo, <span className="text-indigo-600">{user?.name}</span>!
              </>
            ) : (
              'Jual Beli Barang Bekas Antar Warga'
            )}
          </h1>
          <p className="mt-3 text-base text-zinc-600 leading-relaxed">
            Temukan sepeda, perkakas, hobi, dan barang rumah tangga berkualitas dari tetangga sekitar. Langsung terhubung via WhatsApp tanpa ribet.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/pasang"
              className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Pasang Barang Sekarang</span>
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="h-10 px-5 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 font-medium text-sm hover:bg-zinc-50 transition-colors"
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Placeholder for Phase 3: Search & Listings */}
      <div className="border border-dashed border-zinc-300 rounded-xl p-8 text-center bg-zinc-50/50">
        <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900">
          Katalog Listing Publik (Fase 3)
        </h3>
        <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1">
          Pencarian trigram, filter kategori, dan kartu listing barang akan aktif pada Fase 3.
        </p>
      </div>
    </div>
  )
}
