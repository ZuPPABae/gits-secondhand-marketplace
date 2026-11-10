import React from 'react'
import { Package } from 'lucide-react'

export const MyListings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Listing Saya (Fase 4)
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Kelola listing milik Anda (ubah status terjual, edit, dan hapus) akan aktif pada Fase 4.
        </p>
      </div>
    </div>
  )
}

