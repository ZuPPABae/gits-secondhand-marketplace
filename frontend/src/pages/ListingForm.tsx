import React from 'react'
import { PlusCircle } from 'lucide-react'

export const ListingForm: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
          <PlusCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Pasang Barang Baru (Fase 4)
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Formulir upload foto, nama barang, kategori, harga, kondisi, dan lokasi akan diimplementasikan pada Fase 4.
        </p>
      </div>
    </div>
  )
}

