import React from 'react'
import { Link } from 'react-router'
import { HelpCircle } from 'lucide-react'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center mb-4">
        <HelpCircle className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-zinc-900">Halaman Tidak Ditemukan</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        to="/"
        className="mt-4 h-10 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}

