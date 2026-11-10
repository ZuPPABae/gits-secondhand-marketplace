import React from 'react'
import { MapPin, Phone, Mail, User as UserIcon } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export const Profile: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-bold text-2xl flex items-center justify-center">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              {user?.name}
            </h1>
            <p className="text-sm text-zinc-500">Anggota Komunitas PasarWarga</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-zinc-700">
            <Mail className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500 w-24">Email:</span>
            <span className="font-medium text-zinc-900">{user?.email}</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-700">
            <Phone className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500 w-24">WhatsApp:</span>
            <span className="font-medium text-zinc-900">{user?.phone}</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-700">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500 w-24">Lokasi:</span>
            <span className="font-medium text-zinc-900">{user?.location}</span>
          </div>

          {user?.created_at && (
            <div className="flex items-center gap-3 text-zinc-700">
              <UserIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-500 w-24">Bergabung:</span>
              <span className="font-medium text-zinc-900">
                {new Date(user.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

