import React from 'react'
import { PackageOpen } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Belum ada barang yang cocok',
  description = 'Coba ubah kata kunci pencarian atau sesuaikan filter untuk melihat barang lainnya.',
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`border border-dashed border-zinc-200 rounded-xl p-8 sm:p-12 text-center bg-white ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3.5">
        {icon || <PackageOpen className="w-6 h-6 text-zinc-400" />}
      </div>
      <h3 className="text-base font-semibold text-zinc-900 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

