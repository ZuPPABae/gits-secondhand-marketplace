import React, { useEffect } from 'react'
import { Link } from 'react-router'
import { FileQuestion } from 'lucide-react'

export const NotFound: React.FC = () => {
  useEffect(() => {
    document.title = 'Halaman Tidak Ditemukan — PasarWarga'
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-14 h-14 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center mb-4">
        <FileQuestion className="w-7 h-7" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
        Error 404
      </span>
      <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-2 text-sm text-zinc-500 max-w-sm">
        Halaman yang Anda cari tidak tersedia, sudah dihapus, atau tautan yang Anda tuju salah.
      </p>
      <Link
        to="/"
        className="mt-6 h-10 px-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}

